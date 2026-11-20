'use client';

import { useEffect, useState } from 'react';

/**
 * Video de fondo del hero (campo `videoFondo`). Solo se monta en pantallas
 * anchas (>= 768 px) y sin `prefers-reduced-motion`: en celular no se descarga
 * nada y se ve la foto de fondo. `preload="metadata"` + `poster` evitan bajar el
 * video entero antes de tiempo.
 */
export function HeroVideo({ src, poster }: { src: string; poster: string }) {
  const [activo, setActivo] = useState(false);

  useEffect(() => {
    const ancho = window.matchMedia('(min-width: 768px)');
    const reducido = window.matchMedia('(prefers-reduced-motion: reduce)');
    const evaluar = () => setActivo(ancho.matches && !reducido.matches);
    evaluar();
    ancho.addEventListener('change', evaluar);
    reducido.addEventListener('change', evaluar);
    return () => {
      ancho.removeEventListener('change', evaluar);
      reducido.removeEventListener('change', evaluar);
    };
  }, []);

  if (!activo) return null;
  return (
    <video
      className="absolute inset-0 -z-20 size-full object-cover"
      src={src}
      poster={poster}
      preload="metadata"
      autoPlay
      muted
      loop
      playsInline
      aria-hidden="true"
    />
  );
}
