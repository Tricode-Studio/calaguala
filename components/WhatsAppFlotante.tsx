import { linkWhatsApp } from '@/lib/whatsapp';
import { IconoWhatsApp } from './ui/Iconos';

export function WhatsAppFlotante({ numero }: { numero: string }) {
  const href = linkWhatsApp(numero, 'Hola, quería hacer una consulta sobre Calaguala.');
  if (!href) return null; // sin número cargado en el CMS no mostramos un link roto
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escribinos por WhatsApp (se abre en una pestaña nueva)"
      className="fixed z-40 grid size-14 place-items-center rounded-full bg-[#1f7a4d] text-white shadow-[0_6px_20px_-6px_rgb(0_0_0/0.45)] transition-transform hover:scale-105"
      style={{ right: 'max(1rem, env(safe-area-inset-right))', bottom: 'max(1rem, env(safe-area-inset-bottom))' }}
    >
      <IconoWhatsApp />
    </a>
  );
}
