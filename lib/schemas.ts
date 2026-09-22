import { z } from 'zod';
import { hoyISO } from './fechas';

// ════════════════════════════════════════════════════════════════════════
// Contenido del CMS — se valida al recibirlo; si no cumple, se usa data.ts
// ════════════════════════════════════════════════════════════════════════
const texto = z.string();
const listaTextos = z.array(z.string());

export const alojamientoSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  nombre: texto,
  tipo: z.enum(['carpa', 'glamping-solo', 'glamping-doble']),
  descripcion: texto,
  capacidad: z.number().int().positive(),
  caracteristicas: listaTextos,
  incluye: listaTextos,
  precio: z.number().nullable(),
  precioUnidad: texto,
  fotos: listaTextos,
  orden: z.number(),
});

export const preguntaFrecuenteSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  pregunta: texto,
  respuesta: texto,
  orden: z.number(),
});

export const recomendacionSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  nombre: texto,
  tipo: z.enum(['playa', 'restaurante', 'actividad', 'otro']),
  descripcion: texto,
  imagen: texto,
  orden: z.number(),
});

/** Cada singleton se valida por separado: si uno viene roto, solo ese cae al fallback. */
export const singletonSchemas = {
  heroConfig: z.object({ titulo: texto, subtitulo: texto, imagenFondo: texto, videoFondo: texto.optional() }),
  introduccion: z.object({ texto, imagenApoyo: texto }),
  ubicacion: z.object({ direccion: texto, mapaEmbedUrl: texto, imagenDrone: texto }),
  instalaciones: z.object({
    items: z.array(z.object({ titulo: texto, descripcion: texto, icono: texto })),
  }),
  queIncluye: z.object({ items: listaTextos }),
  reservasInfo: z.object({ textoExplicativo: texto, avisoSolicitud: texto }),
  informacionPractica: z.object({ checkIn: texto, checkOut: texto, queTraer: listaTextos, normas: listaTextos }),
  contacto: z.object({ whatsapp: texto, instagramUrl: texto, mensajeFinal: texto }),
  seoGlobal: z.object({ metaTitle: texto, metaDescription: texto, ogImage: texto }),
} as const;

// ════════════════════════════════════════════════════════════════════════
// Formulario de solicitud de reserva
// ════════════════════════════════════════════════════════════════════════
const fechaISO = /^\d{4}-\d{2}-\d{2}$/;
export const MAX_PERSONAS = 8;

export const seleccionBase = z.object({
  fechaLlegada: z.string().regex(fechaISO, 'Elegí la fecha de llegada.'),
  fechaSalida: z.string().regex(fechaISO, 'Elegí la fecha de salida.'),
  cantidadPersonas: z.coerce
    .number({ invalid_type_error: 'Indicá cuántas personas vienen.' })
    .int('Indicá un número entero de personas.')
    .min(1, 'Tiene que venir al menos una persona.')
    .max(MAX_PERSONAS, `Para grupos de más de ${MAX_PERSONAS} personas, escribinos por WhatsApp.`),
  tipoAlojamientoId: z.string().min(1, 'Elegí un tipo de alojamiento.'),
});

function validarFechas(
  d: { fechaLlegada: string; fechaSalida: string },
  ctx: z.RefinementCtx,
) {
  if (!fechaISO.test(d.fechaLlegada) || !fechaISO.test(d.fechaSalida)) return;
  if (d.fechaLlegada < hoyISO()) {
    ctx.addIssue({ code: 'custom', path: ['fechaLlegada'], message: 'La llegada no puede ser en una fecha que ya pasó.' });
  }
  if (d.fechaSalida <= d.fechaLlegada) {
    ctx.addIssue({ code: 'custom', path: ['fechaSalida'], message: 'La salida tiene que ser al menos un día después de la llegada.' });
  }
}

export const seleccionSchema = seleccionBase.superRefine(validarFechas);

export const datosHuespedSchema = z.object({
  nombre: z.string().trim().min(2, 'Escribí tu nombre.').max(120, 'El nombre es demasiado largo.'),
  email: z.string().trim().email('Revisá el email: parece incompleto.'),
  whatsapp: z
    .string()
    .trim()
    .refine((v) => /^\+?[\d\s()-]+$/.test(v) && v.replace(/\D/g, '').length >= 8, {
      message: 'Escribí tu WhatsApp con código de área, por ejemplo 099 123 456.',
    }),
  cantidadPersonas: seleccionBase.shape.cantidadPersonas,
  comentarios: z.string().trim().max(1000, 'Máximo 1000 caracteres.').optional().or(z.literal('')),
});

/** Lo que valida el endpoint propio antes de hablar con el CMS. */
export const solicitudReservaSchema = seleccionBase
  .merge(datosHuespedSchema)
  .superRefine(validarFechas);

export type SeleccionInput = z.infer<typeof seleccionBase>;
export type DatosHuespedInput = z.infer<typeof datosHuespedSchema>;

/** Convierte un ZodError en { campo: primerMensaje } para mostrar junto a cada input. */
export function erroresPorCampo(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const campo = String(issue.path[0] ?? '_');
    if (!out[campo]) out[campo] = issue.message;
  }
  return out;
}
