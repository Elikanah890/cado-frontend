'use client';

import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { invalidateServicesCache } from '@/lib/api/services';
import { toast } from 'sonner';
import { slugify } from '@/lib/utils';
import type { Service } from '@/types/service';

interface ServiceForm {
  slug: string;
  name: string;
  description: string;
  overview: string;
  icon: string;
  startingPrice: number;
  isActive: boolean;
  sortOrder: number;
}

const emptyForm: ServiceForm = {
  slug: '',
  name: '',
  description: '',
  overview: '',
  icon: '',
  startingPrice: 0,
  isActive: true,
  sortOrder: 0,
};

const iconOptions = [
  { value: 'palette', label: 'Palette' },
  { value: 'globe', label: 'Globe' },
  { value: 'megaphone', label: 'Megaphone' },
  { value: 'cpu', label: 'CPU' },
  { value: 'briefcase', label: 'Briefcase' },
  { value: 'camera', label: 'Camera' },
  { value: 'building', label: 'Building' },
  { value: 'code', label: 'Code' },
  { value: 'bar-chart', label: 'Chart' },
];

function extractAdminServices(res: any): Service[] {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res.data)) return res.data;
  if (Array.isArray(res.data?.services)) return res.data.services;
  if (Array.isArray(res.services)) return res.services;
  return [];
}

export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ServiceForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  const loadServices = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getServices();
      setServices(extractAdminServices(res));
    } catch {
      toast.error('Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadServices(); }, []);

  const openCreate = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (s: Service) => {
    setForm({
      slug: s.slug || '',
      name: s.name || '',
      description: s.description || '',
      overview: s.overview || '',
      icon: s.icon || '',
      startingPrice: s.startingPrice || 0,
      isActive: s.isActive ?? true,
      sortOrder: s.sortOrder || 0,
    });
    setEditingId(s.id);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, slug: slugify(form.name) };
      if (editingId) {
        await adminApi.updateService(editingId, payload);
        toast.success('Service updated');
      } else {
        await adminApi.createService(payload);
        toast.success('Service created');
      }
      setShowForm(false);
      invalidateServicesCache();
      await loadServices();
    } catch {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this service?')) return;
    try {
      await adminApi.deleteService(id);
      toast.success('Service deleted');
      invalidateServicesCache();
      await loadServices();
    } catch {
      toast.error('Failed to delete');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-primary-900">Services</h1>
          <p className="text-gray-500 mt-1">Manage your services and packages.</p>
        </div>
        <button className="btn-primary gap-2" onClick={openCreate}>
          <Plus className="w-4 h-4" /> Add Service
        </button>
      </div>

      {showForm && (
        <div className="card p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">{editingId ? 'Edit Service' : 'New Service'}</h2>
            <button onClick={() => setShowForm(false)} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
                <select value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} className="input-field">
                  <option value="">Select icon</option>
                  {iconOptions.map((i) => <option key={i.value} value={i.value}>{i.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
                <input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} className="input-field" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field" rows={3} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Overview</label>
              <textarea value={form.overview} onChange={(e) => setForm({ ...form, overview: e.target.value })} className="input-field" rows={4} />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="isActive" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
              <label htmlFor="isActive" className="text-sm text-gray-700">Active (visible on website)</label>
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Save Service'}</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : services.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-gray-400 text-lg">No services yet.</p>
          <button onClick={openCreate} className="btn-primary mt-4">Create your first service</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((s) => (
            <div key={s.id} className="card p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-bold text-primary-900">{s.name}</h3>
                  <p className="text-xs text-gray-400 mt-1">/{s.slug}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${s.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {s.isActive ? 'Active' : 'Hidden'}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{s.description || 'No description'}</p>
              <div className="flex gap-2">
                <button className="flex-1 flex items-center justify-center gap-1 text-sm py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                  onClick={() => openEdit(s)}>
                  <Pencil className="w-3 h-3" /> Edit
                </button>
                <button className="flex items-center justify-center gap-1 text-sm py-2 px-3 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                  onClick={() => handleDelete(s.id)}>
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
