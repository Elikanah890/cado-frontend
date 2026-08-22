'use client';

import { useState, useEffect } from 'react';
import { adminApi } from '@/lib/api';
import { toast } from 'sonner';

export default function AdminActivitiesPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getActivities().then((res) => {
      setItems(res.data?.activities || []);
    }).catch(() => toast.error('Failed to load')).finally(() => setLoading(false));
  }, []);

  const getActionColor = (action: string) => {
    if (action.includes('Create')) return 'bg-green-100 text-green-700';
    if (action.includes('Update')) return 'bg-blue-100 text-blue-700';
    if (action.includes('Delete')) return 'bg-red-100 text-red-700';
    if (action.includes('Login')) return 'bg-purple-100 text-purple-700';
    if (action.includes('Upload')) return 'bg-yellow-100 text-yellow-700';
    return 'bg-gray-100 text-gray-700';
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-primary-900">Activity Logs</h1>
        <p className="text-gray-500 mt-1">View all admin activities and actions.</p>
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
              </tr>
            </thead>
            <tbody>
              {items.map((item: any) => (
                <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getActionColor(item.action)}`}>{item.action}</span>
                  </td>
                  <td className="py-3 px-4 text-gray-600 capitalize">{item.module}</td>
                  <td className="py-3 px-4 text-gray-600">{item.admin?.firstName} {item.admin?.lastName}</td>
                  <td className="py-3 px-4 text-xs text-gray-500 font-mono">{item.ipAddress || '-'}</td>
                  <td className="py-3 px-4 text-xs text-gray-500">{new Date(item.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
