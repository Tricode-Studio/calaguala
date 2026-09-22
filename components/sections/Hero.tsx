import Link from 'next/link';
import type { HeroConfig } from '@/lib/types';

/** URL del optimizador de Next. Los anchos deben estar en deviceSizes. */
const opt = (src: string, w: number) => `/_next/image?url=${encodeURIComponent(src)}&w=${w}&q=80`;
const srcSet = (src: string, anchos: number[]) => anchos.map((w) => `${opt(src, w)} ${w}w`).join(', ');

const ESCRITORIO = [1080, 1200, 1920, 2048, 3840];
const MOVIL = [640, 750, 828, 1080];

export function Hero({ hero, alt }: { hero: HeroConfig; alt: string }) {
  // En mobile se sirve una copia más liviana de la misma foto. Va con
  // <picture> y no con dos <Image>: next/image precarga las imágenes con
  // priority, así que dos componentes harían descargar ambas al teléfono.
  const movil = hero.imagenFondo.replace(/\.webp$/, '-movil.webp');

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
          className="absolute inset-0 -z-20 size-full object-cover object-[82%_50%] md:object-[50%_62%]"
        />
      </picture>
      {hero.videoFondo ? (
        <video
          className="absolute inset-0 -z-20 size-full object-cover motion-reduce:hidden"
          src={hero.videoFondo}
          autoPlay
          muted
          loop
          playsInline
          aria-hidden="true"
        />
      ) : null}
      {/* Velo para legibilidad del texto sobre la foto (contraste AA) */}
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-t from-mar/95 from-10% via-mar/40 via-35% to-transparent to-58%" />

      <div className="contenedor pb-16 pt-32 md:pb-24">
        <h1 className="text-h1 text-cal">
          <span className="block max-w-[14ch]">{hero.titulo}</span>
          <span className="mt-5 block max-w-[34ch] font-sans text-lead font-normal leading-snug text-cal/90 md:text-[1.4rem]">
            {hero.subtitulo}
          </span>
        </h1>
        <div className="mt-9 flex flex-wrap gap-3">
          <Link href="/reservar" className="boton bg-cal text-eucalipto hover:bg-arena">
            Solicitá tu reserva
          </Link>
          <a href="#introduccion" className="boton boton-secundario text-cal">
            Conocé el espacio
          </a>
        </div>
      </div>
    </section>
  );
}
