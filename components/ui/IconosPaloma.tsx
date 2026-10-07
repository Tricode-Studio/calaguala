const trazo = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

/** Íconos de la franja de experiencias de La Paloma. Trazo simple, sin relleno. */
export function IconoPaloma({ nombre }: { nombre: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-6" {...trazo}>
      {nombre === 'surf' ? (
        <>
          <path d="M9.5 3.5c5 1.5 8.5 6 9.5 11-4.5.5-8.5-1-11-4.5-1.7-2.4-1.6-5 1.5-6.5Z" />
          <path d="M2.5 19.5c2 1.2 3.5 1.2 5.5 0s3.5-1.2 5.5 0 3.5 1.2 5.5 0" />
        </>
      ) : null}
      {nombre === 'bici' ? (
        <>
          <circle cx="5.5" cy="16.5" r="3.5" />
          <circle cx="18.5" cy="16.5" r="3.5" />
          <path d="m5.5 16.5 4-8h5m-2.5 8 3.5-8m2 8-3-5H9" />
        </>
      ) : null}
      {nombre === 'caminata' ? (
        <>
          <circle cx="13" cy="4" r="1.6" />
          <path d="M12 7.5 9 11l2.5 2 .5 4m0-6 3.5 2 1 3.5M9 11l-2 3.5" />
        </>
      ) : null}
      {nombre === 'skate' ? (
        <>
          <path d="M3 13c2.5 2.5 15.5 2.5 18 0" />
          <circle cx="7.5" cy="17" r="1.6" />
          <circle cx="16.5" cy="17" r="1.6" />
          <path d="M3 13c-.8-.8-1-2 .2-2.2M21 13c.8-.8 1-2-.2-2.2" />
        </>
      ) : null}
      {nombre === 'ave' ? (
        <>
          <path d="M3 8.5c3 0 5 1.5 6.5 4 1.5 2.5 3.5 4 6.5 4" />
          <path d="M16 16.5c3 0 5-2 5-5 0-2-1-3.5-2.5-4.5" />
          <path d="M18.5 7 20 5.5" />
        </>
      ) : null}
    </svg>
  );
}
