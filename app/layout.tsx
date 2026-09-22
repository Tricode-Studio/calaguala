import type { Metadata, Viewport } from 'next';
import { Figtree, Young_Serif } from 'next/font/google';
import { getLandingConfig } from '@/lib/cms';
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
    icons: { icon: '/icon.png', apple: '/apple-icon.png' },
    openGraph: {
      type: 'website',
      locale: 'es_UY',
      siteName: 'Calaguala',
      title: seoGlobal.metaTitle,
      description: seoGlobal.metaDescription,
      images: [{ url: seoGlobal.ogImage }],
    },
    twitter: { card: 'summary_large_image' },
  };
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#263B2D',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${youngSerif.variable} ${figtree.variable}`}>
      <body>{children}</body>
    </html>
  );
}
