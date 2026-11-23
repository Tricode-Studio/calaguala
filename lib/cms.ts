/**
 * Módulo ÚNICO de acceso a datos.
 * Intenta Tricode CMS; si no hay tenant configurado, la red falla o la
 * respuesta no cumple el schema, cae a lib/data.ts (misma forma).
 * Server-only: no importar desde componentes 'use client'.
 *
 * Contrato con el CMS: .tricode/onboarding/calaguala/integration-contract.json
 * (repo tricode-cms). Las keys de los campos del CMS van en minúscula
 * (`imagenfondo`), acá se traducen a los tipos de lib/types.ts.
 */
import 'server-only';
import { cache } from 'react';
import { z } from 'zod';
import * as local from './data';
import { iconoPalomaValido } from './iconos-paloma';
import type {
  Alojamiento,
  Experiencia,
  Extensiones,
  LaPaloma,
  LandingConfig,
  PreguntaFrecuente,
  Recomendacion,
  SolicitudReserva,
} from './types';

/** Acepta la base con o sin `/api/v1` (la convención del CMS es con). */
const BASE = (() => {
  const raw = process.env.NEXT_PUBLIC_TRICODE_API_BASE_URL?.trim().replace(/\/+$/, '');
  if (!raw) return undefined;
  return raw.endsWith('/api/v1') ? raw : `${raw}/api/v1`;
})();
const TENANT = process.env.NEXT_PUBLIC_TRICODE_TENANT_SLUG;
/** Clave de integración (solo servidor): lee y escribe la colección `reservas`. */
const API_KEY = process.env.TRICODE_INTEGRATION_API_KEY;

const REVALIDAR_SEGUNDOS = 300;
/** Lectura pública del CMS (puede tardar más en frío, p. ej. durante el build). */
const TIMEOUT_LECTURA_MS = 8000;
/** Integración (reservas/disponibilidad): más corto, hay un usuario esperando. */
const TIMEOUT_MS = 4000;
const LIMITE_PUBLICO = 48; // máximo que acepta la API pública

export const cmsConectado = Boolean(BASE && TENANT);
export const reservasConectadas = Boolean(BASE && API_KEY);

const urlPublica = (ruta: string) => `${BASE}/public/${TENANT}${ruta}`;

/**
 * Lectura pública. Diseño ante fallos:
 * - La caché de datos de Next (`revalidate` + stale-while-revalidate) ya conserva
 *   la última respuesta buena: si hay una entrada cacheada, `fetch` la devuelve y
 *   la revalida en segundo plano; si esa revalidación falla, sigue sirviendo la
 *   vieja. Solo se llega al catch sin ninguna respuesta buena previa (primer
 *   build/arranque en frío) y ahí el llamador usa lib/data.ts.
 * - Los logs distinguen "sin configurar" de "falló la red/HTTP/timeout".
 */
