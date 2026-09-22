import { altDe } from '@/lib/alt';
import type { Extensiones, Recomendacion, TipoRecomendacion } from '@/lib/types';
import { Foto } from './ui/Foto';

const etiqueta: Record<TipoRecomendacion, string> = {
  playa: 'Playa',
  restaurante: 'Para comer',
  actividad: 'Para hacer',
  otro: 'Otro',
};

export function RecomendacionCard({ recomendacion: r, ext }: { recomendacion: Recomendacion; ext: Extensiones }) {
  return (
    <article className="border-t-2 border-eucalipto pt-4">
      <p className="text-paso text-eucalipto-suave">{etiqueta[r.tipo]}</p>
      <h3 className="mt-1">{r.nombre}</h3>
      {r.imagen ? (
        <Foto src={r.imagen} alt={altDe(ext, r.imagen, r.nombre)} aspecto="4 / 3" className="mt-4 rounded-foto" sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw" />
      ) : null}
      <p className="mt-4 text-tinta-suave">{r.descripcion}</p>
    </article>
  );
}
