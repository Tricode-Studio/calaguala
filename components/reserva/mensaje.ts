import { formatoLargo } from '@/lib/fechas';
import type { Alojamiento } from '@/lib/types';
import type { Datos, Seleccion } from './FlujoReservaContext';

/** Texto para WhatsApp: seguimiento o respaldo si el envío falla. */
export function mensajeSolicitud(sel: Seleccion, datos: Datos, aloj?: Alojamiento): string {
  return [
    'Hola, les escribo por una solicitud de reserva en Calaguala:',
    `• ${aloj?.nombre ?? 'Alojamiento a definir'}`,
    `• Llegada: ${sel.fechaLlegada ? formatoLargo(sel.fechaLlegada) : '-'}`,
    `• Salida: ${sel.fechaSalida ? formatoLargo(sel.fechaSalida) : '-'}`,
    `• Personas: ${datos.cantidadPersonas || sel.cantidadPersonas}`,
    datos.nombre ? `• Nombre: ${datos.nombre}` : null,
    datos.comentarios ? `• Comentarios: ${datos.comentarios}` : null,
  ]
    .filter(Boolean)
    .join('\n');
}
