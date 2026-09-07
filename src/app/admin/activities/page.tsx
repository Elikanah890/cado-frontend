'use client';

import { useState, useEffect } from 'react';
import { adminApi } from '@/lib/api';
import { toast } from 'sonner';
import { Trash2, Trash } from 'lucide-react';

export default function AdminActivitiesPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [clearing, setClearing] = useState(false);

  const load = async () => {
    try {
      const res = await adminApi.getActivities();
      setItems(res.data?.activities || []);
    } catch {
      toast.error('Failed to load');
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const getActionColor = (action: string) => {
    if (action.includes('Create')) return 'bg-green-100 text-green-700';
    if (action.includes('Update')) return 'bg-blue-100 text-blue-700';
    if (action.includes('Delete')) return 'bg-red-100 text-red-700';
    if (action.includes('Login')) return 'bg-purple-100 text-purple-700';
    if (action.includes('Upload')) return 'bg-yellow-100 text-yellow-700';
    return 'bg-gray-100 text-gray-700';
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this activity log?')) return;
    setDeletingId(id);
    try {
      await adminApi.deleteActivity(id);
      toast.success('Deleted');
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch { toast.error('Failed to delete'); } finally { setDeletingId(null); }
  };

  const handleClearAll = async () => {
    if (!confirm('Clear ALL activity logs? This cannot be undone.')) return;
    setClearing(true);
    try {
      await adminApi.clearActivities();
      toast.success('All activities cleared');
      setItems([]);
    } catch { toast.error('Failed to clear'); } finally { setClearing(false); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-primary-900">Activity Logs</h1>
          <p className="text-gray-500 mt-1">View all admin activities and actions.</p>
        </div>
        {items.length > 0 && (
          <button onClick={handleClearAll} disabled={clearing} className="btn-secondary gap-2 inline-flex items-center border-red-200 text-red-600 hover:bg-red-50">
            <Trash className="w-4 h-4" /> {clearing ? 'Clearing...' : 'Clear All'}
          </button>
        )}
      </div>

      {loading ? <p className="text-gray-500">Loading...</p> : items.length === 0 ? (
        <div className="card p-12 text-center"><p className="text-gray-400 text-lg">No activity logs yet.</p></div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Action</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Module</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Admin</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">IP Address</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Date</th>
                <th className="text-right py-3 px-4 text-gray-500 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item: any) => (
                <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getActionColor(item.action)}`}>{item.action}</span>
                  </td>
                  <td className="py-3 px-4 text-gray-600 capitalize">{item.module}</td>
                  <td className="py-3 px-4 text-gray-600">{item.admin?.email || `${item.admin?.firstName || ''} ${item.admin?.lastName || ''}`.trim() || '-'}</td>
                  <td className="py-3 px-4 text-xs text-gray-500 font-mono">{item.ipAddress || '-'}</td>
                  <td className="py-3 px-4 text-xs text-gray-500">{new Date(item.createdAt).toLocaleString()}</td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleDelete(item.id)}
                      disabled={deletingId === item.id}
                      className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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
