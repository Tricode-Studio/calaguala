import type { Metadata, Viewport } from 'next';
import { Figtree, Young_Serif } from 'next/font/google';
import { getLandingConfig } from '@/lib/cms';
import { VisorFoto } from '@/components/ui/VisorFoto';
import { CreditoTricode } from '@/components/CreditoTricode';
import './globals.css';

// next/font: self-hosting + preload + font-display: swap
const youngSerif = Young_Serif({
  subsets: ['latin'],
  weight: '400',
  display: 'swap',
  variable: '--font-young-serif',
});
const figtree = Figtree({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-figtree',
});

if (!process.env.NEXT_PUBLIC_SITE_URL && process.env.NODE_ENV === 'production') {
  console.warn('[layout] NEXT_PUBLIC_SITE_URL no está definida: canonical/Open Graph usan http://localhost:3000.');
}
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export async function generateMetadata(): Promise<Metadata> {
  const { seoGlobal } = await getLandingConfig();
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: seoGlobal.metaTitle, template: '%s · Calaguala' },
    description: seoGlobal.metaDescription,
    keywords: [
      'camping La Paloma',
      'glamping La Paloma Uruguay',
      'camping cerca de Playa Anaconda',
      'alojamiento La Paloma Rocha',
      'camping frente al mar Uruguay',
    ],
    alternates: { canonical: '/' },
    openGraph: {
      type: 'website',
      locale: 'es_UY',
      siteName: 'Calaguala',
      url: '/',
      title: seoGlobal.metaTitle,
      description: seoGlobal.metaDescription,
      images: [{ url: seoGlobal.ogImage, width: 1200, height: 630, alt: 'Calaguala, camping y glamping en La Paloma' }],
    },
    twitter: { card: 'summary_large_image' },
  };
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#2F6675',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${youngSerif.variable} ${figtree.variable}`}>
      <body>
        {children}
        <CreditoTricode />
        <VisorFoto />
      </body>
    </html>
  );
}
