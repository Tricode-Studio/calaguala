#!/usr/bin/env node
/**
 * Conecta la página /la-paloma ("Descubrí La Paloma") al CMS de Calaguala.
 *
 * Agrega al perfil del espacio 4 colecciones nuevas:
 *   - la-paloma-pagina        (una sola entrada: textos y fotos sueltos de la página)
 *   - la-paloma-playas        (una entrada por playa)
 *   - la-paloma-naturaleza    (Dunas, Bosques, Vegetación costera, Aves…)
 *   - la-paloma-experiencias  (la franja azul: Surf, Bicicleta…)
 * y renombra la colección vieja "Descubrí La Paloma" a "Portada · Tarjetas de La
 * Paloma" para que no se confunda con la página (esa colección alimenta las
 * tarjetas de la portada, no la página /la-paloma).
 *
 * Con --aplicar, además carga en cada colección las entradas que falten (se
 * comparan por título, sin importar mayúsculas ni acentos) con los textos que
 * hoy muestra el sitio, para que se vean y se puedan editar. Lo que ya está
 * cargado no se toca ni se repite; 'la-paloma-pagina' (entrada única) solo se
 * carga si no tiene ninguna. Las fotos no se cargan: mientras un campo de foto
 * esté vacío, el sitio sigue mostrando la foto actual.
 *
 * Por defecto es DRY-RUN (no escribe nada). Ver docs/aplicar-perfil-cms.md.
 *
 *   TRICODE_TOKEN=... node scripts/perfil-la-paloma.mjs              (dry-run)
 *   TRICODE_TOKEN=... node scripts/perfil-la-paloma.mjs --aplicar    (aplica)
 *   node scripts/perfil-la-paloma.mjs --desde-archivo perfil.json    (dry-run offline)
 *
 * Para volver atrás: node scripts/perfil-cms.mjs --restaurar <respaldo.json>
 * Node 18+, sin dependencias. El token va SOLO por TRICODE_TOKEN y nunca se imprime.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { createInterface } from 'node:readline/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';

const AQUI = dirname(fileURLToPath(import.meta.url));
const DIR_RESPALDO_DEFECTO = resolve(AQUI, '..', '..', '_respaldo-perfil-cms');
const SLUG_DEFECTO = 'calaguala';
const API_DEFECTO = 'https://cms.tricode.studio/api/v1';

const MAX_CAMPOS_POR_PAGINA = 40;
const MAX_LABEL = 72;
const MAX_DESCRIPCION = 180;
const MAX_GRUPO = 40;
const MAX_PAGINAS = 20;

const SLUG_VIEJA = 'recomendaciones-la-paloma';
const LABEL_VIEJO = 'Descubrí La Paloma';
const LABEL_NUEVO = 'Portada · Tarjetas de La Paloma';

// ── Definición de las colecciones ───────────────────────────────────────────
const G = {
  seo: '1 · Título y descripción en Google',
  hero: '2 · Cabecera de la página',
  playas: '3 · Playas (título y presentación)',
  mar: '4 · Más allá del mar (Laguna de Rocha)',
  faro: '5 · Faro',
  puerto: '6 · Puerto y bahías',
  dia: '7 · Un día en La Paloma',
  cierre: '8 · Cierre de la página',
};
const VACIO_FOTO = 'Si lo dejás vacío se sigue viendo la foto actual del sitio.';
const VACIO_TEXTO = 'Si lo dejás vacío se sigue viendo el texto actual del sitio.';

const t = (key, label, group, help = VACIO_TEXTO, extra = {}) => ({ key, label, type: 'text', group, help, ...extra });
const ta = (key, label, group, help = VACIO_TEXTO) => ({ key, label, type: 'textarea', group, help });
const img = (key, label, group, help = VACIO_FOTO) => ({ key, label, type: 'image', group, help });

const CAMPOS_PAGINA = [
  t('herotitulo', 'Título grande de la cabecera', G.hero, 'El título de arriba de todo, sobre la foto grande. Es el nombre de esta entrada.', { required: true }),
  t('herobajada', 'Frase debajo del título', G.hero),
  ta('heroentrada', 'Párrafo de presentación', G.hero, 'El texto centrado que aparece justo debajo de la foto grande.'),
  img('herofoto', 'Foto grande de la cabecera', G.hero),
  t('playastitulo', 'Título de la sección de playas', G.playas),
  ta('playasintro', 'Texto de presentación de las playas', G.playas, 'Las playas en sí se editan en «La Paloma · Playas».'),
  t('naturalezatitulo', 'Título de la sección «Más allá del mar»', G.mar),
  t('lagunatitulo', 'Lugar destacado: nombre', G.mar, 'Hoy es «Laguna de Rocha». ' + VACIO_TEXTO),
  ta('lagunatexto', 'Lugar destacado: descripción', G.mar),
  img('lagunafoto', 'Lugar destacado: foto', G.mar, 'Foto panorámica. ' + VACIO_FOTO),
  t('farotitulo', 'Faro: título', G.faro),
  ta('farotexto', 'Faro: texto', G.faro),
  img('farofoto', 'Faro: foto', G.faro),
  t('farocta', 'Faro: texto del enlace', G.faro, 'El enlace corto debajo del texto, por ejemplo «Explorar».'),
  t('puerto1titulo', 'Puerto: título', G.puerto, 'Primer bloque (el grande). ' + VACIO_TEXTO),
  ta('puerto1texto', 'Puerto: texto', G.puerto),
  img('puerto1foto', 'Puerto: foto', G.puerto),
  t('puerto2titulo', 'Bahías: título', G.puerto, 'Segundo bloque (el chico). ' + VACIO_TEXTO),
  ta('puerto2texto', 'Bahías: texto', G.puerto),
  img('puerto2foto', 'Bahías: foto', G.puerto),
  t('diatitulo', 'Título de «Un día en La Paloma»', G.dia),
  t('diamanana', 'Mañana', G.dia, 'Qué se puede hacer a la mañana. ' + VACIO_TEXTO),
  t('diamediodia', 'Mediodía', G.dia, 'Qué se puede hacer al mediodía. ' + VACIO_TEXTO),
  t('diatarde', 'Tarde', G.dia, 'Qué se puede hacer a la tarde. ' + VACIO_TEXTO),
  t('diaatardecer', 'Atardecer', G.dia, 'Qué se puede hacer al atardecer. ' + VACIO_TEXTO),
  t('cierretitulo', 'Cierre: título', G.cierre),
  ta('cierretexto', 'Cierre: texto', G.cierre),
  img('cierrefoto', 'Cierre: foto de fondo', G.cierre),
  t('cierrecta', 'Cierre: texto del botón', G.cierre, 'El botón que vuelve a la portada.'),
  t('seotitulo', 'Título de la pestaña del navegador', G.seo, 'Es lo que se ve en la pestaña y en Google. ' + VACIO_TEXTO),
  ta('seodescripcion', 'Descripción para Google', G.seo),
];

const ORDEN = { key: 'orden', label: 'Orden', type: 'number', help: 'Menor número = aparece primero.' };

const PAGINAS = [
  {
    slug: 'la-paloma-pagina',
    label: 'Página La Paloma · Textos y fotos',
    singularLabel: 'página',
    description: 'Textos y fotos sueltos de la página /la-paloma. Cargar una sola entrada.',
    template: 'INFO',
    icon: 'layout',
    codePrefix: 'LPP',
    titleField: 'herotitulo',
    campos: CAMPOS_PAGINA,
  },
  {
    slug: 'la-paloma-playas',
    label: 'Página La Paloma · Playas',
    singularLabel: 'playa',
    description: 'Una entrada por playa de la sección «Cada playa, un paisaje diferente».',
    template: 'SHOWCASE',
    icon: 'market',
    codePrefix: 'LPL',
    titleField: 'nombre',
    campos: [
      { key: 'nombre', label: 'Nombre de la playa', type: 'text', required: true },
      { key: 'texto', label: 'Descripción', type: 'textarea', help: VACIO_TEXTO },
      { key: 'foto', label: 'Foto', type: 'image', help: VACIO_FOTO },
      { key: 'distancia', label: 'Aclaración de distancia (opcional)', type: 'text', help: 'Ej.: «A pasos de Calaguala». Aparece arriba de la descripción.' },
      ORDEN,
    ],
  },
  {
    slug: 'la-paloma-naturaleza',
    label: 'Página La Paloma · Naturaleza',
    singularLabel: 'lugar de naturaleza',
    description: 'Los cuadros chicos de «Más allá del mar»: Dunas, Bosques, Aves…',
    template: 'SHOWCASE',
    icon: 'market',
    codePrefix: 'LPN',
    titleField: 'titulo',
    campos: [
      { key: 'titulo', label: 'Nombre', type: 'text', required: true },
      { key: 'texto', label: 'Descripción', type: 'textarea', help: VACIO_TEXTO },
      { key: 'foto', label: 'Foto', type: 'image', help: VACIO_FOTO },
      ORDEN,
    ],
  },
  {
    slug: 'la-paloma-experiencias',
    label: 'Página La Paloma · Franja de experiencias',
    singularLabel: 'experiencia',
    description: 'La franja azul con íconos: Surf, Bicicleta, Caminatas, Skate, Naturaleza.',
    template: 'SHOWCASE',
    icon: 'market',
    codePrefix: 'LPE',
    titleField: 'titulo',
    campos: [
      { key: 'titulo', label: 'Nombre', type: 'text', required: true },
      { key: 'texto', label: 'Descripción corta', type: 'textarea', help: VACIO_TEXTO },
      {
        key: 'icono',
        label: 'Ícono',
        type: 'select',
        options: ['surf', 'bici', 'caminata', 'skate', 'ave'],
        optionLabels: { surf: 'Surf', bici: 'Bicicleta', caminata: 'Caminata', skate: 'Skate', ave: 'Ave / naturaleza' },
      },
      ORDEN,
    ],
  },
];

// Textos actuales del sitio (lib/data.ts) para precargar las colecciones nuevas.
const SEMILLA = {
  'la-paloma-pagina': [
    {
      herotitulo: 'Descubrí La Paloma',
      herobajada: 'Mar, naturaleza y pequeños lugares para descubrir.',
      heroentrada: 'Desde playas abiertas al Atlántico hasta lagunas, bosques, senderos y rincones donde el tiempo parece ir más lento.',
      playastitulo: 'Cada playa, un paisaje diferente',
      playasintro: 'La costa cambia de carácter cada pocos kilómetros: de las olas abiertas del océano a las bahías protegidas junto al puerto.',
      naturalezatitulo: 'Más allá del mar',
      lagunatitulo: 'Laguna de Rocha',
      lagunatexto: 'Un paisaje de agua, humedales y vida silvestre donde el océano se encuentra con la laguna.',
      farotitulo: 'Faro de Cabo Santa María',
      farotexto: 'Uno de los símbolos de La Paloma. Sobre las rocas, frente al Atlántico, el faro ofrece una de las vistas más características de la costa.',
      farocta: 'Explorar',
      puerto1titulo: 'Puerto de La Paloma',
      puerto1texto: 'Embarcaciones, pescadores y la identidad marítima del pueblo.',
      puerto2titulo: 'Bahía Chica / Bahía Grande',
      puerto2texto: 'Aguas más protegidas y rincones tranquilos cerca del centro.',
      diatitulo: 'Un día en La Paloma',
      diamanana: 'Caminar por la costa o desayunar cerca del mar.',
      diamediodia: 'Playa, surf o paseo en bicicleta.',
      diatarde: 'Explorar el faro, el puerto o la Laguna de Rocha.',
      diaatardecer: 'La Balconada y el océano.',
      cierretitulo: 'La Paloma, a tu ritmo',
      cierretexto: 'Hay lugares para explorar y otros simplemente para quedarse mirando. En La Paloma, cada día puede encontrar su propio ritmo.',
      cierrecta: 'Volver a Calaguala',
      seotitulo: 'Descubrí La Paloma',
      seodescripcion: 'Playas, lagunas, bosques y senderos de La Paloma, Rocha. Una guía visual del lugar, desde Calaguala.',
    },
  ],
  'la-paloma-playas': [
    { nombre: 'La Balconada', texto: 'Costa abierta al océano y arena amplia. Un clásico para el atardecer.' },
    { nombre: 'El Cabito', texto: 'Pequeña e íntima, con rocas que forman piscinas naturales según la marea.' },
    { nombre: 'Los Botes', texto: 'Amplia y tranquila, cerca del centro y buena para caminar.' },
    { nombre: 'Anaconda', texto: 'Agreste y de horizonte abierto. La que tenemos a pocos pasos.', distancia: 'A pasos de Calaguala' },
    { nombre: 'La Serena', texto: 'Extensa y silenciosa, rodeada de dunas y vegetación costera.' },
    { nombre: 'La Aguada', texto: 'Costa extensa y con oleaje, en un entorno residencial tranquilo. Buena para el amanecer.' },
    { nombre: 'Bahía Chica', texto: 'Protegida y de aguas calmas, cerca del centro.' },
    { nombre: 'Bahía Grande', texto: 'Junto al puerto, con aguas resguardadas y vista a las embarcaciones.' },
  ].map((x, i) => ({ ...x, orden: i + 1 })),
  'la-paloma-naturaleza': [
    { titulo: 'Dunas', texto: 'Médanos y pasarelas de madera que bajan hasta la arena.' },
    { titulo: 'Bosques', texto: 'Montes de eucaliptos y pinos que cortan el viento del mar.' },
    { titulo: 'Vegetación costera', texto: 'Matorral bajo y plantas que sostienen la arena.' },
    { titulo: 'Observación de aves', texto: 'Aves costeras y migratorias en la laguna y los humedales.' },
  ].map((x, i) => ({ ...x, orden: i + 1 })),
  'la-paloma-experiencias': [
    { icono: 'surf', titulo: 'Surf', texto: 'Olas del Atlántico y playas para distintos niveles.' },
    { icono: 'bici', titulo: 'Bicicleta', texto: 'Recorrer La Paloma a un ritmo tranquilo.' },
    { icono: 'caminata', titulo: 'Caminatas', texto: 'Costa, dunas, bosques y senderos.' },
    { icono: 'skate', titulo: 'Skate', texto: 'El skatepark como punto de encuentro de la comunidad joven.' },
    { icono: 'ave', titulo: 'Naturaleza', texto: 'Aves, fauna y paisajes de Rocha.' },
  ].map((x, i) => ({ ...x, orden: i + 1 })),
};

const tituloDe = (slug, data) => data.herotitulo ?? data.nombre ?? data.titulo ?? slug;

// ── Núcleo puro ─────────────────────────────────────────────────────────────

export function validarDefiniciones(paginas = PAGINAS) {
  const errores = [];
  for (const p of paginas) {
    if (!/^[a-z][a-z0-9-]*$/.test(p.slug)) errores.push(`${p.slug}: slug inválido`);
    if (p.label.length > MAX_LABEL) errores.push(`${p.slug}: label de más de ${MAX_LABEL} caracteres`);
    if (p.description.length > MAX_DESCRIPCION) errores.push(`${p.slug}: description de más de ${MAX_DESCRIPCION}`);
    if (p.campos.length > MAX_CAMPOS_POR_PAGINA) errores.push(`${p.slug}: ${p.campos.length} campos (máximo ${MAX_CAMPOS_POR_PAGINA})`);
    const claves = new Set();
    for (const c of p.campos) {
      if (!/^[a-z][a-z0-9_]*$/.test(c.key)) errores.push(`${p.slug}/${c.key}: key inválida`);
      if (claves.has(c.key)) errores.push(`${p.slug}/${c.key}: key repetida`);
      claves.add(c.key);
      if (!c.label || c.label.length > MAX_LABEL) errores.push(`${p.slug}/${c.key}: label vacía o de más de ${MAX_LABEL}`);
      if (c.help && c.help.length > MAX_DESCRIPCION) errores.push(`${p.slug}/${c.key}: help de ${c.help.length} caracteres (máximo ${MAX_DESCRIPCION})`);
      if (c.group && c.group.length > MAX_GRUPO) errores.push(`${p.slug}/${c.key}: group de más de ${MAX_GRUPO}`);
    }
    if (!claves.has(p.titleField)) errores.push(`${p.slug}: titleField "${p.titleField}" no existe`);
    for (const fila of SEMILLA[p.slug] ?? []) {
      for (const k of Object.keys(fila)) if (!claves.has(k)) errores.push(`${p.slug}: la semilla usa "${k}", que no es un campo`);
    }
  }
  return errores;
}

function paginaCustom(def, orden) {
  return {
    key: `custom:${def.slug}`,
    slug: def.slug,
    label: def.label,
    singularLabel: def.singularLabel,
    description: def.description,
    group: 'contenido',
    icon: def.icon,
    template: def.template,
    audience: 'BOTH',
    dataMode: 'MANUAL',
    dataSchema: {
      tableName: `custom_${def.slug.replace(/-/g, '_')}`,
      contentTypeSlug: def.slug,
      fields: def.campos.map((c, i) => ({
        key: c.key,
        label: c.label,
        type: c.type,
        required: c.required === true,
        unique: false,
        ...(c.options ? { options: c.options } : {}),
        ...(c.optionLabels ? { optionLabels: c.optionLabels } : {}),
        ...(c.help ? { description: c.help } : {}),
        ...(c.group ? { group: c.group, groupLabel: c.group } : {}),
        order: i,
      })),
    },
    presentation: 'table',
    codePrefix: def.codePrefix,
    titleField: def.titleField,
    order: orden,
  };
}

/** Fusiona en una COPIA del perfil. Idempotente. Devuelve { perfil, cambios, errores }. */
export function fusionarPerfil(perfil) {
  const nuevo = structuredClone(perfil);
  const cambios = [];
  const errores = [...validarDefiniciones()];
  if (!Array.isArray(nuevo.customPages)) {
    errores.push('El perfil no tiene customPages.');
    return { perfil, cambios, errores };
  }

  // 1) Páginas nuevas.
  let orden = nuevo.customPages.reduce((m, p) => Math.max(m, Number.isFinite(p.order) ? p.order : -1), -1);
  for (const def of PAGINAS) {
    const existente = nuevo.customPages.find((p) => p?.slug === def.slug || p?.dataSchema?.contentTypeSlug === def.slug);
    if (existente) continue;
    if (nuevo.customPages.length >= MAX_PAGINAS) {
      const hay = perfil.customPages.length;
      const faltantes = PAGINAS.filter((d) => !perfil.customPages.some((p) => p?.slug === d.slug || p?.dataSchema?.contentTypeSlug === d.slug)).length;
      const sobran = hay + faltantes - MAX_PAGINAS;
      errores.push(
        `El CMS admite máximo ${MAX_PAGINAS} páginas custom: hay ${hay} y faltan crear ${faltantes} (excede por ${sobran}). ` +
          `No se escribió nada en el CMS; liberá ${sobran} página(s) custom y volvé a correr el script.`,
      );
      break;
    }
    orden += 1;
    nuevo.customPages.push(paginaCustom(def, orden));
    cambios.push(`nueva colección «${def.label}» (${def.slug}, ${def.campos.length} campos)`);
  }

  // 2) Renombrar la colección vieja (página, recurso del menú y módulo) para que no se confunda.
  const vieja = nuevo.customPages.find((p) => p?.slug === SLUG_VIEJA);
  if (vieja && vieja.label === LABEL_VIEJO) {
    vieja.label = LABEL_NUEVO;
    cambios.push(`renombra «${LABEL_VIEJO}» → «${LABEL_NUEVO}»`);
    for (const r of nuevo.adminResources ?? []) {
      if (r?.resourceKey === `custom:${SLUG_VIEJA}` && r.label === LABEL_VIEJO) r.label = LABEL_NUEVO;
    }
    for (const m of nuevo.modules ?? []) {
      if (m?.key === `custom:${SLUG_VIEJA}` && m.label === LABEL_VIEJO) m.label = LABEL_NUEVO;
    }
  }

  if (errores.length) return { perfil, cambios: [], errores };
  return { perfil: nuevo, cambios, errores };
}

