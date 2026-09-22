import Link from 'next/link';
import type { Extensiones, ReservasInfo } from '@/lib/types';
import { AvisoSolicitud } from '../ui/AvisoSolicitud';
import { RichText } from '../ui/RichText';

const pasos = [
  'Elegís fechas, cantidad de personas y tipo de alojamiento.',
  'Te mostramos las opciones posibles para esas fechas.',
  'Dejás tus datos y lo que necesites contarnos.',
  'Enviás la solicitud y te respondemos para confirmar.',
];

export function Reservas({ info, ext }: { info: ReservasInfo; ext: Extensiones }) {
  return (
    <section id="reservas" aria-labelledby="h-reservas" className="seccion">
      <div className="contenedor grid gap-12 md:grid-cols-2">
        <div>
          <h2 id="h-reservas">{ext.secciones.reservas.titulo}</h2>
          <RichText html={info.textoExplicativo} className="mt-6 text-lead leading-relaxed" />
          <div className="mt-6">
            <AvisoSolicitud texto={info.avisoSolicitud} tiempoRespuesta={ext.tiempoRespuesta} />
          </div>
          <Link href="/reservar" className="boton boton-primario mt-8">
            Solicitá tu reserva
          </Link>
        </div>
        {/* Numeración con sentido: es un proceso de 4 pasos */}
        <ol className="space-y-6 md:pt-2">
          {pasos.map((p, i) => (
            <li key={p} className="flex gap-5">
              <span aria-hidden="true" className="grid size-11 shrink-0 place-items-center rounded-full bg-arena font-display text-xl text-eucalipto">
                {i + 1}
              </span>
              <p className="pt-2">{p}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
