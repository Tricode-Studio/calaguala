'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { optimizable } from './Img';

interface Abierta {
  src: string;
  alt: string;
  grupo: string[];
  /** Miniatura ya cargada de cada foto del grupo (la usa de placeholder), si la hay. */
  miniaturas: (string | undefined)[];
  indice: number;
}

/** Anchos que acepta /_next/image por defecto; tope 1200 (la ampliada no necesita más). */
const ANCHOS = [640, 750, 828, 1080, 1200];
const CALIDAD = 75;

/** URL de la versión ampliada: tamaño según el viewport en vez del 1920 fijo. */
function urlAmpliada(src: string): string {
  if (!optimizable(src)) return src;
  const necesario = window.innerWidth * Math.min(window.devicePixelRatio || 1, 2) * 0.92;
  const w = ANCHOS.find((a) => a >= necesario) ?? ANCHOS[ANCHOS.length - 1];
  return `/_next/image?url=${encodeURIComponent(src)}&w=${w}&q=${CALIDAD}`;
}

/** Ancho (w) de una URL de /_next/image; 0 si no es del optimizador. */
const anchoDe = (url: string) => Number(/[?&]w=(\d+)/.exec(url)?.[1] ?? 0);
/** Suma un contador de reintentos a la URL para esquivar una respuesta de error cacheada. */
const conIntento = (url: string, n: number) => `${url}${url.includes('?') ? '&' : '?'}r=${n}`;

/**
 * Pide la imagen al navegador una sola vez; después sale de su caché HTTP.
 * Con tope LRU: la clave incluye el ancho, así que sin límite crecería.
 */
const MAX_PRECARGADAS = 30;
const precargadas = new Map<string, HTMLImageElement>();
function precargar(src: string | undefined) {
  if (!src) return;
  const url = urlAmpliada(src);
  const previa = precargadas.get(url);
  if (previa) {
    precargadas.delete(url); // reinsertar: pasa a ser la más reciente
    precargadas.set(url, previa);
    return;
  }
  const img = new Image();
  img.decoding = 'async';
  img.src = url;
  precargadas.set(url, img);
  if (precargadas.size > MAX_PRECARGADAS) {
    const primera = precargadas.keys().next().value;
    if (primera !== undefined) precargadas.delete(primera);
  }
}

