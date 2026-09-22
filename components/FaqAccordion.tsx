import type { PreguntaFrecuente } from '@/lib/types';
import { RichText } from './ui/RichText';

/** <details> nativo: accesible por teclado, sin JS, y el texto queda indexable. */
export function FaqAccordion({ items }: { items: PreguntaFrecuente[] }) {
  return (
    <div className="divide-y divide-arena-oscura border-y border-arena-oscura">
      {items.map((q) => (
        <details key={q.id} className="group">
          <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-4 text-lead [&::-webkit-details-marker]:hidden">
            <h3 className="font-sans text-lead font-medium text-tinta">{q.pregunta}</h3>
            <span aria-hidden="true" className="relative size-5 shrink-0 text-eucalipto">
              <span className="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 bg-current" />
              <span className="absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 bg-current transition-transform group-open:rotate-90" />
            </span>
          </summary>
          <RichText html={q.respuesta} className="pb-6 text-tinta-suave" />
        </details>
      ))}
    </div>
  );
}
