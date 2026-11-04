import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Check, ChevronRight, ClipboardList, Download, MessageCircle, Package, ShieldCheck, Zap } from 'lucide-react';
import PublicLayout from '@/components/PublicLayout';
import ProductTabs from './ProductTabs';
import { siteConfig, absoluteUrl, getApiBase } from '@/lib/seo';
import { resolveImageUrl } from '@/lib/imageUtils';

export const dynamic = 'force-dynamic';

interface ProductImage {
  url: string;
  alt?: string | null;
}

interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  originalPrice?: number | null;
  currency: string;
  images: ProductImage[] | string[];
  isActive: boolean;
}

async function getProduct(slug: string): Promise<Product | null> {
  try {
    const base = getApiBase();
    const res = await fetch(`${base}/products/${encodeURIComponent(slug)}`, { cache: 'no-store' });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data ?? json;
  } catch {
    return null;
  }
}

function normalizeImages(images: Product['images']): ProductImage[] {
  if (!Array.isArray(images)) return [];
  return images
    .map((image) => typeof image === 'string' ? { url: image, alt: '' } : { url: image?.url || '', alt: image?.alt || '' })
    .filter((image) => image.url);
}

function formatPrice(price: number, currency: string): string {
  const amount = new Intl.NumberFormat('en-TZ', { maximumFractionDigits: 0 }).format(price);
  return `${amount} ${currency}`;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: 'Product Not Found' };

  const images = normalizeImages(product.images);
  const image = images[0]?.url ? resolveImageUrl(images[0].url) : siteConfig.ogImage;
  const ogImage = image.startsWith('http') ? image : absoluteUrl(image);
  const description = (product.description || '').replace(/\s+/g, ' ').slice(0, 160) || siteConfig.description;
  const url = absoluteUrl(`/shop/${slug}`);

  return {
    title: product.title,
    description,
    alternates: { canonical: url },
    openGraph: { type: 'website', url, title: product.title, description, images: [{ url: ogImage, width: 1200, height: 630, alt: product.title }] },
    twitter: { card: 'summary_large_image', title: product.title, description, images: [ogImage] },
  };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const images = normalizeImages(product.images);
  const mainImage = images[0]?.url ? resolveImageUrl(images[0].url) : null;
  const gallery = images.slice(1).map((image) => ({
    url: resolveImageUrl(image.url),
    alt: image.alt || `${product.title} image`,
  }));

  const price = formatPrice(product.price, product.currency);
  const hasDiscount = Boolean(product.originalPrice && product.originalPrice > product.price);
  const message = `Habari CadorDigital, nahitaji kununua ${product.title} kwa bei ya ${price}`;
  const whatsappHref = `https://wa.me/255716168903?text=${encodeURIComponent(message)}`;

  return (
    <PublicLayout>
      <section className="bg-slate-50">
        <div className="container-custom py-10 md:py-14">
          <nav className="flex items-center gap-1 text-sm text-gray-500" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-gold-600">Home</Link>
            <ChevronRight className="h-4 w-4" />
            <Link href="/shop" className="hover:text-gold-600">Shop</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="truncate text-gray-700">{product.title}</span>
          </nav>

          <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-12">
            <div className="lg:col-span-2">
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-gold-50 px-3 py-1 text-xs font-semibold text-gold-700">Digital Product</span>
                {hasDiscount ? (
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">Sale</span>
                ) : null}
              </div>

              <h1 className="mt-4 text-3xl font-bold leading-tight text-primary-900 md:text-5xl">{product.title}</h1>
              <p className="mt-3 text-lg text-gray-600">Instant digital download, delivered via WhatsApp.</p>

              <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-gray-500">
                <span className="inline-flex items-center gap-1.5"><Zap className="h-4 w-4 text-gold-500" /> Instant delivery</span>
                <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-gold-500" /> Secure support</span>
                <span className="inline-flex items-center gap-1.5"><Download className="h-4 w-4 text-gold-500" /> Ready-to-use files</span>
              </div>

              <div className="mt-8">
                {mainImage ? (
                  <div className="aspect-video w-full max-w-[1066px] overflow-hidden rounded-2xl bg-gray-100 shadow-lg">
                    <img
                      src={mainImage}
                      alt={images[0]?.alt || product.title}
                      loading="eager"
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex aspect-video w-full max-w-[1066px] items-center justify-center rounded-2xl bg-gradient-to-br from-primary-100 to-primary-200 shadow-lg">
                    <Package className="h-16 w-16 text-primary-400" />
                  </div>
                )}
              </div>

              <ProductTabs description={product.description || ''} gallery={gallery} />
            </div>

            <aside className="lg:col-span-1">
              <div className="space-y-5 lg:sticky lg:top-28">
                <div className="rounded-2xl border-t-4 border-gold-500 bg-white p-6 shadow-xl">
                  {hasDiscount ? (
                    <p className="text-sm text-gray-400 line-through">
                      {formatPrice(product.originalPrice!, product.currency)}
                    </p>
                  ) : null}
                  <p className="text-4xl font-bold text-primary-900">{price}</p>

                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary mt-5 w-full justify-center py-4 text-lg"
                  >
                    <MessageCircle className="h-5 w-5" /> Buy Now
                  </a>
                  <Link
                    href={`/register?type=product&slug=${product.slug}`}
                    className="btn-secondary mt-3 w-full justify-center py-3"
                  >
                    <ClipboardList className="h-5 w-5" /> Order / Register
                  </Link>
                  <p className="mt-3 text-center text-xs text-gray-400">
                    Continue on WhatsApp to complete your purchase.
                  </p>

                  <ul className="mt-6 space-y-3 border-t border-gray-100 pt-5 text-sm text-gray-600">
                    <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Instant delivery via WhatsApp</li>
                    <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Secure, personal support</li>
                    <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Ready-to-use digital files</li>
                  </ul>
                </div>

                <div className="rounded-2xl bg-white p-6 shadow-md">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Need help?</p>
                  <p className="mt-2 text-sm leading-relaxed text-gray-600">
                    Chat with our team if you have any questions about this product.
                  </p>
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gold-50 px-4 py-3 text-sm font-semibold text-gold-700 transition-colors hover:bg-gold-100"
                  >
                    <MessageCircle className="h-4 w-4" /> Chat on WhatsApp
                  </a>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
