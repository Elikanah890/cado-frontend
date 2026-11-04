import { resolveImageUrl } from '@/lib/imageUtils';

interface Props {
  src: string;
  alt: string;
  loading?: 'lazy' | 'eager';
  className?: string;
}

export default function FrameImage({ src, alt, loading = 'lazy', className = '' }: Props) {
  return (
    <img
      src={resolveImageUrl(src)}
      alt={alt}
      loading={loading}
      className={`absolute inset-0 h-full w-full object-cover ${className}`}
    />
  );
}
