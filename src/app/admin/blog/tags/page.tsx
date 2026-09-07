'use client';

import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/api';
import { slugify } from '@/lib/utils';
import { toast } from 'sonner';

export default function BlogTagsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const load = () => adminApi.getBlogTags().then((response) => setItems(response.data || [])).catch(() => toast.error('Failed to load tags'));
  useEffect(() => { load(); }, []);
  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const data = { name, slug: slugify(name) };
      if (editingId) await adminApi.updateBlogTag(editingId, data);
      else await adminApi.createBlogTag(data);
      setName(''); setEditingId(null);
      await load();
      toast.success(editingId ? 'Tag updated' : 'Tag created');
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to save tag');
    }
  };
  const remove = async (id: string) => {
    if (!confirm('Delete this tag?')) return;
    try {
      await adminApi.deleteBlogTag(id);
      toast.success('Tag deleted');
      await load();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to delete tag');
    }
  };
  return <div><h1 className="text-2xl font-bold text-primary-900 mb-6">Blog Tags</h1><form onSubmit={save} className="card p-6 mb-6 flex gap-3"><input required value={name} onChange={(event) => setName(event.target.value)} placeholder="Tag name" className="input-field flex-1" /><button className="btn-primary">{editingId ? 'Update Tag' : 'Add Tag'}</button></form><div className="grid gap-3">{items.map((item) => <div key={item.id} className="card p-4 flex items-center justify-between"><div><strong>{item.name}</strong><p className="text-sm text-gray-500">/{item.slug}</p></div><div className="flex gap-3"><button onClick={() => { setName(item.name); setEditingId(item.id); }} className="text-primary-700">Edit</button><button onClick={() => remove(item.id)} className="text-red-600">Delete</button></div></div>)}</div></div>;
}
