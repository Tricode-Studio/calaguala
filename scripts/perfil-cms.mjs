#!/usr/bin/env node
/**
 * Aplica al perfil del espacio "calaguala" en Tricode CMS:
 *   (a) los campos editables nuevos de `portada` y `ubicacion-contacto`
 *       (se leen del bloque JSON al final de docs/campos-cms.md), y
 *   (b) los avisos por correo de reservas (notifyOnCreate, aviso de "cancelada"
 *       al huésped y contactEmail del admin).
 *
 * Por defecto es DRY-RUN: lee el perfil actual y muestra qué cambiaría, sin
 * escribir nada. Solo con --aplicar hace el PUT (con respaldo previo y
 * verificación posterior). Ver docs/aplicar-perfil-cms.md.
 *
 *   TRICODE_TOKEN=... node scripts/perfil-cms.mjs                 (dry-run)
 *   TRICODE_TOKEN=... node scripts/perfil-cms.mjs --aplicar       (aplica)
 *   TRICODE_TOKEN=... node scripts/perfil-cms.mjs --restaurar <archivo.json>
 *   node scripts/perfil-cms.mjs --desde-archivo perfil.json       (dry-run offline)
 *
 * Node 18+, sin dependencias. El token (Bearer de un usuario con TENANTS_WRITE)
 * va SOLO por la variable de entorno TRICODE_TOKEN y nunca se imprime.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { createInterface } from 'node:readline/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';

const AQUI = dirname(fileURLToPath(import.meta.url));
const DOC_CAMPOS = resolve(AQUI, '..', 'docs', 'campos-cms.md');
const DIR_RESPALDO_DEFECTO = resolve(AQUI, '..', '..', '_respaldo-perfil-cms');

const SLUG_DEFECTO = 'calaguala';
const API_DEFECTO = 'https://cms.tricode.studio/api/v1';
const EMAIL_ADMIN = 'calagualacamp@gmail.com';
const SLUG_RESERVAS = 'reservas';

// Límites del normalizador del CMS (apps/api/src/tenants/workspace-profile.ts).
const MAX_CAMPOS_POR_PAGINA = 40;
const MAX_LABEL = 72;
const MAX_DESCRIPCION = 180;
const MAX_GRUPO = 40;
const TIPOS_VALIDOS = new Set([
  'text', 'textarea', 'number', 'boolean', 'date', 'datetime', 'email',
  'phone', 'url', 'select', 'json', 'relation', 'image', 'file',
]);

// ── Núcleo puro (sin I/O) ───────────────────────────────────────────────────

/** Extrae el array JSON de campos nuevos del markdown (último bloque ```json). */
export function leerCamposNuevos(markdown) {
  const bloques = [...markdown.matchAll(/```json\s*([\s\S]*?)```/g)];
  if (!bloques.length) throw new Error('No encontré el bloque ```json en docs/campos-cms.md');
  const datos = JSON.parse(bloques[bloques.length - 1][1]);
  if (!Array.isArray(datos) || !datos.length) throw new Error('El bloque JSON de campos está vacío');
  return datos;
}

function validarCampoNuevo(c) {
  const problemas = [];
  if (!c || typeof c !== 'object') return ['entrada no es un objeto'];
  if (!/^[a-z][a-z0-9_]*$/.test(c.key ?? '')) problemas.push(`key inválida "${c.key}"`);
  if (!c.collection) problemas.push('falta collection');
  if (!TIPOS_VALIDOS.has(c.type)) problemas.push(`type inválido "${c.type}"`);
  if (!c.label || c.label.length > MAX_LABEL) problemas.push(`label vacía o de más de ${MAX_LABEL} caracteres`);
  if (c.help && c.help.length > MAX_DESCRIPCION) problemas.push(`help de más de ${MAX_DESCRIPCION} caracteres`);
  if (c.group && c.group.length > MAX_GRUPO) problemas.push(`group de más de ${MAX_GRUPO} caracteres`);
  return problemas.map((p) => `Campo ${c?.collection}/${c?.key}: ${p}`);
}

