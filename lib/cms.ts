/**
 * Módulo ÚNICO de acceso a datos.
 * Intenta Tricode CMS; si no hay tenant configurado, la red falla o la
 * respuesta no cumple el schema, cae a lib/data.ts (misma forma).
 * Server-only: no importar desde componentes 'use client'.
 */
import 'server-only';
import type { z } from 'zod';
import * as local from './data';
import {
  alojamientoSchema,
  preguntaFrecuenteSchema,
  recomendacionSchema,
  singletonSchemas,
} from './schemas';
import type {
  Alojamiento,
  Extensiones,
  LandingConfig,
  PreguntaFrecuente,
  Recomendacion,
} from './types';

const BASE = process.env.NEXT_PUBLIC_TRICODE_API_BASE_URL?.replace(/\/$/, '');
const TENANT = process.env.NEXT_PUBLIC_TRICODE_TENANT_SLUG;
const REVALIDAR_SEGUNDOS = 300;
const TIMEOUT_MS = 4000;

export const cmsConectado = Boolean(BASE && TENANT);

function urlPublica(ruta: string): string {
  return `${BASE}/api/v1/public/${TENANT}${ruta}`;
}

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
 * Normaliza entries: acepta `[...]`, `{ data: [...] }` o `{ items: [...] }`,
 * y entries planas o envueltas (`{ id, slug, status, data|fields: {...} }`).
 * Solo se aceptan entries PUBLISHED (si el CMS informa estado).
 */
function extraerEntries(json: unknown): Record<string, unknown>[] {
  const lista = Array.isArray(json)
    ? json
    : ((json as { data?: unknown; items?: unknown })?.data ??
       (json as { items?: unknown })?.items);
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

async function coleccion<T>(slug: string, schema: z.ZodType<T>, fallback: T[]): Promise<T[]> {
  const json = await getJson(`/content-types/${slug}/entries`, slug);
  if (json === null) return fallback;
  const validas: T[] = [];
  for (const entry of extraerEntries(json)) {
    const r = schema.safeParse(entry);
    if (r.success) validas.push(r.data);
    else console.warn(`[cms] entry inválida en ${slug}:`, r.error.issues[0]?.message);
  }
  return validas.length ? validas : fallback;
}

const porOrden = <T extends { orden: number }>(a: T, b: T) => a.orden - b.orden;

// ── API pública del módulo ─────────────────────────────────────────────────
export async function getLandingConfig(): Promise<LandingConfig> {
  const json = (await getJson('/landing-config', 'landing-config')) as Record<string, unknown> | null;
  const settings = (json?.data ?? json?.settings ?? json) as Record<string, unknown> | null;
  const out = { ...local.landingConfig };
  if (!settings) return out;
  for (const clave of Object.keys(singletonSchemas) as (keyof LandingConfig)[]) {
    const r = singletonSchemas[clave].safeParse(settings[clave]);
    if (r.success) (out as Record<string, unknown>)[clave] = r.data;
  }
  return out;
}

export async function getAlojamientos(): Promise<Alojamiento[]> {
  return (await coleccion('alojamientos', alojamientoSchema, local.alojamientos)).sort(porOrden);
}

export async function getPreguntasFrecuentes(): Promise<PreguntaFrecuente[]> {
  return (await coleccion('preguntas-frecuentes', preguntaFrecuenteSchema, local.preguntasFrecuentes)).sort(porOrden);
}

export async function getRecomendaciones(): Promise<Recomendacion[]> {
  return (await coleccion('recomendaciones-la-paloma', recomendacionSchema, local.recomendaciones)).sort(porOrden);
}

/** Extensiones no modeladas aún en el CMS: por ahora siempre locales. */
export async function getExtensiones(): Promise<Extensiones> {
  return local.extensiones;
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

// ── BOOKINGS (datos operativos, sin caché) ────────────────────────────────
export async function consultarDisponibilidadCms(params: URLSearchParams): Promise<unknown | null> {
  if (!cmsConectado) return null;
  const res = await fetch(urlPublica(`/reservations/availability?${params}`), {
    cache: 'no-store',
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`Disponibilidad HTTP ${res.status}`);
  return res.json();
}

export async function crearSolicitudCms(body: unknown): Promise<{ id?: string }> {
  if (!cmsConectado) throw new CmsNoConectadoError();
  const res = await fetch(urlPublica('/reservations'), {
    method: 'POST',
    cache: 'no-store',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`Solicitud HTTP ${res.status}`);
  return (await res.json().catch(() => ({}))) as { id?: string };
}

export class CmsNoConectadoError extends Error {
  constructor() {
    super('No hay tenant de Tricode CMS configurado.');
  }
}
