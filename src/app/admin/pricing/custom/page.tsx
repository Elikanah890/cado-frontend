'use client';

import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { toast } from 'sonner';
import { slugify, formatCurrency } from '@/lib/utils';

interface CustomForm {
  slug: string;
  name: string;
  price: number;
  icon: string;
  sortOrder: number;
  isActive: boolean;
}

const emptyForm: CustomForm = {
  slug: '',
  name: '',
  price: 0,
  icon: '',
  sortOrder: 0,
  isActive: true,
};

const iconOptions = ['palette','globe','megaphone','cpu','briefcase','camera','building','code','bar-chart','star','zap'];

export default function AdminCustomServicesPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CustomForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const res = await adminApi.getCustomServices();
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch { toast.error('Failed'); } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm(emptyForm); setEditingId(null); setShowForm(true); };
  const openEdit = (item: any) => {
    setForm({ slug: item.slug || '', name: item.name || '', price: item.price || 0, icon: item.icon || '', sortOrder: item.sortOrder || 0, isActive: item.isActive ?? true });
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, slug: slugify(form.name), price: Number(form.price), sortOrder: Number(form.sortOrder) };
      if (editingId) await adminApi.updateCustomService(editingId, payload);
      else await adminApi.createCustomService(payload);
      toast.success(editingId ? 'Updated' : 'Created');
      setShowForm(false);
      load();
    } catch (err: any) { toast.error(err?.response?.data?.message || 'Failed'); } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete?')) return;
    try { await adminApi.deleteCustomService(id); toast.success('Deleted'); load(); } catch { toast.error('Failed'); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div><h1 className="text-2xl font-bold text-primary-900">Custom Services</h1><p className="text-gray-500 mt-1">Manage individual services like Logo Design, Landing Page etc.</p></div>
        <button onClick={openCreate} className="btn-primary gap-2 inline-flex items-center"><Plus className="w-4 h-4" /> Add Service</button>
      </div>

      {showForm && (
        <div className="card p-6 mb-8">
          <div className="flex items-center justify-between mb-4"><h2 className="text-lg font-bold">{editingId ? 'Edit' : 'New'} Custom Service</h2><button onClick={() => setShowForm(false)} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button></div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium mb-1">Name *</label><input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" required /></div>
              <div><label className="block text-sm font-medium mb-1">Price (TZS)</label><input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} className="input-field" /></div>
              <div><label className="block text-sm font-medium mb-1">Icon</label><select value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} className="input-field"><option value="">Select icon</option>{iconOptions.map((i) => <option key={i} value={i}>{i}</option>)}</select></div>
              <div><label className="block text-sm font-medium mb-1">Sort Order</label><input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} className="input-field" /></div>
            </div>
            <label className="flex items-center gap-2"><input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} /> <span className="text-sm">Active</span></label>
            <div className="flex gap-3"><button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Save'}</button><button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button></div>
          </form>
        </div>
      )}

      {loading ? <p className="text-gray-500">Loading...</p> : items.length === 0 ? (
        <div className="card p-12 text-center"><p className="text-gray-400">No custom services.</p></div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="border-b bg-gray-50"><th className="text-left py-3 px-4">Name</th><th className="text-left py-3 px-4">Price</th><th className="text-left py-3 px-4">Active</th><th className="text-right py-3 px-4">Actions</th></tr></thead>
            <tbody>
              {items.map((item: any) => (
                <tr key={item.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{item.name}</td>
                  <td className="py-3 px-4">{formatCurrency(item.price)}</td>
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
