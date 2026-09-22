'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

const RUTA = '/3d/index.html';
const CANAL = 'visor-carpa';

type Capas = { deck: boolean; tent: boolean; interior: boolean };

const TODAS: Capas = { deck: true, tent: true, interior: true };

const CAPAS: { clave: keyof Capas; nombre: string; detalle: string }[] = [
  { clave: 'deck', nombre: 'Deck', detalle: 'La plataforma de madera' },
  { clave: 'tent', nombre: 'Carpa', detalle: 'La estructura y la lona' },
  { clave: 'interior', nombre: 'Interior', detalle: 'Colchón, ropa de cama y luz' },
];

const PRESETS: { etiqueta: string; capas: Capas }[] = [
  { etiqueta: 'Solo el deck', capas: { deck: true, tent: false, interior: false } },
  { etiqueta: 'Con la carpa', capas: { deck: true, tent: true, interior: false } },
  { etiqueta: 'Todo', capas: TODAS },
];

/**
 * Visor 3D de la zona de carpa (deck + domo + interior).
 *
 * La escena vive en `public/3d/` como página independiente: usa three.js vía
 * import map con hashes fijados, así que se embebe en un iframe en vez de
 * pasar por el bundle. Se monta recién al pedirlo para no descargar la
 * librería en cada visita.
 *
 * Los controles de capas son de este lado, no del iframe: flotando sobre el
 * canvas tapaban medio modelo en pantallas chicas. Viajan por postMessage
 * restringido al mismo origen.
 */
export function Visor3DCarpa() {
  const [activo, setActivo] = useState(false);
  const [capas, setCapas] = useState<Capas>(TODAS);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const enviar = useCallback((proximas: Capas) => {
    iframeRef.current?.contentWindow?.postMessage(
      { canal: CANAL, tipo: 'capas', capas: proximas },
      window.location.origin,
    );
  }, []);

  // La escena avisa cuando terminó de cargar: recién ahí tiene sentido
  // mandarle el estado, que puede haber cambiado mientras bajaba three.js.
  useEffect(() => {
    if (!activo) return;
    const alMensaje = (ev: MessageEvent) => {
      if (ev.origin !== window.location.origin) return;
      if (ev.data?.canal !== CANAL || ev.data?.tipo !== 'listo') return;
      enviar(capas);
    };
    window.addEventListener('message', alMensaje);
    return () => window.removeEventListener('message', alMensaje);
  }, [activo, capas, enviar]);

  const cambiar = (proximas: Capas) => {
    setCapas(proximas);
    enviar(proximas);
  };

  return (
    <div className="mt-10">
      <h3 className="text-h3 font-semibold">Así es tu lugar de carpa</h3>
      <p className="mt-2 max-w-prose text-cuerpo text-cal/75">
        Mirá el deck, la carpa y el equipo del interior en 3D. Podés girarlo, acercarte y
        encender o apagar cada capa para ver cómo está armado.
      </p>

      {activo ? (
        <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_17rem] lg:items-start">
          <div className="overflow-hidden rounded-[var(--radius-foto)] border border-cal/15 bg-arena">
            <iframe
              ref={iframeRef}
              src={RUTA}
              title="Modelo 3D de la zona de carpa"
              className="block h-[50vh] max-h-[30rem] min-h-[17rem] w-full border-0 lg:h-[34rem] lg:max-h-none"
            />
          </div>

          <fieldset className="rounded-[var(--radius-foto)] border border-cal/15 bg-cal/5 p-4">
            <legend className="px-1 text-paso font-semibold uppercase tracking-wide text-cal/70">
              Capas
            </legend>

            <div className="mt-1 grid gap-2 sm:grid-cols-3 lg:grid-cols-1">
              {CAPAS.map(({ clave, nombre, detalle }) => (
                <label
                  key={clave}
                  className="flex min-h-[44px] cursor-pointer items-center gap-3 rounded-[var(--radius-control)] bg-cal/10 px-3 py-2 transition-colors hover:bg-cal/20"
                >
                  <input
                    type="checkbox"
                    checked={capas[clave]}
                    onChange={(e) => cambiar({ ...capas, [clave]: e.target.checked })}
                    className="size-[18px] flex-none accent-sol"
                  />
                  <span className="leading-tight">
                    <span className="block text-cuerpo font-medium">{nombre}</span>
                    <span className="block text-paso text-cal/60">{detalle}</span>
                  </span>
                </label>
              ))}
            </div>

            {/* Los presets repiten lo que hacen los checks: en pantallas
                chicas solo gastan espacio. */}
            <div className="mt-3 hidden gap-2 lg:flex lg:flex-wrap">
              {PRESETS.map(({ etiqueta, capas: preset }) => (
                <button
                  key={etiqueta}
                  type="button"
                  onClick={() => cambiar(preset)}
                  className="rounded-[var(--radius-control)] px-3 py-2 text-paso shadow-[inset_0_0_0_1px_currentColor] transition-colors hover:bg-cal/10"
                >
                  {etiqueta}
                </button>
              ))}
            </div>

            <p className="mt-4 text-paso leading-relaxed text-cal/60">
              Deck de 4,00 × 3,00 m. Domo de 2,70 m de diámetro y 1,57 m de alto.
            </p>
          </fieldset>
        </div>
      ) : (
        <div className="mt-5 flex flex-col items-center justify-center gap-4 rounded-[var(--radius-foto)] border border-cal/15 bg-arena px-6 py-14 text-center">
          <p className="max-w-sm text-cuerpo text-tinta">
            El visor 3D se carga a pedido para no consumir datos de más.
          </p>
          <button type="button" onClick={() => setActivo(true)} className="boton boton-primario">
            Ver la carpa en 3D
          </button>
        </div>
      )}

      <p className="mt-3 text-paso text-cal/60">
        Modelo de referencia a escala. El equipamiento puede variar según la temporada.{' '}
        <a href={RUTA} target="_blank" rel="noreferrer" className="underline underline-offset-2">
          Abrir en pantalla completa
        </a>
        .
      </p>
    </div>
  );
}
