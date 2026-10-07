import Link from 'next/link';
import type { Extensiones, Recomendacion } from '@/lib/types';
import { RecomendacionCard } from '../RecomendacionCard';
import { SeccionEncabezado } from '../ui/SeccionEncabezado';

export function Recomendaciones({ items, ext }: { items: Recomendacion[]; ext: Extensiones }) {
  const { titulo, bajada } = ext.secciones.recomendaciones;
  if (!items.length) return null;
  return (
    <section id="recomendaciones" aria-labelledby="h-recomendaciones" className="seccion">
      <div className="contenedor">
        <SeccionEncabezado id="h-recomendaciones" titulo={titulo} bajada={bajada} />
        <ul className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((r) => (
            <li key={r.id}>
              <RecomendacionCard recomendacion={r} ext={ext} />
            </li>
          ))}
        </ul>
        <div className="mt-12">
          <Link href="/la-paloma" className="boton boton-secundario text-oceano">
            Descubrí La Paloma <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
