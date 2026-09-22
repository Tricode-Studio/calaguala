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

const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    // Las fotos del CMS se sirven desde el host de la API (o su CDN).
    remotePatterns: cmsHost ? [{ protocol: 'https', hostname: cmsHost }] : [],
  },
};

export default nextConfig;
