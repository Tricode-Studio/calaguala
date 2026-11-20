import type { Extensiones, Ubicacion as TUbicacion } from '@/lib/types';
import { SeccionEncabezado } from '../ui/SeccionEncabezado';

export function Ubicacion({ ubicacion, ext }: { ubicacion: TUbicacion; ext: Extensiones }) {
  const { titulo, bajada } = ext.secciones.ubicacion;
  return (
    <section id="ubicacion" aria-labelledby="h-ubicacion" className="seccion bg-arena">
      <div className="contenedor grid gap-10 md:grid-cols-[minmax(0,4fr)_minmax(0,7fr)]">
        <div>
          <SeccionEncabezado id="h-ubicacion" titulo={titulo} bajada={bajada} />
          <p className="prosa">{ubicacion.texto}</p>
          {ubicacion.mapaUrl ? (
            <a
              href={ubicacion.mapaUrl}
              target="_blank"
              rel="noreferrer"
              className="boton boton-secundario mt-6 text-tinta"
            >
              {ubicacion.botonMapa}
            </a>
          ) : null}
        </div>
        <div className="overflow-hidden rounded-foto bg-cal">
          {ubicacion.mapaEmbedUrl ? (
            <iframe
              src={ubicacion.mapaEmbedUrl}
              title="Mapa: ubicación de Calaguala en La Paloma, cerca de Playa Anaconda"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="block aspect-[4/3] w-full border-0 md:aspect-[16/10]"
            />
          ) : null}
        </div>
      </div>
    </section>
  );
}
