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
import { z } from 'zod';
import * as local from './data';
import type {
  Alojamiento,
  Experiencia,
  Extensiones,
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
const TIMEOUT_MS = 4000;
const LIMITE_PUBLICO = 48; // máximo que acepta la API pública

export const cmsConectado = Boolean(BASE && TENANT);
export const reservasConectadas = Boolean(BASE && API_KEY);

const urlPublica = (ruta: string) => `${BASE}/public/${TENANT}${ruta}`;

async function getJson(ruta: string, tag: string): Promise<unknown | null> {
  if (!cmsConectado) return null;
  try {
    const res = await fetch(urlPublica(ruta), {
      headers: { Accept: 'application/json' },
      next: { revalidate: REVALIDAR_SEGUNDOS, tags: ['cms', tag] },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn(`[cms] ${ruta} no disponible, uso data.ts:`, (err as Error).message);
    return null;
  }
}

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
const textoOpc = z.string().optional();
const numero = z.coerce.number();
/** Número opcional: vacío en el CMS es "sin valor", no 0 (precio vacío = a consultar). */
const numeroOpc = z.preprocess(
  (v) => (v === '' || v === null || v === undefined ? undefined : v),
  z.coerce.number().optional(),
);
/** Campo `image` del CMS: una URL o varias (multiple). */
const fotos = z
  .union([z.string(), z.array(z.string())])
  .optional()
  .transform((v) => (Array.isArray(v) ? v : v ? [v] : []).map((s) => s.trim()).filter(Boolean));
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

async function coleccion<S extends z.ZodTypeAny>(
  slug: string,
  schema: S,
): Promise<z.output<S>[] | null> {
  const json = await getJson(`/content-types/${slug}/entries?limit=${LIMITE_PUBLICO}`, slug);
  if (json === null) return null;
  const validas: z.output<S>[] = [];
  for (const entry of extraerEntries(json)) {
    const r = schema.safeParse(entry);
    if (r.success) validas.push(r.data);
    else console.warn(`[cms] entry inválida en ${slug}:`, r.error.issues[0]?.message);
  }
  return validas.length ? validas : null;
}

/** Colecciones de un solo registro: la primera entry publicada. */
async function registro<S extends z.ZodTypeAny>(slug: string, schema: S): Promise<z.output<S> | null> {
  return (await coleccion(slug, schema))?.[0] ?? null;
}

const porOrden = <T extends { orden: number }>(a: T, b: T) => a.orden - b.orden;

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
  titulo: texto,
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
  queincluye: lineas,
  quetraer: lineas,
  normas: lineas,
  reservastexto: textoOpc,
  avisosolicitud: textoOpc,
  tiemporespuesta: textoOpc,
});

const contactoCms = z.object({
  direccion: texto,
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
      .filter((v) => v.foto);
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
  return (cms ?? local.preguntasFrecuentes).sort(porOrden);
}

export async function getRecomendaciones(): Promise<Recomendacion[]> {
  const cms = await coleccion('recomendaciones-la-paloma', recomendacionCms);
  if (!cms) return [...local.recomendaciones].sort(porOrden);
  return cms
    .map((r): Recomendacion => ({
      id: r.id,
      slug: r.slug,
      nombre: r.nombre,
      tipo: r.tipo,
      descripcion: r.descripcion,
      imagen: r.imagenes[0] ?? '',
      imagenes: r.imagenes.length > 1 ? r.imagenes : undefined,
      orden: r.orden,
    }))
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
          titulo: portada.titulo,
          subtitulo: o(portada.subtitulo, L.heroConfig.subtitulo),
          imagenFondo: o(portada.imagenfondo[0], L.heroConfig.imagenFondo),
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
    queIncluye: info?.queincluye.length ? { items: info.queincluye } : L.queIncluye,
    reservasInfo: info
      ? {
          textoExplicativo: o(info.reservastexto, L.reservasInfo.textoExplicativo),
          avisoSolicitud: o(info.avisosolicitud, L.reservasInfo.avisoSolicitud),
        }
      : L.reservasInfo,
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
          items: instalaciones
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
  const [experiencias, instalaciones, portada, info] = await Promise.all([
    coleccion('experiencias', experienciaCms),
    coleccion('instalaciones', instalacionCms),
    registro('portada', portadaCms),
    registro('informacion-huespedes', infoCms),
  ]);
  return {
    ...X,
    experiencias: experiencias
      ? experiencias.sort(porOrden).map(
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
  const res = await fetch(url, {
    ...init,
    cache: 'no-store',
    headers: {
      Accept: 'application/json',
      'X-Api-Key': API_KEY ?? '',
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
  for (let pagina = 1; pagina <= 10; pagina++) {
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
    if (pagina >= (json.pagination?.pageCount ?? 1)) break;
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
