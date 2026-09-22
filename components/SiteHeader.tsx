import Link from 'next/link';

const enlaces = [
  { href: '/#alojamiento', label: 'Alojamiento' },
  { href: '/#predio', label: 'El predio' },
  { href: '/#experiencias', label: 'Experiencias' },
  { href: '/#recomendaciones', label: 'La Paloma' },
  { href: '/#faq', label: 'Preguntas' },
];

export function SiteHeader({ sobreFoto = false }: { sobreFoto?: boolean }) {
  const color = sobreFoto ? 'text-cal sobre-oscuro' : 'text-eucalipto';
  return (
    <header className={`${sobreFoto ? 'absolute inset-x-0 top-0 z-30' : 'border-b border-arena'} ${color}`}>
      <div className="contenedor flex items-center justify-between gap-4 py-3">
        <Link href="/" className="font-display text-2xl leading-none" aria-label="Calaguala, inicio">
          Calaguala
        </Link>
        <nav aria-label="Principal" className="hidden md:block">
          <ul className="flex gap-1">
            {enlaces.map((e) => (
              <li key={e.href}>
                <a href={e.href} className="inline-flex min-h-11 items-center rounded-full px-3 hover:underline hover:underline-offset-4">
                  {e.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <Link href="/reservar" className={`boton ${sobreFoto ? 'bg-cal text-eucalipto hover:bg-arena' : 'boton-primario'} !px-4 text-paso`}>
          Solicitá tu reserva
        </Link>
      </div>
    </header>
  );
}
