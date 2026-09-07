'use client';
import { useEffect, useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { publicApi } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';

interface CommentItem { id: string; name: string; content: string; createdAt: string; }

export default function BlogComments({ slug }: { slug: string }) {
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [form, setForm] = useState({ name: '', email: '', content: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    publicApi.getPostComments(slug).then((r) => setComments(Array.isArray((r as any).data) ? (r as any).data : [])).catch(() => {});
  }, [slug]);

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.content.trim()) { toast.error('Name and comment are required'); return; }
    setSubmitting(true);
    try {
      await publicApi.createComment(slug, { name: form.name.trim(), email: form.email.trim() || undefined, content: form.content.trim() });
      setForm({ name: '', email: '', content: '' });
      toast.success('Comment submitted for moderation');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to submit comment');
    } finally { setSubmitting(false); }
  };

  return (
    <section className="section-padding pb-12">
      <div className="container-custom max-w-4xl">
        <h2 className="text-2xl font-bold text-primary-900 mb-6 flex items-center gap-2"><MessageSquare className="w-6 h-6 text-gold-500" /> Comments ({comments.length})</h2>
        <form onSubmit={handle} className="card p-6 mb-8 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" className="input-field" required />
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email (optional)" className="input-field" />
          </div>
          <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="Write your comment..." className="input-field" rows={4} required />
          <button type="submit" disabled={submitting} className="btn-primary">{submitting ? 'Submitting...' : 'Post Comment'}</button>
          <p className="text-xs text-gray-400">Comments are moderated before appearing.</p>
        </form>
        {comments.length === 0 ? <p className="text-gray-400">No comments yet. Be the first to comment!</p> : <div className="space-y-4">{comments.map((c) => <div key={c.id} className="card p-5"><div className="flex items-center gap-2 mb-2"><span className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-sm font-bold text-primary-700">{c.name[0]?.toUpperCase()}</span><span className="font-semibold text-primary-900">{c.name}</span><span className="text-xs text-gray-400 ml-auto">{formatDate(c.createdAt)}</span></div><p className="text-gray-700 whitespace-pre-wrap text-sm">{c.content}</p></div>)}</div>}
      </div>
    </section>
  );
}
