import type { Alojamiento, Extensiones } from '@/lib/types';
import { AlojamientoCard } from '../AlojamientoCard';
import { SeccionEncabezado } from '../ui/SeccionEncabezado';

export function Alojamientos({ alojamientos, ext }: { alojamientos: Alojamiento[]; ext: Extensiones }) {
  const { titulo, bajada } = ext.secciones.alojamiento;
  return (
    <section id="alojamiento" aria-labelledby="h-alojamiento" className="seccion">
      <div className="contenedor">
        <SeccionEncabezado id="h-alojamiento" titulo={titulo} bajada={bajada} />
        <ul className="grid gap-14 md:grid-cols-3 md:gap-8">
          {alojamientos.map((a) => (
            <li key={a.id}>
              <AlojamientoCard alojamiento={a} ext={ext} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