/** currentSrc de la miniatura si ya terminó de cargar. */
function miniaturaDe(el: HTMLElement): string | undefined {
  const img = el.querySelector('img');
  return img && img.complete && img.naturalWidth > 0 ? img.currentSrc || img.src : undefined;
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
  /** Elemento que abrió el visor: recibe el foco al cerrar. */
  const disparador = useRef<HTMLElement | null>(null);

  useEffect(() => {
    // Abre la foto de `destino` (un `[data-foto]`); lo usan el clic y el teclado.
    const abrir = (destino: HTMLElement) => {
      const src = destino.dataset.foto;
      if (!src) return;
      disparador.current = destino;
      const cont = destino.closest<HTMLElement>('[data-galeria]');
      const hermanas = cont ? [...cont.querySelectorAll<HTMLElement>('[data-foto]')] : [destino];
      const validas = hermanas.filter((h) => h.dataset.foto);
      const grupo = validas.map((h) => h.dataset.foto!);
      setAbierta({
        src,
        alt: destino.dataset.fotoAlt ?? '',
        grupo: grupo.length ? grupo : [src],
        miniaturas: grupo.length ? validas.map(miniaturaDe) : [miniaturaDe(destino)],
        indice: Math.max(0, grupo.indexOf(src)),
      });
    };
    const alClic = (ev: MouseEvent) => {
      const destino = (ev.target as HTMLElement | null)?.closest<HTMLElement>('[data-foto]');
      if (destino) abrir(destino);
    };
    // Enter o Espacio sobre una foto enfocada (son role="button" con tabIndex).
    const alTecla = (ev: KeyboardEvent) => {
      if (ev.key !== 'Enter' && ev.key !== ' ') return;
      if (ev.altKey || ev.ctrlKey || ev.metaKey || ev.shiftKey) return;
      const el = ev.target as HTMLElement | null;
      if (!el?.dataset?.foto) return; // solo si el foco está en la foto misma
      ev.preventDefault(); // Espacio no debe hacer scroll
      abrir(el);
    };
    // Precarga al pasar el mouse o tocar: la ampliada ya viene en camino al hacer clic.
    const alAcercar = (ev: Event) => {
      if (ev.type === 'pointerover' && (ev as PointerEvent).pointerType !== 'mouse') return;
      precargar((ev.target as HTMLElement | null)?.closest<HTMLElement>('[data-foto]')?.dataset.foto);
    };
    document.addEventListener('click', alClic);
    document.addEventListener('keydown', alTecla);
    document.addEventListener('pointerover', alAcercar, { passive: true });
    document.addEventListener('touchstart', alAcercar, { passive: true });
    return () => {
      document.removeEventListener('click', alClic);
      document.removeEventListener('keydown', alTecla);
      document.removeEventListener('pointerover', alAcercar);
      document.removeEventListener('touchstart', alAcercar);
    };
  }, []);

  // Al abrir o moverse: la actual, la siguiente y la anterior.
  useEffect(() => {
    if (!abierta) return;
    const n = abierta.grupo.length;
    precargar(abierta.src);
    precargar(abierta.grupo[(abierta.indice + 1) % n]);
    precargar(abierta.grupo[(abierta.indice - 1 + n) % n]);
  }, [abierta]);

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

  // Bloquea el scroll de la página de fondo mientras el visor está abierto.
  const estaAbierta = abierta !== null;
  useEffect(() => {
    if (!estaAbierta) return;
    const html = document.documentElement;
    const previo = html.style.overflow;
    const paddingPrevio = html.style.paddingRight;
    // Con barra de scroll clásica, al ocultarla la página saltaría: se compensa su ancho.
    const anchoBarra = window.innerWidth - html.clientWidth;
    if (anchoBarra > 0) html.style.paddingRight = `${anchoBarra}px`;
    html.style.overflow = 'hidden';
    return () => {
      html.style.overflow = previo;
      html.style.paddingRight = paddingPrevio;
    };
  }, [estaAbierta]);

  // Swipe horizontal en pantallas táctiles: pasa de foto (umbral 50 px; un
  // gesto más vertical que horizontal se ignora). No interfiere con los botones.
  const toque = useRef<{ x: number; y: number } | null>(null);
  const alIniciarToque = (e: React.TouchEvent) => {
    const t = e.touches[0];
    const sobreBoton = (e.target as HTMLElement).closest('button');
    toque.current = t && !sobreBoton && e.touches.length === 1 ? { x: t.clientX, y: t.clientY } : null;
  };
  const alTerminarToque = (e: React.TouchEvent) => {
    const ini = toque.current;
    toque.current = null;
    const t = e.changedTouches[0];
    if (!ini || !t) return;
    const dx = t.clientX - ini.x;
    const dy = t.clientY - ini.y;
    if (Math.abs(dx) >= 50 && Math.abs(dx) > Math.abs(dy) * 1.5) mover(dx < 0 ? 1 : -1);
  };

  const varias = (abierta?.grupo.length ?? 0) > 1;

  return (
    <dialog
      ref={dialogo}
      onClose={() => {
        setAbierta(null);
        const el = disparador.current;
        disparador.current = null;
        if (el?.isConnected) el.focus({ preventScroll: true });
      }}
      onClick={(e) => { if (e.target === dialogo.current) setAbierta(null); }}
      onTouchStart={varias ? alIniciarToque : undefined}
      onTouchEnd={varias ? alTerminarToque : undefined}
      aria-label="Foto ampliada"
      className="visor"
    >
      {abierta ? (
        <div className="visor-caja">
          <FotoAmpliada key={abierta.src} src={abierta.src} alt={abierta.alt} miniatura={abierta.miniaturas[abierta.indice]} />
          {abierta.alt ? <p className="visor-pie max-w-prose text-center text-paso text-cal/90">{abierta.alt}</p> : null}

          <button type="button" onClick={() => setAbierta(null)} aria-label="Cerrar" className="visor-boton visor-cerrar">
            <Cruz />
          </button>
          {varias ? (
            <>
              <button type="button" onClick={() => mover(-1)} aria-label="Foto anterior" className="visor-boton visor-flecha visor-flecha-izq">
                <Punta izquierda />
              </button>
              <button type="button" onClick={() => mover(1)} aria-label="Foto siguiente" className="visor-boton visor-flecha visor-flecha-der">
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

/**
 * Foto grande con blur-up (miniatura ya cargada, escalada y difuminada),
 * indicador de carga, fade-in al llegar y reintento si falla.
 *
 * Miniatura (o recuadro) y foto final comparten celda de grilla y las mismas
 * clases de tamaño (`h-[80vh] w-auto max-w-full object-contain`), así no hay
 * salto de caja cuando llega la grande.
 */
const CAJA = 'col-start-1 row-start-1 visor-foto-alto w-auto max-w-full rounded-foto object-contain';

function FotoAmpliada({ src, alt, miniatura }: { src: string; alt: string; miniatura?: string }) {
  const [estado, setEstado] = useState<'carga' | 'ok' | 'error'>('carga');
  const [intento, setIntento] = useState(0);
  const [url, setUrl] = useState(() => urlAmpliada(src));
  const ref = useRef<HTMLImageElement>(null);

  // Ventana redimensionada o girada: se recalcula el ancho. Solo se sube; si
  // la ventana se achica se conserva la ya cargada (evita descargar de nuevo).
  useEffect(() => {
    let t: ReturnType<typeof setTimeout> | undefined;
    const recalcular = () => {
      clearTimeout(t);
      t = setTimeout(() => {
        // Con reintentos previos, la URL nueva conserva el contador (no reusa un error cacheado).
        const base = urlAmpliada(src);
        const nueva = intento > 0 ? conIntento(base, intento) : base;
        if (anchoDe(nueva) > anchoDe(url)) {
          setUrl(nueva);
          setEstado('carga');
        }
      }, 200);
    };
    window.addEventListener('resize', recalcular);
    window.addEventListener('orientationchange', recalcular);
    return () => {
      clearTimeout(t);
      window.removeEventListener('resize', recalcular);
      window.removeEventListener('orientationchange', recalcular);
    };
  }, [src, url, intento]);

  // Si ya estaba en caché, `load` puede haber disparado antes de hidratar el handler.
  useEffect(() => {
    const img = ref.current;
    if (img?.complete && img.naturalWidth > 0) setEstado('ok');
  }, [intento, url]);

  return (
    <div className="relative grid max-w-full place-items-center">
      {miniatura ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={miniatura}
          alt=""
          aria-hidden="true"
          className={`${CAJA} blur-md transition-opacity duration-300 ${estado === 'ok' ? 'opacity-0' : 'opacity-100'}`}
        />
      ) : (
        <div aria-hidden="true" className={`col-start-1 row-start-1 h-[60dvh] w-[min(80vw,28rem)] rounded-foto bg-cal/10 ${estado === 'ok' ? 'hidden' : ''}`} />
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        key={intento}
        ref={ref}
        src={url}
        alt={alt}
        onLoad={() => setEstado('ok')}
        onError={() => setEstado('error')}
        className={`${CAJA} transition-opacity duration-300 ${estado === 'ok' ? 'opacity-100' : 'opacity-0'}`}
      />
      {estado === 'carga' ? (
        <div role="status" aria-label="Cargando foto" className="absolute inset-0 grid place-items-center">
          <span className="spinner-foto" />
        </div>
      ) : null}
      {estado === 'error' ? (
        <div role="alert" className="absolute inset-0 grid place-content-center justify-items-center gap-3 rounded-foto bg-black/50 p-4 text-center text-cal">
          <p>No se pudo cargar la foto.</p>
          <button
            type="button"
            onClick={() => {
              // Descarta la precarga fallida y vuelve a pedir con un parámetro nuevo,
              // para que el navegador no reutilice la respuesta de error.
              precargadas.delete(urlAmpliada(src)); // clave real de la precarga (sin `r`)
              precargadas.delete(url);
              setUrl(conIntento(urlAmpliada(src), intento + 1));
              setEstado('carga');
              setIntento((n) => n + 1);
            }}
            className="boton boton-secundario"
          >
            Reintentar
          </button>
        </div>
      ) : null}
    </div>
  );
}
