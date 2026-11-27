import type { NextConfig } from 'next';

const cmsHost = (() => {
  try {
    return process.env.NEXT_PUBLIC_TRICODE_API_BASE_URL
      ? new URL(process.env.NEXT_PUBLIC_TRICODE_API_BASE_URL).hostname
      : null;
  } catch {
    return null;
  }
})();

/**
 * Dominio principal (ej. www.calagualacamp.com). Se define SOLO en Production de
 * Vercel. Si está definido, el dominio sin www y cualquier *.vercel.app redirigen
 * ahí (308, conserva la ruta). Vacío = sin redirecciones: el sitio sigue
 * accesible por vercel.app mientras el DNS del dominio no esté listo, y las
 * previews (que no tienen la variable) no se redirigen.
 */
const DOMINIO_PRINCIPAL = process.env.DOMINIO_PRINCIPAL?.trim().toLowerCase() || null;
const escapar = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const nextConfig: NextConfig = {
  async redirects() {
    if (!DOMINIO_PRINCIPAL) return [];
    const hosts = ['.*\\.vercel\\.app'];
    if (DOMINIO_PRINCIPAL.startsWith('www.')) hosts.push(escapar(DOMINIO_PRINCIPAL.slice(4)));
    return hosts.map((value) => ({
      source: '/:path*',
      has: [{ type: 'host' as const, value }],
      destination: `https://${DOMINIO_PRINCIPAL}/:path*`,
      permanent: true,
    }));
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    // Las fotos del CMS se sirven desde el host de la API (o su CDN).
    remotePatterns: cmsHost ? [{ protocol: 'https', hostname: cmsHost }] : [],
  },
};

export default nextConfig;
