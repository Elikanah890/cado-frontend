const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const getBackendOrigin = (): string => {
  return API_URL.replace(/\/api\/?$/, '').replace(/\/+$/, '');
};

/**
 * Resolve a media URL (image or video) stored by the backend.
 *
 * - Absolute URLs (Cloudinary, YouTube, external CDNs) pass through untouched.
 * - Protocol-relative URLs (`//...`) are upgraded to https.
 * - Local uploads (`/uploads/...`) are rewritten to the backend origin so they
 *   resolve in production where the frontend and backend live on different domains.
 * - Inline data/blob URIs pass through untouched.
 */
export const resolveImageUrl = (url: string | null | undefined): string => {
  if (!url) return '';

  if (/^https?:\/\//i.test(url)) return url;
  if (url.startsWith('//')) return `https:${url}`;
  if (url.startsWith('data:') || url.startsWith('blob:')) return url;

  if (url.startsWith('/uploads/')) {
    return `${getBackendOrigin()}${url}`;
  }

  return url;
};
