'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Pencil, Trash2, Star, ExternalLink, Settings } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { toast } from 'sonner';
import { resolveImageUrl } from '@/lib/imageUtils';

export default function AdminPortfolioPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const res = await adminApi.getPortfolio();
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch {
      toast.error('Failed to load portfolio');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this project?')) return;
    try {
      await adminApi.deletePortfolio(id);
      toast.success('Project deleted');
      load();
    } catch {
      toast.error('Failed to delete');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-primary-900">Portfolio</h1>
          <p className="text-gray-500 mt-1">Manage your projects and categories.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/portfolio/categories" className="btn-secondary gap-2 inline-flex items-center">
            <Settings className="w-4 h-4" /> Manage Categories
          </Link>
          <Link href="/admin/portfolio/new" className="btn-primary gap-2 inline-flex items-center">
            <Plus className="w-4 h-4" /> Add Project
          </Link>
        </div>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : items.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-gray-400 text-lg">No projects yet.</p>
          <Link href="/admin/portfolio/new" className="btn-primary mt-4 inline-flex">Add your first project</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item: any) => (
            <div key={item.id} className="card overflow-hidden">
              {item.featuredImage ? (
                <div className="w-full h-48 md:h-56 overflow-hidden rounded-t-lg">
                  <img
                    src={resolveImageUrl(item.featuredImage)}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-full h-48 md:h-56 bg-gradient-to-br from-gray-800 to-gray-600 flex items-center justify-center rounded-t-lg">
                  <span className="text-white text-sm font-medium">No Image</span>
                </div>
              )}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-primary-900 line-clamp-1">{item.title}</h3>
                  {item.isFeatured && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 flex-shrink-0" />}
                </div>
                <p className="text-xs text-gray-500 flex items-center gap-2">
                  {item.category ? <span className="bg-primary-50 text-primary-600 px-2 py-0.5 rounded-full">{item.category}</span> : <span className="text-gray-400">No category</span>}
                  {item.status && <span className={`px-2 py-0.5 rounded-full text-xs ${item.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{item.status}</span>}
                </p>
                <p className="text-xs text-gray-400 mt-1 line-clamp-1">{item.clientName || 'No client'} {item.completionDate ? `• ${new Date(item.completionDate).toLocaleDateString()}` : ''}</p>
                {item.projectUrl && (
                  <a href={item.projectUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-gold-600 hover:text-gold-700 flex items-center gap-1 mt-2">
                    <ExternalLink className="w-3 h-3" /> {item.projectUrl}
                  </a>
                )}
                <div className="flex gap-2 mt-3">
                  <Link href={`/admin/portfolio/edit/${item.id}`} className="flex-1 flex items-center justify-center gap-1 text-sm py-2 rounded-lg border border-gray-200 hover:bg-gray-50">
                    <Pencil className="w-3 h-3" /> Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="flex items-center justify-center gap-1 text-sm py-2 px-3 rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
