'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { adminApi } from '@/lib/api';
import ProductForm from '@/components/admin/ProductForm';
import { toast } from 'sonner';

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    adminApi.getProductById(id)
      .then((res) => {
        if (!mounted) return;
        setData({ ...res.data, id });
      })
      .catch(() => {
        if (!mounted) return;
        setError('Failed to load product');
        toast.error('Failed to load product');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, [id]);

  if (loading) return <div className="p-6"><p className="text-gray-500">Loading product...</p></div>;

  if (error || !data) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-500 mb-4">{error || 'Product not found'}</p>
        <Link href="/admin/shop" className="btn-primary">Back to Shop</Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/shop" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gold-600">
          <ArrowLeft className="w-4 h-4" /> Back to Shop
        </Link>
        <h1 className="text-2xl font-bold text-primary-900 mt-2">Edit Product</h1>
        <p className="text-gray-500 mt-1">Update product: {data.title}</p>
      </div>
      <ProductForm mode="edit" initialData={data} />
    </div>
  );
}
