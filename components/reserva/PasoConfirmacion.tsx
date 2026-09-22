'use client';

import Link from 'next/link';
import { formatoLargo } from '@/lib/fechas';
import { linkWhatsApp } from '@/lib/whatsapp';
import { useFlujoReserva } from './FlujoReservaContext';
import { mensajeSolicitud } from './mensaje';

export function PasoConfirmacion() {
  const { estado, config } = useFlujoReserva();
  const { seleccion: s, datos: d } = estado;
  const aloj = config.alojamientos.find((a) => a.id === s.tipoAlojamientoId);
  const wa = linkWhatsApp(config.whatsapp, mensajeSolicitud(s, d, aloj));

  return (
    <div className="space-y-7">
      <div className="flex items-start gap-4">
        <span aria-hidden="true" className="grid size-12 shrink-0 place-items-center rounded-full bg-eucalipto text-cal">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12.5l4.2 4L19 7" /></svg>
        </span>
        <p className="text-lead">
          Gracias, {d.nombre.split(' ')[0]}. Recibimos tu solicitud. <strong className="font-semibold">Todavía no es una reserva confirmada:</strong>{' '}
          el equipo la revisa a mano y te escribe a {d.whatsapp} o {d.email}. {config.tiempoRespuesta}
        </p>
      </div>

      <dl className="grid gap-x-8 gap-y-3 rounded-[var(--radius-control)] bg-arena px-5 py-5 sm:grid-cols-2">
        <div><dt className="text-paso text-tinta-suave">Alojamiento</dt><dd className="font-semibold">{aloj?.nombre}</dd></div>
        <div><dt className="text-paso text-tinta-suave">Huéspedes</dt><dd className="font-semibold">{d.cantidadPersonas}</dd></div>
        <div><dt className="text-paso text-tinta-suave">Llegada</dt><dd className="font-semibold">{formatoLargo(s.fechaLlegada)}</dd></div>
        <div><dt className="text-paso text-tinta-suave">Salida</dt><dd className="font-semibold">{formatoLargo(s.fechaSalida)}</dd></div>
      </dl>

      <div className="flex flex-col gap-3 sm:flex-row">
        {wa ? (
          <a href={wa} target="_blank" rel="noopener noreferrer" className="boton boton-primario">
            Seguir la conversación por WhatsApp
          </a>
        ) : null}
        <Link href="/" className="boton boton-secundario text-eucalipto">Volver al inicio</Link>
      </div>
    </div>
  );
}
