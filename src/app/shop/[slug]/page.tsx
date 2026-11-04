import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Check, ClipboardList, MessageCircle, Package } from 'lucide-react';
import PublicLayout from '@/components/PublicLayout';
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
    openGraph: { type: 'website', url, title: product.title, description, images: [{ url: ogImage, width: 1080, height: 1350, alt: product.title }] },
    twitter: { card: 'summary_large_image', title: product.title, description, images: [ogImage] },
  };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const images = normalizeImages(product.images);
  const mainImage = images[0]?.url ? resolveImageUrl(images[0].url) : null;
  const gallery = images.slice(1);

  const price = formatPrice(product.price, product.currency);
  const hasDiscount = Boolean(product.originalPrice && product.originalPrice > product.price);
  const message = `Habari CadorDigital, nahitaji kununua ${product.title} kwa bei ya ${price}`;
  const whatsappHref = `https://wa.me/255716168903?text=${encodeURIComponent(message)}`;

  return (
    <PublicLayout>
      <section className="bg-primary-900 text-white">
        <div className="container-custom py-10 md:py-16">
          <Link href="/shop" className="text-white/60 hover:text-gold-400 text-sm mb-6 inline-flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Back to Shop
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
            <div className="w-full">
              {mainImage ? (
                <div className="aspect-video w-full overflow-hidden rounded-2xl bg-gray-100 shadow-2xl">
                  <img
                    src={mainImage}
                    alt={images[0]?.alt || product.title}
                    loading="eager"
                    className="h-full w-full object-contain"
                  />
                </div>
              ) : (
                <div className="aspect-video w-full rounded-2xl bg-primary-800 shadow-2xl flex items-center justify-center">
                  <Package className="w-16 h-16 text-white/20" />
                </div>
              )}

              {gallery.length > 0 && (
                <div className="mt-4 grid grid-cols-4 gap-3">
                  {gallery.map((image, index) => (
                    <a
                      key={`${image.url}-${index}`}
                      href={resolveImageUrl(image.url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="relative block aspect-video overflow-hidden rounded-lg border border-white/10 bg-gray-100 hover:border-gold-500 transition-colors"
                    >
                      <img
                        src={resolveImageUrl(image.url)}
                        alt={image.alt || `${product.title} image ${index + 2}`}
                        loading="lazy"
                        className="h-full w-full object-contain"
                      />
                    </a>
                  ))}
                </div>
              )}
            </div>

            <div>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-sm text-gold-400">
                <Package className="w-3.5 h-3.5" /> Digital Product
              </span>

              <h1 className="text-3xl md:text-5xl font-bold mt-4 mb-4">{product.title}</h1>
              {hasDiscount ? (
                <div className="flex items-center gap-3">
                  <span className="text-xl text-white/50 line-through">
                    {formatPrice(product.originalPrice!, product.currency)}
                  </span>
                  <span className="text-3xl font-bold text-gold-400">{price}</span>
                </div>
              ) : (
                <p className="text-3xl font-bold text-gold-400">{price}</p>
              )}

              {product.description ? (
                <p className="mt-6 text-white/70 leading-relaxed whitespace-pre-wrap">{product.description}</p>
              ) : null}

              <div className="mt-8">
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gold-500 px-8 py-4 text-lg font-bold text-white transition-all hover:bg-gold-600"
                >
                  <MessageCircle className="w-5 h-5" /> Buy Now
                </a>
                <Link
                  href={`/register?type=product&slug=${product.slug}`}
                  className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full border-2 border-white/30 px-8 py-3 text-base font-semibold text-white transition-colors hover:bg-white hover:text-primary-900"
                >
                  <ClipboardList className="w-5 h-5" /> Order / Register
                </Link>
                <p className="mt-3 text-sm text-white/50">Chat with us to complete your purchase and receive your download.</p>
              </div>

              <ul className="mt-8 space-y-3 text-sm text-white/70">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-gold-400" /> Instant delivery via WhatsApp</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-gold-400" /> Secure, personal support</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-gold-400" /> Ready-to-use digital files</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
