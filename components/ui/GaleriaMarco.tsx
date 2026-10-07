'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';

export interface FotoMarco {
  src: string;
  alt: string;
  /** Rótulo sobre la foto, para variantes con nombre propio. */
  etiqueta?: string;
}

/**
 * Galería dentro de un marco fijo: una foto por vez, se desliza con el dedo
 * o con las flechas y el marco no cambia de tamaño.
 *
 * Es scroll horizontal nativo con scroll-snap, no un slider con transformes:
 * así el gesto táctil es el del sistema y el teclado funciona solo. Las
 * flechas aparecen desde md, donde no hay gesto.
 */
export function GaleriaMarco({
  fotos,
  aspecto = '4 / 5',
  sizes = '(min-width: 768px) 30vw, 85vw',
  etiquetaRegion,
  className = '',
}: {
  fotos: FotoMarco[];
  aspecto?: string;
  sizes?: string;
  etiquetaRegion: string;
  className?: string;
}) {
  const pista = useRef<HTMLDivElement>(null);
  const [activa, setActiva] = useState(0);

  const irA = useCallback((i: number) => {
    const el = pista.current;
    if (!el) return;
    el.scrollTo({ left: i * el.clientWidth, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const el = pista.current;
    if (!el) return;
    const mirar = () => {
      const w = el.clientWidth || 1;
      setActiva(Math.round(el.scrollLeft / w));
    };
    el.addEventListener('scroll', mirar, { passive: true });
    return () => el.removeEventListener('scroll', mirar);
  }, []);

  if (!fotos.length) return null;
  const sola = fotos.length === 1;

  return (
    <div data-galeria className={`group relative overflow-hidden rounded-foto bg-arena ${className}`} style={{ aspectRatio: aspecto }}>
      <div
        ref={pista}
        tabIndex={sola ? -1 : 0}
        role={sola ? undefined : 'region'}
        aria-label={sola ? undefined : etiquetaRegion}
        className="marco-pista size-full"
      >
        {fotos.map((f) => (
          <div key={f.src} data-foto={f.src} data-foto-alt={f.alt} className="relative size-full shrink-0 cursor-zoom-in snap-start">
            <Image src={f.src} alt={f.alt} fill sizes={sizes} className="object-cover" />
            {f.etiqueta ? (
              <span className="absolute bottom-3 left-3 rounded-full bg-mar/80 px-3 py-1 text-paso font-medium text-cal backdrop-blur-sm">
                {f.etiqueta}
              </span>
            ) : null}
          </div>
        ))}
      </div>

      {sola ? null : (
        <>
          <Flecha lado="izquierda" onClick={() => irA(Math.max(0, activa - 1))} oculta={activa === 0} />
          <Flecha lado="derecha" onClick={() => irA(Math.min(fotos.length - 1, activa + 1))} oculta={activa === fotos.length - 1} />
          <ol className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center gap-1.5" aria-hidden="true">
            {fotos.map((f, i) => (
              <li key={f.src} className={`h-1.5 rounded-full transition-all ${i === activa ? 'w-5 bg-cal' : 'w-1.5 bg-cal/55'}`} />
            ))}
          </ol>
        </>
      )}
    </div>
  );
}

function Flecha({ lado, onClick, oculta }: { lado: 'izquierda' | 'derecha'; onClick: () => void; oculta: boolean }) {
  const izq = lado === 'izquierda';
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={izq ? 'Foto anterior' : 'Foto siguiente'}
      className={`absolute top-1/2 z-10 hidden size-10 -translate-y-1/2 place-items-center rounded-full bg-cal/90 text-tinta shadow-md transition hover:bg-cal md:grid ${
        izq ? 'left-2' : 'right-2'
      } ${oculta ? 'pointer-events-none opacity-0' : 'opacity-0 group-hover:opacity-100 group-focus-within:opacity-100'}`}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
        <path d={izq ? 'M15 5l-7 7 7 7' : 'M9 5l7 7-7 7'} />
      </svg>
    </button>
  );
}