async function getJson(ruta: string, tag: string): Promise<unknown | null> {
  if (!cmsConectado) {
    if (!avisoSinEnv) {
      avisoSinEnv = true;
      console.warn(
        '[cms] SIN CONFIGURAR: faltan NEXT_PUBLIC_TRICODE_API_BASE_URL / NEXT_PUBLIC_TRICODE_TENANT_SLUG; el sitio usa lib/data.ts (modo standalone).',
      );
    }
    return null;
  }
  try {
    const res = await fetch(urlPublica(ruta), {
      headers: { Accept: 'application/json' },
      next: { revalidate: REVALIDAR_SEGUNDOS, tags: ['cms', tag] },
      signal: AbortSignal.timeout(TIMEOUT_LECTURA_MS),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    const e = err as Error;
    const causa =
      e.name === 'TimeoutError' || e.name === 'AbortError'
        ? `timeout (${TIMEOUT_LECTURA_MS} ms)`
        : e.message.startsWith('HTTP ')
          ? e.message
          : `error de red (${e.message})`;
    console.error(
      `[cms] FALLÓ la lectura de ${ruta}: ${causa}. Sin respuesta previa en caché: se usa lib/data.ts como respaldo (contenido local, no el del CMS).`,
    );
    return null;
  }
}
let avisoSinEnv = false;

/**
 * Normaliza la respuesta pública `{ items: [{ id, slug, data }] }` (o un array
 * plano) a objetos `{ id, slug, ...data }`. La API pública ya filtra a PUBLISHED
 * y ordena por `orden`.
 */
function extraerEntries(json: unknown): Record<string, unknown>[] {
  const lista = Array.isArray(json)
    ? json
    : ((json as { items?: unknown; data?: unknown })?.items ?? (json as { data?: unknown })?.data);
  if (!Array.isArray(lista)) return [];
  return lista
    .filter((e) => {
      const estado = (e as { status?: string })?.status;
      return !estado || estado.toUpperCase() === 'PUBLISHED';
    })
    .map((e) => {
      const entry = e as Record<string, unknown>;
      const campos = (entry.data ?? entry.fields) as Record<string, unknown> | undefined;
      return campos ? { id: entry.id, slug: entry.slug, ...campos } : entry;
    });
}

// ── Helpers de forma ───────────────────────────────────────────────────────
const texto = z.string();
const textoOpc = z.string().nullish();
const numero = z.coerce.number();
/** Número opcional: vacío en el CMS es "sin valor", no 0 (precio vacío = a consultar). */
const numeroOpc = z.preprocess(
  (v) => (v === '' || v === null || v === undefined ? undefined : v),
  z.coerce.number().optional(),
);
/** Campo `image` del CMS: una URL o varias (multiple). */
const urlDeFoto = (v: unknown): string => {
  if (typeof v === 'string') return v.trim();
  if (v && typeof v === 'object') {
    const f = v as { url?: unknown; src?: unknown; publicUrl?: unknown };
    for (const c of [f.url, f.src, f.publicUrl]) if (typeof c === 'string' && c.trim()) return c.trim();
  }
  return '';
};
/** Tolerante: string, objeto {url|src|publicUrl}, array de cualquiera de ellos, null o undefined. */
const fotos = z
  .unknown()
  .transform((v): string[] => (Array.isArray(v) ? v : [v]).map(urlDeFoto).filter(Boolean));
/** `textarea` "uno por línea" → lista. */
const lineas = z
  .union([z.string(), z.array(z.string())])
  .optional()
  .transform((v) =>
    (Array.isArray(v) ? v : (v ?? '').split(/\r?\n/)).map((s) => s.trim()).filter(Boolean),
  );
const base = z.object({ id: z.string().min(1), slug: z.string().min(1) });
/** Vacío en el CMS = usar el valor local. */
const o = <T>(valor: T | undefined | null, respaldo: T): T =>
  valor === undefined || valor === null || (typeof valor === 'string' && !valor.trim()) ? respaldo : valor;

type Origen = 'cms' | 'local';

// React.cache: evita parsear dos veces la misma colección dentro de un render
// (getLandingConfig y getExtensiones). La clave son los argumentos (slug y la
// referencia al schema, constante de módulo), así que cada slug cachea aparte.
const coleccion = cache(async function coleccion<S extends z.ZodTypeAny>(
  slug: string,
  schema: S,
): Promise<z.output<S>[] | null> {
  const json = await getJson(`/content-types/${slug}/entries?limit=${LIMITE_PUBLICO}`, slug);
  if (json === null) return null;
  const validas: z.output<S>[] = [];
  for (const entry of extraerEntries(json)) {
    const r = schema.safeParse(entry);
    if (r.success) validas.push(r.data);
    else {
      const issues = r.error.issues.map((i) => `${i.path.join('.') || '(raíz)'}: ${i.message}`).join('; ');
      console.warn(`[cms] entry inválida en "${slug}" (id ${String(entry.id ?? '?')}): ${issues}`);
    }
  }
  return validas.length ? validas : null;
});

/** Colecciones de un solo registro: la primera entry publicada. */
async function registro<S extends z.ZodTypeAny>(slug: string, schema: S): Promise<z.output<S> | null> {
  return (await coleccion(slug, schema))?.[0] ?? null;
}

const porOrden = <T extends { orden: number }>(a: T, b: T) => a.orden - b.orden;
/** Como porOrden, pero los ítems sin orden van al final (estable entre sí). */
const porOrdenOpc = <T extends { orden?: number }>(a: T, b: T) => {
  if (a.orden === undefined || b.orden === undefined) {
    return a.orden === b.orden ? 0 : a.orden === undefined ? 1 : -1;
  }
  return a.orden - b.orden;
};

// ── Schemas del CMS (keys en minúscula) ────────────────────────────────────
const alojamientoCms = base.extend({
  nombre: texto,
  tipo: z.enum(['carpa', 'glamping-solo', 'glamping-doble']),
  descripcion: textoOpc,
  capacidad: numero.pipe(z.number().int().positive()),
  cupos: numeroOpc.pipe(z.number().int().min(0).optional()),
  etiquetacapacidad: textoOpc,
  precio: numeroOpc,
  preciounidad: textoOpc,
  caracteristicas: lineas,
  incluye: lineas,
  fotos,
  orden: numero.default(0),
});

const unidadCms = base.extend({
  nombre: texto,
  alojamiento: z.string().min(1),
  foto: fotos,
  orden: numero.default(0),
});

const faqCms = base.extend({ pregunta: texto, respuesta: texto, orden: numero.default(0) });

const recomendacionCms = base.extend({
  nombre: texto,
  tipo: z.enum(['playa', 'restaurante', 'actividad', 'otro']),
  descripcion: texto.default(''),
  imagenes: fotos,
  orden: numero.default(0),
});

const instalacionCms = base.extend({
  titulo: texto,
  descripcion: texto.default(''),
  icono: texto,
  fotos,
  orden: numero.default(0),
});

const experienciaCms = base.extend({
  titulo: texto,
  descripcion: texto.default(''),
  detalles: lineas,
  fotos,
  orden: numero.default(0),
});

const portadaCms = z.object({
  // Textos del sitio (todos opcionales: vacío = se usa el texto local de lib/data.ts).
  herobotonprincipal: textoOpc,
  herobotonsecundario: textoOpc,
  introtitulo: textoOpc,
  alojamientotitulo: textoOpc,
  alojamientobajada: textoOpc,
  espaciostitulo: textoOpc,
  espaciosbajada: textoOpc,
  experienciastitulo: textoOpc,
  experienciasbajada: textoOpc,
  descubrirtitulo: textoOpc,
  descubrirbajada: textoOpc,
  reservastitulo: textoOpc,
  reservasboton: textoOpc,
  reservaspasos: lineas,
  infopracticatitulo: textoOpc,
  faqtitulo: textoOpc,
  reservartitulo: textoOpc,
  reservarbajada: textoOpc,
  titulo: textoOpc,
  subtitulo: textoOpc,
  imagenfondo: fotos,
  introtexto: textoOpc,
  introimagen: fotos,
  introgaleria: fotos,
  metatitle: textoOpc,
  metadescription: textoOpc,
  ogimage: fotos,
});

const infoCms = z.object({
  checkin: textoOpc,
  checkout: textoOpc,
  quetraer: lineas,
  normas: lineas,
  reservastexto: textoOpc,
  avisosolicitud: textoOpc,
  tiemporespuesta: textoOpc,
});

const contactoCms = z.object({
  direccion: texto,
  ubicaciontitulo: textoOpc,
  ubicacionbajada: textoOpc,
  ubicaciontexto: textoOpc,
  ubicacionboton: textoOpc,
  mapaembedurl: textoOpc,
  mapaurl: textoOpc,
  imagendrone: fotos,
  whatsapp: textoOpc,
  instagramurl: textoOpc,
  mensajefinal: textoOpc,
});

// ── API pública del módulo ─────────────────────────────────────────────────
async function alojamientosConOrigen(): Promise<{ items: Alojamiento[]; origen: Origen }> {
  const [cms, unidades] = await Promise.all([
    coleccion('alojamientos', alojamientoCms),
    coleccion('unidades', unidadCms),
  ]);
  if (!cms) return { items: local.alojamientos, origen: 'local' };
  const items = cms.map((a): Alojamiento => {
    const variantes = (unidades ?? [])
      .filter((u) => u.alojamiento === a.id)
      .sort(porOrden)
      .map((u) => ({ nombre: u.nombre, foto: u.foto[0] ?? a.fotos[0] ?? '' }))
      .filter((v) => {
        if (v.foto) return true;
        console.warn(`[cms] variante "${v.nombre}" de "${a.nombre}" descartada: no tiene foto propia ni el alojamiento.`);
        return false;
      });
    return {
      id: a.id,
      slug: a.slug,
      nombre: a.nombre,
      tipo: a.tipo,
      descripcion: a.descripcion ?? '',
      capacidad: a.capacidad,
      cupos: a.cupos ?? 1,
      etiquetaCapacidad: a.etiquetacapacidad || undefined,
      variantes: variantes.length ? variantes : undefined,
      caracteristicas: a.caracteristicas,
      incluye: a.incluye,
      precio: a.precio ?? null,
      precioUnidad: a.preciounidad || 'por noche',
      fotos: a.fotos,
      orden: a.orden,
    };
  });
  return { items: items.sort(porOrden), origen: 'cms' };
}

export async function getAlojamientos(): Promise<Alojamiento[]> {
  return (await alojamientosConOrigen()).items;
}

export async function getPreguntasFrecuentes(): Promise<PreguntaFrecuente[]> {
  const cms = await coleccion('preguntas-frecuentes', faqCms);
  return [...(cms ?? local.preguntasFrecuentes)].sort(porOrden);
}

/** Para emparejar entries del CMS con las locales: sin tildes, minúsculas, solo alfanumérico. */
const normalizar = (s: string) =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '');

/**
 * Foto local de respaldo para una entry del CMS sin imágenes: se busca la entry
 * local equivalente por slug o nombre normalizado (nunca por índice). Si el CMS
 * trae imágenes, tienen prioridad y esto no se usa.
 *
 * Intencional: si el CMS tiene, por ejemplo, una entry "Skatepark" sin
 * imágenes, se usa la foto local de la recomendación local "Skatepark"
 * (`/fotos/skatepark.webp`, ver lib/data.ts) en vez de mostrarla sin foto.
 */
function fotosLocalesDe(r: { slug: string; nombre: string }): string[] {
  const slug = normalizar(r.slug);
  const nombre = normalizar(r.nombre);
  const l = local.recomendaciones.find((x) => normalizar(x.slug) === slug || normalizar(x.nombre) === nombre);
  if (!l) return [];
  return l.imagenes?.length ? l.imagenes : l.imagen ? [l.imagen] : [];
}

export async function getRecomendaciones(): Promise<Recomendacion[]> {
  const cms = await coleccion('recomendaciones-la-paloma', recomendacionCms);
  if (!cms) return [...local.recomendaciones].sort(porOrden);
  return cms
    .map((r): Recomendacion => {
      const imgs = r.imagenes.length ? r.imagenes : fotosLocalesDe(r);
      return {
        id: r.id,
        slug: r.slug,
        nombre: r.nombre,
        tipo: r.tipo,
        descripcion: r.descripcion,
        imagen: imgs[0] ?? '',
        imagenes: imgs.length > 1 ? imgs : undefined,
        orden: r.orden,
      };
    })
    .sort(porOrden);
}

export async function getLandingConfig(): Promise<LandingConfig> {
  const L = local.landingConfig;
  const [portada, info, contacto, instalaciones] = await Promise.all([
    registro('portada', portadaCms),
    registro('informacion-huespedes', infoCms),
    registro('ubicacion-contacto', contactoCms),
    coleccion('instalaciones', instalacionCms),
  ]);

  return {
    heroConfig: portada
      ? {
          ...L.heroConfig,
          titulo: o(portada.titulo, L.heroConfig.titulo),
          subtitulo: o(portada.subtitulo, L.heroConfig.subtitulo),
          imagenFondo: o(portada.imagenfondo[0], L.heroConfig.imagenFondo),
          botonPrincipal: o(portada.herobotonprincipal, L.heroConfig.botonPrincipal),
          botonSecundario: o(portada.herobotonsecundario, L.heroConfig.botonSecundario),
        }
      : L.heroConfig,
    introduccion: portada
      ? {
          texto: o(portada.introtexto, L.introduccion.texto),
          imagenApoyo: o(portada.introimagen[0], L.introduccion.imagenApoyo),
        }
      : L.introduccion,
    seoGlobal: portada
      ? {
          metaTitle: o(portada.metatitle, L.seoGlobal.metaTitle),
          metaDescription: o(portada.metadescription, L.seoGlobal.metaDescription),
          ogImage: o(portada.ogimage[0], L.seoGlobal.ogImage),
        }
      : L.seoGlobal,
    reservasInfo: {
      textoExplicativo: o(info?.reservastexto, L.reservasInfo.textoExplicativo),
      avisoSolicitud: o(info?.avisosolicitud, L.reservasInfo.avisoSolicitud),
      boton: o(portada?.reservasboton, L.reservasInfo.boton),
      pasos: portada?.reservaspasos.length ? portada.reservaspasos : L.reservasInfo.pasos,
    },
    informacionPractica: info
      ? {
          checkIn: o(info.checkin, L.informacionPractica.checkIn),
          checkOut: o(info.checkout, L.informacionPractica.checkOut),
          queTraer: info.quetraer.length ? info.quetraer : L.informacionPractica.queTraer,
          normas: info.normas.length ? info.normas : L.informacionPractica.normas,
        }
      : L.informacionPractica,
    ubicacion: contacto
      ? {
          direccion: contacto.direccion,
          mapaEmbedUrl: o(contacto.mapaembedurl, L.ubicacion.mapaEmbedUrl),
          mapaUrl: o(contacto.mapaurl, L.ubicacion.mapaUrl),
          imagenDrone: o(contacto.imagendrone[0], L.ubicacion.imagenDrone),
          texto: o(contacto.ubicaciontexto, L.ubicacion.texto),
          botonMapa: o(contacto.ubicacionboton, L.ubicacion.botonMapa),
        }
      : L.ubicacion,
    contacto: contacto
      ? {
          whatsapp: o(contacto.whatsapp, L.contacto.whatsapp),
          instagramUrl: o(contacto.instagramurl, L.contacto.instagramUrl),
          mensajeFinal: o(contacto.mensajefinal, L.contacto.mensajeFinal),
        }
      : L.contacto,
    instalaciones: instalaciones
      ? {
          items: [...instalaciones]
            .sort(porOrden)
            .map((i) => ({ titulo: i.titulo, descripcion: i.descripcion, icono: i.icono })),
        }
      : L.instalaciones,
  };
}

/**
 * Lo que el sitio necesita además de LandingConfig. Experiencias, fotos de
 * instalaciones, galería de la introducción y plazo de respuesta vienen del
 * CMS; títulos de sección, textos alternativos y datos del negocio siguen
 * locales (fase 1, ver notas del contrato).
 */
export async function getExtensiones(): Promise<Extensiones> {
  const X = local.extensiones;
  const [experiencias, instalaciones, portada, info, contacto] = await Promise.all([
    coleccion('experiencias', experienciaCms),
    coleccion('instalaciones', instalacionCms),
    registro('portada', portadaCms),
    registro('informacion-huespedes', infoCms),
    registro('ubicacion-contacto', contactoCms),
  ]);
  // Títulos y bajadas editables (vacío = texto local). La bajada puede no existir.
  const bajadaOpc = (v: string | null | undefined, r: string | undefined) => (v?.trim() ? v : r);
  const S = X.secciones;
  return {
    ...X,
    secciones: {
      ...S,
      introduccion: { ...S.introduccion, titulo: o(portada?.introtitulo, S.introduccion.titulo) },
      ubicacion: {
        titulo: o(contacto?.ubicaciontitulo, S.ubicacion.titulo),
        bajada: bajadaOpc(contacto?.ubicacionbajada, S.ubicacion.bajada),
      },
      alojamiento: {
        titulo: o(portada?.alojamientotitulo, S.alojamiento.titulo),
        bajada: bajadaOpc(portada?.alojamientobajada, S.alojamiento.bajada),
      },
      instalaciones: {
        titulo: o(portada?.espaciostitulo, S.instalaciones.titulo),
        bajada: bajadaOpc(portada?.espaciosbajada, S.instalaciones.bajada),
      },
      experiencias: {
        titulo: o(portada?.experienciastitulo, S.experiencias.titulo),
        bajada: bajadaOpc(portada?.experienciasbajada, S.experiencias.bajada),
      },
      recomendaciones: {
        titulo: o(portada?.descubrirtitulo, S.recomendaciones.titulo),
        bajada: bajadaOpc(portada?.descubrirbajada, S.recomendaciones.bajada),
      },
      reservas: { ...S.reservas, titulo: o(portada?.reservastitulo, S.reservas.titulo) },
      'informacion-practica': {
        ...S['informacion-practica'],
        titulo: o(portada?.infopracticatitulo, S['informacion-practica'].titulo),
      },
      faq: { ...S.faq, titulo: o(portada?.faqtitulo, S.faq.titulo) },
    },
    reservar: {
      titulo: o(portada?.reservartitulo, X.reservar.titulo),
      bajada: o(portada?.reservarbajada, X.reservar.bajada),
    },
    experiencias: experiencias
      ? [...experiencias].sort(porOrden).map(
          (e): Experiencia => ({
            id: e.slug,
            titulo: e.titulo,
            descripcion: e.descripcion,
            detalles: e.detalles,
            fotos: e.fotos,
          }),
        )
      : X.experiencias,
    fotosInstalaciones: instalaciones
      ? Object.fromEntries(instalaciones.map((i) => [i.icono, i.fotos]))
      : X.fotosInstalaciones,
    galeriaIntroduccion: portada?.introgaleria.length ? portada.introgaleria : X.galeriaIntroduccion,
    tiempoRespuesta: o(info?.tiemporespuesta, X.tiempoRespuesta),
  };
}

export async function getContenidoLanding() {
  const [config, alojamientos, faq, recomendaciones, extensiones] = await Promise.all([
    getLandingConfig(),
    getAlojamientos(),
    getPreguntasFrecuentes(),
    getRecomendaciones(),
    getExtensiones(),
  ]);
  return { config, alojamientos, faq, recomendaciones, extensiones };
}

// ── Reservas (colección privada `reservas`, API de integración) ────────────
// Datos operativos: sin caché y solo desde el servidor. La clave nunca llega
// al navegador (no lleva NEXT_PUBLIC_).
const urlReservas = (sufijo = '') => `${BASE}/integration/collections/reservas/entries${sufijo}`;

async function integracion(url: string, init: RequestInit = {}, timeoutMs = TIMEOUT_MS) {
  if (!API_KEY) throw new CmsNoConectadoError();
  const res = await fetch(url, {
    ...init,
    cache: 'no-store',
    headers: {
      Accept: 'application/json',
      'X-Api-Key': API_KEY,
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
    },
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!res.ok) throw new Error(`Integración HTTP ${res.status}`);
  return res.json().catch(() => ({}));
}

export interface EstadiaConfirmada {
  alojamientoId: string;
  llegada: string; // YYYY-MM-DD
  salida: string; // YYYY-MM-DD
}

/**
 * Estadías confirmadas que se solapan con [desde, hasta). `null` si no hay
 * conexión con el CMS: el llamador no debe inventar disponibilidad.
 */
export async function getEstadiasConfirmadas(desde: string, hasta: string): Promise<EstadiaConfirmada[] | null> {
  if (!reservasConectadas) return null;
  const confirmadas: EstadiaConfirmada[] = [];
  const PAGINA = 500;
  const MAX_PAGINAS = 10;
  for (let pagina = 1; pagina <= MAX_PAGINAS; pagina++) {
    const json = (await integracion(urlReservas(`?page=${pagina}&pageSize=${PAGINA}`))) as {
      items?: { data?: Record<string, unknown> }[];
      pagination?: { pageCount?: number };
    };
    for (const item of json.items ?? []) {
      const d = item.data ?? {};
      if (d.estado !== 'confirmada') continue;
      const llegada = String(d.fechallegada ?? '').slice(0, 10);
      const salida = String(d.fechasalida ?? '').slice(0, 10);
      const alojamientoId = String(d.alojamiento ?? '');
      if (!alojamientoId || !llegada || !salida) continue;
      if (llegada < hasta && salida > desde) confirmadas.push({ alojamientoId, llegada, salida });
    }
    const total = json.pagination?.pageCount ?? 1;
    if (pagina >= total) break;
    if (pagina === MAX_PAGINAS) {
      console.warn(
        `[cms] getEstadiasConfirmadas: se alcanzó el tope de ${MAX_PAGINAS} páginas (${total} en total); la disponibilidad puede estar incompleta.`,
      );
    }
  }
  return confirmadas;
}

/** Cuántas plazas de un alojamiento siguen libres en todo el rango. */
export function cuposLibres(alojamiento: Alojamiento, estadias: EstadiaConfirmada[]): number {
  const ocupadas = estadias.filter((e) => e.alojamientoId === alojamiento.id).length;
  return (alojamiento.cupos ?? 1) - ocupadas;
}

/** Si la disponibilidad del CMS aplica: solo con alojamientos que vienen del CMS (sus ids). */
export async function getAlojamientosParaReserva() {
  return alojamientosConOrigen();
}

export async function crearSolicitudCms(sol: SolicitudReserva): Promise<{ id?: string }> {
  if (!reservasConectadas) throw new CmsNoConectadoError();
  const json = (await integracion(
    urlReservas(),
    {
      method: 'POST',
      body: JSON.stringify({
        title: sol.nombre,
        status: 'DRAFT',
        data: {
          nombre: sol.nombre,
          email: sol.email,
          whatsapp: sol.whatsapp,
          alojamiento: sol.tipoAlojamientoId,
          fechallegada: sol.fechaLlegada,
          fechasalida: sol.fechaSalida,
          cantidadpersonas: sol.cantidadPersonas,
          ...(sol.comentarios ? { comentarios: sol.comentarios } : {}),
          origen: 'web',
          // El estado inicial va explícito: el defaultData del perfil solo lo
          // aplica el panel del CMS, no la API.
          estado: 'nueva',
        },
      }),
    },
    8000,
  )) as { id?: string };
  return { id: json.id };
}

export class CmsNoConectadoError extends Error {
  constructor() {
    super('No hay conexión de reservas con Tricode CMS configurada.');
  }
}

// ── Página "Descubrí La Paloma" (/la-paloma) ───────────────────────────────
// Una entrada de `la-paloma-pagina` (textos y fotos sueltos) + tres listas:
// `la-paloma-playas`, `la-paloma-naturaleza` y `la-paloma-experiencias`.
// Todo opcional: vacío en el CMS = se usa el texto/foto de lib/data.ts.
const laPalomaPaginaCms = z.object({
  seotitulo: textoOpc,
  seodescripcion: textoOpc,
  herotitulo: textoOpc,
  herobajada: textoOpc,
  heroentrada: textoOpc,
  herofoto: fotos,
  playastitulo: textoOpc,
  playasintro: textoOpc,
  naturalezatitulo: textoOpc,
  lagunatitulo: textoOpc,
  lagunatexto: textoOpc,
  lagunafoto: fotos,
  farotitulo: textoOpc,
  farotexto: textoOpc,
  farofoto: fotos,
  farocta: textoOpc,
  puerto1titulo: textoOpc,
  puerto1texto: textoOpc,
  puerto1foto: fotos,
  puerto2titulo: textoOpc,
  puerto2texto: textoOpc,
  puerto2foto: fotos,
  diatitulo: textoOpc,
  diamanana: textoOpc,
  diamediodia: textoOpc,
  diatarde: textoOpc,
  diaatardecer: textoOpc,
  cierretitulo: textoOpc,
  cierretexto: textoOpc,
  cierrefoto: fotos,
  cierrecta: textoOpc,
});

const laPalomaPlayaCms = base.extend({
  nombre: texto,
  texto: textoOpc,
  foto: fotos,
  distancia: textoOpc,
  orden: numeroOpc,
});

const laPalomaNaturalezaCms = base.extend({
  titulo: texto,
  texto: textoOpc,
  foto: fotos,
  orden: numeroOpc,
});

const laPalomaExperienciaCms = base.extend({
  titulo: texto,
  texto: textoOpc,
  icono: textoOpc,
  orden: numeroOpc,
});

export async function getLaPaloma(): Promise<LaPaloma> {
  const L = local.laPaloma;
  const [p, playas, naturaleza, experiencias] = await Promise.all([
    registro('la-paloma-pagina', laPalomaPaginaCms),
    coleccion('la-paloma-playas', laPalomaPlayaCms),
    coleccion('la-paloma-naturaleza', laPalomaNaturalezaCms),
    coleccion('la-paloma-experiencias', laPalomaExperienciaCms),
  ]);

  const textosDia = [p?.diamanana, p?.diamediodia, p?.diatarde, p?.diaatardecer];
  const bloquesPuerto = [
    [p?.puerto1titulo, p?.puerto1texto, p?.puerto1foto],
    [p?.puerto2titulo, p?.puerto2texto, p?.puerto2foto],
  ] as const;
  const bloque = (
    titulo: string | null | undefined,
    texto: string | null | undefined,
    foto: string[] | undefined,
    r: { titulo: string; texto: string; foto: string },
  ) => ({ titulo: o(titulo, r.titulo), texto: o(texto, r.texto), foto: o(foto?.[0], r.foto) });

  return {
    seo: {
      titulo: o(p?.seotitulo, L.seo.titulo),
      descripcion: o(p?.seodescripcion, L.seo.descripcion),
    },
    hero: {
      titulo: o(p?.herotitulo, L.hero.titulo),
      bajada: o(p?.herobajada, L.hero.bajada),
      entrada: o(p?.heroentrada, L.hero.entrada),
      foto: o(p?.herofoto[0], L.hero.foto),
    },
    playas: {
      titulo: o(p?.playastitulo, L.playas.titulo),
      intro: o(p?.playasintro, L.playas.intro),
      items: playas
        ? [...playas].sort(porOrdenOpc).map((x) => {
            const l = L.playas.items.find((i) => normalizar(i.nombre) === normalizar(x.nombre));
            return {
              nombre: x.nombre,
              texto: o(x.texto, l?.texto ?? ''),
              foto: o(x.foto[0], l?.foto ?? ''),
              distancia: o(x.distancia, l?.distancia ?? '') || undefined,
            };
          })
        : L.playas.items,
    },
    naturaleza: {
      titulo: o(p?.naturalezatitulo, L.naturaleza.titulo),
      destacado: bloque(p?.lagunatitulo, p?.lagunatexto, p?.lagunafoto, L.naturaleza.destacado),
      secundarios: naturaleza
        ? [...naturaleza].sort(porOrdenOpc).map((x) => {
            const l = L.naturaleza.secundarios.find((i) => normalizar(i.titulo) === normalizar(x.titulo));
            return { titulo: x.titulo, texto: o(x.texto, l?.texto ?? ''), foto: o(x.foto[0], l?.foto ?? '') };
          })
        : L.naturaleza.secundarios,
    },
    experiencias: experiencias
      ? [...experiencias].sort(porOrdenOpc).map((x) => {
          const l = L.experiencias.find((i) => normalizar(i.titulo) === normalizar(x.titulo));
          return { icono: iconoPalomaValido(x.icono) ?? iconoPalomaValido(l?.icono) ?? 'ave', titulo: x.titulo, texto: o(x.texto, l?.texto ?? '') };
        })
      : L.experiencias,
    faro: {
      ...bloque(p?.farotitulo, p?.farotexto, p?.farofoto, L.faro),
      cta: o(p?.farocta, L.faro.cta),
    },
    puerto: L.puerto.map((r, i) => bloque(bloquesPuerto[i]?.[0], bloquesPuerto[i]?.[1], bloquesPuerto[i]?.[2], r)),
    dia: {
      titulo: o(p?.diatitulo, L.dia.titulo),
      momentos: L.dia.momentos.map((m, i) => ({ momento: m.momento, texto: o(textosDia[i], m.texto) })),
    },
    cierre: {
      titulo: o(p?.cierretitulo, L.cierre.titulo),
      texto: o(p?.cierretexto, L.cierre.texto),
      foto: o(p?.cierrefoto[0], L.cierre.foto),
      cta: o(p?.cierrecta, L.cierre.cta),
    },
  };
}
