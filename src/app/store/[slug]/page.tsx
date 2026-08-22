'use client';

import Link from 'next/link';
import { use } from 'react';
import { MessageCircle, Download, Check } from 'lucide-react';
import PublicLayout from '@/components/PublicLayout';
import { publicApi } from '@/lib/api';
import { whatsappLink } from '@/lib/utils';
import { useEffect, useState } from 'react';

const productData: Record<string, any> = {
  'company-profile-template': { name: 'Company Profile Template', price: 50000, currency: 'TZS', category: 'Templates', desc: 'Professional company profile template designed for Tanzanian businesses. Includes 20+ pages with modern layouts, charts, and infographics.', features: ['20+ Page Designs', 'Editable in Word & PowerPoint', 'Professional Charts', 'Photo Placeholders', 'Print Ready', 'Free Updates'], format: 'ZIP (Word + PPT)', size: '45 MB' },
  'business-document-template-pack': { name: 'Business Document Template Pack', price: 35000, currency: 'TZS', category: 'Templates', desc: 'A set of professional business document templates with clean, modern designs.', features: ['10 Unique Designs', 'Editable in Word', 'Professional Layouts', 'Print Friendly', 'A4 Format'], format: 'ZIP', size: '12 MB' },
};

export default function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [product, setProduct] = useState(productData[slug]);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    publicApi.getStoreProduct(slug).then((response) => {
      const item = response.data;
      setProduct({ name: item.name, price: item.price, currency: item.currency, category: item.category, desc: item.description || '', features: [], format: item.fileSize || '', size: item.fileSize || '' });
    }).catch(() => {}).finally(() => setLoaded(true));
  }, [slug]);
  if (!product && !loaded) return <PublicLayout><div className="section-padding text-center">Loading product...</div></PublicLayout>;

  if (!product) return <PublicLayout><div className="section-padding text-center"><h1 className="text-3xl font-bold">Product not found</h1><Link href="/store" className="btn-primary mt-4">Back to Store</Link></div></PublicLayout>;

  return (
    <PublicLayout>
      <section className="section-padding">
        <div className="container-custom max-w-5xl">
          <Link href="/store" className="text-gray-500 hover:text-gold-500 text-sm mb-6 inline-block">← Back to Store</Link>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center">
              <Download className="w-24 h-24 text-gray-400" />
            </div>
            <div>
              <span className="text-sm text-gold-500 font-medium uppercase">{product.category}</span>
              <h1 className="text-3xl md:text-4xl font-bold text-primary-900 mt-2 mb-4">{product.name}</h1>
              <div className="text-3xl font-bold text-gold-500 mb-6">{product.price.toLocaleString()} {product.currency}</div>
              <p className="text-gray-600 leading-relaxed mb-6">{product.desc}</p>
              <div className="grid grid-cols-2 gap-2 mb-6">
                <div className="text-sm text-gray-500"><span className="font-medium text-primary-900">Format:</span> {product.format}</div>
                <div className="text-sm text-gray-500"><span className="font-medium text-primary-900">File size:</span> {product.size}</div>
              </div>
              <h3 className="font-bold text-primary-900 mb-3">Features</h3>
              <ul className="space-y-2 mb-8">
                {product.features.map((f: string) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <div className="flex gap-4">
                <a href={whatsappLink(product.name)} target="_blank" rel="noopener noreferrer" className="btn-primary gap-2 flex-1 text-center">
                  <MessageCircle className="w-5 h-5" /> Ask on WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
