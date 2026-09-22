'use client';

import { useMemo, useState, type FormEvent } from 'react';
import { datosHuespedSchema } from '@/lib/schemas';
import { linkWhatsApp } from '@/lib/whatsapp';
import { Campo } from './Campo';
import { useFlujoReserva, type Datos } from './FlujoReservaContext';
import { mensajeSolicitud } from './mensaje';
import { Spinner } from './PasoSeleccion';
import { useValidacion } from './useValidacion';

type ErrorEnvio = 'CMS_NO_CONECTADO' | 'CMS_ERROR' | 'RED' | null;

export function PasoDatos() {
  const { estado, dispatch, config } = useFlujoReserva();
  const { datos: d, seleccion: s } = estado;
  const alojamiento = config.alojamientos.find((a) => a.id === s.tipoAlojamientoId);

  // Schema con la capacidad del alojamiento elegido
  const schema = useMemo(
    () =>
      datosHuespedSchema.refine((x) => !alojamiento || x.cantidadPersonas <= alojamiento.capacidad, {
        path: ['cantidadPersonas'],
        message: `${alojamiento?.nombre} es para ${alojamiento?.capacidad === 1 ? '1 persona' : `hasta ${alojamiento?.capacidad} personas`}.`,
      }),
    [alojamiento],
  );
  const v = useValidacion(schema, d);
  const [enviando, setEnviando] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState<ErrorEnvio>(null);
  const [erroresServidor, setErroresServidor] = useState<Record<string, string>>({});

  const set = (campo: keyof Datos) => (valor: string) => {
    dispatch({ tipo: 'datos', campo, valor });
    if (erroresServidor[campo]) setErroresServidor(({ [campo]: _, ...resto }) => resto);
  };
  const err = (campo: string) => v.errorDe(campo) ?? erroresServidor[campo];

  async function enviar(e: FormEvent) {
    e.preventDefault();
    v.marcarIntento();
    if (!v.esValido) {
      if (v.primerError) document.getElementById(`dat-${v.primerError}`)?.focus();
      return;
    }
    setEnviando(true);
    setErrorEnvio(null);
    try {
      const res = await fetch('/api/reservas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...s, ...d }),
      });
      const json = (await res.json().catch(() => ({}))) as { codigo?: string; errores?: Record<string, string> };
      if (res.ok) {
        dispatch({ tipo: 'ir', paso: 4 });
        return;
      }
      if (json.codigo === 'VALIDACION' && json.errores) {
        setErroresServidor(json.errores);
        if (json.errores.fechaLlegada || json.errores.fechaSalida || json.errores.tipoAlojamientoId) {
          dispatch({ tipo: 'ir', paso: 1 });
        }
        return;
      }
      setErrorEnvio(json.codigo === 'CMS_NO_CONECTADO' ? 'CMS_NO_CONECTADO' : 'CMS_ERROR');
    } catch {
      setErrorEnvio('RED');
    } finally {
      setEnviando(false);
    }
  }

  const wa = linkWhatsApp(config.whatsapp, mensajeSolicitud(s, d, alojamiento));

  return (
    <form onSubmit={enviar} noValidate aria-busy={enviando} className="space-y-6">
      <Campo id="dat-nombre" label="Nombre" error={err('nombre')}>
        {(p) => <input {...p} className="campo" autoComplete="name" value={d.nombre} onChange={(e) => set('nombre')(e.target.value)} onBlur={() => v.tocar('nombre')} />}
      </Campo>
      <div className="grid gap-6 sm:grid-cols-2">
        <Campo id="dat-email" label="Email" error={err('email')}>
          {(p) => <input {...p} type="email" inputMode="email" autoComplete="email" className="campo" value={d.email} onChange={(e) => set('email')(e.target.value)} onBlur={() => v.tocar('email')} />}
        </Campo>
        <Campo id="dat-whatsapp" label="WhatsApp" ayuda="Te escribimos por acá para confirmar." error={err('whatsapp')}>
          {(p) => <input {...p} type="tel" inputMode="tel" autoComplete="tel" className="campo" value={d.whatsapp} onChange={(e) => set('whatsapp')(e.target.value)} onBlur={() => v.tocar('whatsapp')} />}
        </Campo>
      </div>
      <Campo id="dat-cantidadPersonas" label="Cantidad de huéspedes" error={err('cantidadPersonas')}>
        {(p) => <input {...p} type="number" inputMode="numeric" min={1} className="campo w-28" value={d.cantidadPersonas} onChange={(e) => set('cantidadPersonas')(e.target.value)} onBlur={() => v.tocar('cantidadPersonas')} />}
      </Campo>
      <Campo id="dat-comentarios" label="Comentarios o necesidades especiales" opcional error={err('comentarios')}>
        {(p) => <textarea {...p} rows={4} className="campo" value={d.comentarios} onChange={(e) => set('comentarios')(e.target.value)} onBlur={() => v.tocar('comentarios')} />}
      </Campo>

      {/* Honeypot anti-spam: invisible para personas, tentador para bots */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="dat-sitioWeb">Sitio web</label>
        <input id="dat-sitioWeb" name="sitioWeb" tabIndex={-1} autoComplete="off" value={d.sitioWeb} onChange={(e) => set('sitioWeb')(e.target.value)} />
      </div>

      {errorEnvio ? (
        <div role="alert" className="space-y-3 rounded-[var(--radius-control)] bg-[#f6e3df] px-4 py-4 text-[#7d261d]">
          <p>
            {errorEnvio === 'RED'
              ? 'No se pudo enviar la solicitud: parece que no hay conexión. Tus datos siguen acá, probá de nuevo.'
              : 'No se pudo enviar la solicitud en este momento. Tus datos siguen acá: probá de nuevo o mandanos lo mismo por WhatsApp.'}
          </p>
          {wa ? (
            <a href={wa} target="_blank" rel="noopener noreferrer" className="boton boton-secundario text-[#7d261d]">
              Enviar por WhatsApp
            </a>
          ) : null}
        </div>
      ) : null}

      <div className="flex flex-col-reverse gap-3 sm:flex-row">
        <button type="button" onClick={() => dispatch({ tipo: 'ir', paso: 2 })} className="boton boton-secundario text-eucalipto">
          Volver a las opciones
        </button>
        <button type="submit" disabled={enviando} className="boton boton-primario">
          {enviando ? <><Spinner /> Enviando solicitud…</> : 'Enviar solicitud de reserva'}
        </button>
      </div>
      <p className="sr-only" aria-live="polite">{enviando ? 'Enviando solicitud' : ''}</p>
    </form>
  );
}