// ── I/O ─────────────────────────────────────────────────────────────────────

class ErrorApi extends Error {}

function leerArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) continue;
    const [k, ...resto] = a.slice(2).split('=');
    if (resto.length) out[k] = resto.join('=');
    else if (['slug', 'desde-archivo'].includes(k)) {
      const v = argv[++i];
      if (v === undefined || v.startsWith('--')) throw new ErrorApi(`Falta el valor de --${k}.`);
      out[k] = v;
    } else out[k] = true;
  }
  return out;
}

async function api(base, token, ruta, { metodo = 'GET', json } = {}) {
  let res;
  try {
    res = await fetch(`${base}${ruta}`, {
      method: metodo,
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
        ...(json !== undefined ? { 'Content-Type': 'application/json' } : {}),
      },
      body: json === undefined ? undefined : JSON.stringify(json),
    });
  } catch (err) {
    throw new ErrorApi(`No pude conectarme a ${base} (${err.cause?.code ?? err.message}).`);
  }
  const cuerpo = await res.json().catch(() => null);
  if (res.status === 401) throw new ErrorApi('401: el token es inválido o venció. Copiá uno nuevo.');
  if (res.status === 403) throw new ErrorApi('403: tu usuario no tiene permiso para esta operación.');
  if (!res.ok) throw new ErrorApi(`${metodo} ${ruta} → ${res.status}: ${(JSON.stringify(cuerpo) ?? '').slice(0, 300)}`);
  return cuerpo;
}

