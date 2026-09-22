import type { Alojamiento, Extensiones, LandingConfig } from '@/lib/types';
import { soloDigitos } from '@/lib/whatsapp';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

/** Schema.org Campground (subtipo de LocalBusiness). NAP sale de una sola fuente. */
export function JsonLd({ config, ext, alojamientos }: { config: LandingConfig; ext: Extensiones; alojamientos: Alojamiento[] }) {
  const tel = soloDigitos(config.contacto.whatsapp);
  const data = {
    '@context': 'https://schema.org',
    '@type': ['Campground', 'LocalBusiness'],
    '@id': `${SITE_URL}/#negocio`,
    name: ext.negocio.nombre,
    description: config.seoGlobal.metaDescription,
    url: SITE_URL,
    image: new URL(config.seoGlobal.ogImage, SITE_URL).toString(),
    ...(tel.length >= 8 ? { telephone: `+${tel}` } : {}),
    address: {
      '@type': 'PostalAddress',
      ...(config.ubicacion.direccion.includes('[completar') ? {} : { streetAddress: config.ubicacion.direccion }),
      addressLocality: ext.negocio.localidad,
      addressRegion: ext.negocio.departamento,
      addressCountry: ext.negocio.codigoPais,
    },
    areaServed: ['La Paloma', 'Playa Anaconda', 'Rocha'],
    sameAs: config.contacto.instagramUrl.replace(/\/$/, '').endsWith('instagram.com') ? [] : [config.contacto.instagramUrl],
    amenityFeature: config.instalaciones.items.map((i) => ({
      '@type': 'LocationFeatureSpecification',
      name: i.titulo,
      value: true,
    })),
    makesOffer: alojamientos.map((a) => ({
      '@type': 'Offer',
      name: a.nombre,
      ...(a.precio ? { price: a.precio, priceCurrency: 'UYU' } : {}),
    })),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  );
}
