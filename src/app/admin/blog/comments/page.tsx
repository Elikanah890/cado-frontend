'use client';

import { useEffect, useState } from 'react';
import { Check, Trash2 } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { toast } from 'sonner';
import { formatDate } from '@/lib/utils';

export default function AdminBlogCommentsPage() {
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    adminApi.getBlogComments()
      .then((res) => setComments(Array.isArray(res.data) ? res.data : []))
      .catch(() => toast.error('Failed to load comments'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const approve = async (id: string) => {
    try {
      await adminApi.approveBlogComment(id);
      toast.success('Comment approved');
      load();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to approve comment');
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this comment?')) return;
    try {
      await adminApi.deleteBlogComment(id);
      toast.success('Comment deleted');
      load();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to delete comment');
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-primary-900 mb-6">Blog Comments</h1>
      {loading ? <p className="text-gray-500">Loading...</p> : comments.length === 0 ? (
        <div className="card p-12 text-center"><p className="text-gray-400 text-lg">No comments yet.</p></div>
      ) : (
        <div className="space-y-4">
          {comments.map((c: any) => (
            <div key={c.id} className={`card p-5 ${!c.isApproved ? 'border-amber-300 ring-1 ring-amber-200' : ''}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-primary-900">{c.name}</span>
                  {c.email && <span className="text-sm text-gray-400">{c.email}</span>}
                  <span className="text-xs text-gray-400">{formatDate(c.createdAt)}</span>
                </div>
                <div className="flex items-center gap-2">
                  {!c.isApproved && <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">Pending</span>}
                  {!c.isApproved && (
                    <button onClick={() => approve(c.id)} className="p-1.5 hover:bg-green-50 rounded text-green-600" title="Approve">
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                  <button onClick={() => remove(c.id)} className="p-1.5 hover:bg-red-50 rounded text-red-500" title="Delete">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-gray-700 whitespace-pre-wrap">{c.content}</p>
              {c.post && <p className="text-xs text-gray-400 mt-2">on <span className="text-primary-700 font-medium">{c.post.title}</span></p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}