'use client';

import { useMemo, useState } from 'react';
import type { z } from 'zod';
import { erroresPorCampo } from '@/lib/schemas';

/**
 * Validación en tiempo real: el error de un campo aparece después de salir
 * de él (blur) y a partir de ahí se actualiza mientras se escribe.
 */
export function useValidacion<T>(schema: z.ZodType<T>, valores: unknown) {
  const [tocados, setTocados] = useState<Record<string, boolean>>({});
  const [intentoEnvio, setIntentoEnvio] = useState(false);

  const todos = useMemo(() => {
    const r = schema.safeParse(valores);
    return r.success ? {} : erroresPorCampo(r.error);
  }, [schema, valores]);

  const errorDe = (campo: string) => (intentoEnvio || tocados[campo] ? todos[campo] : undefined);
  const tocar = (campo: string) => setTocados((t) => (t[campo] ? t : { ...t, [campo]: true }));
  const esValido = Object.keys(todos).length === 0;

  return { errorDe, tocar, esValido, marcarIntento: () => setIntentoEnvio(true), primerError: Object.keys(todos)[0] };
}