/** La página custom de una colección: por `slug` de la página, o por contentTypeSlug. */
function buscarPagina(perfil, slug) {
  const paginas = Array.isArray(perfil.customPages) ? perfil.customPages : [];
  const porSlug = paginas.filter((p) => p?.slug === slug);
  if (porSlug.length === 1) return { pagina: porSlug[0] };
  if (porSlug.length > 1) return { error: `hay ${porSlug.length} páginas con slug "${slug}"` };
  const porTipo = paginas.filter((p) => p?.dataSchema?.contentTypeSlug === slug);
  if (porTipo.length === 1) return { pagina: porTipo[0] };
  if (porTipo.length > 1) return { error: `hay ${porTipo.length} páginas con contentTypeSlug "${slug}" (${porTipo.map((p) => p.slug).join(', ')})` };
  return { error: `no existe una página custom para "${slug}"` };
}

/**
 * Fusiona los cambios en una COPIA del perfil (el original no se muta).
 * Devuelve { perfil, cambios[], errores[] }. Si hay errores, `perfil` es la
 * copia sin tocar y no debe aplicarse nada. Idempotente: sobre un perfil ya
 * fusionado, `cambios` queda vacío.
 */
export function fusionarPerfil(perfil, opciones = {}) {
  const {
    campos = [],
    contactEmail = EMAIL_ADMIN,
    forzarEmail = false,
    slugReservas = SLUG_RESERVAS,
  } = opciones;
  const original = structuredClone(perfil);
  const nuevo = structuredClone(perfil);
  const cambios = [];
  const errores = [];

  // 1) Correo del admin.
  const actual = nuevo.quickActions?.contactEmail;
  if (!actual) {
    nuevo.quickActions = { ...(nuevo.quickActions ?? {}), contactEmail };
    cambios.push(`contactEmail → ${contactEmail}`);
  } else if (String(actual).trim().toLowerCase() !== contactEmail.toLowerCase()) {
    if (forzarEmail) {
      nuevo.quickActions.contactEmail = contactEmail;
      cambios.push(`contactEmail ${actual} → ${contactEmail} (forzado)`);
    } else {
      errores.push(
        `Conflicto: quickActions.contactEmail ya vale "${actual}" y no coincide con ${contactEmail}. ` +
          'No lo piso; usá --forzar-email si querés cambiarlo.',
      );
    }
  }

  // 2) Reservas: notifyOnCreate y aviso al huésped en "cancelada".
  const r = buscarPagina(nuevo, slugReservas);
  if (r.error) {
    errores.push(`Reservas: ${r.error}.`);
  } else {
    const pagina = r.pagina;
    const tieneEmail = (pagina.dataSchema?.fields ?? []).some((f) => f?.key === 'email');
    if (!tieneEmail) errores.push('Reservas: la colección no tiene un campo "email" en su esquema.');
    const estados = pagina.workflow?.states;
    if (!Array.isArray(estados) || !estados.length) {
      errores.push('Reservas: la página no tiene workflow con estados.');
    } else {
      const listado = estados.map((s) => `${s.key} ("${s.label}")`).join(', ');
      let candidatos = estados.filter((s) => s.key === 'cancelada');
      if (!candidatos.length) candidatos = estados.filter((s) => /cancelad/i.test(`${s.key}`) || /cancelad/i.test(`${s.label}`));
      if (candidatos.length !== 1) {
        errores.push(
          `Reservas: esperaba exactamente un estado "cancelada" y encontré ${candidatos.length}. ` +
            `Estados del workflow: ${listado}.`,
        );
      } else if (tieneEmail) {
        const estado = candidatos[0];
        if (estado.notifyEmailField !== 'email') {
          cambios.push(
            `estado ${estado.key}: notifyEmailField ${estado.notifyEmailField ?? '(vacío)'} → email`,
          );
          estado.notifyEmailField = 'email';
        }
      }
    }
    if (pagina.notifyOnCreate !== true) {
      cambios.push(`reservas: notifyOnCreate ${pagina.notifyOnCreate === true} → true`);
      pagina.notifyOnCreate = true;
    }
  }

  // 3) Campos nuevos en portada y ubicacion-contacto.
  for (const c of campos) errores.push(...validarCampoNuevo(c));
  const porColeccion = new Map();
  for (const c of campos) {
    if (!porColeccion.has(c.collection)) porColeccion.set(c.collection, []);
    porColeccion.get(c.collection).push(c);
  }
  for (const [coleccion, lista] of porColeccion) {
    const p = buscarPagina(nuevo, coleccion);
    if (p.error) {
      errores.push(`Campos de "${coleccion}": ${p.error}.`);
      continue;
    }
    const esquema = p.pagina.dataSchema;
    if (!esquema || !Array.isArray(esquema.fields)) {
      errores.push(`Campos de "${coleccion}": la página no tiene dataSchema.fields.`);
      continue;
    }
    const existentes = new Set(esquema.fields.map((f) => f.key));
    let orden = esquema.fields.reduce((m, f) => Math.max(m, Number.isFinite(f.order) ? f.order : -1), -1);
    const agregados = [];
    const salteados = [];
    for (const c of lista) {
      if (existentes.has(c.key)) {
        salteados.push(c.key);
        continue;
      }
      orden += 1;
      const campo = {
        key: c.key,
        label: c.label,
        type: c.type,
        required: false,
        unique: false,
        ...(c.help ? { description: c.help } : {}),
        ...(c.group ? { group: c.group, groupLabel: c.group } : {}),
        order: orden,
      };
      esquema.fields.push(campo);
      existentes.add(c.key);
      agregados.push(c.key);
    }
    if (esquema.fields.length > MAX_CAMPOS_POR_PAGINA) {
      errores.push(
        `Campos de "${coleccion}": quedarían ${esquema.fields.length} campos y el CMS admite máximo ${MAX_CAMPOS_POR_PAGINA}.`,
      );
    }
    if (agregados.length) cambios.push(`${coleccion}: agrega ${agregados.length} campos: ${agregados.join(', ')}`);
    if (salteados.length) cambios.push(`(${coleccion}: ya existían ${salteados.length}: ${salteados.join(', ')})`.replace(/^/, '~'));
  }

  // Las líneas "~(...)" son informativas: no cuentan como cambio real.
  const informativos = cambios.filter((c) => c.startsWith('~')).map((c) => c.slice(1));
  const reales = cambios.filter((c) => !c.startsWith('~'));
  if (errores.length) return { perfil: original, cambios: reales, informativos, errores };
  return { perfil: nuevo, cambios: reales, informativos, errores };
}

