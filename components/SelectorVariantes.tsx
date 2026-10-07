'use client';

import { useState } from 'react';
import Image from 'next/image';

export interface Variante {
  nombre: string;
  foto: string;
  alt: string;
}

/**
 * Elige entre las carpas con nombre propio de un mismo alojamiento.
 *
 * Es un grupo de radios, no botones sueltos: son opciones excluyentes del
 * mismo campo, así las flechas del teclado funcionan solas y el lector de
 * pantalla anuncia "1 de 3".
 */
export function SelectorVariantes({ variantes, idGrupo }: { variantes: Variante[]; idGrupo: string }) {
  const [activa, setActiva] = useState(0);
  const elegida = variantes[activa];
  if (!elegida) return null;

  return (
    <div>
      <div data-galeria className="relative overflow-hidden rounded-foto bg-arena" style={{ aspectRatio: '4 / 5' }}>
        <div data-foto={elegida.foto} data-foto-alt={elegida.alt} className="size-full cursor-zoom-in">
          <Image
            key={elegida.foto}
            src={elegida.foto}
            alt={elegida.alt}
            fill
            sizes="(min-width: 768px) 30vw, 85vw"
            className="object-cover"
          />
        </div>
      </div>

      <fieldset className="mt-3">
        <legend className="sr-only">Elegí la carpa</legend>
        <div className="flex flex-wrap gap-2">
          {variantes.map((v, i) => (
            <label
              key={v.nombre}
              className={`cursor-pointer rounded-full px-4 py-2 text-paso transition-colors ${
                i === activa
                  ? 'bg-eucalipto text-cal'
                  : 'bg-arena text-tinta hover:bg-arena-oscura'
              }`}
            >
              <input
                type="radio"
                name={idGrupo}
                checked={i === activa}
                onChange={() => setActiva(i)}
                className="sr-only"
              />
              {v.nombre}
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  );
}
