import type { Extensiones } from './types';

/** alt descriptivo desde el mapa de fotos; si no está, usa el contexto. */
export function altDe(ext: Extensiones, url: string, contexto: string): string {
  return ext.altFotos[url] ?? `${contexto} — Calaguala, La Paloma`;
}
