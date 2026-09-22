import Image from 'next/image';

interface Props {
  src: string;
  alt: string;
  /** Relación de aspecto del contenedor, evita CLS. Default: retrato 9/16. */
  aspecto?: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
}

export function Foto({ src, alt, aspecto = '9 / 16', sizes = '(min-width: 768px) 33vw, 80vw', priority, className = '' }: Props) {
  return (
    <div className={`relative overflow-hidden bg-arena ${className}`} style={{ aspectRatio: aspecto }}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        loading={priority ? undefined : 'lazy'}
        className="object-cover"
      />
    </div>
  );
}
