'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Package, Pencil, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { adminApi } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { resolveImageUrl } from '@/lib/imageUtils';

interface Product {
  id: string;
  title: string;
  slug: string;
  price: number;
  originalPrice?: number | null;
  currency: string;
  images: { url: string; alt?: string | null }[];
  isActive: boolean;
  sortOrder: number;
}

function mainImage(product: Product): string | null {
  if (!Array.isArray(product.images) || product.images.length === 0) return null;
  const image = product.images[0];
  return resolveImageUrl(typeof image === 'string' ? image : image?.url) || null;
}

export default function AdminShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const res = await adminApi.getProducts();
      setProducts(Array.isArray(res.data) ? res.data : []);
    } catch {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (product: Product) => {
    if (!confirm(`Delete "${product.title}"? This cannot be undone.`)) return;
    try {
      await adminApi.deleteProduct(product.id);
      toast.success('Product deleted');
      load();
    } catch {
      toast.error('Failed to delete product');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-primary-900">Shop</h1>
          <p className="text-gray-500 mt-1">Manage digital products and downloads.</p>
        </div>
        <Link href="/admin/shop/new" className="btn-primary gap-2 inline-flex items-center">
          <Plus className="w-4 h-4" /> Add New Product
        </Link>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : products.length === 0 ? (
        <div className="card p-12 text-center">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">No products yet.</p>
          <Link href="/admin/shop/new" className="btn-primary mt-4 inline-flex">Add your first product</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {products.map((product) => {
            const image = mainImage(product);
            return (
              <div key={product.id} className="card overflow-hidden">
                {image ? (
                  <div className="relative w-full h-48 overflow-hidden bg-gray-100">
                    <img src={image} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full scale-110 object-cover opacity-40 blur-2xl" />
                    <img src={image} alt={product.title} className="relative z-10 w-full h-full object-contain" />
                  </div>
                ) : (
                  <div className="w-full h-48 bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                    <Package className="w-10 h-10 text-primary-400" />
                  </div>
                )}

                <div className="p-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="font-bold text-primary-900 line-clamp-1">{product.title}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full shrink-0 ${product.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {product.isActive ? 'Active' : 'Hidden'}
                    </span>
                  </div>

                  {product.originalPrice && product.originalPrice > product.price ? (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-400 line-through">{formatCurrency(product.originalPrice, product.currency)}</span>
                      <span className="text-lg font-semibold text-gold-600">{formatCurrency(product.price, product.currency)}</span>
                    </div>
                  ) : (
                    <p className="text-lg font-semibold text-gold-600">{formatCurrency(product.price, product.currency)}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">{product.images?.length || 0} image(s)</p>

                  <div className="flex gap-2 mt-4">
                    <Link href={`/admin/shop/edit/${product.id}`} className="flex-1 flex items-center justify-center gap-1 text-sm py-2 rounded-lg border border-gray-200 hover:bg-gray-50">
                      <Pencil className="w-3 h-3" /> Edit
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDelete(product)}
                      className="flex items-center justify-center gap-1 text-sm py-2 px-3 rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
