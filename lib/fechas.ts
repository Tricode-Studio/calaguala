const ZONA = 'America/Montevideo';

/** Fecha de hoy en Uruguay, formato YYYY-MM-DD (igual en server y cliente). */
export function hoyISO(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: ZONA }).format(new Date());
}

export function sumarDias(iso: string, dias: number): string {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + dias);
  return d.toISOString().slice(0, 10);
}

export function noches(llegada: string, salida: string): number {
  const ms = Date.parse(`${salida}T12:00:00Z`) - Date.parse(`${llegada}T12:00:00Z`);
  return Math.round(ms / 86_400_000);
}

export function formatoLargo(iso: string): string {
  return new Intl.DateTimeFormat('es-UY', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
    timeZone: 'UTC',
  }).format(new Date(`${iso}T12:00:00Z`));
}