const perfilDe = (p) => (p && typeof p === 'object' && p.profile ? p.profile : p ?? {});
const listaDe = (j) => (Array.isArray(j) ? j : j?.items ?? j?.data ?? []);

function sello() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
}

async function confirmar(pregunta, automatico) {
  if (automatico) return true;
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const r = (await rl.question(`${pregunta} Escribí "si" para continuar: `)).trim().toLowerCase();
  rl.close();
  return r === 'si' || r === 'sí';
}

const normalizar = (s) => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

const POR_PAGINA = 100;
const MAX_PAGINAS_LECTURA = 50;

async function listarEntradas(base, token, ruta) {
  const todas = [];
  for (let page = 1; page <= MAX_PAGINAS_LECTURA; page++) {
    const lote = listaDe(await api(base, token, `${ruta}?pageSize=${POR_PAGINA}&page=${page}`));
    todas.push(...lote);
    if (lote.length < POR_PAGINA) break;
  }
  return todas;
}

async function cargarSemilla(base, token, slug) {
  const informe = [];
  for (const def of PAGINAS) {
    const filas = SEMILLA[def.slug] ?? [];
    const ruta = `/tenants/${encodeURIComponent(slug)}/content-types/${def.slug}/entries`;
    let existentes;
    try {
      existentes = await listarEntradas(base, token, ruta);
    } catch (err) {
      if (err instanceof ErrorApi && err.message.includes('→ 404')) {
        throw new ErrorApi(
          `La API no encontró el tipo de contenido «${def.slug}» (404). Revisá que el perfil del espacio tenga esa colección (customPages) y volvé a correr el script. Detalle: ${err.message}`,
        );
      }
      throw err;
    }
    let aCrear;
    if (def.slug === 'la-paloma-pagina') {
      aCrear = existentes.length ? [] : filas;
    } else {
      const tengo = new Set(existentes.map((e) => normalizar(tituloDe(def.slug, e?.data ?? e))));
      for (const e of existentes) if (typeof e?.title === 'string') tengo.add(normalizar(e.title));
      aCrear = filas.filter((fila) => !tengo.has(normalizar(tituloDe(def.slug, fila))));
    }
    for (const fila of aCrear) {
      await api(base, token, ruta, { metodo: 'POST', json: { title: tituloDe(def.slug, fila), status: 'PUBLISHED', data: fila } });
    }
    informe.push(`  ${aCrear.length ? '+' : '·'} ${def.slug}: ${aCrear.length} creadas, ${filas.length - aCrear.length} ya estaban`);
  }
  return informe;
}

