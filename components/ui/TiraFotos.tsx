'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Foto } from './Foto';

const PAUSA_MS = 4000;

/**
 * Tira de fotos con avance automático.
 *
 * No hay librería de carrusel en el proyecto: la tira es scroll horizontal
 * nativo con scroll-snap, así que el avance se hace moviendo el scroll.
 * Se detiene al tocarla, al pasar el cursor y al navegar con teclado, y no
 * arranca si el sistema pide menos movimiento (WCAG 2.2.2).
 */
export function TiraFotos({ fotos, etiqueta }: { fotos: { src: string; alt: string }[]; etiqueta: string }) {
  const pista = useRef<HTMLDivElement>(null);
  const [quieta, setQuieta] = useState(false);
  const [extremo, setExtremo] = useState<'inicio' | 'medio' | 'fin'>('inicio');

  const paso = useCallback((dir: 1 | -1) => {
    const el = pista.current;
    if (!el) return;
    const ancho = el.firstElementChild?.clientWidth ?? el.clientWidth;
    const gap = 12;
    // Al llegar al final vuelve al principio, así el ciclo no se corta.
    if (dir === 1 && el.scrollLeft + el.clientWidth >= el.scrollWidth - 4) {
      el.scrollTo({ left: 0, behavior: 'smooth' });
      return;
    }
    el.scrollBy({ left: dir * (ancho + gap), behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (quieta) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = setInterval(() => paso(1), PAUSA_MS);
    return () => clearInterval(id);
  }, [quieta, paso]);

  // Deshabilitar la flecha que no lleva a ningún lado.
  useEffect(() => {
    const el = pista.current;
    if (!el) return;
    const mirar = () => {
      const fin = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
      setExtremo(el.scrollLeft <= 4 ? 'inicio' : fin ? 'fin' : 'medio');
    };
    mirar();
    el.addEventListener('scroll', mirar, { passive: true });
    return () => el.removeEventListener('scroll', mirar);
  }, []);

  return (
    <div
      className="relative"
      onPointerDown={() => setQuieta(true)}
      onMouseEnter={() => setQuieta(true)}
      onMouseLeave={() => setQuieta(false)}
      onFocusCapture={() => setQuieta(true)}
      onBlurCapture={() => setQuieta(false)}
    >
      <div ref={pista} tabIndex={0} role="region" aria-label={etiqueta} className="tira tira-viva">
        {fotos.map(({ src, alt }) => (
          <Foto key={src} src={src} alt={alt} className="rounded-foto" sizes="(min-width: 768px) 18rem, 68vw" />
        ))}
      </div>

      <Flecha lado="izquierda" onClick={() => paso(-1)} inactiva={extremo === 'inicio'} />
      <Flecha lado="derecha" onClick={() => paso(1)} inactiva={false} />
    </div>
  );
}

function Flecha({ lado, onClick, inactiva }: { lado: 'izquierda' | 'derecha'; onClick: () => void; inactiva: boolean }) {
  const izq = lado === 'izquierda';
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={inactiva}
      aria-label={izq ? 'Foto anterior' : 'Foto siguiente'}
      className={`absolute top-1/2 z-10 hidden size-11 md:grid -translate-y-1/2 place-items-center rounded-full bg-cal/90 text-tinta shadow-md transition hover:bg-cal disabled:pointer-events-none disabled:opacity-0 ${izq ? 'left-1' : 'right-1'}`}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
        <path d={izq ? 'M15 5l-7 7 7 7' : 'M9 5l7 7-7 7'} />
      </svg>
    </button>
  );
}
