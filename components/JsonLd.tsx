import type { Alojamiento, Extensiones, LandingConfig, PreguntaFrecuente } from '@/lib/types';
import { soloDigitos } from '@/lib/whatsapp';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

/** Texto plano de una respuesta RICH_TEXT (HTML), para el FAQPage. */
const sinHtml = (h: string) =>
  h.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();

/** Schema.org Campground (subtipo de LocalBusiness) + FAQPage. NAP sale de una sola fuente. */
export function JsonLd({
  config,
  ext,
  alojamientos,
  faq = [],
}: {
  config: LandingConfig;
  ext: Extensiones;
  alojamientos: Alojamiento[];
  faq?: PreguntaFrecuente[];
}) {
  const tel = soloDigitos(config.contacto.whatsapp);
  const data = {
    '@context': 'https://schema.org',
    '@type': ['Campground', 'LocalBusiness'],
    '@id': `${SITE_URL}/#negocio`,
    name: ext.negocio.nombre,
    description: config.seoGlobal.metaDescription,
    url: SITE_URL,
    image: new URL(config.seoGlobal.ogImage, SITE_URL).toString(),
    logo: new URL('/logo.webp', SITE_URL).toString(),
    ...(tel.length >= 8 ? { telephone: `+${tel}` } : {}),
    address: {
      '@type': 'PostalAddress',
      // Solo si es una calle de verdad (no «[completar…]» ni «La Paloma, Rocha, Uruguay»).
      ...(config.ubicacion.direccion.includes('[completar') ||
      config.ubicacion.direccion.startsWith(ext.negocio.localidad)
        ? {}
        : { streetAddress: config.ubicacion.direccion }),
      addressLocality: ext.negocio.localidad,
      addressRegion: ext.negocio.departamento,
      addressCountry: ext.negocio.codigoPais,
    },
    ...(config.ubicacion.mapaUrl.startsWith('https://') ? { hasMap: config.ubicacion.mapaUrl } : {}),
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
  const preguntas = faq
    .map((f) => ({ q: f.pregunta.trim(), a: sinHtml(f.respuesta) }))
    .filter((f) => f.q && f.a && !f.a.includes('[completar'));
  // WebSite: le dice a Google el nombre del sitio («Calaguala» en vez del dominio).
  const sitio = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#sitio`,
    name: ext.negocio.nombre,
    alternateName: ['Calaguala Camp', 'calagualacamp.com'],
    url: `${SITE_URL}/`,
    inLanguage: 'es-UY',
  };
  const grafo = preguntas.length
    ? [
        sitio,
        data,
        {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: preguntas.map((f) => ({
            '@type': 'Question',
            name: f.q,
            acceptedAnswer: { '@type': 'Answer', text: f.a },
          })),
        },
      ]
    : [sitio, data];
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(grafo).replace(/</g, '\\u003c') }}
    />
  );
}
