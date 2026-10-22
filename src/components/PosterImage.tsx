import { resolveImageUrl } from '@/lib/imageUtils';

interface PosterImageProps {
  src: string;
  alt: string;
  className?: string;
  imageClassName?: string;
  loading?: 'lazy' | 'eager';
}

export default function PosterImage({
  src,
  alt,
  className = '',
  imageClassName = '',
  loading = 'lazy',
}: PosterImageProps) {
  const url = resolveImageUrl(src);

  return (
    <div className={`relative aspect-[4/5] overflow-hidden bg-gray-100 ${className}`}>
      <img
        src={url}
        alt=""
        aria-hidden="true"
        loading={loading}
        className="absolute inset-0 h-full w-full scale-110 object-cover opacity-40 blur-2xl"
      />
      <img
        src={url}
        alt={alt}
        width={1080}
        height={1350}
        loading={loading}
        className={`relative z-10 h-full w-full object-contain ${imageClassName}`}
      />
    </div>
  );
}
