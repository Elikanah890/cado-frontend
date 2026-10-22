'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import ProductForm from '@/components/admin/ProductForm';

export default function NewProductPage() {
  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/shop" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gold-600">
          <ArrowLeft className="w-4 h-4" /> Back to Shop
        </Link>
        <h1 className="text-2xl font-bold text-primary-900 mt-2">New Product</h1>
        <p className="text-gray-500 mt-1">Add a digital product to your shop.</p>
      </div>
      <ProductForm mode="create" />
    </div>
  );
}
