import type { Extensiones, PreguntaFrecuente } from '@/lib/types';
import { FaqAccordion } from '../FaqAccordion';

export function Faq({ items, ext }: { items: PreguntaFrecuente[]; ext: Extensiones }) {
  return (
    <section id="faq" aria-labelledby="h-faq" className="seccion">
      <div className="contenedor grid gap-10 md:grid-cols-[minmax(0,4fr)_minmax(0,7fr)]">
        <h2 id="h-faq">{ext.secciones.faq.titulo}</h2>
        <FaqAccordion items={items} />
      </div>
    </section>
  );
}
