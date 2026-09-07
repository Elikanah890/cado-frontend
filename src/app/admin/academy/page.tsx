'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils';
import { resolveImageUrl } from '@/lib/imageUtils';

export default function AdminAcademyPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try { const res = await adminApi.getCourses(); setItems(Array.isArray(res.data) ? res.data : []); } catch { toast.error('Failed to load'); } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (item: any) => {
    if (!confirm(`Delete "${item.title}"? All its modules and lessons will also be deleted.`)) return;
    try { await adminApi.deleteCourse(item.id); toast.success('Deleted'); load(); } catch (e: any) { toast.error(e?.response?.data?.message || 'Failed to delete course'); }
  };

  const totalLessons = (item: any) =>
    Array.isArray(item.modules) ? item.modules.reduce((sum: number, m: any) => sum + (Array.isArray(m.lessons) ? m.lessons.length : 0), 0) : 0;

  const coverFor = (item: any) => {
    const u = item.thumbnail || item.featuredImage;
    return resolveImageUrl(u);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div><h1 className="text-2xl font-bold text-primary-900">Academy</h1><p className="text-gray-500 mt-1">Manage courses, modules, and lessons with lock/unlock.</p></div>
        <Link href="/admin/academy/new" className="btn-primary gap-2"><Plus className="w-4 h-4" /> Add Course</Link>
      </div>

      {loading ? <p className="text-gray-500">Loading...</p> : items.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-gray-400 text-lg">No courses yet.</p>
          <Link href="/admin/academy/new" className="btn-primary mt-4 inline-block">Create your first course</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item: any) => {
            const lessons = totalLessons(item);
            return (
              <div key={item.id} className="card overflow-hidden">
                {coverFor(item) ? (
                  <img src={coverFor(item)} alt={item.title} className="w-full h-40 object-cover" />
                ) : (
                  <div className="w-full h-40 bg-gradient-to-br from-primary-100 to-primary-200" />
                )}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-primary-900">{item.title}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${item.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{item.isActive ? 'Active' : 'Hidden'}</span>
                  </div>
                  <div className="flex gap-2 text-xs text-gray-400 mb-2 flex-wrap">
                    {item.level && <span>{item.level}</span>}
                    {item.category && <span>| {item.category}</span>}
                    {item.estimatedHours > 0 && <span>| {item.estimatedHours}h</span>}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mb-3 flex-wrap">
                    <span>{lessons} lessons</span>
                    <span>{Array.isArray(item.modules) ? item.modules.length : 0} modules</span>
                  </div>
                  <p className="text-lg font-bold text-gold-500 mb-3">{formatCurrency(item.price)}</p>
                  <div className="flex gap-2">
                    <Link href={`/admin/academy/edit/${item.id}`} className="flex-1 flex items-center justify-center gap-1 text-sm py-2 rounded-lg border border-gray-200 hover:bg-gray-50"><Pencil className="w-3 h-3" /> Edit</Link>
                    <button className="flex items-center justify-center gap-1 text-sm py-2 px-3 rounded-lg border border-red-200 text-red-600 hover:bg-red-50" onClick={() => handleDelete(item)}><Trash2 className="w-3 h-3" /></button>
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