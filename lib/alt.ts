import type { Extensiones } from './types';

/**
 * Nombre de archivo de una foto, local (`/fotos/portada.webp`) o subida al
 * storage del CMS (`.../2026/11/<uuid>-portada.webp`): el storage antepone un
 * uuid al nombre original, así que se descarta para que el mapa de alts siga
 * sirviendo después de migrar las fotos.
 */
function archivo(url: string): string {
  const nombre = (url.split(/[?#]/)[0] ?? '').split('/').pop() ?? '';
  return nombre.replace(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}-/i, '').toLowerCase();
}

let indice: Map<string, string> | null = null;

/** alt descriptivo desde el mapa de fotos; si no está, usa el contexto. */
export function altDe(ext: Extensiones, url: string, contexto: string): string {
  if (ext.altFotos[url]) return ext.altFotos[url];
  indice ??= new Map(Object.entries(ext.altFotos).map(([k, v]) => [archivo(k), v]));
  return indice.get(archivo(url)) ?? `${contexto} — Calaguala, La Paloma`;
}
