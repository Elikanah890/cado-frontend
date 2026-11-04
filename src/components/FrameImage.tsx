import { resolveImageUrl } from '@/lib/imageUtils';

interface Props {
  src: string;
  alt: string;
  loading?: 'lazy' | 'eager';
  className?: string;
}

export default function FrameImage({ src, alt, loading = 'lazy', className = '' }: Props) {
  const url = resolveImageUrl(src);

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      <img
        src={url}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full scale-110 object-cover opacity-45 blur-2xl"
      />
      <img
        src={url}
        alt={alt}
        loading={loading}
        className="relative z-10 h-full w-full object-contain"
      />
    </div>
  );
}
