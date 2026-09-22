import type { Extensiones } from '@/lib/types';
import { SeccionEncabezado } from '../ui/SeccionEncabezado';
import { VisorInteractivo2_5D } from '../visor-2.5d/VisorInteractivo2_5D';
import { Visor3DCarpa } from '../visor-3d/Visor3DCarpa';

export function Predio({ ext }: { ext: Extensiones }) {
  const { titulo, bajada } = ext.secciones.predio;
  return (
    <section id="predio" aria-labelledby="h-predio" className="seccion sobre-oscuro bg-tierra text-cal">
      <div className="contenedor">
        <SeccionEncabezado id="h-predio" titulo={titulo} bajada={bajada} claro />
        <VisorInteractivo2_5D />
        <Visor3DCarpa />
      </div>
    </section>
  );
}
