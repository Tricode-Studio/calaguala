'use client';

import { useState, type FormEvent } from 'react';
import { hoyISO, sumarDias } from '@/lib/fechas';
import { MAX_PERSONAS, seleccionSchema } from '@/lib/schemas';
import type { RespuestaDisponibilidad } from '@/lib/types';
import { Campo } from './Campo';
import { useFlujoReserva } from './FlujoReservaContext';
import { useValidacion } from './useValidacion';

export function PasoSeleccion() {
  const { estado, dispatch, config } = useFlujoReserva();
  const s = estado.seleccion;
  const v = useValidacion(seleccionSchema, s);
  const [cargando, setCargando] = useState(false);
  const [errorRed, setErrorRed] = useState<string | null>(null);
  const hoy = hoyISO();

  const set = (campo: keyof typeof s) => (valor: string) => dispatch({ tipo: 'seleccion', campo, valor });
  const personas = Number(s.cantidadPersonas) || 0;

  async function consultar(e: FormEvent) {
    e.preventDefault();
    v.marcarIntento();
    if (!v.esValido) {
      if (v.primerError) document.getElementById(`sel-${v.primerError}`)?.focus();
      return;
    }
    setCargando(true);
    setErrorRed(null);
    try {
      const res = await fetch(`/api/disponibilidad?${new URLSearchParams({ ...s })}`);
      if (!res.ok) throw new Error();
      dispatch({ tipo: 'disponibilidad', valor: (await res.json()) as RespuestaDisponibilidad });
    } catch {
      setErrorRed('No pudimos consultar la disponibilidad. Revisá tu conexión y probá de nuevo.');
    } finally {
      setCargando(false);
    }
  }

  return (
    <form onSubmit={consultar} noValidate aria-busy={cargando} className="space-y-7">
      <div className="grid gap-5 sm:grid-cols-2">
        <Campo id="sel-fechaLlegada" label="Llegada" error={v.errorDe('fechaLlegada')}>
          {(p) => (
            <input {...p} type="date" className="campo" min={hoy} value={s.fechaLlegada}
              onChange={(e) => set('fechaLlegada')(e.target.value)} onBlur={() => v.tocar('fechaLlegada')} />
          )}
        </Campo>
        <Campo id="sel-fechaSalida" label="Salida" error={v.errorDe('fechaSalida')}>
          {(p) => (
            <input {...p} type="date" className="campo" min={s.fechaLlegada ? sumarDias(s.fechaLlegada, 1) : sumarDias(hoy, 1)}
              value={s.fechaSalida} onChange={(e) => set('fechaSalida')(e.target.value)} onBlur={() => v.tocar('fechaSalida')} />
          )}
        </Campo>
      </div>

      <Campo id="sel-cantidadPersonas" label="Cantidad de personas" error={v.errorDe('cantidadPersonas')}>
        {(p) => (
          <div className="flex items-center gap-2">
            <button type="button" aria-label="Una persona menos" disabled={personas <= 1}
              onClick={() => { set('cantidadPersonas')(String(Math.max(1, personas - 1))); v.tocar('cantidadPersonas'); }}
              className="boton boton-secundario size-11 !p-0 text-eucalipto">−</button>
            <input {...p} type="number" inputMode="numeric" min={1} max={MAX_PERSONAS} className="campo w-20 text-center"
              value={s.cantidadPersonas} onChange={(e) => set('cantidadPersonas')(e.target.value)} onBlur={() => v.tocar('cantidadPersonas')} />
            <button type="button" aria-label="Una persona más" disabled={personas >= MAX_PERSONAS}
              onClick={() => { set('cantidadPersonas')(String(Math.min(MAX_PERSONAS, personas + 1))); v.tocar('cantidadPersonas'); }}
              className="boton boton-secundario size-11 !p-0 text-eucalipto">+</button>
          </div>
        )}
      </Campo>

      <fieldset aria-describedby={v.errorDe('tipoAlojamientoId') ? 'sel-tipo-error' : undefined}>
        <legend className="mb-2 font-semibold text-eucalipto">Tipo de alojamiento</legend>
        <div className="grid gap-3 sm:grid-cols-3">
          {config.alojamientos.map((a) => {
            const noEntra = personas > a.capacidad;
            return (
              <label key={a.id}
                className="flex min-h-14 cursor-pointer flex-col justify-center rounded-[var(--radius-control)] border-[1.5px] border-arena-oscura bg-white px-4 py-3 has-[:checked]:border-eucalipto has-[:checked]:bg-arena has-[:focus-visible]:outline has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-mar">
                <input type="radio" name="tipoAlojamientoId" value={a.id} className="sr-only"
                  checked={s.tipoAlojamientoId === a.id}
                  onChange={() => { set('tipoAlojamientoId')(a.id); v.tocar('tipoAlojamientoId'); }} />
                <span className="font-semibold">{a.nombre}</span>
                <span className="text-paso text-tinta-suave">
                  {a.capacidad === 1 ? '1 persona' : `Hasta ${a.capacidad} personas`}
                  {noEntra ? ' · no alcanza para tu grupo' : ''}
                </span>
              </label>
            );
          })}
        </div>
        {v.errorDe('tipoAlojamientoId') ? <p id="sel-tipo-error" className="mensaje-error" role="alert">{v.errorDe('tipoAlojamientoId')}</p> : null}
      </fieldset>

      {errorRed ? <p role="alert" className="rounded-[var(--radius-control)] bg-[#f6e3df] px-4 py-3 text-[#7d261d]">{errorRed}</p> : null}

      <button type="submit" disabled={cargando} className="boton boton-primario w-full sm:w-auto">
        {cargando ? <><Spinner /> Consultando disponibilidad…</> : 'Consultar disponibilidad'}
      </button>
      <p className="sr-only" aria-live="polite">{cargando ? 'Consultando disponibilidad' : ''}</p>
    </form>
  );
}

export function Spinner() {
  return <span aria-hidden="true" className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent" />;
}
