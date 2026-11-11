import Image, { type ImageProps } from 'next/image';

/**
 * Host del CMS (sus fotos sí pasan por el optimizador; está en remotePatterns
 * de next.config.ts). Se lee de la variable pública para que funcione igual
 * en componentes de servidor y de cliente.
 */
const HOST_CMS = (() => {
  try {
    const base = process.env.NEXT_PUBLIC_TRICODE_API_BASE_URL;
    return base ? new URL(base).hostname : null;
  } catch {
    return null;
  }
})();

/** ¿Puede pasar por el optimizador de Next? (locales y del storage del CMS). */
export function optimizable(src: ImageProps['src']): boolean {
  if (typeof src !== 'string' || src.startsWith('/')) return true;
  try {
    const url = new URL(src);
    return url.protocol === 'https:' && url.hostname === HOST_CMS;
  } catch {
    return false;
  }
}

/**
 * `next/image` que no rompe con URLs externas: desde el CMS se puede pegar la
 * URL de una foto alojada en cualquier lado, y `next/image` tira un error (500
 * de toda la página) ante un host que no está en `remotePatterns`. Esas se
 * muestran sin optimizar; las locales y las del storage del CMS se optimizan.
 */
export default function Img(props: ImageProps) {
  return <Image {...props} unoptimized={props.unoptimized || !optimizable(props.src)} />;
}
