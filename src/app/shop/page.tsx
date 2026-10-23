'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Package, ShoppingBag } from 'lucide-react';
import PublicLayout from '@/components/PublicLayout';
import PosterImage from '@/components/PosterImage';
import { publicApi } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import type { Product } from '@/types';

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    publicApi.getProducts()
      .then((res) => {
        if (!mounted) return;
        setProducts(Array.isArray(res.data) ? res.data : []);
      })
      .catch(() => {
        if (!mounted) return;
        setError('Failed to load products. Please try again later.');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, []);

  const mainImage = (product: Product) => {
    const first = Array.isArray(product.images) ? product.images[0] : null;
    if (!first) return null;
    return typeof first === 'string' ? first : first.url || null;
  };

  return (
    <PublicLayout>
      <section className="section-padding bg-gradient-to-b from-primary-900 to-primary-800 text-white">
        <div className="container-custom text-center max-w-3xl">
          <span className="text-gold-500 font-semibold text-sm uppercase tracking-wider">Shop</span>
          <h1 className="text-4xl md:text-6xl font-bold mt-4 mb-6">Digital Products</h1>
          <p className="text-xl text-white/70">Ready-made templates, graphics and digital tools to help your business grow.</p>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-custom">
          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="card overflow-hidden animate-pulse">
                  <div className="aspect-[4/5] bg-gray-200" />
                  <div className="p-5 space-y-3">
                    <div className="h-5 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500 mb-4">{error}</p>
              <button onClick={() => window.location.reload()} className="btn-primary">Retry</button>
            </div>
          ) : products.length === 0 ? (
            <div className="card p-12 text-center">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">No products available yet. Please check back soon.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
              {products.map((product) => {
                const image = mainImage(product);
                const productUrl = `/shop/${product.slug}`;
                const price = formatCurrency(product.price, product.currency);
                const hasDiscount = Boolean(product.originalPrice && product.originalPrice > product.price);
                const message = `Habari CadorDigital, nahitaji kununua ${product.title} kwa bei ya ${price}`;
                const whatsappHref = `https://wa.me/255716168903?text=${encodeURIComponent(message)}`;
                return (
                  <div key={product.id} className="card group overflow-hidden flex flex-col">
                    <Link href={productUrl} className="block bg-gradient-to-br from-primary-100 to-primary-200 overflow-hidden">
                      {image ? (
                        <PosterImage
                          src={image}
                          alt={product.title}
                          imageClassName="transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="aspect-[4/5] w-full flex items-center justify-center">
                          <ShoppingBag className="w-10 h-10 text-primary-400" />
                        </div>
                      )}
                    </Link>

                    <div className="p-4 sm:p-5 flex flex-col flex-1">
                      <Link href={productUrl}>
                        <h2 className="text-base sm:text-lg font-bold text-primary-900 group-hover:text-gold-500 transition-colors line-clamp-2">
                          {product.title}
                        </h2>
                      </Link>
                      {hasDiscount ? (
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-gray-400 line-through text-sm">
                            {formatCurrency(product.originalPrice!, product.currency)}
                          </span>
                          <span className="font-bold text-lg text-gray-900">
                            {price}
                          </span>
                        </div>
                      ) : (
                        <p className="text-gold-600 font-semibold mt-2">{price}</p>
                      )}
                      <a
                        href={whatsappHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-primary-900 px-6 py-3 text-lg font-bold text-white transition-all hover:bg-primary-800"
                      >
                        Buy Now
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </PublicLayout>
  );
}
