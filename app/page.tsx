import { JsonLd } from '@/components/JsonLd';
import { SiteHeader } from '@/components/SiteHeader';
import { WhatsAppFlotante } from '@/components/WhatsAppFlotante';
import { Alojamientos } from '@/components/sections/Alojamientos';
import { Contacto } from '@/components/sections/Contacto';
import { Experiencias } from '@/components/sections/Experiencias';
import { Faq } from '@/components/sections/Faq';
import { Hero } from '@/components/sections/Hero';
import { InformacionPractica } from '@/components/sections/InformacionPractica';
import { Instalaciones } from '@/components/sections/Instalaciones';
import { Introduccion } from '@/components/sections/Introduccion';
import { Predio } from '@/components/sections/Predio';
import { QueIncluye } from '@/components/sections/QueIncluye';
import { Recomendaciones } from '@/components/sections/Recomendaciones';
import { Reservas } from '@/components/sections/Reservas';
import { Ubicacion } from '@/components/sections/Ubicacion';
import { altDe } from '@/lib/alt';
import { getContenidoLanding } from '@/lib/cms';

export const revalidate = 300;

export default async function Home() {
  const { config, alojamientos, faq, recomendaciones, extensiones: ext } = await getContenidoLanding();

  return (
    <>
      <JsonLd config={config} ext={ext} alojamientos={alojamientos} />
      <a href="#introduccion" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-cal focus:px-4 focus:py-3">
        Saltar al contenido
      </a>
      <SiteHeader sobreFoto />
      <main>
        <Hero hero={config.heroConfig} alt={altDe(ext, config.heroConfig.imagenFondo, 'Playa Anaconda')} />
        <Introduccion intro={config.introduccion} ext={ext} />
        <Ubicacion ubicacion={config.ubicacion} ext={ext} />
        <Alojamientos alojamientos={alojamientos} ext={ext} />
        <Predio ext={ext} />
        <Instalaciones instalaciones={config.instalaciones} ext={ext} />
        <Experiencias ext={ext} />
        <Recomendaciones items={recomendaciones} ext={ext} />
        <QueIncluye data={config.queIncluye} ext={ext} />
        <Reservas info={config.reservasInfo} ext={ext} />
        <InformacionPractica info={config.informacionPractica} ext={ext} />
        <Faq items={faq} ext={ext} />
      </main>
      <Contacto contacto={config.contacto} ubicacion={config.ubicacion} ext={ext} />
      <WhatsAppFlotante numero={config.contacto.whatsapp} />
    </>
  );
}
