'use client';

import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, Star } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { toast } from 'sonner';

export default function AdminTestimonialsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ clientName: '', clientCompany: '', content: '', rating: 5, isFeatured: false });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try { const res = await adminApi.getTestimonials(); setItems(Array.isArray(res.data) ? res.data : []); } catch { toast.error('Failed to load'); } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm({ clientName: '', clientCompany: '', content: '', rating: 5, isFeatured: false }); setEditingId(null); setShowForm(true); };

  const openEdit = (item: any) => {
    setForm({ clientName: item.clientName || '', clientCompany: item.clientCompany || '', content: item.content || '', rating: item.rating || 5, isFeatured: item.isFeatured || false });
    setEditingId(item.id); setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      const payload = { ...form, rating: Number(form.rating) };
      if (editingId) { await adminApi.updateTestimonial(editingId, payload); toast.success('Updated'); }
      else { await adminApi.createTestimonial(payload); toast.success('Created'); }
      setShowForm(false); load();
    } catch { toast.error('Failed to save'); } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this testimonial?')) return;
    try { await adminApi.deleteTestimonial(id); toast.success('Deleted'); load(); } catch { toast.error('Failed'); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div><h1 className="text-2xl font-bold text-primary-900">Testimonials</h1><p className="text-gray-500 mt-1">Manage client testimonials.</p></div>
        <button className="btn-primary gap-2" onClick={openCreate}><Plus className="w-4 h-4" /> Add Testimonial</button>
      </div>

      {showForm && (
        <div className="card p-6 mb-8">
          <div className="flex items-center justify-between mb-4"><h2 className="text-lg font-bold">{editingId ? 'Edit' : 'New'} Testimonial</h2><button onClick={() => setShowForm(false)} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button></div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Client Name *</label><input type="text" value={form.clientName} onChange={(e) => setForm({ ...form, clientName: e.target.value })} className="input-field" required /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Company</label><input type="text" value={form.clientCompany} onChange={(e) => setForm({ ...form, clientCompany: e.target.value })} className="input-field" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Rating (1-5)</label><select value={form.rating} onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })} className="input-field">{[5,4,3,2,1].map((n) => <option key={n} value={n}>{n} Star{n > 1 ? 's' : ''}</option>)}</select></div>
            </div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Content *</label><textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} className="input-field" rows={4} required /></div>
            <label className="flex items-center gap-2"><input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} /><span className="text-sm">Featured</span></label>
            <div className="flex gap-3"><button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Save'}</button><button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button></div>
          </form>
        </div>
      )}

      {loading ? <p className="text-gray-500">Loading...</p> : items.length === 0 ? (
        <div className="card p-12 text-center"><p className="text-gray-400 text-lg">No testimonials yet.</p><button onClick={openCreate} className="btn-primary mt-4">Add your first testimonial</button></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item: any) => (
            <div key={item.id} className="card p-6">
              <div className="flex items-start justify-between mb-3">
                <div><h3 className="font-bold text-primary-900">{item.clientName}</h3>{item.clientCompany && <p className="text-xs text-gray-400">{item.clientCompany}</p>}</div>
                <div className="flex text-yellow-400">{Array.from({ length: item.rating || 5 }).map((_, i) => <Star key={i} className="w-3 h-3 fill-current" />)}</div>
              </div>
              <p className="text-sm text-gray-600 mb-4 line-clamp-3">&ldquo;{item.content}&rdquo;</p>
              <div className="flex gap-2">
                <button className="flex-1 flex items-center justify-center gap-1 text-sm py-2 rounded-lg border border-gray-200 hover:bg-gray-50" onClick={() => openEdit(item)}><Pencil className="w-3 h-3" /> Edit</button>
                <button className="flex items-center justify-center gap-1 text-sm py-2 px-3 rounded-lg border border-red-200 text-red-600 hover:bg-red-50" onClick={() => handleDelete(item.id)}><Trash2 className="w-3 h-3" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
