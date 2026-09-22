import type { Alojamiento } from './types';

export function textoPrecio(a: Pick<Alojamiento, 'precio' | 'precioUnidad'>): string {
  if (a.precio === null || a.precio <= 0) return 'Tarifa a consultar';
  const monto = new Intl.NumberFormat('es-UY', {
    style: 'currency',
    currency: 'UYU',
    maximumFractionDigits: 0,
  }).format(a.precio);
  return `${monto} ${a.precioUnidad}`.trim();
}
