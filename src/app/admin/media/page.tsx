'use client';

import { useState, useEffect, useRef } from 'react';
import { Trash2, Upload, Image } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { toast } from 'sonner';

export default function AdminMediaPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    try { const res = await adminApi.getMedia(); setItems(Array.isArray(res.data) ? res.data : []); } catch { toast.error('Failed to load'); } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      await adminApi.uploadMedia(formData);
      toast.success('Uploaded');
      load();
    } catch { toast.error('Upload failed'); }
    finally { setUploading(false); if (fileInputRef.current) fileInputRef.current.value = ''; }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this file?')) return;
    try { await adminApi.deleteMedia(id); toast.success('Deleted'); load(); } catch { toast.error('Failed'); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div><h1 className="text-2xl font-bold text-primary-900">Media Library</h1><p className="text-gray-500 mt-1">Upload and manage media files.</p></div>
        <label className={`btn-primary gap-2 cursor-pointer ${uploading ? 'opacity-50' : ''}`}>
          <Upload className="w-4 h-4" /> {uploading ? 'Uploading...' : 'Upload File'}
          <input ref={fileInputRef} type="file" className="hidden" onChange={handleUpload} accept="image/*,video/*,.pdf,.doc,.docx" />
        </label>
      </div>

      {loading ? <p className="text-gray-500">Loading...</p> : items.length === 0 ? (
        <div className="card p-12 text-center"><Image className="w-16 h-16 text-gray-300 mx-auto mb-4" /><p className="text-gray-400 text-lg">No media files yet.</p><label className="btn-primary mt-4 inline-block cursor-pointer">Upload your first file<input type="file" className="hidden" onChange={handleUpload} accept="image/*,video/*,.pdf,.doc,.docx" /></label></div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {items.map((item: any) => (
            <div key={item.id} className="card overflow-hidden group">
              {item.fileType?.startsWith('image') ? (
                <img src={item.fileUrl} alt={item.fileName} className="w-full h-40 object-cover" />
              ) : (
                <div className="w-full h-40 bg-gray-100 flex items-center justify-center"><Image className="w-10 h-10 text-gray-300" /></div>
              )}
              <div className="p-2 flex items-center justify-between">
                <div className="truncate flex-1 mr-2"><p className="text-xs font-medium truncate">{item.fileName}</p><p className="text-xs text-gray-400">{item.fileSize || ''}</p></div>
                <button onClick={() => handleDelete(item.id)} className="p-1 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-3 h-3 text-red-500" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
