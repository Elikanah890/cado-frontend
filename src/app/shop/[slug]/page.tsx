import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Check, MessageCircle, Package } from 'lucide-react';
import PublicLayout from '@/components/PublicLayout';
import PosterImage from '@/components/PosterImage';
import { siteConfig, absoluteUrl, getApiBase } from '@/lib/seo';
import { resolveImageUrl } from '@/lib/imageUtils';

export const revalidate = 3600;

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
  currency: string;
  images: ProductImage[] | string[];
  isActive: boolean;
}

async function getProduct(slug: string): Promise<Product | null> {
  try {
    const base = getApiBase();
    const res = await fetch(`${base}/products/${encodeURIComponent(slug)}`, { next: { revalidate: 3600 } });
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
            <div className="w-full max-w-md mx-auto">
              {mainImage ? (
                <PosterImage src={mainImage} alt={images[0]?.alt || product.title} loading="eager" className="rounded-2xl shadow-2xl" />
              ) : (
                <div className="aspect-[4/5] w-full rounded-2xl bg-primary-800 shadow-2xl flex items-center justify-center">
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
                      className="block rounded-lg overflow-hidden border border-white/10 hover:border-gold-500 transition-colors"
                    >
                      <PosterImage src={image.url} alt={image.alt || `${product.title} image ${index + 2}`} className="rounded-none" />
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
              <p className="text-3xl font-bold text-gold-400">{price}</p>

              {product.description ? (
                <p className="mt-6 text-white/70 leading-relaxed whitespace-pre-wrap">{product.description}</p>
              ) : null}

              <div className="mt-8">
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary inline-flex items-center gap-2 text-base px-8 py-4"
                >
                  <MessageCircle className="w-5 h-5" /> Buy on WhatsApp
                </a>
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
