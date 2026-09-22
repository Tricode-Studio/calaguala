'use client';

import { useEffect, useRef } from 'react';
import { AvisoSolicitud } from '../ui/AvisoSolicitud';
import { FlujoReservaProvider, useFlujoReserva, type ConfigFlujo, type Paso } from './FlujoReservaContext';
import { PasoConfirmacion } from './PasoConfirmacion';
import { PasoDatos } from './PasoDatos';
import { PasoOpciones } from './PasoOpciones';
import { PasoSeleccion } from './PasoSeleccion';
import { Stepper } from './Stepper';

const TITULOS: Record<Paso, string> = {
  1: '¿Cuándo querés venir?',
  2: 'Opciones para tus fechas',
  3: 'Tus datos',
  4: 'Solicitud enviada',
};

function Contenido() {
  const { estado, config } = useFlujoReserva();
  const titulo = useRef<HTMLHeadingElement>(null);
  const primerRender = useRef(true);

  // Al cambiar de paso, el foco va al título (lectores de pantalla y teclado)
  useEffect(() => {
    if (primerRender.current) {
      primerRender.current = false;
      return;
    }
    titulo.current?.focus();
    titulo.current?.scrollIntoView({ block: 'start', behavior: 'smooth' });
  }, [estado.paso]);

  return (
    <div className="space-y-8">
      <Stepper paso={estado.paso} />
      {estado.paso < 4 ? <AvisoSolicitud texto={config.avisoSolicitud} tiempoRespuesta={config.tiempoRespuesta} /> : null}
      <section aria-labelledby="titulo-paso" key={estado.paso} className="motion-safe:animate-[aparecer_280ms_ease-out]">
        <h2 id="titulo-paso" ref={titulo} tabIndex={-1} className="mb-6 text-h3 outline-none md:text-[2rem]">
          {TITULOS[estado.paso]}
        </h2>
        {estado.paso === 1 && <PasoSeleccion />}
        {estado.paso === 2 && <PasoOpciones />}
        {estado.paso === 3 && <PasoDatos />}
        {estado.paso === 4 && <PasoConfirmacion />}
      </section>
    </div>
  );
}

export function FlujoReserva({ config, tipoInicialId }: { config: ConfigFlujo; tipoInicialId?: string }) {
  return (
    <FlujoReservaProvider config={config} tipoInicialId={tipoInicialId}>
      <Contenido />
    </FlujoReservaProvider>
  );
}
