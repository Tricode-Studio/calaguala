'use client';

import { createContext, useContext, useMemo, useReducer, type Dispatch, type ReactNode } from 'react';
import type { Alojamiento, RespuestaDisponibilidad } from '@/lib/types';

export type Paso = 1 | 2 | 3 | 4;

export interface Seleccion {
  fechaLlegada: string;
  fechaSalida: string;
  cantidadPersonas: string;
  tipoAlojamientoId: string;
}
export interface Datos {
  nombre: string;
  email: string;
  whatsapp: string;
  cantidadPersonas: string;
  comentarios: string;
  sitioWeb: string; // honeypot
}

interface Estado {
  paso: Paso;
  seleccion: Seleccion;
  disponibilidad: RespuestaDisponibilidad | null;
  datos: Datos;
}

type Accion =
  | { tipo: 'seleccion'; campo: keyof Seleccion; valor: string }
  | { tipo: 'datos'; campo: keyof Datos; valor: string }
  | { tipo: 'disponibilidad'; valor: RespuestaDisponibilidad }
  | { tipo: 'ir'; paso: Paso };

function reducer(s: Estado, a: Accion): Estado {
  switch (a.tipo) {
    case 'seleccion': {
      const seleccion = { ...s.seleccion, [a.campo]: a.valor };
      // La cantidad de huéspedes del paso 3 arranca igual a la del paso 1
      const datos = a.campo === 'cantidadPersonas' ? { ...s.datos, cantidadPersonas: a.valor } : s.datos;
      return { ...s, seleccion, datos };
    }
    case 'datos':
      return { ...s, datos: { ...s.datos, [a.campo]: a.valor } };
    case 'disponibilidad':
      return { ...s, disponibilidad: a.valor, paso: 2 };
    case 'ir':
      return { ...s, paso: a.paso };
  }
}

export interface ConfigFlujo {
  alojamientos: Alojamiento[];
  avisoSolicitud: string;
  tiempoRespuesta: string;
  whatsapp: string;
}

interface Ctx {
  estado: Estado;
  dispatch: Dispatch<Accion>;
  config: ConfigFlujo;
}

const FlujoCtx = createContext<Ctx | null>(null);

/** Estado del wizard: vive solo mientras dura el flujo, no persiste entre sesiones. */
export function FlujoReservaProvider({
  config,
  tipoInicialId,
  children,
}: {
  config: ConfigFlujo;
  tipoInicialId?: string;
  children: ReactNode;
}) {
  const [estado, dispatch] = useReducer(reducer, {
    paso: 1,
    seleccion: { fechaLlegada: '', fechaSalida: '', cantidadPersonas: '2', tipoAlojamientoId: tipoInicialId ?? '' },
    disponibilidad: null,
    datos: { nombre: '', email: '', whatsapp: '', cantidadPersonas: '2', comentarios: '', sitioWeb: '' },
  });
  const value = useMemo(() => ({ estado, dispatch, config }), [estado, config]);
  return <FlujoCtx.Provider value={value}>{children}</FlujoCtx.Provider>;
}

export function useFlujoReserva(): Ctx {
  const ctx = useContext(FlujoCtx);
  if (!ctx) throw new Error('useFlujoReserva fuera de FlujoReservaProvider');
  return ctx;
}
