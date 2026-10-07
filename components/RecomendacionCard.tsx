import { altDe } from '@/lib/alt';
import type { Extensiones, Recomendacion, TipoRecomendacion } from '@/lib/types';
import { GaleriaMarco } from './ui/GaleriaMarco';

const etiqueta: Record<TipoRecomendacion, string> = {
  playa: 'Playa',
  restaurante: 'Para comer',
  actividad: 'Para hacer',
  otro: 'Otro',
};

export function RecomendacionCard({ recomendacion: r, ext }: { recomendacion: Recomendacion; ext: Extensiones }) {
  const fotos = r.imagenes?.length ? r.imagenes : r.imagen ? [r.imagen] : [];
  return (
    <article className="border-t-2 border-eucalipto pt-4">
      <p className="text-paso text-eucalipto-suave">{etiqueta[r.tipo]}</p>
      <h3 className="mt-1">{r.nombre}</h3>
      {fotos.length ? (
        <GaleriaMarco
          etiquetaRegion={`Fotos de ${r.nombre}`}
          fotos={fotos.map((src) => ({ src, alt: altDe(ext, src, r.nombre) }))}
          aspecto="4 / 3"
          sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
          className="mt-4"
        />
      ) : null}
      <p className="mt-4 text-tinta-suave">{r.descripcion}</p>
    </article>
  );
}
