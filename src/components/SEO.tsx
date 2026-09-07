import { siteConfig, absoluteUrl } from '@/lib/seo';

type SEOProps = {
  title?: string;
  description?: string;
  image?: string | null;
  url?: string;
  type?: 'website' | 'article' | 'profile' | 'book';
  keywords?: string[];
  noIndex?: boolean;
  canonical?: string;
};

export default function SEO({ title, description, image, url, type = 'website', keywords, noIndex, canonical }: SEOProps) {
  const metaTitle = title ? `${title} | ${siteConfig.name}` : siteConfig.title;
  const metaDesc = description || siteConfig.description;
  const metaImage = image ? (image.startsWith('http') ? image : absoluteUrl(image)) : absoluteUrl(siteConfig.ogImage);
  const metaUrl = url ? (url.startsWith('http') ? url : absoluteUrl(url)) : siteConfig.url;
  const canonicalUrl = canonical || metaUrl;
  return (
    <>
      <title>{metaTitle}</title>
      <meta name="description" content={metaDesc} />
      {keywords?.length ? <meta name="keywords" content={keywords.join(', ')} /> : null}
      <link rel="canonical" href={canonicalUrl} />
      {noIndex ? <meta name="robots" content="noindex, nofollow" /> : null}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title || siteConfig.title} />
      <meta property="og:description" content={metaDesc} />
      <meta property="og:url" content={metaUrl} />
      <meta property="og:site_name" content={siteConfig.name} />
      <meta property="og:image" content={metaImage} />
      <meta property="og:locale" content={siteConfig.locale} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title || siteConfig.title} />
      <meta name="twitter:description" content={metaDesc} />
      <meta name="twitter:image" content={metaImage} />
    </>
  );
}

export function buildMetadata({ title, description, image, url, type = 'website', keywords }: SEOProps) {
  const metaImage = image ? (image.startsWith('http') ? image : absoluteUrl(image)) : absoluteUrl(siteConfig.ogImage);
  const metaUrl = url ? (url.startsWith('http') ? url : absoluteUrl(url)) : undefined;
  return {
    title: title ? { absolute: `${title} | ${siteConfig.name}` } : undefined,
    description: description || undefined,
    keywords: keywords || undefined,
    openGraph: {
      type: type as any,
      title: title || siteConfig.title,
      description: description || siteConfig.description,
      url: metaUrl,
      images: [{ url: metaImage, width: 1200, height: 630, alt: title || siteConfig.title }],
    },
    twitter: { card: 'summary_large_image' as const, title: title || siteConfig.title, description: description || siteConfig.description, images: [metaImage] },
    alternates: metaUrl ? { canonical: metaUrl } : undefined,
  };
}
