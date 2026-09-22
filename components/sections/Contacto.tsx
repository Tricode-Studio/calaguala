import Link from 'next/link';
import type { Contacto as TContacto, Extensiones, Ubicacion } from '@/lib/types';
import { linkWhatsApp } from '@/lib/whatsapp';

export function Contacto({ contacto, ubicacion, ext }: { contacto: TContacto; ubicacion: Ubicacion; ext: Extensiones }) {
  const wa = linkWhatsApp(contacto.whatsapp, 'Hola, quería hacer una consulta sobre Calaguala.');
  return (
    <footer id="contacto" aria-labelledby="h-contacto" className="sobre-oscuro bg-mar text-cal">
      <div className="contenedor seccion">
        <h2 id="h-contacto" className="max-w-[16ch] text-h1 text-cal">{contacto.mensajeFinal}</h2>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/reservar" className="boton bg-cal text-eucalipto hover:bg-arena">Solicitar reserva</Link>
          {wa ? (
            <a href={wa} target="_blank" rel="noopener noreferrer" className="boton boton-secundario">Escribinos por WhatsApp</a>
          ) : null}
          <a href={contacto.instagramUrl} target="_blank" rel="noopener noreferrer" className="boton boton-secundario">Instagram</a>
        </div>
        <address className="mt-20 border-t border-cal/20 pt-6 text-paso not-italic text-cal/75">
          {ext.negocio.nombre}, camping &amp; glamping. {ubicacion.direccion}
        </address>
      </div>
    </footer>
  );
}
