import { siteConfig, absoluteUrl } from './seo';

export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${siteConfig.url}/#organization`,
    name: siteConfig.name,
    url: siteConfig.url,
    logo: absoluteUrl('/cador-logo.png'),
    image: absoluteUrl(siteConfig.ogImage),
    description: siteConfig.description,
    foundingLocation: { '@type': 'Place', address: { '@type': 'PostalAddress', addressCountry: 'TZ', addressLocality: 'Dar es Salaam' } },
    sameAs: ['https://wa.me/255716168903'],
    contactPoint: { '@type': 'ContactPoint', telephone: '+255716168903', contactType: 'customer service', availableLanguage: ['English', 'Swahili'] },
  };
}

export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${siteConfig.url}/#website`,
    url: siteConfig.url,
    name: siteConfig.name,
    description: siteConfig.description,
    publisher: { '@id': `${siteConfig.url}/#organization` },
    inLanguage: 'en-TZ',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${siteConfig.url}/blog?search={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function articleSchema(data: {
  title: string;
  description: string;
  slug: string;
  image?: string | null;
  publishedAt?: string | null;
  updatedAt?: string | null;
  authorName?: string | null;
}) {
  const url = absoluteUrl(`/blog/${data.slug}`);
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: data.title,
    description: data.description,
    image: data.image ? [data.image.startsWith('http') ? data.image : absoluteUrl(data.image)] : [absoluteUrl(siteConfig.ogImage)],
    author: { '@type': 'Person', name: data.authorName || siteConfig.name },
    publisher: { '@id': `${siteConfig.url}/#organization`, name: siteConfig.name, logo: { '@type': 'ImageObject', url: absoluteUrl('/cador-logo.png') } },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    url,
    datePublished: data.publishedAt || new Date().toISOString(),
    dateModified: data.updatedAt || data.publishedAt || new Date().toISOString(),
    inLanguage: 'en-TZ',
  };
}

export function serviceSchema(data: { name: string; description: string; slug: string; image?: string | null }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: data.name,
    description: data.description,
    url: absoluteUrl(`/services/${data.slug}`),
    provider: { '@id': `${siteConfig.url}/#organization` },
    serviceType: data.name,
    areaServed: { '@type': 'Country', name: 'Tanzania' },
    image: data.image ? absoluteUrl(data.image) : absoluteUrl(siteConfig.ogImage),
  };
}

export function courseSchema(data: {
  title: string;
  description: string;
  slug: string;
  image?: string | null;
  providerName?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: data.title,
    description: data.description,
    url: absoluteUrl(`/academy/${data.slug}`),
    provider: { '@type': 'Organization', name: data.providerName || siteConfig.name, sameAs: siteConfig.url },
    image: data.image ? absoluteUrl(data.image) : absoluteUrl(siteConfig.ogImage),
    inLanguage: 'en-TZ',
  };
}

export function portfolioSchema(data: { title: string; description: string; slug: string; image?: string | null }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: data.title,
    description: data.description,
    url: absoluteUrl(`/portfolio/${data.slug}`),
    creator: { '@id': `${siteConfig.url}/#organization` },
    image: data.image ? absoluteUrl(data.image) : absoluteUrl(siteConfig.ogImage),
  };
}
