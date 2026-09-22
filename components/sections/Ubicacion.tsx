import type { Extensiones, Ubicacion as TUbicacion } from '@/lib/types';
import { Foto } from '../ui/Foto';
import { SeccionEncabezado } from '../ui/SeccionEncabezado';

export function Ubicacion({ ubicacion, ext }: { ubicacion: TUbicacion; ext: Extensiones }) {
  const { titulo, bajada } = ext.secciones.ubicacion;
  return (
    <section id="ubicacion" aria-labelledby="h-ubicacion" className="seccion bg-arena">
      <div className="contenedor grid gap-10 md:grid-cols-[minmax(0,4fr)_minmax(0,7fr)]">
        <div>
          <SeccionEncabezado id="h-ubicacion" titulo={titulo} bajada={bajada} />
          <p className="prosa">
            Estamos en La Paloma, departamento de Rocha, a pocos pasos de Playa Anaconda. Salís del predio y en un rato
            estás con los pies en la arena.
          </p>
          <address className="mt-6 not-italic text-tinta-suave">{ubicacion.direccion}</address>
        </div>
        <div className="overflow-hidden rounded-foto bg-cal">
          {ubicacion.imagenDrone ? (
            <Foto src={ubicacion.imagenDrone} alt="Vista aérea del predio de Calaguala y la costa de Playa Anaconda" aspecto="16 / 10" sizes="(min-width: 768px) 60vw, 100vw" />
          ) : ubicacion.mapaEmbedUrl ? (
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
