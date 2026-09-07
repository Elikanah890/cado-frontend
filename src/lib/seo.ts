export const siteConfig = {
  name: 'CadorDigital',
  tagline: 'Build. Market. Automate. Grow.',
  title: 'CadorDigital - Build. Market. Automate. Grow.',
  description:
    'CadorDigital helps startups, companies and organizations build professional brands, websites, marketing systems and automation solutions that create real business growth in Tanzania and beyond.',
  keywords: [
    'digital agency Tanzania',
    'web development Tanzania',
    'branding Tanzania',
    'digital marketing',
    'AI automation',
    'business registration Tanzania',
    'CadorDigital',
    'website design Dar es Salaam',
    'SEO Tanzania',
    'ecommerce development',
  ],
  url: (process.env.NEXT_PUBLIC_SITE_URL || 'https://cador.digital').replace(/\/$/, ''),
  ogImage: '/og-image.png',
  locale: 'en_TZ',
  twitterHandle: '@CadorDigital',
  themeColor: '#0A1628',
  backgroundColor: '#ffffff',
  author: 'CadorDigital',
  category: 'Digital Agency',
};

export const getSiteUrl = () => siteConfig.url;
export const absoluteUrl = (path: string) => `${siteConfig.url}${path.startsWith('/') ? path : `/${path}`}`;
export const getOgImageUrl = (image?: string | null) => {
  if (!image) return absoluteUrl(siteConfig.ogImage);
  if (image.startsWith('http')) return image;
  if (image.startsWith('/')) return absoluteUrl(image);
  return absoluteUrl(`/${image}`);
};

export const defaultOpenGraph = {
  type: 'website' as const,
  locale: siteConfig.locale,
  url: siteConfig.url,
  siteName: siteConfig.name,
  title: siteConfig.title,
  description: siteConfig.description,
  images: [{ url: absoluteUrl(siteConfig.ogImage), width: 1200, height: 630, alt: siteConfig.title }],
};

export function getApiBase(): string {
  return (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');
}

export async function fetchSeo<T>(path: string, revalidate = 3600): Promise<T | null> {
  try {
    const base = getApiBase();
    const url = `${base}${path.startsWith('/') ? path : `/${path}`}`;
    const res = await fetch(url, { next: { revalidate } });
    if (!res.ok) return null;
    const json = await res.json();
    return (json.data ?? json) as T;
  } catch {
    return null;
  }
}
