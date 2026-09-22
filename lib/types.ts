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
  id: 'mar' | 'naturaleza' | 'descanso';
  titulo: string;
  descripcion: string;
  detalles: string[];
  foto: string;
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
