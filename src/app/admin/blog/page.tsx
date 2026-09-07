'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { toast } from 'sonner';
import { formatDate } from '@/lib/utils';

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPosts = async () => {
    try { const res = await adminApi.getBlogPosts(); setPosts(Array.isArray(res.data) ? res.data : []); } catch { toast.error('Failed to load posts'); } finally { setLoading(false); }
  };

  useEffect(() => { loadPosts(); }, []);

  const handleDeletePost = async (id: string) => {
    if (!confirm('Delete this post?')) return;
    try { await adminApi.deleteBlogPost(id); toast.success('Deleted'); loadPosts(); } catch (e: any) { toast.error(e?.response?.data?.message || 'Failed to delete post'); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div><h1 className="text-2xl font-bold text-primary-900">Blog Posts</h1><p className="text-gray-500 mt-1">Manage your posts.</p></div>
        <Link href="/admin/blog/new" className="btn-primary gap-2"><Plus className="w-4 h-4" /> New Post</Link>
      </div>

      {loading ? <p className="text-gray-500">Loading...</p> : posts.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-gray-400 text-lg">No posts yet.</p>
          <Link href="/admin/blog/new" className="btn-primary mt-4">Write your first post</Link>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Title</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Category</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Status</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Views</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Date</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((p: any) => (
                <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <Link href={`/admin/blog/edit/${p.id}`} className="font-medium text-primary-900 hover:text-gold-600 transition-colors">{p.title}</Link>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{p.category?.name || '-'}</td>
                  <td className="py-3 px-4">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${p.status === 'published' ? 'bg-green-100 text-green-700' : p.status === 'scheduled' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>{p.status}</span>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{p.views}</td>
                  <td className="py-3 px-4 text-xs text-gray-500">{formatDate(p.publishedAt || p.createdAt)}</td>
                  <td className="py-3 px-4">
                    <div className="flex gap-1">
                      <Link href={`/admin/blog/edit/${p.id}`} className="p-1.5 hover:bg-gray-100 rounded text-gray-600"><Pencil className="w-3 h-3" /></Link>
                      <button onClick={() => handleDeletePost(p.id)} className="p-1.5 hover:bg-red-50 rounded text-red-500"><Trash2 className="w-3 h-3" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
