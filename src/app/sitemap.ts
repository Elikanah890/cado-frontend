import type { MetadataRoute } from 'next';
import { siteConfig, getApiBase } from '@/lib/seo';

const staticRoutes: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'] }[] = [
  { path: '', priority: 1, changeFrequency: 'weekly' },
  { path: '/services', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/portfolio', priority: 0.8, changeFrequency: 'weekly' },
  { path: '/blog', priority: 0.8, changeFrequency: 'daily' },
  { path: '/academy', priority: 0.8, changeFrequency: 'weekly' },
  { path: '/pricing', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/contact', priority: 0.8, changeFrequency: 'yearly' },
  { path: '/about', priority: 0.8, changeFrequency: 'monthly' },
];

async function fetchSlugs(endpoint: string): Promise<{ slug: string; updatedAt?: string; publishedAt?: string }[]> {
  try {
    const base = getApiBase();
    const res = await fetch(`${base}${endpoint}`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const json = await res.json();
    const data = json.data ?? json;
    const arr = Array.isArray(data) ? data : Array.isArray(data?.services) ? data.services : Array.isArray(data?.portfolio) ? data.portfolio : Array.isArray(data?.courses) ? data.courses : Array.isArray(data?.posts) ? data.posts : [];
    return arr
      .filter((x: any) => x?.slug)
      .map((x: any) => ({ slug: x.slug, updatedAt: x.updatedAt, publishedAt: x.publishedAt }));
  } catch {
    return [];
  }
}

async function fetchBlogSlugs(): Promise<{ slug: string; updatedAt?: string; publishedAt?: string }[]> {
  try {
    const base = getApiBase();
    const res = await fetch(`${base}/blog?limit=1000`, { next: { revalidate: 3600 } });
    if (!res.ok) return fetchSlugs('/blog');
    const json = await res.json();
    const data = json.data;
    const posts = Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : Array.isArray(data?.posts) ? data.posts : [];
    if (posts.length) return posts.filter((x: any) => x?.slug).map((x: any) => ({ slug: x.slug, updatedAt: x.updatedAt, publishedAt: x.publishedAt }));
    return fetchSlugs('/blog');
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteConfig.url;
  const now = new Date();
  const statics: MetadataRoute.Sitemap = staticRoutes.map((r) => ({
    url: `${baseUrl}${r.path || '/'}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  const [blog, services, portfolio, courses] = await Promise.all([
    fetchBlogSlugs(),
    fetchSlugs('/services'),
    fetchSlugs('/portfolio'),
    fetchSlugs('/academy'),
  ]);

  const blogUrls: MetadataRoute.Sitemap = blog.map((p) => ({
    url: `${baseUrl}/blog/${p.slug}`,
    lastModified: p.updatedAt ? new Date(p.updatedAt) : p.publishedAt ? new Date(p.publishedAt) : now,
    changeFrequency: 'weekly',
    priority: 0.6,
  }));
  const serviceUrls: MetadataRoute.Sitemap = services.map((p) => ({
    url: `${baseUrl}/services/${p.slug}`,
    lastModified: p.updatedAt ? new Date(p.updatedAt) : now,
    changeFrequency: 'monthly',
    priority: 0.6,
  }));
  const portfolioUrls: MetadataRoute.Sitemap = portfolio.map((p) => ({
    url: `${baseUrl}/portfolio/${p.slug}`,
    lastModified: p.updatedAt ? new Date(p.updatedAt) : now,
    changeFrequency: 'monthly',
    priority: 0.6,
  }));
  const courseUrls: MetadataRoute.Sitemap = courses.map((p) => ({
    url: `${baseUrl}/academy/${p.slug}`,
    lastModified: p.updatedAt ? new Date(p.updatedAt) : now,
    changeFrequency: 'weekly',
    priority: 0.6,
  }));

  return [...statics, ...blogUrls, ...serviceUrls, ...portfolioUrls, ...courseUrls];
}
