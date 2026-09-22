import Image from 'next/image';
import { altDe } from '@/lib/alt';
import type { Extensiones, Introduccion as TIntro } from '@/lib/types';
import { TiraFotos } from '../ui/TiraFotos';
import { RichText } from '../ui/RichText';

export function Introduccion({ intro, ext }: { intro: TIntro; ext: Extensiones }) {
  const { titulo } = ext.secciones.introduccion;
  return (
    <section id="introduccion" aria-labelledby="h-introduccion" className="seccion sobre-oscuro relative isolate overflow-hidden text-cal">
      {/* Foto de fondo decorativa. El velo mantiene el texto oscuro legible:
          la foto tiene cielo claro y mar oscuro, sin él no se leería. */}
      <Image
        src="/fotos/mardefondo.webp"
        alt=""
        aria-hidden="true"
        fill
        sizes="100vw"
        className="-z-20 object-cover object-center"
      />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-b from-black/62 via-black/55 to-black/30 md:bg-gradient-to-r md:from-black/62 md:from-30% md:via-black/45 md:via-55% md:to-transparent md:to-72%" />
      <div className="contenedor grid gap-12 md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] md:items-center">
        <div>
          <h2 id="h-introduccion" className="text-cal">{titulo}</h2>
          <RichText html={intro.texto} className="mt-6 text-lead leading-relaxed" />
          <a href="#predio" className="boton boton-secundario mt-8 text-cal">
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
