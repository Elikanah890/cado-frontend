'use client';

import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/api';
import { slugify } from '@/lib/utils';
import { toast } from 'sonner';

export default function BlogCategoriesPage() {
  const [items, setItems] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const load = () => adminApi.getBlogCategories().then((response) => setItems(response.data || [])).catch(() => toast.error('Failed to load categories'));
  useEffect(() => { load(); }, []);
  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const data = { name, slug: slugify(name), description };
      if (editingId) await adminApi.updateBlogCategory(editingId, data);
      else await adminApi.createBlogCategory(data);
      setName(''); setDescription(''); setEditingId(null);
      await load();
      toast.success(editingId ? 'Category updated' : 'Category created');
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to save category');
    }
  };
  const remove = async (id: string) => {
    if (!confirm('Delete this category? This will detach it from posts.')) return;
    try {
      await adminApi.deleteBlogCategory(id);
      toast.success('Category deleted');
      await load();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to delete category — it may have linked posts');
    }
  };
  return <div><h1 className="text-2xl font-bold text-primary-900 mb-6">Blog Categories</h1><form onSubmit={save} className="card p-6 mb-6 flex flex-wrap gap-3"><input required value={name} onChange={(event) => setName(event.target.value)} placeholder="Category name" className="input-field flex-1" /><input value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Description" className="input-field flex-1" /><button className="btn-primary">{editingId ? 'Update Category' : 'Add Category'}</button></form><div className="grid gap-3">{items.map((item) => <div key={item.id} className="card p-4 flex items-center justify-between"><div><strong>{item.name}</strong><p className="text-sm text-gray-500">/{item.slug}</p></div><div className="flex gap-3"><button onClick={() => { setName(item.name); setDescription(item.description || ''); setEditingId(item.id); }} className="text-primary-700">Edit</button><button onClick={() => remove(item.id)} className="text-red-600">Delete</button></div></div>)}</div></div>;
}
