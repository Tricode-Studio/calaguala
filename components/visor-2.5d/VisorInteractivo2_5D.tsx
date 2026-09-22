'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { ANCHO, ARBOLES, CAMINO, CAPAS, ELEMENTOS, FONDO, SALIDA_PLAYA, type CapaId, type Elemento } from './predio';

// ── Proyección isométrica ─────────────────────────────────────────────────
const S = 24;
const C = Math.cos(Math.PI / 6);
type P3 = [number, number, number];
const iso = ([x, y, z]: P3): [number, number] => [(x - y) * C * S, (x + y) * 0.5 * S - z * S];
const pts = (ps: P3[]) => ps.map((p) => iso(p).map((n) => n.toFixed(1)).join(',')).join(' ');

// Bounds del viewBox (incluye algo de altura para árboles)
const MIN_X = iso([0, FONDO, 0])[0] - 30;
const MAX_X = iso([ANCHO, 0, 0])[0] + 30;
const MIN_Y = iso([0, 0, 4])[1] - 10;
const MAX_Y = iso([ANCHO, FONDO, -0.8])[1] + 40;
const VB_W = MAX_X - MIN_X;
const VB_H = MAX_Y - MIN_Y;

const COL = {
  sueloTop: '#e7dcc8', sueloIzq: '#b9a47f', sueloDer: '#cdbb9c',
  camino: '#f4f4f0', copa: '#5c7160', copaLuz: '#7d9273', tronco: '#6b5a44',
  pared: '#f4f4f0', paredSombra: '#d9d6cc', techo: '#9aa5a9',
  lona: '#f4f4f0', lonaSombra: '#cfc3dc', parcela: '#cdbb9c', fuego: '#e6a13c',
};

function Caja({ e }: { e: Elemento }) {
  const { x, y, w, d, h } = e;
  return (
    <>
      <polygon points={pts([[x + w, y, 0], [x + w, y + d, 0], [x + w, y + d, h], [x + w, y, h]])} fill={COL.paredSombra} />
      <polygon points={pts([[x, y + d, 0], [x + w, y + d, 0], [x + w, y + d, h], [x, y + d, h]])} fill={COL.pared} />
      <polygon points={pts([[x, y, h], [x + w, y, h], [x + w, y + d, h], [x, y + d, h]])} fill={COL.techo} />
    </>
  );
}

function Carpa({ e }: { e: Elemento }) {
  const { x, y, w, d, h } = e;
  const m = y + d / 2;
  return (
    <>
      <polygon points={pts([[x - 0.3, y - 0.3, 0], [x + w + 0.3, y - 0.3, 0], [x + w + 0.3, y + d + 0.3, 0], [x - 0.3, y + d + 0.3, 0]])} fill="#a8916b" />
      <polygon points={pts([[x, y, 0], [x + w, y, 0], [x + w, m, h], [x, m, h]])} fill={COL.lonaSombra} />
      <polygon points={pts([[x, y + d, 0], [x + w, y + d, 0], [x + w, m, h], [x, m, h]])} fill={COL.lona} />
      <polygon points={pts([[x + w, y, 0], [x + w, y + d, 0], [x + w, m, h]])} fill={COL.lonaSombra} />
    </>
  );
}

function Techo({ e }: { e: Elemento }) {
  const { x, y, w, d, h } = e;
  const postes: [number, number][] = [[x, y + d], [x + w, y + d], [x + w, y]];
  return (
    <>
      <polygon points={pts([[x, y, 0.02], [x + w, y, 0.02], [x + w, y + d, 0.02], [x, y + d, 0.02]])} fill="#efe4cf" />
      {postes.map(([px, py]) => {
        const [a, b] = [iso([px, py, 0]), iso([px, py, h])];
        return <line key={`${px}-${py}`} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={COL.tronco} strokeWidth={3} />;
      })}
      <polygon points={pts([[x - 0.2, y - 0.2, h], [x + w + 0.2, y - 0.2, h], [x + w + 0.2, y + d + 0.2, h], [x - 0.2, y + d + 0.2, h]])} fill={COL.techo} opacity={0.92} />
    </>
  );
}

function circulo(cx: number, cy: number, r: number, z = 0.02, n = 18): P3[] {
  return Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    return [cx + Math.cos(a) * r, cy + Math.sin(a) * r, z];
  });
}

function Fogon({ e }: { e: Elemento }) {
  const cx = e.x + e.w / 2, cy = e.y + e.d / 2;
  return (
    <>
      <polygon points={pts(circulo(cx, cy, e.w / 2))} fill="#8c7a5e" />
      <polygon points={pts(circulo(cx, cy, e.w / 4, 0.05))} fill={COL.fuego} />
    </>
  );
}

