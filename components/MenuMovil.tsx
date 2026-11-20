'use client';

import Link from 'next/link';
import { useEffect, useId, useRef, useState } from 'react';

/**
 * Menú de celular: botón de hamburguesa + panel debajo del header. Sin
 * librerías. Cierra con Esc, al tocar un link o al tocar fuera; con Esc devuelve
 * el foco al botón. Visible solo bajo `lg` (la nav de escritorio ocupa su lugar).
 */
export function MenuMovil({ enlaces }: { enlaces: { href: string; label: string }[] }) {
  const [abierto, setAbierto] = useState(false);
  const idPanel = useId();
  const boton = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!abierto) return;
    // Foco al primer link al abrir.
    panel.current?.querySelector<HTMLElement>('a')?.focus();
    const alTecla = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setAbierto(false);
        boton.current?.focus();
      }
    };
    const alToque = (e: PointerEvent) => {
      const t = e.target as Node;
      if (panel.current?.contains(t) || boton.current?.contains(t)) return;
      setAbierto(false);
    };
    document.addEventListener('keydown', alTecla);
    document.addEventListener('pointerdown', alToque);
    return () => {
      document.removeEventListener('keydown', alTecla);
      document.removeEventListener('pointerdown', alToque);
    };
  }, [abierto]);

  // Al llegar a escritorio la nav completa reemplaza al menú: se cierra para que
  // no reaparezca abierto al volver a un ancho menor.
  useEffect(() => {
    const escritorio = window.matchMedia('(min-width: 1024px)');
    const alCambiar = (e: MediaQueryListEvent) => {
      if (e.matches) setAbierto(false);
    };
    escritorio.addEventListener('change', alCambiar);
    return () => escritorio.removeEventListener('change', alCambiar);
  }, []);

  return (
    <div
      className="lg:hidden"
      onBlur={(e) => {
        // El foco salió del menú (Tab más allá del último link): se cierra. Con
        // relatedTarget null (clic en zona no enfocable) lo maneja `pointerdown`.
        const destino = e.relatedTarget;
        if (abierto && destino instanceof Node && !e.currentTarget.contains(destino)) setAbierto(false);
      }}
    >
      <button
        ref={boton}
        type="button"
        aria-expanded={abierto}
        aria-controls={idPanel}
        aria-label={abierto ? 'Cerrar menú' : 'Abrir menú'}
        onClick={() => setAbierto((a) => !a)}
        className="grid size-11 place-items-center rounded-full hover:bg-arena/60"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" className="size-6" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
          {abierto ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
        </svg>
      </button>
      <div
        ref={panel}
        id={idPanel}
        hidden={!abierto}
        className="menu-movil absolute inset-x-0 top-full border-b border-arena bg-cal shadow-lg"
      >
        <nav aria-label="Menú principal" className="contenedor py-3">
          <ul>
            {enlaces.map((e) => (
              <li key={e.href}>
                <a href={e.href} onClick={() => setAbierto(false)} className="flex min-h-11 items-center rounded-control px-2 text-lead hover:bg-arena/60">
                  {e.label}
                </a>
              </li>
            ))}
          </ul>
          <Link href="/reservar" onClick={() => setAbierto(false)} className="boton boton-primario mt-3 w-full">
            Solicitá tu reserva
          </Link>
        </nav>
      </div>
    </div>
  );
}
