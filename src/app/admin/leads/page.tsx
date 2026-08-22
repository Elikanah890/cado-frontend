'use client';

import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/api';
import { toast } from 'sonner';
import { Pencil, Trash2 } from 'lucide-react';

export default function AdminLeadsPage() {
  const [data, setData] = useState<any>({ leads: [], pagination: {} });

  useEffect(() => {
    adminApi.getLeads().then((res) => setData(res.data)).catch(() => {});
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this lead?')) return;
    try {
      await adminApi.deleteLead(id);
      toast.success('Lead deleted');
      const updated = await adminApi.getLeads();
      setData(updated.data);
    } catch { toast.error('Failed'); }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-primary-900">Leads</h1>
        <p className="text-gray-500 mt-1">Manage contact form submissions and inquiries.</p>
      </div>
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Name</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Email</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Phone</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Service</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Status</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Date</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.leads.length === 0 ? (
                <tr><td colSpan={7} className="py-8 text-center text-gray-400">No leads yet</td></tr>
              ) : (
                data.leads.map((l: any) => (
                  <tr key={l.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-primary-900">{l.firstName} {l.lastName}</td>
                    <td className="py-3 px-4 text-gray-600">{l.email}</td>
                    <td className="py-3 px-4 text-gray-600">{l.phone || '-'}</td>
                    <td className="py-3 px-4 text-gray-600">{l.serviceNeeded || '-'}</td>
                    <td className="py-3 px-4">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        l.status === 'new' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>{l.status}</span>
                    </td>
                    <td className="py-3 px-4 text-xs text-gray-500">{new Date(l.createdAt).toLocaleDateString()}</td>
                    <td className="py-3 px-4">
                      <div className="flex gap-1">
                        <button className="p-1.5 hover:bg-gray-100 rounded" onClick={() => toast.info('Edit lead')}>
                          <Pencil className="w-3 h-3 text-gray-500" />
                        </button>
                        <button className="p-1.5 hover:bg-red-50 rounded" onClick={() => handleDelete(l.id)}>
                          <Trash2 className="w-3 h-3 text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
