'use client';

import { useState, useEffect, useRef } from 'react';
import { Plus, Pencil, Trash2, X, Star, Upload, Loader2 } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { toast } from 'sonner';
import { resolveImageUrl } from '@/lib/imageUtils';

interface TestimonialForm {
  clientName: string;
  clientCompany: string;
  content: string;
  rating: number;
  clientAvatar: string;
  serviceId: string;
  sortOrder: number;
  isFeatured: boolean;
  isApproved: boolean;
}

const emptyForm: TestimonialForm = {
  clientName: '',
  clientCompany: '',
  content: '',
  rating: 5,
  clientAvatar: '',
  serviceId: '',
  sortOrder: 0,
  isFeatured: false,
  isApproved: true,
};

export default function AdminTestimonialsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<TestimonialForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    try {
      const res = await adminApi.getTestimonials();
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch { toast.error('Failed to load testimonials'); } finally { setLoading(false); }
  };

  const loadServices = async () => {
    try {
      const res = await adminApi.getServices();
      setServices(Array.isArray(res.data) ? res.data : []);
    } catch { /* non-fatal */ }
  };

  useEffect(() => { load(); loadServices(); }, []);

  const openCreate = () => { setForm(emptyForm); setEditingId(null); setShowForm(true); };

  const openEdit = (item: any) => {
    setForm({
      clientName: item.clientName || '',
      clientCompany: item.clientCompany || '',
      content: item.content || '',
      rating: item.rating || 5,
      clientAvatar: item.clientAvatar || '',
      serviceId: item.serviceId || '',
      sortOrder: item.sortOrder || 0,
      isFeatured: !!item.isFeatured,
      isApproved: item.isApproved ?? true,
    });
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleAvatarFile = async (files: FileList | File[]) => {
    const file = Array.from(files)[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Only image files are allowed'); return; }
    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'testimonials');
      const res: any = await adminApi.uploadMedia(formData);
      const url = res?.data?.fileUrl || res?.data?.data?.fileUrl || res?.data?.url || res?.data?.data?.url || res?.fileUrl || res?.url || res?.data?.media?.fileUrl;
      if (!url) throw new Error('No URL returned');
      setForm({ ...form, clientAvatar: url });
      toast.success('Avatar uploaded');
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploadingAvatar(false);
      if (avatarInputRef.current) avatarInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        clientName: form.clientName.trim(),
        clientCompany: form.clientCompany.trim() || null,
        content: form.content.trim(),
        rating: Number(form.rating),
        clientAvatar: form.clientAvatar.trim() || null,
        serviceId: form.serviceId || null,
        sortOrder: Number(form.sortOrder) || 0,
        isFeatured: form.isFeatured,
        isApproved: form.isApproved,
      };
      if (editingId) { await adminApi.updateTestimonial(editingId, payload); toast.success('Testimonial updated'); }
      else { await adminApi.createTestimonial(payload); toast.success('Testimonial created'); }
      setShowForm(false);
      load();
    } catch { toast.error('Failed to save'); } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this testimonial?')) return;
    try { await adminApi.deleteTestimonial(id); toast.success('Deleted'); load(); } catch { toast.error('Failed to delete'); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div><h1 className="text-2xl font-bold text-primary-900">Testimonials</h1><p className="text-gray-500 mt-1">Manage the client testimonials shown on the homepage and service pages.</p></div>
        <button className="btn-primary gap-2 inline-flex items-center" onClick={openCreate}><Plus className="w-4 h-4" /> Add Testimonial</button>
      </div>

      {showForm && (
        <div className="card p-6 mb-8">
          <div className="flex items-center justify-between mb-4"><h2 className="text-lg font-bold">{editingId ? 'Edit' : 'New'} Testimonial</h2><button onClick={() => setShowForm(false)} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button></div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Client Name *</label><input type="text" value={form.clientName} onChange={(e) => setForm({ ...form, clientName: e.target.value })} className="input-field" required /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Company / Role</label><input type="text" value={form.clientCompany} onChange={(e) => setForm({ ...form, clientCompany: e.target.value })} className="input-field" placeholder="Founder, Safari Adventures Ltd" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Rating (1-5)</label><select value={form.rating} onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })} className="input-field">{[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} Star{n > 1 ? 's' : ''}</option>)}</select></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Linked Service</label><select value={form.serviceId} onChange={(e) => setForm({ ...form, serviceId: e.target.value })} className="input-field"><option value="">— None —</option>{services.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label><input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} className="input-field" /></div>
            </div>

            <div><label className="block text-sm font-medium text-gray-700 mb-1">Quote *</label><textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} className="input-field" rows={4} required /></div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Client Profile Image (Avatar)</label>
              <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files && handleAvatarFile(e.target.files)} />
              {form.clientAvatar ? (
                <div className="flex items-center gap-3">
                  <img src={resolveImageUrl(form.clientAvatar)} alt="Avatar preview" className="w-16 h-16 rounded-full object-cover border" />
                  <div className="flex gap-2">
                    <button type="button" onClick={() => avatarInputRef.current?.click()} className="btn-secondary text-sm">Change</button>
                    <button type="button" onClick={() => setForm({ ...form, clientAvatar: '' })} className="btn-secondary text-sm text-red-600">Remove</button>
                  </div>
                </div>
              ) : (
                <button type="button" onClick={() => avatarInputRef.current?.click()} className="w-full border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:border-gold-300 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col items-center gap-1">
                    {uploadingAvatar ? <Loader2 className="w-6 h-6 text-gold-500 animate-spin" /> : <Upload className="w-6 h-6 text-gray-400" />}
                    <span className="text-sm text-gray-600">{uploadingAvatar ? 'Uploading...' : 'Upload avatar image'}</span>
                  </div>
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-6">
              <label className="flex items-center gap-2"><input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} /><span className="text-sm">Featured</span></label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={form.isApproved} onChange={(e) => setForm({ ...form, isApproved: e.target.checked })} /><span className="text-sm">Approved (visible on site)</span></label>
            </div>

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
                <div className="flex items-center gap-3 min-w-0">
                  {item.clientAvatar ? (
                    <img src={resolveImageUrl(item.clientAvatar)} alt={item.clientName} className="w-11 h-11 rounded-full object-cover shrink-0" />
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold shrink-0">{(item.clientName || '?')[0]?.toUpperCase()}</div>
                  )}
                  <div className="min-w-0">
                    <h3 className="font-bold text-primary-900 truncate">{item.clientName}</h3>
                    {item.clientCompany && <p className="text-xs text-gray-400 truncate">{item.clientCompany}</p>}
                  </div>
                </div>
                <div className="flex text-yellow-400 shrink-0">{Array.from({ length: item.rating || 5 }).map((_, i) => <Star key={i} className="w-3 h-3 fill-current" />)}</div>
              </div>
              <p className="text-sm text-gray-600 mb-4 line-clamp-3">&ldquo;{item.content}&rdquo;</p>
              <div className="flex flex-wrap gap-1.5 mb-4">
                {item.isFeatured && <span className="text-xs px-2 py-0.5 rounded-full bg-gold-100 text-gold-700 font-medium">Featured</span>}
                {item.isApproved ? <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">Approved</span> : <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">Pending</span>}
                {item.service && <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">{item.service.name}</span>}
              </div>
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
