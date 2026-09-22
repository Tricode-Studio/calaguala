/** Íconos de trazo simple. Decorativos: siempre aria-hidden. */
const base = {
  width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
  strokeWidth: 1.6, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true,
};

export const IconoCocina = () => (
  <svg {...base}><path d="M4 10h16v10H4z" /><path d="M8 10V7m4 3V6m4 4V7" /><circle cx="9" cy="15" r="1.5" /><circle cx="15" cy="15" r="1.5" /></svg>
);
export const IconoDucha = () => (
  <svg {...base}><path d="M5 20V8a4 4 0 0 1 8 0" /><path d="M10 11h6" /><path d="M11 14v1m2.5-1v2m2.5-2v1m-4 3v1m2.5-1v1" /></svg>
);
export const IconoDescanso = () => (
  <svg {...base}><path d="M3 8c3 5 15 5 18 0" /><path d="M3 8V5m18 3V5" /><path d="M6 20l2-7m10 7l-2-7" /></svg>
);
export const IconoCheck = () => (
  <svg {...base}><path d="M5 12.5l4.2 4L19 7" /></svg>
);
export const IconoWhatsApp = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.1 5.1 0 0 0 1.1 2.7 11.7 11.7 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.2 2.2 2.2 0 0 0 .1-1.3c0-.1-.2-.2-.5-.3Z" />
  </svg>
);

export function IconoInstalacion({ nombre }: { nombre: string }) {
  if (nombre === 'cocina') return <IconoCocina />;
  if (nombre === 'ducha') return <IconoDucha />;
  return <IconoDescanso />;
}
