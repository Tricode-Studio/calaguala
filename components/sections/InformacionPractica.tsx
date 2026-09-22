import type { Extensiones, InformacionPractica as TInfo } from '@/lib/types';

export function InformacionPractica({ info, ext }: { info: TInfo; ext: Extensiones }) {
  return (
    <section id="informacion-practica" aria-labelledby="h-info" className="seccion bg-arena">
      <div className="contenedor">
        <h2 id="h-info" className="mb-12">{ext.secciones['informacion-practica'].titulo}</h2>
        <div className="grid gap-12 md:grid-cols-3">
          <div>
            <h3>Horarios</h3>
            <dl className="mt-4 space-y-3">
              <div><dt className="font-semibold">Check-in</dt><dd className="text-tinta-suave">{info.checkIn}</dd></div>
              <div><dt className="font-semibold">Check-out</dt><dd className="text-tinta-suave">{info.checkOut}</dd></div>
            </dl>
          </div>
          <div>
            <h3>Qué traer</h3>
            <ul className="mt-4 list-disc space-y-2 pl-5 marker:text-eucalipto-suave">
              {info.queTraer.map((t) => <li key={t}>{t}</li>)}
            </ul>
          </div>
          <div>
            <h3>Normas del espacio</h3>
            <ul className="mt-4 list-disc space-y-2 pl-5 marker:text-eucalipto-suave">
              {info.normas.map((n) => <li key={n}>{n}</li>)}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
