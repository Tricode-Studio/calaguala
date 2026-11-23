/** Íconos válidos de la franja de experiencias de La Paloma (los mismos que dibuja IconoPaloma y ofrece el select del CMS). */
export const ICONOS_PALOMA = ['surf', 'bici', 'caminata', 'skate', 'ave'] as const;
export type IconoPalomaNombre = (typeof ICONOS_PALOMA)[number];

/** Devuelve el ícono si está en la lista; si no, undefined. */
export const iconoPalomaValido = (v: unknown): IconoPalomaNombre | undefined =>
  typeof v === 'string' ? ICONOS_PALOMA.find((i) => i === v.trim()) : undefined;
