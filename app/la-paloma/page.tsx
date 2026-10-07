import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { SiteHeader } from '@/components/SiteHeader';
import { Foto } from '@/components/ui/Foto';
import { IconoPaloma } from '@/components/ui/IconosPaloma';
import { laPaloma } from '@/lib/data';

export const metadata: Metadata = {
  title: 'Descubrí La Paloma',
  description:
    'Playas, lagunas, bosques y senderos de La Paloma, Rocha. Una guía visual del lugar, desde Calaguala.',
  alternates: { canonical: '/la-paloma' },
};

const { hero, playas, naturaleza, experiencias, faro, puerto, dia, cierre } = laPaloma;

/** Marco vacío para los lugares que todavía no tienen foto. */
function Hueco({ aspecto, tono = 'bg-cal/60' }: { aspecto: string; tono?: string }) {
  return <div aria-hidden="true" className={`rounded-foto ${tono}`} style={{ aspectRatio: aspecto }} />;
}

export default function LaPalomaPage() {
  return (
    <>
      <SiteHeader sobreFoto />
      <main>
        {/* 1 · Hero */}
        <section aria-labelledby="h-paloma" className="sobre-oscuro relative isolate flex min-h-[78svh] items-end overflow-hidden bg-oceano text-cal md:min-h-[88svh]">
          <Image src={hero.foto} alt="" aria-hidden="true" fill priority sizes="100vw" className="-z-20 object-cover" />
          <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-t from-oceano/92 from-5% via-oceano/45 via-45% to-transparent to-75%" />
          <div className="contenedor pb-16 pt-32 md:pb-24">
            <h1 id="h-paloma" className="text-h1 uppercase text-cal">{hero.titulo}</h1>
            <p className="mt-5 max-w-[32ch] font-sans text-lead leading-snug text-cal">{hero.bajada}</p>
          </div>
        </section>

        <section className="seccion">
          <div className="contenedor">
            <p className="aparece prosa mx-auto max-w-[46rem] text-center text-lead leading-relaxed text-tinta-suave">
              {hero.entrada}
            </p>
          </div>
        </section>

        {/* 2 · Playas */}
        <section aria-labelledby="h-playas" className="seccion bg-playa">
          <div className="contenedor">
            <h2 id="h-playas" className="aparece max-w-[18ch] text-oceano">Cada playa, un paisaje diferente</h2>
            <p className="aparece prosa mt-5 max-w-[48ch] text-tinta">{playas.intro}</p>

            <ul className="mt-14 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {playas.items.map((p, i) => (
                <li key={p.nombre} className={`aparece ${i % 3 === 1 ? 'lg:mt-14' : ''}`}>
                  {p.foto ? (
                    <Foto src={p.foto} alt={`${p.nombre}, La Paloma`} aspecto="4 / 5" className="rounded-foto" sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 88vw" />
                  ) : (
                    <Hueco aspecto="4 / 5" />
                  )}
                  <h3 className="mt-5 text-oceano">{p.nombre}</h3>
                  {p.distancia ? (
                    <p className="mt-1 text-paso uppercase tracking-wide text-terracota">{p.distancia}</p>
                  ) : null}
                  <p className="mt-2 text-tinta">{p.texto}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 3 · Naturaleza */}
        <section aria-labelledby="h-naturaleza" className="seccion">
          <div className="contenedor">
            <h2 id="h-naturaleza" className="aparece text-oceano">Más allá del mar</h2>

            <div className="aparece mt-12 grid gap-8 md:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] md:items-center">
              {naturaleza.destacado.foto ? (
                <Foto src={naturaleza.destacado.foto} alt={naturaleza.destacado.titulo} aspecto="16 / 10" className="rounded-foto" sizes="(min-width: 768px) 58vw, 92vw" />
              ) : (
                <Hueco aspecto="16 / 10" tono="bg-agua/40" />
              )}
              <div className="md:-ml-16 md:bg-cal md:py-10 md:pl-10">
                <h3 className="font-display text-h2 leading-tight text-oceano">{naturaleza.destacado.titulo}</h3>
                <p className="prosa mt-4 text-lead leading-relaxed text-tinta-suave">{naturaleza.destacado.texto}</p>
              </div>
            </div>

            <ul className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {naturaleza.secundarios.map((b) => (
                <li key={b.titulo} className="aparece">
                  {b.foto ? (
                    <Foto src={b.foto} alt={b.titulo} aspecto="1 / 1" className="rounded-foto" sizes="(min-width: 1024px) 22vw, 45vw" />
                  ) : (
                    <Hueco aspecto="1 / 1" tono="bg-agua/30" />
                  )}
                  <h3 className="mt-4 text-h3 text-oceano">{b.titulo}</h3>
                  <p className="mt-1 text-paso text-tinta-suave">{b.texto}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 4 · Franja de experiencias */}
        <section aria-labelledby="h-exp-paloma" className="seccion sobre-oscuro bg-oceano text-cal">
          <div className="contenedor">
            <h2 id="h-exp-paloma" className="sr-only">Experiencias en La Paloma</h2>
            <ul className="grid gap-10 sm:grid-cols-3 lg:grid-cols-5">
              {experiencias.map((e) => (
                <li key={e.titulo} className="aparece">
                  <span className="grid size-12 place-items-center rounded-full bg-cal/15 text-cal">
                    <IconoPaloma nombre={e.icono} />
                  </span>
                  <h3 className="mt-4 text-h3 uppercase tracking-wide text-cal">{e.titulo}</h3>
                  <p className="mt-2 text-paso leading-relaxed text-cal">{e.texto}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 5 · Faro */}
        <section aria-labelledby="h-faro" className="seccion">
          <div className="contenedor grid items-center gap-10 md:grid-cols-2 md:gap-16">
            <Foto src={faro.foto} alt={faro.titulo} aspecto="4 / 5" className="aparece rounded-foto" sizes="(min-width: 768px) 46vw, 92vw" />
            <div className="aparece">
              <h2 id="h-faro" className="text-oceano">{faro.titulo}</h2>
              <p className="prosa mt-5 text-lead leading-relaxed text-tinta-suave">{faro.texto}</p>
              <a href="#cierre-paloma" className="mt-8 inline-flex items-center gap-2 border-b-2 border-terracota pb-1 font-semibold text-oceano">
                {faro.cta} <span aria-hidden="true">&rarr;</span>
              </a>
            </div>
          </div>
        </section>

        {/* 6 · Puerto y bahías */}
        <section aria-labelledby="h-puerto" className="seccion bg-playa">
          <div className="contenedor">
            <h2 id="h-puerto" className="sr-only">El puerto y las bahías</h2>
            <div className="grid gap-10 md:grid-cols-12">
              {puerto.map((b, i) => (
                <article key={b.titulo} className={`aparece ${i === 0 ? 'md:col-span-7' : 'md:col-span-5 md:mt-24'}`}>
                  {b.foto ? (
                    <Foto src={b.foto} alt={b.titulo} aspecto={i === 0 ? '16 / 11' : '4 / 5'} className="rounded-foto" sizes="(min-width: 768px) 50vw, 92vw" />
                  ) : (
                    <Hueco aspecto={i === 0 ? '16 / 11' : '4 / 5'} />
                  )}
                  <h3 className="mt-5 text-oceano">{b.titulo}</h3>
                  <p className="mt-2 max-w-[40ch] text-tinta">{b.texto}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* 7 · Un día en La Paloma */}
        <section aria-labelledby="h-dia" className="seccion">
          <div className="contenedor">
            <h2 id="h-dia" className="aparece text-oceano">Un día en La Paloma</h2>
            <ol className="mt-12 max-w-[42rem]">
              {dia.map((d, i) => (
                <li key={d.momento} className="aparece grid grid-cols-[auto_minmax(0,1fr)] gap-x-6">
                  <span aria-hidden="true" className="flex flex-col items-center">
                    <span className="size-3 rounded-full bg-terracota" />
                    {i < dia.length - 1 ? <span className="w-px flex-1 bg-oceano/25" /> : null}
                  </span>
                  <div className={i < dia.length - 1 ? 'pb-10' : ''}>
                    <h3 className="text-h3 uppercase tracking-wide text-oceano">{d.momento}</h3>
                    <p className="mt-1 text-lead leading-snug text-tinta-suave">{d.texto}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* 8 · Cierre */}
        <section id="cierre-paloma" aria-labelledby="h-cierre" className="sobre-oscuro relative isolate flex min-h-[70svh] items-center overflow-hidden bg-oceano text-cal">
          <Image src={cierre.foto} alt="" aria-hidden="true" fill sizes="100vw" className="-z-20 object-cover" />
          <div aria-hidden="true" className="absolute inset-0 -z-10 bg-oceano/70" />
          <div className="contenedor text-center">
            <h2 id="h-cierre" className="mx-auto max-w-[16ch] uppercase text-cal">{cierre.titulo}</h2>
            <p className="prosa mx-auto mt-6 max-w-[46ch] text-lead leading-relaxed text-cal">{cierre.texto}</p>
            <Link href="/" className="boton mt-10 bg-cal text-oceano hover:bg-arena">
              {cierre.cta} <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
