'use client';

import Link from 'next/link';
import { Download, MessageCircle } from 'lucide-react';
import PublicLayout from '@/components/PublicLayout';
import { useState } from 'react';
import { useEffect } from 'react';
import { publicApi } from '@/lib/api';
import { whatsappLink } from '@/lib/utils';

const fallbackProducts = [
  { id: '1', name: 'Company Profile Template', category: 'Templates', price: 50000, currency: 'TZS', image: null, slug: 'company-profile-template', desc: 'Professional company profile template for businesses.' },
  { id: '2', name: 'Business Document Template Pack', category: 'Templates', price: 35000, currency: 'TZS', image: null, slug: 'business-document-template-pack', desc: 'A set of professional business document templates.' },
  { id: '3', name: 'Business Proposal Template', category: 'Templates', price: 45000, currency: 'TZS', image: null, slug: 'business-proposal-template', desc: 'Winning business proposal template.' },
  { id: '4', name: 'Social Media Graphics Pack', category: 'Assets', price: 25000, currency: 'TZS', image: null, slug: 'social-media-graphics', desc: '50+ social media graphic templates.' },
  { id: '5', name: 'Icon Set - Business', category: 'Assets', price: 20000, currency: 'TZS', image: null, slug: 'business-icon-set', desc: '200 professional business icons.' },
  { id: '6', name: 'Presentation Deck', category: 'Templates', price: 40000, currency: 'TZS', image: null, slug: 'presentation-deck', desc: 'Professional presentation template.' },
  { id: '7', name: 'Digital Marketing Guide', category: 'Guides', price: 30000, currency: 'TZS', image: null, slug: 'digital-marketing-guide', desc: 'Complete digital marketing strategy guide.' },
  { id: '8', name: 'Brand Building eBook', category: 'Guides', price: 25000, currency: 'TZS', image: null, slug: 'brand-building-ebook', desc: 'Step-by-step brand building guide.' },
];

const categories = ['All', 'Templates', 'Assets', 'Guides'];

export default function StorePage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [products, setProducts] = useState(fallbackProducts);

  useEffect(() => {
    const fetchProducts = () => {
      publicApi.getStoreProducts().then((response) => {
        if (Array.isArray(response.data) && response.data.length > 0) {
          setProducts(response.data.map((product) => ({
            id: product.id,
            name: product.name,
            category: product.category,
            price: product.price,
            currency: product.currency,
            image: null,
            slug: product.slug,
            desc: product.description || '',
          })));
        } else if (Array.isArray(response.data) && response.data.length === 0) {
          setProducts([]);
        }
      }).catch((err) => console.error('Failed to fetch products:', err?.message));
    };
    fetchProducts();
    const onFocus = () => fetchProducts();
    const onVis = () => { if (!document.hidden) fetchProducts(); };
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVis);
    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);

  const filtered = activeCategory === 'All' ? products : products.filter((p) => p.category === activeCategory);

  return (
    <PublicLayout>
      <section className="section-padding bg-gradient-to-b from-primary-900 to-primary-800 text-white">
        <div className="container-custom text-center max-w-3xl">
          <span className="text-gold-500 font-semibold text-sm uppercase tracking-wider">Digital Store</span>
          <h1 className="text-4xl md:text-6xl font-bold mt-4 mb-6">Digital Products & Templates</h1>
          <p className="text-xl text-white/70">Professional templates, assets, and guides for your business.</p>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-custom">
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                  activeCategory === cat ? 'bg-gold-500 text-white shadow-lg' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filtered.map((product) => (
              <div key={product.slug} className="card overflow-hidden group">
                <Link href={`/store/${product.slug}`}>
                  <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <Download className="w-12 h-12 text-gray-400" />
                  </div>
                </Link>
                <div className="p-5">
                  <span className="text-xs text-gold-500 font-medium uppercase">{product.category}</span>
                  <Link href={`/store/${product.slug}`}>
                    <h3 className="font-semibold text-primary-900 mt-1 mb-1 group-hover:text-gold-500 transition-colors">
                      {product.name}
                    </h3>
                  </Link>
                  <p className="text-sm text-gray-500 mb-3 line-clamp-2">{product.desc}</p>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-primary-900">
                      {product.price.toLocaleString()} {product.currency}
                    </span>
                    <a href={whatsappLink(product.name)} target="_blank" rel="noopener noreferrer" className="btn-primary text-xs py-2 px-4 gap-1">
                      <MessageCircle className="w-3 h-3" /> Ask on WhatsApp
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
