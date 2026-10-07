import { altDe } from '@/lib/alt';
import type { Extensiones, Instalaciones as TInst } from '@/lib/types';
import { GaleriaMarco } from '../ui/GaleriaMarco';
import { IconoInstalacion } from '../ui/Iconos';
import { SeccionEncabezado } from '../ui/SeccionEncabezado';

export function Instalaciones({ instalaciones, ext }: { instalaciones: TInst; ext: Extensiones }) {
  const { titulo, bajada } = ext.secciones.instalaciones;
  return (
    <section id="instalaciones" aria-labelledby="h-instalaciones" className="seccion">
      <div className="contenedor">
        <SeccionEncabezado id="h-instalaciones" titulo={titulo} bajada={bajada} />
        <ul className="space-y-16 md:space-y-24">
          {instalaciones.items.map((item, idx) => {
            const fotos = ext.fotosInstalaciones[item.icono] ?? [];
            return (
              <li key={item.titulo} className="grid gap-8 md:grid-cols-12 md:items-center">
                <div className={`md:col-span-5 ${idx % 2 ? 'md:order-2 md:col-start-8' : ''}`}>
                  <span className="grid size-12 place-items-center rounded-full bg-arena text-eucalipto">
                    <IconoInstalacion nombre={item.icono} />
                  </span>
                  <h3 className="mt-4">{item.titulo}</h3>
                  <p className="prosa mt-3 text-tinta-suave">{item.descripcion}</p>
                </div>
                {fotos.length ? (
                  <div className={`grid grid-cols-2 gap-3 md:col-span-6 ${idx % 2 ? 'md:order-1 md:col-start-1' : 'md:col-start-7'}`}>
                    {/* Se mantienen los dos marcos; las fotos de más se
                        reparten dentro de cada uno, deslizables. */}
                    {[fotos.filter((_, i) => i % 2 === 0), fotos.filter((_, i) => i % 2 === 1)].map((grupo, i) =>
                      grupo.length ? (
                        <GaleriaMarco
                          key={i}
                          etiquetaRegion={`Fotos de ${item.titulo}, marco ${i + 1}`}
                          fotos={grupo.map((src) => ({ src, alt: altDe(ext, src, item.titulo) }))}
                          aspecto="9 / 16"
                          sizes="(min-width: 768px) 24vw, 45vw"
                          className={i === 1 ? 'mt-10' : ''}
                        />
                      ) : null,
                    )}
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
