'use client';

import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, Star } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { toast } from 'sonner';
import { slugify } from '@/lib/utils';

const categories = ['Web Development', 'Branding', 'Marketing', 'AI & Automation', 'Business Solutions', 'Creative', 'Registration'];

export default function AdminPortfolioPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ slug: '', title: '', clientName: '', industry: '', category: '', challenge: '', solution: '', results: '', featuredImage: '', isFeatured: false });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try { const res = await adminApi.getPortfolio(); setItems(Array.isArray(res.data) ? res.data : []); } catch { toast.error('Failed to load'); } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm({ slug: '', title: '', clientName: '', industry: '', category: '', challenge: '', solution: '', results: '', featuredImage: '', isFeatured: false }); setEditingId(null); setShowForm(true); };

  const openEdit = (item: any) => {
    setForm({ slug: item.slug || '', title: item.title || '', clientName: item.clientName || '', industry: item.industry || '', category: item.category || '', challenge: item.challenge || '', solution: item.solution || '', results: item.results || '', featuredImage: item.featuredImage || '', isFeatured: item.isFeatured || false });
    setEditingId(item.id); setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      const payload = { ...form, slug: slugify(form.title) };
      if (editingId) { await adminApi.updatePortfolio(editingId, payload); toast.success('Updated'); }
      else { await adminApi.createPortfolio(payload); toast.success('Created'); }
      setShowForm(false); load();
    } catch { toast.error('Failed to save'); } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this item?')) return;
    try { await adminApi.deletePortfolio(id); toast.success('Deleted'); load(); } catch { toast.error('Failed'); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div><h1 className="text-2xl font-bold text-primary-900">Portfolio</h1><p className="text-gray-500 mt-1">Manage your projects.</p></div>
        <button className="btn-primary gap-2" onClick={openCreate}><Plus className="w-4 h-4" /> Add Project</button>
      </div>

      {showForm && (
        <div className="card p-6 mb-8">
          <div className="flex items-center justify-between mb-4"><h2 className="text-lg font-bold">{editingId ? 'Edit' : 'New'} Project</h2><button onClick={() => setShowForm(false)} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button></div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Title *</label><input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input-field" required /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Client Name</label><input type="text" value={form.clientName} onChange={(e) => setForm({ ...form, clientName: e.target.value })} className="input-field" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Category</label><select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input-field" required><option value="">Select</option>{categories.map((c) => <option key={c} value={c}>{c}</option>)}</select></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Industry</label><input type="text" value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} className="input-field" /></div>
            </div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Challenge</label><textarea value={form.challenge} onChange={(e) => setForm({ ...form, challenge: e.target.value })} className="input-field" rows={3} /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Solution</label><textarea value={form.solution} onChange={(e) => setForm({ ...form, solution: e.target.value })} className="input-field" rows={3} /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Results</label><textarea value={form.results} onChange={(e) => setForm({ ...form, results: e.target.value })} className="input-field" rows={3} /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Featured Image URL</label><input type="url" value={form.featuredImage} onChange={(e) => setForm({ ...form, featuredImage: e.target.value })} className="input-field" /></div>
            <label className="flex items-center gap-2"><input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} /><span className="text-sm">Featured</span></label>
            <div className="flex gap-3"><button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Save'}</button><button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button></div>
          </form>
        </div>
      )}

      {loading ? <p className="text-gray-500">Loading...</p> : items.length === 0 ? (
        <div className="card p-12 text-center"><p className="text-gray-400 text-lg">No projects yet.</p><button onClick={openCreate} className="btn-primary mt-4">Add your first project</button></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item: any) => (
            <div key={item.id} className="card overflow-hidden">
              {item.featuredImage && <img src={item.featuredImage} alt={item.title} className="w-full h-48 object-cover" />}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2"><h3 className="font-bold text-primary-900">{item.title}</h3>{item.isFeatured && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />}</div>
                <p className="text-xs text-gray-500">{item.category}{item.clientName && ` | ${item.clientName}`}</p>
                <div className="flex gap-2 mt-3">
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
