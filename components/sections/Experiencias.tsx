import { altDe } from '@/lib/alt';
import type { Extensiones } from '@/lib/types';
import { Foto } from '../ui/Foto';
import { SeccionEncabezado } from '../ui/SeccionEncabezado';

export function Experiencias({ ext }: { ext: Extensiones }) {
  const { titulo, bajada } = ext.secciones.experiencias;
  return (
    <section id="experiencias" aria-labelledby="h-experiencias" className="seccion bg-arena">
      <div className="contenedor">
        <SeccionEncabezado id="h-experiencias" titulo={titulo} bajada={bajada} />
        <ul className="grid gap-12 md:grid-cols-3 md:gap-8">
          {ext.experiencias.map((e, i) => (
            <li key={e.id} className={i === 1 ? 'md:mt-16' : ''}>
              <Foto src={e.foto} alt={altDe(ext, e.foto, e.titulo)} aspecto="3 / 4" className="rounded-foto" />
              <h3 className="mt-5">{e.titulo}</h3>
              <p className="mt-2 text-tinta-suave">{e.descripcion}</p>
              <ul className="mt-4 flex flex-wrap gap-2 text-paso">
                {e.detalles.map((d) => (
                  <li key={d} className="rounded-full bg-cal px-3 py-1">{d}</li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
