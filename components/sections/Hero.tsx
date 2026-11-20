import Link from 'next/link';
import type { HeroConfig } from '@/lib/types';
import { optimizable } from '../ui/Img';
import { HeroVideo } from './HeroVideo';

/**
 * URL del optimizador de Next. Los anchos deben estar en deviceSizes. Una foto
 * de un host que el optimizador no acepta (URL pegada en el CMS) va directa.
 */
const opt = (src: string, w: number) =>
  optimizable(src) ? `/_next/image?url=${encodeURIComponent(src)}&w=${w}&q=80` : src;
const srcSet = (src: string, anchos: number[]) =>
  optimizable(src) ? anchos.map((w) => `${opt(src, w)} ${w}w`).join(', ') : src;

const ESCRITORIO = [1080, 1200, 1920, 2048, 3840];
const MOVIL = [640, 750, 828, 1080];

export function Hero({ hero, alt }: { hero: HeroConfig; alt: string }) {
  // En mobile se sirve una copia más liviana de la misma foto. Va con
  // <picture> y no con dos <Image>: next/image precarga las imágenes con
  // priority, así que dos componentes harían descargar ambas al teléfono.
  // La copia `-movil` existe solo entre las fotos locales (public/fotos); una
  // foto del CMS no la tiene, y el optimizador ya la achica para mobile.
  const esLocal = hero.imagenFondo.startsWith('/fotos/');
  const movil = esLocal ? hero.imagenFondo.replace(/\.webp$/, '-movil.webp') : hero.imagenFondo;
  // Encuadre: el desplazamiento está pensado para la foto local; las del CMS van centradas.
  const encuadre = esLocal ? 'object-[82%_50%] md:object-[50%_62%]' : 'object-center';

  return (
    <section aria-labelledby="titulo-principal" className="sobre-oscuro relative isolate flex min-h-[72svh] md:min-h-[100svh] items-end overflow-hidden bg-mar text-cal">
      <picture>
        <source media="(max-width: 767px)" srcSet={srcSet(movil, MOVIL)} sizes="100vw" />
        <img
          src={opt(hero.imagenFondo, 1920)}
          srcSet={srcSet(hero.imagenFondo, ESCRITORIO)}
          sizes="100vw"
          alt={alt}
          fetchPriority="high"
          decoding="async"
          className={`absolute inset-0 -z-20 size-full object-cover ${encuadre}`}
        />
      </picture>
      {hero.videoFondo ? <HeroVideo src={hero.videoFondo} poster={opt(hero.imagenFondo, 1920)} /> : null}
      {/* Velo para legibilidad del texto sobre la foto (contraste AA) */}
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-t from-mar/95 from-10% via-mar/55 via-45% to-transparent to-80% md:via-mar/40 md:via-35% md:to-58%" />

      <div className="contenedor pb-16 pt-32 md:pb-24">
        <h1 id="titulo-principal" className="text-h1 text-cal">
          <span className="block max-w-[14ch]">{hero.titulo}</span>
          <span className="mt-5 block max-w-[34ch] font-sans text-lead font-normal leading-snug text-cal/90 md:text-[1.4rem]">
            {hero.subtitulo}
          </span>
        </h1>
        <div className="mt-9 flex flex-wrap gap-3">
          <Link href="/reservar" className="boton bg-cal text-eucalipto hover:bg-arena">
            {hero.botonPrincipal}
          </Link>
          <a href="#introduccion" className="boton boton-secundario text-cal">
            {hero.botonSecundario}
          </a>
        </div>
      </div>
    </section>
  );
}