// ── I/O ─────────────────────────────────────────────────────────────────────

function leerArgs(argv) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) {
      out._.push(a);
      continue;
    }
    const [k, ...resto] = a.slice(2).split('=');
    if (resto.length) out[k] = resto.join('=');
    else if (['slug', 'restaurar', 'desde-archivo'].includes(k)) {
      const valor = argv[++i];
      if (valor === undefined || valor.startsWith('--')) throw new ErrorApi(`Falta el valor de --${k}.`);
      out[k] = valor;
    }
    else out[k] = true;
  }
  return out;
}

class ErrorApi extends Error {}

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
    throw new ErrorApi(`No pude conectarme a ${base} (${err.cause?.code ?? err.message}). Revisá la red y TRICODE_API_BASE.`);
  }
  const cuerpo = await res.json().catch(() => null);
  if (res.status === 401) throw new ErrorApi('401: el token es inválido o venció. Pedí uno nuevo a quien administra el CMS.');
  if (res.status === 403) throw new ErrorApi('403: tu usuario no tiene permiso (hace falta TENANTS_WRITE para aplicar, SETTINGS_READ para leer).');
  if (!res.ok) throw new ErrorApi(`${metodo} ${ruta} → ${res.status}: ${(JSON.stringify(cuerpo) ?? '').slice(0, 300)}`);
  return cuerpo;
}

const perfilDe = (payload) => (payload && typeof payload === 'object' && payload.profile ? payload.profile : payload ?? {});

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

function mostrarResumen(res) {
  if (res.informativos?.length) for (const i of res.informativos) console.log(`  · ${i}`);
  if (!res.cambios.length) console.log('  (sin cambios: el perfil ya está al día)');
  for (const c of res.cambios) console.log(`  + ${c}`);
}

