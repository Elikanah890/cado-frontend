import DOMPurify from 'isomorphic-dompurify';

export function sanitizeHtml(html: unknown): string {
  if (typeof html !== 'string') return '';
  return DOMPurify.sanitize(html, { USE_PROFILES: { html: true } });
}
