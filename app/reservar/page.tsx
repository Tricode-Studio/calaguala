import type { Metadata } from 'next';
import { SiteHeader } from '@/components/SiteHeader';
import { WhatsAppFlotante } from '@/components/WhatsAppFlotante';
import { FlujoReserva } from '@/components/reserva/FlujoReserva';
import { getAlojamientos, getExtensiones, getLandingConfig } from '@/lib/cms';

export const metadata: Metadata = {
  title: 'Solicitá tu reserva en La Paloma',
  description:
    'Consultá disponibilidad de camping y glamping en La Paloma, a pasos de Playa Anaconda, y enviá tu solicitud de reserva. El equipo la revisa y te confirma.',
  alternates: { canonical: '/reservar' },
};

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
        <h1 className="text-h2">Solicitá tu reserva</h1>
        <p className="mt-3 mb-10 text-lead text-tinta-suave">Camping & Glamping en La Paloma, a pocos pasos de Playa Anaconda.</p>
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
