import type { Metadata } from 'next';
import { SiteHeader } from '@/components/SiteHeader';
import { WhatsAppFlotante } from '@/components/WhatsAppFlotante';
import { FlujoReserva } from '@/components/reserva/FlujoReserva';
import { getAlojamientos, getExtensiones, getLandingConfig } from '@/lib/cms';

const TITULO = 'Solicitá tu reserva en La Paloma';
const DESCRIPCION =
  'Consultá disponibilidad de camping y glamping en La Paloma, a pasos de Playa Anaconda, y enviá tu solicitud de reserva. El equipo la revisa y te confirma.';

export async function generateMetadata(): Promise<Metadata> {
  const { seoGlobal } = await getLandingConfig();
  return {
    title: TITULO,
    description: DESCRIPCION,
    alternates: { canonical: '/reservar' },
    // openGraph del layout se reemplaza entero (no se fusiona): repetir lo común.
    openGraph: {
      type: 'website',
      locale: 'es_UY',
      siteName: 'Calaguala',
      url: '/reservar',
      title: `${TITULO} · Calaguala`,
      description: DESCRIPCION,
      images: [{ url: seoGlobal.ogImage, width: 1200, height: 630, alt: 'Calaguala, camping y glamping en La Paloma' }],
    },
  };
}

export default async function ReservarPage({ searchParams }: { searchParams: Promise<{ tipo?: string }> }) {
  const [{ tipo }, config, alojamientos, ext] = await Promise.all([
    searchParams,
    getLandingConfig(),
    getAlojamientos(),
    getExtensiones(),
  ]);
  const tipoInicialId = alojamientos.find((a) => a.slug === tipo)?.id;

  return (
    <>
      <SiteHeader />
      <main className="contenedor max-w-[46rem] py-12 md:py-20">
        <h1 className="text-h2">{ext.reservar.titulo}</h1>
        <p className="mt-3 mb-10 text-lead text-tinta-suave">{ext.reservar.bajada}</p>
        <FlujoReserva
          tipoInicialId={tipoInicialId}
          config={{
            alojamientos,
            avisoSolicitud: config.reservasInfo.avisoSolicitud,
            tiempoRespuesta: ext.tiempoRespuesta,
            whatsapp: config.contacto.whatsapp,
          }}
        />
      </main>
      <WhatsAppFlotante numero={config.contacto.whatsapp} />
    </>
  );
}
