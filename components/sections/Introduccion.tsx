import { altDe } from '@/lib/alt';
import type { Extensiones, Introduccion as TIntro } from '@/lib/types';
import { TiraFotos } from '../ui/TiraFotos';
import { RichText } from '../ui/RichText';

export function Introduccion({ intro, ext }: { intro: TIntro; ext: Extensiones }) {
  const { titulo } = ext.secciones.introduccion;
  return (
    <section id="introduccion" aria-labelledby="h-introduccion" className="seccion">
      <div className="contenedor grid gap-12 md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] md:items-center">
        <div>
          <h2 id="h-introduccion">{titulo}</h2>
          <RichText html={intro.texto} className="mt-6 text-lead leading-relaxed" />
          <a href="#predio" className="boton boton-secundario mt-8 text-eucalipto">
            Conocé el espacio
          </a>
        </div>
        <TiraFotos
          etiqueta="Galería: playa, surf, naturaleza y atardeceres"
          fotos={ext.galeriaIntroduccion.map((src) => ({ src, alt: altDe(ext, src, 'Vida de playa') }))}
        />
      </div>
    </section>
  );
}