async function principal() {
  const args = leerArgs(process.argv.slice(2));
  const slug = args.slug ?? SLUG_DEFECTO;
  const base = (process.env.TRICODE_API_BASE ?? API_DEFECTO).replace(/\/+$/, '');
  const token = process.env.TRICODE_TOKEN;
  const ruta = `/tenants/${encodeURIComponent(slug)}/workspace-profile`;
  const dirRespaldo = process.env.TRICODE_BACKUP_DIR ?? DIR_RESPALDO_DEFECTO;

  let actual;
  if (args['desde-archivo']) {
    if (args.aplicar) throw new ErrorApi('--desde-archivo solo sirve para dry-run.');
    actual = perfilDe(JSON.parse(readFileSync(args['desde-archivo'], 'utf8')));
  } else {
    if (!token) throw new ErrorApi('Falta la variable de entorno TRICODE_TOKEN.');
    actual = perfilDe(await api(base, token, ruta));
  }

  const res = fusionarPerfil(actual);
  console.log(`Espacio: ${slug}   API: ${base}`);
  console.log(args.aplicar ? 'Modo: APLICAR' : 'Modo: dry-run (no se escribe nada; usá --aplicar para aplicar)');
  if (res.errores.length) {
    console.error('\nNo se puede continuar. No se aplicó nada:');
    for (const e of res.errores) console.error(`  ✗ ${e}`);
    process.exitCode = 1;
    return;
  }
  console.log('\nCambios en el perfil:');
  if (!res.cambios.length) console.log('  (sin cambios: el perfil ya está al día)');
  for (const c of res.cambios) console.log(`  + ${c}`);
  console.log('\nContenido a cargar (solo las entradas que falten en cada colección, comparadas por título):');
  for (const def of PAGINAS) console.log(`  · ${def.slug}: ${(SEMILLA[def.slug] ?? []).length} entrada(s)`);
  if (!args.aplicar) return;

  if (!(await confirmar('\nSe va a modificar el perfil del CMS y cargar contenido.', args.si))) {
    return console.log('Cancelado. No se escribió nada.');
  }

  let perfilFinal = actual;
  if (res.cambios.length) {
    mkdirSync(dirRespaldo, { recursive: true });
    const archivo = join(dirRespaldo, `perfil-${slug}-${sello()}-la-paloma.json`);
    writeFileSync(archivo, JSON.stringify(actual, null, 2), 'utf8');
    console.log(`\nRespaldo guardado en: ${archivo}`);

    const releido = perfilDe(await api(base, token, ruta));
    if (JSON.stringify(releido) !== JSON.stringify(actual)) {
      console.error('\nEl perfil cambió en el CMS desde que lo leí. No se escribió nada. Volvé a correr el script.');
      process.exitCode = 1;
      return;
    }
    try {
      await api(base, token, ruta, { metodo: 'PUT', json: { profile: res.perfil } });
    } catch (err) {
      console.error(`\nFalló el PUT: ${err.message}`);
      console.error(`El perfil NO se modificó o quedó como antes. Respaldo: ${archivo}`);
      console.error(`Para restaurarlo: node scripts/perfil-cms.mjs --restaurar "${archivo}"`);
      process.exitCode = 1;
      return;
    }
    const guardado = perfilDe(await api(base, token, ruta));
    const verif = fusionarPerfil(guardado);
    if (verif.errores.length || verif.cambios.length) {
      console.error('\nOJO: el CMS guardó el perfil pero no refleja todos los cambios:');
      for (const x of [...verif.errores, ...verif.cambios]) console.error(`  ✗ ${x}`);
      console.error(`Respaldo: ${archivo}. Restaurar: node scripts/perfil-cms.mjs --restaurar "${archivo}"`);
      process.exitCode = 1;
      return;
    }
    perfilFinal = guardado;
    console.log('Perfil guardado y verificado.');
  }

  const sinPaginas = PAGINAS.filter(
    (d) => !(perfilFinal.customPages ?? []).some((p) => p?.slug === d.slug || p?.dataSchema?.contentTypeSlug === d.slug),
  ).map((d) => d.slug);
  if (sinPaginas.length) {
    console.error(`
No se carga contenido: el perfil del CMS no tiene las colecciones ${sinPaginas.join(', ')}.`);
    console.error('Corré el script de nuevo para que agregue las páginas al perfil, o revisá el perfil del espacio.');
    process.exitCode = 1;
    return;
  }

  try {
    console.log('\nCargando contenido:');
    for (const l of await cargarSemilla(base, token, slug)) console.log(l);
  } catch (err) {
    console.error(`\nEl perfil quedó bien pero falló la carga de contenido: ${err.message}`);
    console.error('Podés volver a correr el script: completa solo las entradas que falten.');
    process.exitCode = 1;
    return;
  }
  console.log('\nListo.');
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  principal().catch((err) => {
    console.error(err instanceof ErrorApi ? err.message : `Error: ${err.message}`);
    process.exitCode = 1;
  });
}
