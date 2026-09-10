import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Clock, User, Tag, Eye, MessageSquare } from 'lucide-react';
import PublicLayout from '@/components/PublicLayout';
import ShareButtons from '@/components/ShareButtons';
import JsonLd from '@/components/JsonLd';
import { siteConfig, absoluteUrl, getApiBase } from '@/lib/seo';
import { articleSchema, breadcrumbSchema } from '@/lib/jsonLd';
import { resolveImageUrl } from '@/lib/imageUtils';
import { sanitizeHtml } from '@/lib/sanitize';
import BlogComments from './BlogComments';

export const revalidate = 3600;

async function getPost(slug: string) {
  let res: Response;
  try {
    const base = getApiBase();
    res = await fetch(`${base}/blog/${encodeURIComponent(slug)}`, {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(8000),
    });
  } catch {
    throw new Error('Unable to reach the blog service. Please try again shortly.');
  }

  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Blog service returned an error (${res.status}).`);

  const json = await res.json();
  return json.data ?? json;
}

async function getRelated(slug: string) {
  try {
    const base = getApiBase();
    const res = await fetch(`${base}/blog/related/${encodeURIComponent(slug)}`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const json = await res.json();
    const data = json.data ?? json;
    return Array.isArray(data) ? data : [];
  } catch { return []; }
}

async function getServices() {
  try {
    const base = getApiBase();
    const res = await fetch(`${base}/services`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const json = await res.json();
    const data = json.data ?? json;
    const arr = Array.isArray(data) ? data : Array.isArray(data?.services) ? data.services : [];
    return arr.slice(0, 4);
  } catch { return []; }
}

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  let post: any = null;
  try {
    post = await getPost(slug);
  } catch {
    post = null;
  }
  if (!post) return { title: 'Post Not Found' };
  const title: string = post.seo?.metaTitle || post.metaTitle || post.title;
  const rawDesc = post.seo?.metaDescription || post.metaDescription || post.excerpt || stripHtml(post.content || '').slice(0, 155);
  const description = rawDesc ? String(rawDesc).slice(0, 160) : siteConfig.description;
  const ogImage = post.seo?.ogImage || post.ogImage || post.featuredImage || siteConfig.ogImage;
  const imageUrl = ogImage?.startsWith('http') ? ogImage : ogImage ? absoluteUrl(ogImage.startsWith('/') ? ogImage : `/${ogImage}`) : absoluteUrl(siteConfig.ogImage);
  const url = absoluteUrl(`/blog/${slug}`);
  const keywords = post.seo?.keywords || post.metaKeywords || undefined;
  return {
    title,
    description,
    keywords: keywords ? String(keywords).split(',').map((k: string) => k.trim()) : undefined,
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      url,
      title,
      description,
      images: [{ url: imageUrl, width: 1200, height: 630, alt: title }],
      publishedTime: post.publishedAt || post.createdAt,
      modifiedTime: post.updatedAt || post.publishedAt,
      authors: [post.authorName || siteConfig.name],
      tags: (post.tags || []).map((t: any) => t.tag?.name || t.name).filter(Boolean),
    },
    twitter: { card: 'summary_large_image', title, description, images: [imageUrl] },
  };
}

function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat('en-TZ', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(date));
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let post: any;
  try {
    post = await getPost(slug);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Something went wrong while loading this post.';
    return (
      <PublicLayout>
        <section className="section-padding">
          <div className="container-custom max-w-2xl text-center">
            <h1 className="text-3xl font-bold text-primary-900 mb-4">This page couldn&apos;t load</h1>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="flex items-center justify-center gap-3">
              <Link href="/blog" className="btn-primary">← Back to Blog</Link>
              <Link href="/" className="btn-secondary">Go Home</Link>
            </div>
          </div>
        </section>
      </PublicLayout>
    );
  }
  if (!post) notFound();
  const [related, services] = await Promise.all([getRelated(slug), getServices()]);
  const title: string = post.title;
  const excerpt: string = post.excerpt || '';
  const content: string = post.content || '';
  const category: string = post.category?.name || '';
  const author: string = post.authorName || 'CadorDigital';
  const date: string = post.publishedAt || post.createdAt;
  const readTime: number = post.readTime || 1;
  const views: number = post.views || post.viewCount || 0;
  const image: string | null = post.featuredImage || null;
  const galleryImages: string[] = Array.isArray(post.galleryImages) ? post.galleryImages.map((g: any) => (typeof g === 'string' ? g : g.url || '')).filter(Boolean) : [];
  const tags: string[] = (post.tags || []).map((tag: any) => tag.tag?.name || tag.name).filter(Boolean);
  const resolvedImage = image ? resolveImageUrl(image) : null;
  const ogForSchema = post.seo?.ogImage || post.ogImage || image || siteConfig.ogImage;
  const schemaImage = ogForSchema?.startsWith('http') ? ogForSchema : absoluteUrl(ogForSchema || siteConfig.ogImage);
  const articleJson = articleSchema({ title, description: excerpt || stripHtml(content).slice(0, 160), slug, image: schemaImage, publishedAt: post.publishedAt, updatedAt: post.updatedAt, authorName: author });
  const breadcrumbJson = breadcrumbSchema([
    { name: 'Home', url: siteConfig.url },
    { name: 'Blog', url: absoluteUrl('/blog') },
    { name: title, url: absoluteUrl(`/blog/${slug}`) },
  ]);

  return (
    <PublicLayout>
      <JsonLd data={[articleJson, breadcrumbJson]} />
      <article>
        <section className="section-padding bg-gradient-to-b from-primary-900 to-primary-800 text-white pt-10 pb-0">
          <div className="container-custom max-w-4xl">
            <nav className="flex items-center gap-2 text-xs text-white/50 mb-4" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-gold-400 transition-colors">Home</Link>
              <span>/</span>
              <Link href="/blog" className="hover:text-gold-400 transition-colors">Blog</Link>
              {category && (<><span>/</span><Link href={`/blog?search=${encodeURIComponent(category)}`} className="hover:text-gold-400 transition-colors">{category}</Link></>)}
              <span>/</span>
              <span className="text-white/80 truncate max-w-[180px]">{title}</span>
            </nav>
            <Link href="/blog" className="text-white/60 hover:text-gold-500 text-sm mb-4 inline-block">← Back to Blog</Link>
            <span className="bg-gold-500/20 text-gold-400 px-3 py-1 rounded-full text-sm">{category || 'Article'}</span>
            <h1 className="text-3xl md:text-5xl font-bold mt-4 mb-6">{title}</h1>
            <div className="flex flex-wrap items-center gap-6 text-white/70 text-sm pb-10">
              <span className="flex items-center gap-1"><User className="w-4 h-4" /> {author}</span>
              <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {formatDate(date)}</span>
              <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {readTime} min read</span>
              {views > 0 && <span className="flex items-center gap-1"><Eye className="w-4 h-4" /> {views}</span>}
            </div>
          </div>
          {resolvedImage && (
            <div className="container-custom max-w-4xl">
              <img src={resolvedImage} alt={title} width={1200} height={630} className="w-full max-h-[480px] object-cover rounded-t-2xl" loading="eager" />
            </div>
          )}
        </section>

        <section className="section-padding">
          <div className="container-custom max-w-4xl">
            <div className="flex gap-6">
              <div className="hidden lg:flex flex-col sticky top-28 h-fit">
                <ShareButtons title={title} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="mb-6 lg:hidden">
                  <ShareButtons title={title} />
                </div>
                {excerpt && <p className="text-lg text-gray-600 mb-8 leading-relaxed italic border-l-4 border-gold-500 pl-6">{excerpt}</p>}
                <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
                  <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(content) }} />
                </div>
                {galleryImages.length > 0 && (
                  <div className="mt-8">
                    <h2 className="text-xl font-bold text-primary-900 mb-4">Gallery</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {galleryImages.map((img: string, i: number) => (
                        <a key={i} href={resolveImageUrl(img)} target="_blank" rel="noopener noreferrer" className="block rounded-xl overflow-hidden border hover:opacity-90 transition-opacity">
                          <img src={resolveImageUrl(img)} alt={`${title} gallery ${i + 1}`} width={400} height={300} className="w-full h-40 md:h-48 object-cover" loading="lazy" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t">
                    {tags.map((tag: string) => (
                      <Link key={tag} href={`/blog?search=${encodeURIComponent(tag)}`} className="bg-gray-100 text-gray-600 hover:bg-primary-50 hover:text-primary-700 px-3 py-1 rounded-full text-sm flex items-center gap-1 transition-colors"><Tag className="w-3 h-3" /> {tag}</Link>
                    ))}
                  </div>
                )}
                {services.length > 0 && (
                  <div className="mt-10 p-6 rounded-2xl bg-primary-50 border border-primary-100">
                    <h3 className="text-lg font-bold text-primary-900 mb-2">Need help with this topic?</h3>
                    <p className="text-sm text-gray-600 mb-4">Our team at <Link href="/" className="text-gold-600 hover:underline font-medium">CadorDigital</Link> can help you implement what you just read. Explore our services or <Link href="/contact" className="text-gold-600 hover:underline font-medium">contact us</Link> for a free consultation.</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {services.map((svc: any) => (
                        <Link key={svc.slug} href={`/services/${svc.slug}`} className="flex items-center justify-between p-3 bg-white rounded-xl border hover:border-gold-500 hover:shadow-sm transition-all group">
                          <span className="text-sm font-medium text-primary-900 group-hover:text-gold-600">{svc.name}</span>
                          <span className="text-gold-500 text-xs">→</span>
                        </Link>
                      ))}
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Link href="/services" className="text-sm text-primary-700 hover:text-gold-600 font-medium">View all services →</Link>
                      <span className="text-gray-300">•</span>
                      <Link href="/portfolio" className="text-sm text-primary-700 hover:text-gold-600 font-medium">See our portfolio →</Link>
                      <span className="text-gray-300">•</span>
                      <Link href="/academy" className="text-sm text-primary-700 hover:text-gold-600 font-medium">Learn in Academy →</Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="section-padding bg-gray-50 pt-12">
          <div className="container-custom max-w-4xl">
            <div className="card p-8 flex items-start gap-6">
              <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0"><User className="w-8 h-8 text-primary-700" /></div>
              <div><h3 className="text-lg font-bold text-primary-900">{author}</h3><p className="text-gray-600 text-sm mt-1">Author at CadorDigital — sharing insights on digital growth, technology, and business.</p></div>
            </div>
          </div>
        </section>

        <BlogComments slug={slug} />

        {related.length > 0 && (
          <section className="section-padding pt-0">
            <div className="container-custom max-w-4xl">
              <h2 className="text-2xl font-bold text-primary-900 mb-6">Related Posts</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {related.map((r: any) => (
                  <Link key={r.slug} href={`/blog/${r.slug}`} className="card group overflow-hidden">
                    <div className="aspect-video bg-gradient-to-br from-primary-200 to-primary-300 overflow-hidden">
                      {r.featuredImage ? <img src={resolveImageUrl(r.featuredImage)} alt={r.title} width={400} height={225} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" /> : <div className="w-full h-full flex items-center justify-center text-primary-400 text-sm">CadorDigital</div>}
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-primary-900 group-hover:text-gold-500 transition-colors line-clamp-2 text-sm">{r.title}</h3>
                      <p className="text-xs text-gray-400 mt-1">{formatDate(r.publishedAt || r.createdAt)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </article>
    </PublicLayout>
  );
}
