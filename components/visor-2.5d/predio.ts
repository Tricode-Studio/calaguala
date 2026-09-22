/**
 * Plano del predio en coordenadas de planta (unidades arbitrarias).
 * ⚠️ PLACEHOLDER ilustrativo: la distribución real se reemplaza cuando
 * Calaguala entregue el plano. No es contenido del CMS: es geometría del asset.
 */
export type CapaId = 'terreno' | 'distribucion' | 'servicios';

export interface Capa {
  id: CapaId;
  nombre: string;
  descripcion: string;
}

export const CAPAS: Capa[] = [
  { id: 'terreno', nombre: 'Terreno', descripcion: 'El predio, los caminos y la vegetación' },
  { id: 'distribucion', nombre: 'Carpas', descripcion: 'Parcelas para carpa y glamping' },
  { id: 'servicios', nombre: 'Servicios y entorno', descripcion: 'Cocina, baños, duchas y zonas comunes' },
];

export type Forma = 'caja' | 'carpa' | 'techo' | 'fogon' | 'parcela';

export interface Elemento {
  id: string;
  capa: CapaId;
  forma: Forma;
  nombre: string;
  descripcion: string;
  x: number; y: number; w: number; d: number; h: number;
}

export const ANCHO = 22;
export const FONDO = 16;

export const ELEMENTOS: Elemento[] = [
  // Distribución
  { id: 'parcela-1', capa: 'distribucion', forma: 'parcela', nombre: 'Parcela para carpa 1', descripcion: 'Espacio para carpa entre árboles.', x: 2, y: 9.5, w: 3, d: 3, h: 0 },
  { id: 'parcela-2', capa: 'distribucion', forma: 'parcela', nombre: 'Parcela para carpa 2', descripcion: 'Espacio para carpa entre árboles.', x: 6, y: 11, w: 3, d: 3, h: 0 },
  { id: 'parcela-3', capa: 'distribucion', forma: 'parcela', nombre: 'Parcela para carpa 3', descripcion: 'Espacio para carpa entre árboles.', x: 10, y: 12, w: 3, d: 2.8, h: 0 },
  { id: 'glamping-solo', capa: 'distribucion', forma: 'carpa', nombre: 'Glamping 1 persona', descripcion: 'Carpa armada, lista para llegar.', x: 14.5, y: 10.5, w: 2.6, d: 2.4, h: 2 },
  { id: 'glamping-doble', capa: 'distribucion', forma: 'carpa', nombre: 'Glamping 2 personas', descripcion: 'Carpa armada para dos.', x: 16.5, y: 6.5, w: 3.4, d: 3, h: 2.4 },
  // Servicios y entorno
  { id: 'cocina', capa: 'servicios', forma: 'caja', nombre: 'Cocina compartida', descripcion: 'Equipada, con heladera y cocina de uso común.', x: 3, y: 2, w: 4, d: 3, h: 2.4 },
  { id: 'banos', capa: 'servicios', forma: 'caja', nombre: 'Baños y ducha interior', descripcion: 'Con agua caliente.', x: 8, y: 1.5, w: 3, d: 2.6, h: 2.2 },
  { id: 'ducha-exterior', capa: 'servicios', forma: 'caja', nombre: 'Ducha exterior', descripcion: 'Con agua caliente, para sacarte la sal del mar.', x: 12, y: 2, w: 1.2, d: 1.2, h: 2.4 },
  { id: 'espacio-comun', capa: 'servicios', forma: 'techo', nombre: 'Espacio común techado', descripcion: 'Piso de arena, mesas y sillones a la sombra.', x: 3, y: 5.5, w: 5, d: 3, h: 2.6 },
  { id: 'fogon', capa: 'servicios', forma: 'fogon', nombre: 'Fogón', descripcion: 'Ubicación ilustrativa.', x: 11, y: 7, w: 1.6, d: 1.6, h: 0 },
];

/** Árboles (capa terreno, no interactivos). [x, y, radio de copa] */
export const ARBOLES: [number, number, number][] = [
  [1.2, 1.2, 1.3], [1.2, 7.4, 1.4], [15.6, 1.6, 1.4], [19.6, 2.6, 1.6], [21, 10.8, 1.3],
  [1.2, 14.6, 1.2], [21, 15, 1.2], [9.6, 5.4, 0.9], [4.6, 15, 1.0],
];

/** Camino interno (polilínea en planta) y salida hacia la playa. */
export const CAMINO: [number, number][] = [[8.4, 7], [11, 9.4], [13.6, 11.2], [13.8, 16]];
export const SALIDA_PLAYA: [number, number] = [13.8, 16];
