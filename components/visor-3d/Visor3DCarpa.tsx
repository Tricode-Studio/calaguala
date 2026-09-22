'use client';

import { useState } from 'react';

const RUTA = '/3d/index.html';

/**
 * Visor 3D de la zona de carpa (deck + domo + interior).
 *
 * La escena vive en `public/3d/` como página independiente: usa three.js vía
 * import map con hashes fijados, así que se embebe en un iframe en vez de
 * pasar por el bundle. Se monta recién al pedirlo para no descargar la
 * librería en cada visita.
 */
export function Visor3DCarpa() {
  const [activo, setActivo] = useState(false);

  return (
    <div className="mt-10">
      <h3 className="text-h3 font-semibold">Así es tu lugar de carpa</h3>
      <p className="mt-2 max-w-prose text-cuerpo text-cal/75">
        Mirá el deck, la carpa y el equipo del interior en 3D. Podés girarlo, acercarte y
        encender o apagar cada capa para ver cómo está armado.
      </p>

      <div className="mt-5 overflow-hidden rounded-[var(--radius-foto)] border border-cal/15 bg-arena">
        {activo ? (
          <iframe
            src={RUTA}
            title="Visor 3D de la zona de carpa"
            loading="lazy"
            className="block h-[clamp(26rem,70vh,40rem)] w-full border-0"
          />
        ) : (
          <div className="flex h-[clamp(20rem,45vh,28rem)] flex-col items-center justify-center gap-4 px-6 text-center">
            <p className="max-w-sm text-cuerpo text-tinta">
              El visor 3D se carga a pedido para no consumir datos de más.
            </p>
            <button
              type="button"
              onClick={() => setActivo(true)}
              className="boton boton-primario"
            >
              Ver la carpa en 3D
            </button>
          </div>
        )}
      </div>

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
