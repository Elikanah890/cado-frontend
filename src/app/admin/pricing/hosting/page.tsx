'use client';

import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, Star } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { toast } from 'sonner';
import { slugify, formatCurrency } from '@/lib/utils';

interface HostingForm {
  slug: string;
  name: string;
  price: number;
  billingPeriod: string;
  features: string[];
  isPopular: boolean;
  isActive: boolean;
  sortOrder: number;
}

const emptyForm: HostingForm = {
  slug: '',
  name: '',
  price: 0,
  billingPeriod: 'yearly',
  features: [],
  isPopular: false,
  isActive: true,
  sortOrder: 0,
};

export default function AdminHostingPlansPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<HostingForm>(emptyForm);
  const [featureInput, setFeatureInput] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const res = await adminApi.getHostingPlansAdmin();
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch { toast.error('Failed to load'); } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm(emptyForm); setEditingId(null); setShowForm(true); };
  const openEdit = (item: any) => {
    setForm({
      slug: item.slug || '',
      name: item.name || '',
      price: item.price || 0,
      billingPeriod: item.billingPeriod || 'yearly',
      features: Array.isArray(item.features) ? item.features : [],
      isPopular: !!item.isPopular,
      isActive: item.isActive ?? true,
      sortOrder: item.sortOrder || 0,
    });
    setEditingId(item.id);
    setShowForm(true);
  };

  const addFeature = () => {
    const v = featureInput.trim();
    if (!v) return;
    setForm({ ...form, features: [...form.features, v] });
    setFeatureInput('');
  };
  const removeFeature = (idx: number) => setForm({ ...form, features: form.features.filter((_, i) => i !== idx) });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, slug: slugify(form.name), price: Number(form.price), sortOrder: Number(form.sortOrder) };
      if (editingId) await adminApi.updateHostingPlan(editingId, payload);
      else await adminApi.createHostingPlan(payload);
      toast.success(editingId ? 'Updated' : 'Created');
      setShowForm(false);
      load();
    } catch (err: any) { toast.error(err?.response?.data?.message || 'Failed'); } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete?')) return;
    try { await adminApi.deleteHostingPlan(id); toast.success('Deleted'); load(); } catch { toast.error('Failed'); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div><h1 className="text-2xl font-bold text-primary-900">Hosting Plans</h1><p className="text-gray-500 mt-1">Manage Starter, Business, Ecommerce hosting.</p></div>
        <button onClick={openCreate} className="btn-primary gap-2 inline-flex items-center"><Plus className="w-4 h-4" /> Add Plan</button>
      </div>

      {showForm && (
        <div className="card p-6 mb-8">
          <div className="flex items-center justify-between mb-4"><h2 className="text-lg font-bold">{editingId ? 'Edit' : 'New'} Hosting Plan</h2><button onClick={() => setShowForm(false)} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button></div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium mb-1">Name *</label><input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" required /></div>
              <div><label className="block text-sm font-medium mb-1">Price (TZS)</label><input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} className="input-field" /></div>
              <div><label className="block text-sm font-medium mb-1">Period</label><select value={form.billingPeriod} onChange={(e) => setForm({ ...form, billingPeriod: e.target.value })} className="input-field"><option value="monthly">Monthly</option><option value="yearly">Yearly</option></select></div>
              <div><label className="block text-sm font-medium mb-1">Sort Order</label><input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} className="input-field" /></div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Features</label>
              <div className="flex gap-2 mb-2"><input type="text" value={featureInput} onChange={(e) => setFeatureInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addFeature(); } }} placeholder="Add feature" className="input-field flex-1" /><button type="button" onClick={addFeature} className="btn-secondary">Add</button></div>
              <div className="flex flex-wrap gap-2">{form.features.map((f, idx) => (<span key={idx} className="inline-flex items-center gap-1 bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-sm">{f} <button type="button" onClick={() => removeFeature(idx)}><X className="w-3 h-3" /></button></span>))}</div>
            </div>
            <div className="flex gap-6"><label className="flex items-center gap-2"><input type="checkbox" checked={form.isPopular} onChange={(e) => setForm({ ...form, isPopular: e.target.checked })} /> Most Popular</label><label className="flex items-center gap-2"><input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} /> Active</label></div>
            <div className="flex gap-3"><button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Save'}</button><button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button></div>
          </form>
        </div>
      )}

      {loading ? <p className="text-gray-500">Loading...</p> : items.length === 0 ? (
        <div className="card p-12 text-center"><p className="text-gray-400">No hosting plans.</p></div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="border-b bg-gray-50"><th className="text-left py-3 px-4">Name</th><th className="text-left py-3 px-4">Price</th><th className="text-left py-3 px-4">Period</th><th className="text-left py-3 px-4">Active</th><th className="text-right py-3 px-4">Actions</th></tr></thead>
            <tbody>
              {items.map((item: any) => (
                <tr key={item.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{item.name} {item.isPopular && <Star className="w-3 h-3 inline text-yellow-500 fill-yellow-500 ml-1" />}</td>
                  <td className="py-3 px-4">{formatCurrency(item.price)} <span className="text-xs text-gray-500">/{item.billingPeriod}</span></td>
                  <td className="py-3 px-4">{item.billingPeriod}</td>
                  <td className="py-3 px-4"><span className={`text-xs px-2 py-1 rounded-full ${item.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100'}`}>{item.isActive ? 'Active' : 'Inactive'}</span></td>
                  <td className="py-3 px-4 text-right flex justify-end gap-2"><button onClick={() => openEdit(item)} className="p-2 border rounded-lg hover:bg-gray-50"><Pencil className="w-4 h-4" /></button><button onClick={() => handleDelete(item.id)} className="p-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50"><Trash2 className="w-4 h-4" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
