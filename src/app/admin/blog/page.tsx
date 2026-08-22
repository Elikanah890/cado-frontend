'use client';

import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { toast } from 'sonner';
import { slugify } from '@/lib/utils';

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'posts' | 'categories'>('posts');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ slug: '', title: '', excerpt: '', content: '', featuredImage: '', categoryId: '', authorName: '', status: 'draft' });
  const [catForm, setCatForm] = useState({ name: '', slug: '', description: '' });
  const [editCatId, setEditCatId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const loadPosts = async () => {
    try { const res = await adminApi.getBlogPosts(); setPosts(Array.isArray(res.data) ? res.data : []); } catch { toast.error('Failed to load posts'); } finally { setLoading(false); }
  };
  const loadCategories = async () => {
    try { const res = await adminApi.getBlogCategories(); setCategories(Array.isArray(res.data) ? res.data : []); } catch {}
  };

  useEffect(() => { loadPosts(); loadCategories(); }, []);

  const openCreatePost = () => {
    setForm({ slug: '', title: '', excerpt: '', content: '', featuredImage: '', categoryId: '', authorName: '', status: 'draft' });
    setEditingId(null); setShowForm(true);
  };

  const openEditPost = (p: any) => {
    setForm({ slug: p.slug || '', title: p.title || '', excerpt: p.excerpt || '', content: p.content || '', featuredImage: p.featuredImage || '', categoryId: p.categoryId || '', authorName: p.authorName || '', status: p.status || 'draft' });
    setEditingId(p.id); setShowForm(true);
  };

  const handleSubmitPost = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      const payload = { ...form, slug: slugify(form.title) };
      if (editingId) { await adminApi.updateBlogPost(editingId, payload); toast.success('Post updated'); }
      else { await adminApi.createBlogPost(payload); toast.success('Post created'); }
      setShowForm(false); loadPosts();
    } catch { toast.error('Failed to save'); } finally { setSaving(false); }
  };

  const handleDeletePost = async (id: string) => {
    if (!confirm('Delete this post?')) return;
    try { await adminApi.deleteBlogPost(id); toast.success('Deleted'); loadPosts(); } catch { toast.error('Failed'); }
  };

  const handleCatSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      const payload = { ...catForm, slug: slugify(catForm.name) };
      if (editCatId) { await adminApi.updateBlogCategory(editCatId, payload); toast.success('Category updated'); }
      else { await adminApi.createBlogCategory(payload); toast.success('Category created'); }
      setCatForm({ name: '', slug: '', description: '' }); setEditCatId(null); loadCategories();
    } catch { toast.error('Failed to save'); } finally { setSaving(false); }
  };

  const handleDeleteCat = async (id: string) => {
    if (!confirm('Delete this category?')) return;
    try { await adminApi.deleteBlogCategory(id); toast.success('Deleted'); loadCategories(); } catch { toast.error('Failed'); }
  };

  const editCat = (c: any) => { setCatForm({ name: c.name, slug: c.slug, description: c.description || '' }); setEditCatId(c.id); };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div><h1 className="text-2xl font-bold text-primary-900">Blog</h1><p className="text-gray-500 mt-1">Manage posts and categories.</p></div>
        {tab === 'posts' && <button className="btn-primary gap-2" onClick={openCreatePost}><Plus className="w-4 h-4" /> New Post</button>}
      </div>

      <div className="flex gap-4 mb-6">
        <button onClick={() => setTab('posts')} className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === 'posts' ? 'bg-primary-900 text-white' : 'bg-gray-100 text-gray-600'}`}>Posts</button>
        <button onClick={() => setTab('categories')} className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === 'categories' ? 'bg-primary-900 text-white' : 'bg-gray-100 text-gray-600'}`}>Categories</button>
      </div>

      {tab === 'posts' && showForm && (
        <div className="card p-6 mb-8">
          <div className="flex items-center justify-between mb-4"><h2 className="text-lg font-bold">{editingId ? 'Edit' : 'New'} Post</h2><button onClick={() => setShowForm(false)} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button></div>
          <form onSubmit={handleSubmitPost} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Title *</label><input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input-field" required /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Author</label><input type="text" value={form.authorName} onChange={(e) => setForm({ ...form, authorName: e.target.value })} className="input-field" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Category</label><select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className="input-field"><option value="">None</option>{categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Status</label><select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="input-field"><option value="draft">Draft</option><option value="published">Published</option></select></div>
            </div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Excerpt</label><textarea value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} className="input-field" rows={2} /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Content</label><textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} className="input-field" rows={6} /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Featured Image URL</label><input type="url" value={form.featuredImage} onChange={(e) => setForm({ ...form, featuredImage: e.target.value })} className="input-field" /></div>
            <div className="flex gap-3"><button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Save'}</button><button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button></div>
          </form>
        </div>
      )}

      {tab === 'categories' && (
        <div className="mb-8">
          <div className="card p-6 mb-6">
            <h2 className="text-lg font-bold mb-4">{editCatId ? 'Edit' : 'New'} Category</h2>
            <form onSubmit={handleCatSubmit} className="flex gap-3 items-end flex-wrap">
              <div className="flex-1 min-w-[200px]"><label className="block text-sm font-medium text-gray-700 mb-1">Name</label><input type="text" value={catForm.name} onChange={(e) => setCatForm({ ...catForm, name: e.target.value })} className="input-field" required /></div>
              <div className="flex-1 min-w-[200px]"><label className="block text-sm font-medium text-gray-700 mb-1">Description</label><input type="text" value={catForm.description} onChange={(e) => setCatForm({ ...catForm, description: e.target.value })} className="input-field" /></div>
              <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Save'}</button>
              {editCatId && <button type="button" onClick={() => { setCatForm({ name: '', slug: '', description: '' }); setEditCatId(null); }} className="btn-secondary">Cancel</button>}
            </form>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((c: any) => (
              <div key={c.id} className="card p-4 flex items-center justify-between">
                <div><p className="font-medium text-primary-900">{c.name}</p><p className="text-xs text-gray-400">/{c.slug}</p></div>
                <div className="flex gap-1">
                  <button onClick={() => editCat(c)} className="p-1.5 hover:bg-gray-100 rounded"><Pencil className="w-3 h-3" /></button>
                  <button onClick={() => handleDeleteCat(c.id)} className="p-1.5 hover:bg-red-50 rounded"><Trash2 className="w-3 h-3 text-red-500" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'posts' && (
        loading ? <p className="text-gray-500">Loading...</p> : posts.length === 0 ? (
          <div className="card p-12 text-center"><p className="text-gray-400 text-lg">No posts yet.</p><button onClick={openCreatePost} className="btn-primary mt-4">Write your first post</button></div>
        ) : (
          <div className="card overflow-hidden"><table className="w-full text-sm"><thead><tr className="border-b border-gray-200 bg-gray-50"><th className="text-left py-3 px-4 text-gray-500 font-medium">Title</th><th className="text-left py-3 px-4 text-gray-500 font-medium">Category</th><th className="text-left py-3 px-4 text-gray-500 font-medium">Status</th><th className="text-left py-3 px-4 text-gray-500 font-medium">Views</th><th className="text-left py-3 px-4 text-gray-500 font-medium">Date</th><th className="text-left py-3 px-4 text-gray-500 font-medium">Actions</th></tr></thead><tbody>{posts.map((p: any) => (<tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50"><td className="py-3 px-4 font-medium text-primary-900">{p.title}</td><td className="py-3 px-4 text-gray-600">{p.category?.name || '-'}</td><td className="py-3 px-4"><span className={`text-xs px-2 py-0.5 rounded-full ${p.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{p.status}</span></td><td className="py-3 px-4 text-gray-600">{p.views}</td><td className="py-3 px-4 text-xs text-gray-500">{new Date(p.createdAt).toLocaleDateString()}</td><td className="py-3 px-4"><div className="flex gap-1"><button onClick={() => openEditPost(p)} className="p-1.5 hover:bg-gray-100 rounded"><Pencil className="w-3 h-3" /></button><button onClick={() => handleDeletePost(p.id)} className="p-1.5 hover:bg-red-50 rounded"><Trash2 className="w-3 h-3 text-red-500" /></button></div></td></tr>))}</tbody></table></div>
        )
      )}
    </div>
  );
}
