import Link from 'next/link';
import { altDe } from '@/lib/alt';
import { textoPrecio } from '@/lib/precio';
import type { Alojamiento, Extensiones } from '@/lib/types';
import { SelectorVariantes } from './SelectorVariantes';
import { GaleriaMarco } from './ui/GaleriaMarco';
import { IconoCheck } from './ui/Iconos';
import { RichText } from './ui/RichText';

export function AlojamientoCard({ alojamiento: a, ext }: { alojamiento: Alojamiento; ext: Extensiones }) {
  const idTitulo = `aloj-${a.slug}`;
  const fotos = a.fotos.map((src) => ({ src, alt: '' }));
  return (
    <article aria-labelledby={idTitulo} className="flex h-full flex-col">
      {a.variantes?.length ? (
        <SelectorVariantes
          idGrupo={`variante-${a.slug}`}
          variantes={a.variantes.map((v) => ({
            nombre: v.nombre,
            foto: v.foto,
            alt: altDe(ext, v.foto, `${a.nombre}, ${v.nombre}`),
          }))}
        />
      ) : (
        <GaleriaMarco
          etiquetaRegion={`Fotos de ${a.nombre}`}
          fotos={fotos.map((f) => ({ ...f, alt: altDe(ext, f.src, a.nombre) }))}
        />
      )}

      <h3 id={idTitulo} className="mt-5">{a.nombre}</h3>
      <p className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-tinta-suave">
        <span>{a.etiquetaCapacidad ?? (a.capacidad === 1 ? 'Para 1 persona' : `Hasta ${a.capacidad} personas`)}</span>
        <span className="font-semibold text-eucalipto">{textoPrecio(a)}</span>
      </p>
      <RichText html={a.descripcion} className="mt-4" />



      {a.caracteristicas.length ? (
        <ul className="mt-5 space-y-1.5 text-paso">
          {a.caracteristicas.map((c) => (
            <li key={c} className="border-l-2 border-arena-oscura pl-3">{c}</li>
          ))}
        </ul>
      ) : null}

      <h4 className="mt-6 font-semibold text-eucalipto">Incluye</h4>
      <ul className="mt-2 space-y-1.5 text-paso">
        {a.incluye.map((i) => (
          <li key={i} className="flex gap-2">
            <span className="text-eucalipto-suave"><IconoCheck /></span>
            {i}
          </li>
        ))}
      </ul>

      <div className="mt-auto pt-7">
        <Link
          href={`/reservar?tipo=${encodeURIComponent(a.slug)}`}
          className="boton boton-primario w-full"
          aria-label={`Consultar disponibilidad para ${a.nombre}`}
        >
          Consultar disponibilidad
        </Link>
      </div>
    </article>
  );
}