function Parcela({ e }: { e: Elemento }) {
  const { x, y, w, d } = e;
  return (
    <polygon
      points={pts([[x, y, 0.02], [x + w, y, 0.02], [x + w, y + d, 0.02], [x, y + d, 0.02]])}
      fill={COL.parcela}
      stroke={COL.tronco}
      strokeWidth={1.5}
      strokeDasharray="5 4"
    />
  );
}

const FORMAS = { caja: Caja, carpa: Carpa, techo: Techo, fogon: Fogon, parcela: Parcela } as const;

// ── Componente ───────────────────────────────────────────────────────────
export function VisorInteractivo2_5D() {
  const [visibles, setVisibles] = useState<Record<CapaId, boolean>>({ terreno: true, distribucion: false, servicios: false });
  const [hover, setHover] = useState<string | null>(null);
  const [seleccion, setSeleccion] = useState<string | null>(null);
  const contenedor = useRef<HTMLDivElement>(null);
  const yaAnimado = useRef(false);

  // Único momento orquestado: al entrar en viewport, las capas se apilan en orden.
  useEffect(() => {
    const el = contenedor.current;
    if (!el) return;
    const reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducido) {
      setVisibles({ terreno: true, distribucion: true, servicios: true });
      return;
    }
    const timers: number[] = [];
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting || yaAnimado.current) return;
        yaAnimado.current = true;
        timers.push(window.setTimeout(() => setVisibles((v) => ({ ...v, distribucion: true })), 450));
        timers.push(window.setTimeout(() => setVisibles((v) => ({ ...v, servicios: true })), 1050));
        io.disconnect();
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      timers.forEach(clearTimeout);
    };
  }, []);

  type Item =
    | { tipo: 'arbol'; key: string; prof: number; arbol: [number, number, number] }
    | { tipo: 'elemento'; key: string; prof: number; elemento: Elemento };
  const escena = useMemo<Item[]>(
    () =>
      [
        ...ARBOLES.map((a): Item => ({ tipo: 'arbol', key: `arbol-${a[0]}-${a[1]}`, prof: a[0] + a[1], arbol: a })),
        ...ELEMENTOS.map((e): Item => ({ tipo: 'elemento', key: e.id, prof: e.x + e.w + e.y + e.d, elemento: e })),
      ].sort((a, b) => a.prof - b.prof),
    [],
  );

  const activoId = hover ?? seleccion;
  const activo = ELEMENTOS.find((e) => e.id === activoId && visibles[e.capa]) ?? null;
  const ancla = activo ? iso([activo.x + activo.w / 2, activo.y + activo.d / 2, activo.h + 0.4]) : null;

  const alternar = useCallback((id: CapaId) => {
    setVisibles((v) => ({ ...v, [id]: !v[id] }));
  }, []);

  const onKey = (e: KeyboardEvent, id: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setSeleccion(id);
    } else if (e.key === 'Escape') {
      setSeleccion(null);
    }
  };

  const estiloCapa = (id: CapaId, idx: number): React.CSSProperties => ({
    opacity: visibles[id] ? 1 : 0,
    transform: visibles[id] ? 'translateY(0)' : `translateY(${-18 - idx * 6}px)`,
    transition: 'opacity 420ms ease, transform 620ms cubic-bezier(.2,.7,.2,1), filter 160ms ease',
  });

  const capaIdx = (id: CapaId) => CAPAS.findIndex((c) => c.id === id);
  const suelo = (z: number) => pts([[0, 0, z], [ANCHO, 0, z], [ANCHO, FONDO, z], [0, FONDO, z]]);
  const salidaPlaya = iso([SALIDA_PLAYA[0], SALIDA_PLAYA[1] + 0.6, 0]);

  return (
    <div ref={contenedor} className="grid gap-8 lg:grid-cols-[16rem_minmax(0,1fr)] lg:items-start">
      {/* Toggles de capa */}
      <fieldset className="lg:sticky lg:top-24">
        <legend className="mb-3 text-cal">Capas del predio</legend>
        <ul className="flex flex-wrap gap-2 lg:flex-col">
          {CAPAS.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                aria-pressed={visibles[c.id]}
                onClick={() => alternar(c.id)}
                className="flex min-h-11 w-full items-center gap-3 rounded-[var(--radius-control)] px-4 py-2 text-left ring-1 ring-cal/30 transition-colors aria-pressed:bg-cal aria-pressed:text-mar"
              >
                <span aria-hidden="true" className="size-3 shrink-0 rounded-full ring-2 ring-current [[aria-pressed=true]_&]:bg-current" />
                <span>
                  <span className="block font-semibold leading-tight">{c.nombre}</span>
                  <span className="hidden text-paso opacity-80 lg:block">{c.descripcion}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-paso text-cal">Pasá el cursor o navegá con Tab por cada lugar para ver qué es.</p>
      </fieldset>

      {/* Lienzo */}
      <div className="relative">
        <svg
          viewBox={`${MIN_X} ${MIN_Y} ${VB_W} ${VB_H}`}
          className="h-auto w-full"
          role="group"
          aria-label="Plano ilustrado del predio de Calaguala"
        >
          {/* Capa base: terreno */}
          <g style={estiloCapa('terreno', 0)} aria-hidden="true">
            <polygon points={pts([[ANCHO, 0, 0], [ANCHO, FONDO, 0], [ANCHO, FONDO, -0.8], [ANCHO, 0, -0.8]])} fill={COL.sueloDer} />
            <polygon points={pts([[0, FONDO, 0], [ANCHO, FONDO, 0], [ANCHO, FONDO, -0.8], [0, FONDO, -0.8]])} fill={COL.sueloIzq} />
            <polygon points={suelo(0)} fill={COL.sueloTop} />
            <polyline points={pts(CAMINO.map(([x, y]) => [x, y, 0.01]))} fill="none" stroke={COL.camino} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" />
            <text x={salidaPlaya[0]} y={salidaPlaya[1] + 46} textAnchor="middle" fill="#f4f4f0" fontSize={15} fontFamily="var(--font-sans)">
              Hacia Playa Anaconda
            </text>
          </g>

          {/* Árboles + elementos, ordenados por profundidad (painter's algorithm).
              Cada ítem hereda la animación de su capa. */}
          {escena.map((item) => {
            if (item.tipo === 'arbol') {
              const [x, y, r] = item.arbol;
              const base = iso([x, y, 0]);
              const copa = iso([x, y, 2.4]);
              return (
                <g key={item.key} aria-hidden="true" style={estiloCapa('terreno', 0)}>
                  <ellipse cx={base[0]} cy={base[1]} rx={r * S * 0.8} ry={r * S * 0.4} fill="#000" opacity={0.08} />
                  <line x1={base[0]} y1={base[1]} x2={copa[0]} y2={copa[1]} stroke={COL.tronco} strokeWidth={4} />
                  <circle cx={copa[0]} cy={copa[1]} r={r * S * 0.7} fill={COL.copa} />
                  <circle cx={copa[0] - r * 5} cy={copa[1] - r * 5} r={r * S * 0.38} fill={COL.copaLuz} />
                </g>
              );
            }
            const e = item.elemento;
            const Forma = FORMAS[e.forma];
            const visible = visibles[e.capa];
            const esActivo = activo?.id === e.id;
            return (
              <g
                key={item.key}
                role="button"
                tabIndex={visible ? 0 : -1}
                aria-hidden={!visible}
                aria-label={`${e.nombre}. ${e.descripcion}`}
                aria-pressed={seleccion === e.id}
                onMouseEnter={() => setHover(e.id)}
                onMouseLeave={() => setHover(null)}
                onFocus={() => setSeleccion(e.id)}
                onBlur={() => setSeleccion((s) => (s === e.id ? null : s))}
                onClick={() => setSeleccion(e.id)}
                onKeyDown={(ev) => onKey(ev, e.id)}
                className="cursor-pointer outline-none"
                style={{
                  ...estiloCapa(e.capa, capaIdx(e.capa)),
                  pointerEvents: visible ? 'auto' : 'none',
                  filter: esActivo ? 'drop-shadow(0 0 6px rgb(230 161 60 / .95))' : undefined,
                }}
              >
                <Forma e={e} />
              </g>
            );
          })}
        </svg>

        {/* Tooltip visual (la info accesible ya está en el aria-label de cada elemento) */}
        {activo && ancla ? (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute z-10 w-max max-w-[15rem] -translate-x-1/2 -translate-y-[calc(100%+10px)] rounded-[var(--radius-control)] bg-cal px-3 py-2 text-paso leading-snug text-tinta shadow-lg"
            style={{ left: `${((ancla[0] - MIN_X) / VB_W) * 100}%`, top: `${((ancla[1] - MIN_Y) / VB_H) * 100}%` }}
          >
            <strong className="block font-semibold text-eucalipto">{activo.nombre}</strong>
            {activo.descripcion}
          </div>
        ) : null}
        <p className="mt-3 text-paso text-cal">Ilustración de referencia. La distribución exacta puede variar.</p>
      </div>
    </div>
  );
}
