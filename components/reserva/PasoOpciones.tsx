'use client';

import { formatoLargo, noches } from '@/lib/fechas';
import { textoPrecio } from '@/lib/precio';
import type { EstadoDisponibilidad } from '@/lib/types';
import { linkWhatsApp } from '@/lib/whatsapp';
import { useFlujoReserva } from './FlujoReservaContext';
import { mensajeSolicitud } from './mensaje';

const TEXTO_ESTADO: Record<EstadoDisponibilidad, string> = {
  disponible: 'Disponible para esas fechas',
  'a-confirmar': 'Posible: lo confirmamos al revisar tu solicitud',
  'no-disponible': 'No disponible',
};

export function PasoOpciones() {
  const { estado, dispatch, config } = useFlujoReserva();
  const { seleccion: s, disponibilidad } = estado;
  if (!disponibilidad) return null;

  const n = noches(s.fechaLlegada, s.fechaSalida);
  const opciones = disponibilidad.opciones
    .map((o) => ({ ...o, alojamiento: config.alojamientos.find((a) => a.id === o.tipoAlojamientoId) }))
    .filter((o) => o.alojamiento);
  const elegida = opciones.find((o) => o.tipoAlojamientoId === s.tipoAlojamientoId);
  const puedeSeguir = elegida && elegida.estado !== 'no-disponible';
  const ninguna = opciones.every((o) => o.estado === 'no-disponible');
  const wa = linkWhatsApp(config.whatsapp, mensajeSolicitud(s, estado.datos, elegida?.alojamiento));

  return (
    <div className="space-y-6">
      <p className="text-lead">
        {formatoLargo(s.fechaLlegada)} → {formatoLargo(s.fechaSalida)}, {n} {n === 1 ? 'noche' : 'noches'}, {s.cantidadPersonas}{' '}
        {s.cantidadPersonas === '1' ? 'persona' : 'personas'}.
      </p>

      {disponibilidad.origen === 'local' ? (
        <p className="text-tinta-suave">
          Para estas fechas no podemos ver la disponibilidad en línea. Elegí la opción que te guste y el equipo la
          confirma cuando revise tu solicitud.
        </p>
      ) : null}

      <fieldset>
        <legend className="mb-3 font-semibold text-eucalipto">Elegí una opción</legend>
        <div className="space-y-3">
          {opciones.map(({ alojamiento: a, estado: est, tipoAlojamientoId }) => {
            const bloqueada = est === 'no-disponible';
            return (
              <label key={tipoAlojamientoId}
                className={`flex min-h-14 items-start gap-4 rounded-[var(--radius-control)] border-[1.5px] px-4 py-4 ${
                  bloqueada ? 'cursor-not-allowed border-arena bg-arena/40 text-tinta-suave'
                    : 'cursor-pointer border-arena-oscura bg-white has-[:checked]:border-eucalipto has-[:checked]:bg-arena has-[:focus-visible]:outline has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-mar'
                }`}>
                <input type="radio" name="opcion" value={tipoAlojamientoId} disabled={bloqueada}
                  checked={s.tipoAlojamientoId === tipoAlojamientoId}
                  onChange={() => dispatch({ tipo: 'seleccion', campo: 'tipoAlojamientoId', valor: tipoAlojamientoId })}
                  className="mt-1 size-5 accent-[var(--color-eucalipto)]" />
                <span className="flex-1">
                  <span className="block font-semibold">{a!.nombre}</span>
                  <span className="block text-paso">{TEXTO_ESTADO[est]}</span>
                  {Number(s.cantidadPersonas) > a!.capacidad ? (
                    <span className="block text-paso">Capacidad máxima: {a!.capacidad}</span>
                  ) : null}
                </span>
                <span className="text-right text-paso font-semibold text-eucalipto">{textoPrecio(a!)}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      {ninguna ? (
        <p role="status" className="rounded-[var(--radius-control)] bg-arena px-4 py-3">
          No encontramos opciones para esas fechas o esa cantidad de personas. Probá con otras fechas
          {wa ? <>, o <a href={wa} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">escribinos por WhatsApp</a> y lo vemos juntos</> : null}.
        </p>
      ) : null}

      <div className="flex flex-col-reverse gap-3 sm:flex-row">
        <button type="button" onClick={() => dispatch({ tipo: 'ir', paso: 1 })} className="boton boton-secundario text-eucalipto">
          Cambiar fechas
        </button>
        <button type="button" disabled={!puedeSeguir} onClick={() => dispatch({ tipo: 'ir', paso: 3 })} className="boton boton-primario">
          Continuar con mis datos
        </button>
      </div>
    </div>
  );
}
