'use client';

import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { toast } from 'sonner';
import { formatCurrency, slugify } from '@/lib/utils';

const levels = ['Beginner', 'Intermediate', 'Advanced'];

export default function AdminAcademyPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ slug: '', title: '', subtitle: '', description: '', instructorName: '', category: '', level: '', price: 0, estimatedHours: 0, thumbnail: '', isPublished: false, isFeatured: false });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try { const res = await adminApi.getCourses(); setItems(Array.isArray(res.data) ? res.data : []); } catch { toast.error('Failed to load'); } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm({ slug: '', title: '', subtitle: '', description: '', instructorName: '', category: '', level: '', price: 0, estimatedHours: 0, thumbnail: '', isPublished: false, isFeatured: false }); setEditingId(null); setShowForm(true); };

  const openEdit = (item: any) => {
    setForm({ slug: item.slug || '', title: item.title || '', subtitle: item.subtitle || '', description: item.description || '', instructorName: item.instructorName || '', category: item.category || '', level: item.level || '', price: item.price || 0, estimatedHours: item.estimatedHours || 0, thumbnail: item.thumbnail || '', isPublished: item.isPublished || false, isFeatured: item.isFeatured || false });
    setEditingId(item.id); setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      const payload = { ...form, slug: slugify(form.title), price: Number(form.price), estimatedHours: Number(form.estimatedHours) };
      if (editingId) { await adminApi.updateCourse(editingId, payload); toast.success('Updated'); }
      else { await adminApi.createCourse(payload); toast.success('Created'); }
      setShowForm(false); load();
    } catch { toast.error('Failed to save'); } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this course?')) return;
    try { await adminApi.deleteCourse(id); toast.success('Deleted'); load(); } catch { toast.error('Failed'); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div><h1 className="text-2xl font-bold text-primary-900">Academy</h1><p className="text-gray-500 mt-1">Manage courses.</p></div>
        <button className="btn-primary gap-2" onClick={openCreate}><Plus className="w-4 h-4" /> Add Course</button>
      </div>

      {showForm && (
        <div className="card p-6 mb-8">
          <div className="flex items-center justify-between mb-4"><h2 className="text-lg font-bold">{editingId ? 'Edit' : 'New'} Course</h2><button onClick={() => setShowForm(false)} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button></div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Title *</label><input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input-field" required /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Instructor</label><input type="text" value={form.instructorName} onChange={(e) => setForm({ ...form, instructorName: e.target.value })} className="input-field" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Level</label><select value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })} className="input-field"><option value="">Select</option>{levels.map((l) => <option key={l} value={l}>{l}</option>)}</select></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Price (TZS)</label><input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} className="input-field" required /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Hours</label><input type="number" value={form.estimatedHours} onChange={(e) => setForm({ ...form, estimatedHours: Number(e.target.value) })} className="input-field" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Thumbnail URL</label><input type="url" value={form.thumbnail} onChange={(e) => setForm({ ...form, thumbnail: e.target.value })} className="input-field" /></div>
            </div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Description</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field" rows={3} /></div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2"><input type="checkbox" checked={form.isPublished} onChange={(e) => setForm({ ...form, isPublished: e.target.checked })} /><span className="text-sm">Published</span></label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} /><span className="text-sm">Featured</span></label>
            </div>
            <div className="flex gap-3"><button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Save'}</button><button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button></div>
          </form>
        </div>
      )}

      {loading ? <p className="text-gray-500">Loading...</p> : items.length === 0 ? (
        <div className="card p-12 text-center"><p className="text-gray-400 text-lg">No courses yet.</p><button onClick={openCreate} className="btn-primary mt-4">Create your first course</button></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item: any) => (
            <div key={item.id} className="card overflow-hidden">
              {item.thumbnail && <img src={item.thumbnail} alt={item.title} className="w-full h-40 object-cover" />}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2"><h3 className="font-bold text-primary-900">{item.title}</h3><span className={`text-xs px-2 py-1 rounded-full ${item.isPublished ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{item.isPublished ? 'Published' : 'Draft'}</span></div>
                <div className="flex gap-2 text-xs text-gray-400 mb-3">{item.level && <span>{item.level}</span>}{item.category && <span>| {item.category}</span>}{item.estimatedHours > 0 && <span>| {item.estimatedHours}h</span>}</div>
                <p className="text-lg font-bold text-gold-500 mb-3">{formatCurrency(item.price)}</p>
                <div className="flex gap-2">
                  <button className="flex-1 flex items-center justify-center gap-1 text-sm py-2 rounded-lg border border-gray-200 hover:bg-gray-50" onClick={() => openEdit(item)}><Pencil className="w-3 h-3" /> Edit</button>
                  <button className="flex items-center justify-center gap-1 text-sm py-2 px-3 rounded-lg border border-red-200 text-red-600 hover:bg-red-50" onClick={() => handleDelete(item.id)}><Trash2 className="w-3 h-3" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
