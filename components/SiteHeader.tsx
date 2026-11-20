import Image from '@/components/ui/Img';
import Link from 'next/link';
import { MenuMovil } from './MenuMovil';

const enlaces = [
  { href: '/#alojamiento', label: 'Alojamiento' },
  { href: '/#experiencias', label: 'Experiencias' },
  { href: '/la-paloma', label: 'La Paloma' },
  { href: '/#faq', label: 'Preguntas' },
];

/** Header sticky con fondo sólido de la paleta. */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-arena bg-cal/95 text-eucalipto backdrop-blur">
      <div className="contenedor flex items-center justify-between gap-2 !px-3 py-2 sm:gap-4 sm:!px-[clamp(1.25rem,4vw,2.5rem)] lg:py-3">
        <Link href="/" className="flex min-w-0 items-center gap-2" aria-label="Calaguala, inicio">
          {/* El emblema viene sobre fondo crema y sin transparencia: recortado
              en círculo funciona como chapa. */}
          <Image src="/logo.webp" alt="" aria-hidden="true" width={40} height={40} priority className="size-10 rounded-full" />
          <span className="font-display text-lg leading-none sm:text-2xl">Calaguala</span>
        </Link>
        <nav aria-label="Principal" className="hidden lg:block">
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
        <div className="flex shrink-0 items-center gap-1">
          <Link href="/reservar" className="boton boton-primario !px-3 text-paso sm:!px-4">
            <span className="sm:hidden">Reservar</span>
            <span className="hidden sm:inline">Solicitá tu reserva</span>
          </Link>
          <MenuMovil enlaces={enlaces} />
        </div>
      </div>
    </header>
  );
}
