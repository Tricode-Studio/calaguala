'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface Abierta {
  src: string;
  alt: string;
  grupo: string[];
  indice: number;
}

/**
 * Visor ampliado para las fotos de contenido.
 *
 * Escucha los clics en todo el documento en vez de envolver cada imagen:
 * las fotos las pintan componentes de servidor, y así no hay que volverlos
 * cliente ni duplicar estado. Una foto participa si lleva `data-foto` con
 * su ruta original; las de fondo no lo llevan y quedan afuera.
 *
 * Si la foto está dentro de un `data-galeria`, el visor toma las hermanas
 * y permite pasar de una a otra.
 */
export function VisorFoto() {
  const [abierta, setAbierta] = useState<Abierta | null>(null);
  const dialogo = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const alClic = (ev: MouseEvent) => {
      const destino = (ev.target as HTMLElement | null)?.closest<HTMLElement>('[data-foto]');
      if (!destino) return;
      const src = destino.dataset.foto;
      if (!src) return;
      const cont = destino.closest<HTMLElement>('[data-galeria]');
      const hermanas = cont ? [...cont.querySelectorAll<HTMLElement>('[data-foto]')] : [destino];
      const grupo = hermanas.map((h) => h.dataset.foto!).filter(Boolean);
      setAbierta({
        src,
        alt: destino.dataset.fotoAlt ?? '',
        grupo: grupo.length ? grupo : [src],
        indice: Math.max(0, grupo.indexOf(src)),
      });
    };
    document.addEventListener('click', alClic);
    return () => document.removeEventListener('click', alClic);
  }, []);

  useEffect(() => {
    const d = dialogo.current;
    if (!d) return;
    if (abierta && !d.open) d.showModal();
    if (!abierta && d.open) d.close();
  }, [abierta]);

  const mover = useCallback((paso: number) => {
    setAbierta((a) => {
      if (!a) return a;
      const i = (a.indice + paso + a.grupo.length) % a.grupo.length;
      const src = a.grupo[i];
      if (!src) return a;
      return { ...a, indice: i, src };
    });
  }, []);

  useEffect(() => {
    if (!abierta) return;
    const alTeclado = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') mover(1);
      if (e.key === 'ArrowLeft') mover(-1);
    };
    window.addEventListener('keydown', alTeclado);
    return () => window.removeEventListener('keydown', alTeclado);
  }, [abierta, mover]);

  const varias = (abierta?.grupo.length ?? 0) > 1;

  return (
    <dialog
      ref={dialogo}
      onClose={() => setAbierta(null)}
      onClick={(e) => { if (e.target === dialogo.current) setAbierta(null); }}
      aria-label="Foto ampliada"
      className="visor"
    >
      {abierta ? (
        <div className="relative flex max-h-[90vh] max-w-[92vw] flex-col items-center gap-3">
          {/* Ruta original, no la miniatura: el optimizador sirve el tamaño grande. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/_next/image?url=${encodeURIComponent(abierta.src)}&w=1920&q=80`}
            alt={abierta.alt}
            className="max-h-[80vh] w-auto max-w-full rounded-foto object-contain"
          />
          {abierta.alt ? <p className="max-w-prose text-center text-paso text-cal/90">{abierta.alt}</p> : null}

          <button type="button" onClick={() => setAbierta(null)} aria-label="Cerrar" className="visor-boton absolute -top-2 right-0 -translate-y-full">
            <Cruz />
          </button>
          {varias ? (
            <>
              <button type="button" onClick={() => mover(-1)} aria-label="Foto anterior" className="visor-boton absolute left-2 top-1/2 -translate-y-1/2">
                <Punta izquierda />
              </button>
              <button type="button" onClick={() => mover(1)} aria-label="Foto siguiente" className="visor-boton absolute right-2 top-1/2 -translate-y-1/2">
                <Punta />
              </button>
            </>
          ) : null}
        </div>
      ) : null}
    </dialog>
  );
}

const Cruz = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round">
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);

const Punta = ({ izquierda }: { izquierda?: boolean }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className="size-6" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
    <path d={izquierda ? 'M15 5l-7 7 7 7' : 'M9 5l7 7-7 7'} />
  </svg>
);
