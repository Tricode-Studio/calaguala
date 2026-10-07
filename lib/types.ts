/**
 * Tipos espejados 1:1 de DATA.md. No renombrar campos: son los mismos que
 * devuelve Tricode CMS. Lo que NO está en DATA.md vive en `Extensiones`
 * (abajo) y está marcado como propuesta para sumar al CMS.
 */

// ── Colecciones ────────────────────────────────────────────────────────────
export type TipoAlojamiento = 'carpa' | 'glamping-solo' | 'glamping-doble';

export interface Alojamiento {
  id: string;
  slug: string;
  nombre: string;
  tipo: TipoAlojamiento;
  /** RICH_TEXT (HTML) */
  descripcion: string;
  capacidad: number;
  /** Reemplaza el texto de capacidad en la tarjeta (ej. 'Tarifa por persona'). */
  etiquetaCapacidad?: string;
  /** Unidades con nombre propio dentro del mismo tipo de alojamiento. */
  variantes?: { nombre: string; foto: string }[];
  caracteristicas: string[];
  incluye: string[];
  /** NUMBER. `null` = campo vacío en el CMS → la UI muestra "Tarifa a consultar". */
  precio: number | null;
  precioUnidad: string;
  fotos: string[];
  orden: number;
}

export interface PreguntaFrecuente {
  id: string;
  slug: string;
  pregunta: string;
  /** RICH_TEXT (HTML) */
  respuesta: string;
  orden: number;
}

export type TipoRecomendacion = 'playa' | 'restaurante' | 'actividad' | 'otro';

export interface Recomendacion {
  id: string;
  slug: string;
  nombre: string;
  tipo: TipoRecomendacion;
  /** LONG_TEXT */
  descripcion: string;
  /** Fotos extra del mismo lugar; con más de una, la tarjeta las pasa. */
  imagenes?: string[];
  imagen: string;
  orden: number;
}

// ── Singletons (settings del tenant) ────────────────────────────────────────
export interface HeroConfig {
  titulo: string;
  subtitulo: string;
  imagenFondo: string;
  videoFondo?: string;
}
export interface Introduccion {
  texto: string;
  imagenApoyo: string;
}
export interface Ubicacion {
  direccion: string;
  mapaEmbedUrl: string;
  /** Enlace para abrir la ubicación en la app de mapas. */
  mapaUrl: string;
  imagenDrone: string;
}
export interface ItemInstalacion {
  titulo: string;
  descripcion: string;
  icono: string;
}
export interface Instalaciones {
  items: ItemInstalacion[];
}
export interface QueIncluye {
  items: string[];
}
export interface ReservasInfo {
  textoExplicativo: string;
  avisoSolicitud: string;
}
export interface InformacionPractica {
  checkIn: string;
  checkOut: string;
  queTraer: string[];
  normas: string[];
}
export interface Contacto {
  whatsapp: string;
  instagramUrl: string;
  mensajeFinal: string;
}
export interface SeoGlobal {
  metaTitle: string;
  metaDescription: string;
  ogImage: string;
}

export interface LandingConfig {
  heroConfig: HeroConfig;
  introduccion: Introduccion;
  ubicacion: Ubicacion;
  instalaciones: Instalaciones;
  queIncluye: QueIncluye;
  reservasInfo: ReservasInfo;
  informacionPractica: InformacionPractica;
  contacto: Contacto;
  seoGlobal: SeoGlobal;
}

// ── Extensiones (NO están en DATA.md — propuesta para el CMS) ───────────────
export type SeccionId =
  | 'introduccion'
  | 'ubicacion'
  | 'alojamiento'
  | 'predio'
  | 'instalaciones'
  | 'experiencias'
  | 'recomendaciones'
  | 'que-incluye'
  | 'reservas'
  | 'informacion-practica'
  | 'faq'
  | 'contacto';

export interface Experiencia {
  id: string;
  titulo: string;
  descripcion: string;
  detalles: string[];
  /** Cada experiencia tiene su propia galería. */
  fotos: string[];
}

export interface Extensiones {
  secciones: Record<SeccionId, { titulo: string; bajada?: string }>;
  experiencias: Experiencia[];
  galeriaIntroduccion: string[];
  /** Fotos por instalación, indexadas por `ItemInstalacion.icono`. */
  fotosInstalaciones: Record<string, string[]>;
  /** DATA.md guarda fotos como URL sola; acá viven los textos alternativos. */
  altFotos: Record<string, string>;
  tiempoRespuesta: string;
  negocio: {
    nombre: string;
    localidad: string;
    departamento: string;
    pais: string;
    codigoPais: string;
  };
}

// ── Datos operativos (módulo BOOKINGS, no contenido) ────────────────────────
export interface SolicitudReserva {
  fechaLlegada: string;
  fechaSalida: string;
  cantidadPersonas: number;
  tipoAlojamientoId: string;
  nombre: string;
  email: string;
  whatsapp: string;
  comentarios?: string;
}

export type EstadoDisponibilidad = 'disponible' | 'a-confirmar' | 'no-disponible';

export interface OpcionDisponibilidad {
  tipoAlojamientoId: string;
  estado: EstadoDisponibilidad;
}

export interface RespuestaDisponibilidad {
  opciones: OpcionDisponibilidad[];
  /** 'cms' = resultado real; 'local' = sin CMS, todo queda a confirmar. */
  origen: 'cms' | 'local';
}

// ── Página "Descubrí La Paloma" ─────────────────────────────────────────────
export interface BloqueLaPaloma {
  titulo: string;
  texto: string;
  foto: string;
}
export interface LaPaloma {
  hero: { titulo: string; bajada: string; entrada: string; foto: string };
  playas: { intro: string; items: { nombre: string; texto: string; foto: string; distancia?: string }[] };
  naturaleza: { destacado: BloqueLaPaloma; secundarios: BloqueLaPaloma[] };
  experiencias: { icono: string; titulo: string; texto: string }[];
  faro: BloqueLaPaloma & { cta: string };
  puerto: BloqueLaPaloma[];
  dia: { momento: string; texto: string }[];
  cierre: { titulo: string; texto: string; foto: string; cta: string };
}
