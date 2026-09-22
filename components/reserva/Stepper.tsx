import type { Paso } from './FlujoReservaContext';

const NOMBRES = ['Fechas y alojamiento', 'Opciones', 'Tus datos', 'Enviada'];

export function Stepper({ paso }: { paso: Paso }) {
  return (
    <nav aria-label="Progreso de la solicitud">
      <ol className="grid grid-cols-4 gap-2">
        {NOMBRES.map((n, i) => {
          const num = (i + 1) as Paso;
          const estado = num < paso ? 'hecho' : num === paso ? 'actual' : 'pendiente';
          return (
            <li key={n} aria-current={estado === 'actual' ? 'step' : undefined} className="min-w-0">
              <span className={`block h-1.5 rounded-full ${estado === 'pendiente' ? 'bg-arena' : 'bg-eucalipto'}`} />
              <span className={`mt-2 block truncate text-paso ${estado === 'actual' ? 'font-semibold text-eucalipto' : 'text-tinta-suave'}`}>
                <span className="sr-only">Paso {num} de 4: </span>
                <span aria-hidden="true">{num}. </span>
                <span className="hidden sm:inline">{n}</span>
                {estado === 'hecho' ? <span className="sr-only"> (completado)</span> : null}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
