import { altDe } from '@/lib/alt';
import type { Extensiones } from '@/lib/types';
import { GaleriaMarco } from '../ui/GaleriaMarco';
import { SeccionEncabezado } from '../ui/SeccionEncabezado';

export function Experiencias({ ext }: { ext: Extensiones }) {
  const { titulo, bajada } = ext.secciones.experiencias;
  return (
    <section id="experiencias" aria-labelledby="h-experiencias" className="seccion bg-nieve">
      <div className="contenedor">
        <SeccionEncabezado id="h-experiencias" titulo={titulo} bajada={bajada} />
        <ul className="grid gap-12 md:grid-cols-2 md:gap-10 lg:grid-cols-4 lg:gap-8">
          {ext.experiencias.map((e, i) => (
            <li key={e.id} className={i % 2 ? 'lg:mt-16' : ''}>
              <GaleriaMarco
                etiquetaRegion={`Fotos de ${e.titulo}`}
                fotos={e.fotos.map((src) => ({ src, alt: altDe(ext, src, e.titulo) }))}
                aspecto="3 / 4"
                sizes="(min-width: 1024px) 22vw, (min-width: 768px) 45vw, 85vw"
              />
              <h3 className="mt-5">{e.titulo}</h3>
              <p className="mt-2 text-tinta-suave">{e.descripcion}</p>
              <ul className="mt-4 flex flex-wrap gap-2 text-paso">
                {e.detalles.map((d) => (
                  <li key={d} className="rounded-full bg-arena px-3 py-1">{d}</li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
