'use client';

import { useRef, useState } from 'react';
import { Upload, Loader2, Trash2, Video } from 'lucide-react';
import { toast } from 'sonner';
import { adminApi } from '@/lib/api';
import { resolveImageUrl } from '@/lib/imageUtils';

interface Props {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  label?: string;
  hint?: string;
  compact?: boolean;
}

export default function VideoUpload({ value, onChange, folder = 'course', label = 'Intro Video', hint = 'No size limit', compact = false }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const uploadFile = async (file: File) => {
    if (!file.type.startsWith('video/')) { toast.error('Only video files allowed'); return; }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);
      const res: any = await adminApi.uploadMedia(formData);
      const url = res?.data?.fileUrl || res?.data?.data?.fileUrl || res?.data?.url || res?.data?.data?.url || res?.fileUrl || res?.url || res?.data?.media?.fileUrl;
      if (!url) throw new Error('Upload failed: no URL returned');
      onChange(url);
      toast.success('Video uploaded');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || 'Upload failed');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const handleFiles = (files: FileList | File[]) => {
    const file = Array.from(files)[0];
    if (file) uploadFile(file);
  };

  if (compact) {
    return (
      <>
        <input ref={inputRef} type="file" accept="video/*" className="hidden" onChange={(e) => e.target.files && handleFiles(e.target.files)} />
        <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading} className="inline-flex w-full items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-primary-50 text-primary-700 text-sm font-medium cursor-pointer hover:bg-primary-100 disabled:opacity-50">
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Video className="w-4 h-4" />}
          {value ? 'Change' : 'Upload'}
        </button>
      </>
    );
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
        <Video className="w-4 h-4" /> {label}
      </label>
      <input ref={inputRef} type="file" accept="video/*" className="hidden" onChange={(e) => e.target.files && handleFiles(e.target.files)} />
      {!value ? (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files) handleFiles(e.dataTransfer.files); }}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${dragOver ? 'border-gold-500 bg-gold-50' : 'border-gray-300 hover:border-gold-300 hover:bg-gray-50'}`}
        >
          {uploading ? <Loader2 className="w-8 h-8 text-gold-500 animate-spin mx-auto" /> : <Upload className="w-8 h-8 text-gray-400 mx-auto" />}
          <p className="mt-2 text-sm font-medium text-gray-600">{uploading ? 'Uploading...' : 'Click or drag & drop to upload video'}</p>
          <p className="text-xs text-gray-400 mt-1">{hint}</p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="relative">
            <video src={resolveImageUrl(value)} controls className="w-full max-w-[480px] h-auto max-h-[300px] rounded-xl border bg-black" />
            {uploading && <div className="absolute inset-0 bg-white/70 flex items-center justify-center rounded-xl"><Loader2 className="w-6 h-6 animate-spin text-gold-500" /></div>}
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => inputRef.current?.click()} className="btn-secondary gap-1">
              <Video className="w-4 h-4" /> Change
            </button>
            <button type="button" onClick={() => onChange('')} className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-red-600 text-white text-sm hover:bg-red-700">
              <Trash2 className="w-4 h-4" /> Remove
            </button>
          </div>
        </div>
      )}
    </div>
  );
}