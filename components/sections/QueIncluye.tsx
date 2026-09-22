import type { Extensiones, QueIncluye as TQI } from '@/lib/types';
import { IconoCheck } from '../ui/Iconos';

export function QueIncluye({ data, ext }: { data: TQI; ext: Extensiones }) {
  return (
    <section id="que-incluye" aria-labelledby="h-que-incluye" className="seccion bg-eucalipto text-cal sobre-oscuro">
      <div className="contenedor grid gap-10 md:grid-cols-2 md:items-start">
        <h2 id="h-que-incluye" className="text-cal">{ext.secciones['que-incluye'].titulo}</h2>
        <ul className="divide-y divide-cal/20 text-lead">
          {data.items.map((item) => (
            <li key={item} className="flex items-center gap-4 py-4">
              <span className="text-sol"><IconoCheck /></span>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
