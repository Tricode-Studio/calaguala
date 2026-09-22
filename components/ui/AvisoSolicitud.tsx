/** El recordatorio que acompaña TODO el flujo: solicitud ≠ reserva confirmada. */
export function AvisoSolicitud({ texto, tiempoRespuesta }: { texto: string; tiempoRespuesta?: string }) {
  return (
    <p className="flex items-start gap-3 rounded-[var(--radius-control)] bg-lavanda/60 px-4 py-3 text-paso leading-snug text-mar">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" className="mt-0.5 shrink-0">
        <circle cx="12" cy="12" r="9" /><path d="M12 8v5m0 3h.01" strokeLinecap="round" />
      </svg>
      <span>
        <strong className="font-semibold">{texto}</strong>
        {tiempoRespuesta ? <> El equipo la revisa a mano. {tiempoRespuesta}</> : ' El equipo la revisa a mano y te confirma.'}
      </span>
    </p>
  );
}
