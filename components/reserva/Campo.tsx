import type { ReactNode } from 'react';

/** Label + control + ayuda + error, con los ids cableados para lectores de pantalla. */
export function Campo({
  id,
  label,
  ayuda,
  error,
  opcional,
  children,
}: {
  id: string;
  label: string;
  ayuda?: string;
  error?: string;
  opcional?: boolean;
  children: (props: { id: string; 'aria-invalid': boolean; 'aria-describedby'?: string }) => ReactNode;
}) {
  const describedBy = [ayuda ? `${id}-ayuda` : null, error ? `${id}-error` : null].filter(Boolean).join(' ') || undefined;
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block font-semibold text-eucalipto">
        {label}
        {opcional ? <span className="font-normal text-tinta-suave"> (opcional)</span> : null}
      </label>
      {children({ id, 'aria-invalid': Boolean(error), 'aria-describedby': describedBy })}
      {ayuda ? <p id={`${id}-ayuda`} className="mt-1.5 text-paso text-tinta-suave">{ayuda}</p> : null}
      {error ? <p id={`${id}-error`} className="mensaje-error" role="alert">{error}</p> : null}
    </div>
  );
}