async function principal() {
  const args = leerArgs(process.argv.slice(2));
  const slug = args.slug ?? SLUG_DEFECTO;
  const base = (process.env.TRICODE_API_BASE ?? API_DEFECTO).replace(/\/+$/, '');
  const token = process.env.TRICODE_TOKEN;
  const ruta = `/tenants/${encodeURIComponent(slug)}/workspace-profile`;
  const dirRespaldo = process.env.TRICODE_BACKUP_DIR ?? DIR_RESPALDO_DEFECTO;

  // Restaurar un respaldo (PUT del perfil guardado).
  if (args.restaurar) {
    if (!token) throw new ErrorApi('Falta la variable de entorno TRICODE_TOKEN.');
    const crudo = JSON.parse(readFileSync(args.restaurar, 'utf8'));
    const perfil = perfilDe(crudo);
    if (!perfil || !Array.isArray(perfil.customPages)) throw new ErrorApi('El archivo no parece un perfil (falta customPages).');
    console.log(`Se va a REEMPLAZAR el perfil de "${slug}" en ${base} por el de ${args.restaurar}.`);
    if (!(await confirmar('', args.si))) return console.log('Cancelado. No se escribió nada.');
    const previo = perfilDe(await api(base, token, ruta));
    mkdirSync(dirRespaldo, { recursive: true });
    const archivoPrevio = join(dirRespaldo, `perfil-${slug}-${sello()}-previo-restauracion.json`);
    writeFileSync(archivoPrevio, JSON.stringify(previo, null, 2), 'utf8');
    console.log(`Perfil actual guardado en: ${archivoPrevio}`);
    await api(base, token, ruta, { metodo: 'PUT', json: { profile: perfil } });
    const tras = perfilDe(await api(base, token, ruta));
    if (JSON.stringify(tras) !== JSON.stringify(perfil)) {
      console.error('\nOJO: el CMS guardó el perfil pero lo que devuelve no coincide con el restaurado.');
      console.error(`Perfil previo a la restauración: ${archivoPrevio}`);
      process.exitCode = 1;
      return;
    }
    console.log('Perfil restaurado y verificado.');
    return;
  }

  // Perfil actual: del CMS, o de un archivo (solo dry-run offline).
  let actual;
  if (args['desde-archivo']) {
    if (args.aplicar) throw new ErrorApi('--desde-archivo solo sirve para dry-run.');
    actual = perfilDe(JSON.parse(readFileSync(args['desde-archivo'], 'utf8')));
  } else {
    if (!token) throw new ErrorApi('Falta la variable de entorno TRICODE_TOKEN (token Bearer de un usuario con TENANTS_WRITE).');
    actual = perfilDe(await api(base, token, ruta));
  }

  const opciones = { campos: leerCamposNuevos(readFileSync(DOC_CAMPOS, 'utf8')), forzarEmail: Boolean(args['forzar-email']) };
  const res = fusionarPerfil(actual, opciones);

  console.log(`Espacio: ${slug}   API: ${base}`);
  console.log(args.aplicar ? 'Modo: APLICAR' : 'Modo: dry-run (no se escribe nada; usá --aplicar para aplicar)');
  if (res.errores.length) {
    console.error('\nNo se puede continuar. No se aplicó nada:');
    for (const e of res.errores) console.error(`  ✗ ${e}`);
    process.exitCode = 1;
    return;
  }
  console.log('\nCambios:');
  mostrarResumen(res);
  if (!args.aplicar) return;
  if (!res.cambios.length) return console.log('\nNada que aplicar.');

  if (!(await confirmar('\nSe va a modificar el perfil en el CMS.', args.si))) return console.log('Cancelado. No se escribió nada ni se guardó respaldo.');

  // Respaldo previo del perfil completo.
  mkdirSync(dirRespaldo, { recursive: true });
  const archivo = join(dirRespaldo, `perfil-${slug}-${sello()}.json`);
  writeFileSync(archivo, JSON.stringify(actual, null, 2), 'utf8');
  console.log(`\nRespaldo guardado en: ${archivo}`);

  // Si el perfil cambió desde la lectura inicial, no pisamos el cambio ajeno.
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

  // Verificación: volver a leer y comprobar que no queda nada por fusionar.
  const guardado = perfilDe(await api(base, token, ruta));
  const verif = fusionarPerfil(guardado, opciones);
  if (verif.errores.length || verif.cambios.length) {
    console.error('\nOJO: el CMS guardó el perfil pero no refleja todos los cambios:');
    for (const x of [...verif.errores, ...verif.cambios]) console.error(`  ✗ ${x}`);
    console.error(`Respaldo: ${archivo}. Restaurar: node scripts/perfil-cms.mjs --restaurar "${archivo}"`);
    process.exitCode = 1;
    return;
  }
  console.log('\nListo. Verificado: el CMS devuelve el perfil con todos los cambios.');
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  principal().catch((err) => {
    console.error(err instanceof ErrorApi ? err.message : `Error: ${err.message}`);
    process.exitCode = 1;
  });
}
