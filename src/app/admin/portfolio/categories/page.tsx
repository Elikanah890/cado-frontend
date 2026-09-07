'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Trash2, Tag, Briefcase } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { toast } from 'sonner';

interface CategoryItem {
  name: string;
  count: number;
}

export default function PortfolioCategoriesPage() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getPortfolioCategories();
      const data: CategoryItem[] = res.data || [];
      setCategories(data);
    } catch {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (name: string) => {
    if (!confirm(`Are you sure you want to delete the category '${name}'? This will remove it from all projects.`)) return;
    try {
      setDeleting(name);
      await adminApi.deletePortfolioCategory(name);
      toast.success(`Category '${name}' deleted`);
      await load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to delete category');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <Link href="/admin/portfolio" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gold-600">
          <ArrowLeft className="w-4 h-4" /> Back to Portfolio
        </Link>
        <h1 className="text-2xl font-bold text-primary-900 mt-2">Manage Portfolio Categories</h1>
        <p className="text-gray-500 mt-1">View all categories and remove those no longer needed. Projects remain, only the category is cleared.</p>
      </div>

      <div className="card p-6">
        <div className="flex items-center gap-2 mb-6">
          <Tag className="w-5 h-5 text-gold-500" />
          <h2 className="text-lg font-semibold text-primary-900">Categories ({categories.length})</h2>
        </div>

        {loading ? (
          <p className="text-gray-500">Loading categories...</p>
        ) : categories.length === 0 ? (
          <div className="text-center py-12">
            <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400">No categories found. Create a project with a category to see it here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left text-sm text-gray-500">
                  <th className="pb-3 font-medium">Category Name</th>
                  <th className="pb-3 font-medium">Projects Count</th>
                  <th className="pb-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => (
                  <tr key={cat.name} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="py-4">
                      <span className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-sm font-medium">
                        <Tag className="w-3 h-3" /> {cat.name}
                      </span>
                    </td>
                    <td className="py-4 text-sm text-gray-600">{cat.count} project{cat.count !== 1 ? 's' : ''}</td>
                    <td className="py-4 text-right">
                      <button
                        onClick={() => handleDelete(cat.name)}
                        disabled={deleting === cat.name}
                        className="inline-flex items-center gap-1 text-sm px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50"
                      >
                        <Trash2 className="w-3 h-3" /> {deleting === cat.name ? 'Deleting...' : 'Delete'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mt-6 card p-4 bg-blue-50 border-blue-100">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> Deleting a category does <strong>NOT</strong> delete projects. It only sets their <code className="bg-white px-1 rounded">category</code> field to <code className="bg-white px-1 rounded">null</code>. The projects remain in the portfolio.
        </p>
      </div>
    </div>
  );
}
