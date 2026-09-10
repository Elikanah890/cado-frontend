// Lightweight, dependency-free HTML sanitizer used as a defensive layer on the
// frontend. Rich-text content (blog posts, course descriptions, lessons) is
// already sanitized by the backend with a strict allowlist before it is stored,
// so this only needs to strip the most dangerous patterns and must work in both
// the browser and the Node runtime (no jsdom dependency, unlike
// `isomorphic-dompurify` which breaks on older Node versions).

function stripUnsafeHtml(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<(iframe|object|embed|form)[\s\S]*?<\/(iframe|object|embed|form)>/gi, '')
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/\s(href|src)\s*=\s*["']?\s*javascript:[^"'\s>]*["']?/gi, '');
}

export function sanitizeHtml(html: unknown): string {
  if (typeof html !== 'string') return '';
  return stripUnsafeHtml(html);
}
