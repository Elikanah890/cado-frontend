'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { X, Trash2, Upload, Loader2, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { adminApi } from '@/lib/api';
import { slugify } from '@/lib/utils';
import { resolveImageUrl } from '@/lib/imageUtils';
import RichTextEditor from './RichTextEditor';

type Tab = 'general' | 'content' | 'media' | 'tags-seo' | 'advanced';

const TABS: { id: Tab; label: string }[] = [
  { id: 'general', label: 'General' },
  { id: 'content', label: 'Content' },
  { id: 'media', label: 'Media' },
  { id: 'tags-seo', label: 'Tags & SEO' },
  { id: 'advanced', label: 'Advanced' },
];

interface FormState {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  galleryImages: string[];
  categoryId: string;
  authorName: string;
  tags: string[];
  status: string;
  publishedAt: string;
  scheduledAt: string;
  sortOrder: number;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  ogImage: string;
}

const emptyForm: FormState = {
  slug: '', title: '', excerpt: '', content: '', featuredImage: '',
  galleryImages: [], categoryId: '', authorName: '', tags: [],
  status: 'draft', publishedAt: '', scheduledAt: '', sortOrder: 0,
  metaTitle: '', metaDescription: '', metaKeywords: '', ogImage: '',
};

interface Props {
  initialData?: any;
  mode: 'create' | 'edit';
}

export default function BlogPostForm({ initialData, mode }: Props) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('general');
  const [form, setForm] = useState<FormState>(emptyForm);
  const [categories, setCategories] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [uploadingFeatured, setUploadingFeatured] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [dragOverFeatured, setDragOverFeatured] = useState(false);
  const featuredInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    adminApi.getBlogCategories().then((res) => setCategories(Array.isArray(res.data) ? res.data : [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (initialData && mode === 'edit') {
      setForm({
        slug: initialData.slug || '',
        title: initialData.title || '',
        excerpt: initialData.excerpt || '',
        content: initialData.content || '',
        featuredImage: initialData.featuredImage || '',
        galleryImages: Array.isArray(initialData.galleryImages) ? initialData.galleryImages.map((g: any) => typeof g === 'string' ? g : g.url || '') : [],
        categoryId: initialData.categoryId || '',
        authorName: initialData.authorName || '',
        tags: Array.isArray(initialData.tags) ? initialData.tags.filter((t: any) => t.tag).map((t: any) => t.tag.name) : [],
        status: initialData.status || 'draft',
        publishedAt: initialData.publishedAt ? new Date(initialData.publishedAt).toISOString().slice(0, 16) : '',
        scheduledAt: initialData.scheduledAt ? new Date(initialData.scheduledAt).toISOString().slice(0, 16) : '',
        sortOrder: initialData.sortOrder || 0,
        metaTitle: initialData.metaTitle || initialData.seo?.metaTitle || '',
        metaDescription: initialData.metaDescription || initialData.seo?.metaDescription || '',
        metaKeywords: initialData.metaKeywords || initialData.seo?.keywords || '',
        ogImage: initialData.ogImage || initialData.seo?.ogImage || '',
      });
    }
  }, [initialData, mode]);

  useEffect(() => {
    if (mode === 'create' && form.title && !initialData?.slug) {
      setForm((prev) => ({ ...prev, slug: slugify(prev.title) }));
    }
  }, [form.title, mode, initialData?.slug]);

  const handleChange = (field: keyof FormState, value: any) => setForm((prev) => ({ ...prev, [field]: value }));

  const addTag = () => {
    const v = tagInput.trim();
    if (!v || form.tags.includes(v)) { setTagInput(''); return; }
    handleChange('tags', [...form.tags, v]);
    setTagInput('');
  };

  const removeTag = (t: string) => handleChange('tags', form.tags.filter((tag) => tag !== t));

  const uploadSingleFile = async (file: File, folder: string = 'blog'): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);
    const res: any = await adminApi.uploadMedia(formData);
    const url = res?.data?.fileUrl || res?.data?.data?.fileUrl || res?.data?.url || res?.data?.data?.url || res?.fileUrl || res?.url || res?.data?.media?.fileUrl;
    if (!url) throw new Error('Upload failed: no URL returned');
    return url;
  };

  const handleFeaturedFiles = async (files: FileList | File[]) => {
    const file = Array.from(files)[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Only image files allowed'); return; }
    setUploadingFeatured(true);
    try {
      const url = await uploadSingleFile(file, 'blog');
      handleChange('featuredImage', url);
      toast.success('Featured image uploaded');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || 'Upload failed');
    } finally {
      setUploadingFeatured(false);
      if (featuredInputRef.current) featuredInputRef.current.value = '';
    }
  };

  const handleGalleryFiles = async (files: FileList | File[]) => {
    const validFiles = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (validFiles.length === 0) { toast.error('Only image files allowed'); return; }
    setUploadingGallery(true);
    try {
      const urls = await Promise.all(validFiles.map((f) => uploadSingleFile(f, 'blog')));
      handleChange('galleryImages', [...form.galleryImages, ...urls]);
      toast.success(`${validFiles.length} image(s) uploaded`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || 'Upload failed');
    } finally {
      setUploadingGallery(false);
      if (galleryInputRef.current) galleryInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error('Title is required'); setActiveTab('general'); return; }
    if (!form.slug.trim()) { toast.error('Slug is required'); setActiveTab('general'); return; }
    setSaving(true);
    try {
      const payload: any = {
        slug: slugify(form.slug || form.title),
        title: form.title.trim(),
        excerpt: form.excerpt.trim() || null,
        content: form.content || '',
        featuredImage: form.featuredImage.trim() || null,
        galleryImages: form.galleryImages,
        categoryId: form.categoryId || null,
        authorName: form.authorName.trim() || null,
        tags: form.tags,
        status: form.status,
        sortOrder: Number(form.sortOrder) || 0,
        metaTitle: form.metaTitle.trim() || null,
        metaDescription: form.metaDescription.trim() || null,
        metaKeywords: form.metaKeywords.trim() || null,
        ogImage: form.ogImage.trim() || null,
      };

      if (mode === 'edit' && initialData?.id) {
        payload.publishedAt = form.status === 'published'
          ? (initialData.publishedAt ? new Date(initialData.publishedAt).toISOString() : new Date().toISOString())
          : null;
        payload.scheduledAt = form.status === 'scheduled' && form.scheduledAt
          ? new Date(form.scheduledAt).toISOString()
          : null;
        await adminApi.updateBlogPost(initialData.id, payload);
        toast.success('Post updated');
      } else {
        payload.publishedAt = form.status === 'published' ? new Date().toISOString() : null;
        payload.scheduledAt = form.status === 'scheduled' && form.scheduledAt
          ? new Date(form.scheduledAt).toISOString()
          : null;
        await adminApi.createBlogPost(payload);
        toast.success('Post created');
      }
      router.push('/admin/blog');
      router.refresh();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to save post');
    } finally {
      setSaving(false);
    }
  };

  const readTimeFromContent = (html: string): number => {
    const text = html.replace(/<[^>]*>/g, '');
    const words = text.split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(words / 200));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="border-b border-gray-200 overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          {TABS.map((tab) => (
            <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                activeTab === tab.id ? 'border-gold-500 text-gold-600 bg-gold-50/50' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="card p-6">
        {activeTab === 'general' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input type="text" value={form.title} onChange={(e) => handleChange('title', e.target.value)} className="input-field" placeholder="Post title" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
                <input type="text" value={form.slug} onChange={(e) => handleChange('slug', e.target.value)} className="input-field" placeholder="auto-generated" />
                <p className="text-xs text-gray-400 mt-1">/blog/{form.slug || 'post-slug'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
                <input type="text" value={form.authorName} onChange={(e) => handleChange('authorName', e.target.value)} className="input-field" placeholder="Author name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select value={form.categoryId} onChange={(e) => handleChange('categoryId', e.target.value)} className="input-field">
                  <option value="">None</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select value={form.status} onChange={(e) => handleChange('status', e.target.value)} className="input-field">
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="scheduled">Scheduled</option>
                </select>
              </div>
              {form.status === 'scheduled' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Publish at</label>
                  <input type="datetime-local" value={form.scheduledAt} onChange={(e) => handleChange('scheduledAt', e.target.value)} className="input-field" />
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'content' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Excerpt</label>
              <textarea value={form.excerpt} onChange={(e) => handleChange('excerpt', e.target.value)} className="input-field" rows={3} placeholder="Short summary (shown in blog grid)" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">Content</label>
                <span className="text-xs text-gray-400">{readTimeFromContent(form.content)} min read</span>
              </div>
              <RichTextEditor value={form.content} onChange={(html) => handleChange('content', html)} placeholder="Start writing your post..." />
            </div>
          </div>
        )}

        {activeTab === 'media' && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Featured Image</label>
              <input ref={featuredInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files && handleFeaturedFiles(e.target.files)} />
              {!form.featuredImage ? (
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOverFeatured(true); }}
                  onDragLeave={() => setDragOverFeatured(false)}
                  onDrop={(e) => { e.preventDefault(); setDragOverFeatured(false); if (e.dataTransfer.files) handleFeaturedFiles(e.dataTransfer.files); }}
                  onClick={() => featuredInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${dragOverFeatured ? 'border-gold-500 bg-gold-50' : 'border-gray-200 hover:border-gold-300 hover:bg-gray-50'}`}
                >
                  <div className="flex flex-col items-center gap-3">
                    {uploadingFeatured ? <Loader2 className="w-10 h-10 text-gold-500 animate-spin" /> : <Upload className="w-10 h-10 text-gray-400" />}
                    <div>
                      <p className="text-sm font-semibold text-gray-700">{uploadingFeatured ? 'Uploading...' : 'Upload Featured Image'}</p>
                      <p className="text-xs text-gray-400 mt-1">Click or drag & drop (JPEG, PNG, WebP)</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative">
                    <img src={resolveImageUrl(form.featuredImage)} alt="Featured preview" className="w-full max-w-[400px] h-auto max-h-[300px] object-cover rounded-xl border mx-auto" />
                    {uploadingFeatured && <div className="absolute inset-0 bg-white/70 flex items-center justify-center rounded-xl"><Loader2 className="w-6 h-6 animate-spin text-gold-500" /> <span className="ml-2 text-sm">Uploading...</span></div>}
                  </div>
                  <div className="flex justify-center gap-3">
                    <button type="button" onClick={() => featuredInputRef.current?.click()} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium hover:bg-gray-50">Change</button>
                    <button type="button" onClick={() => handleChange('featuredImage', '')} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700"><Trash2 className="w-4 h-4" /> Remove</button>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Gallery Images</label>
              <input ref={galleryInputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => e.target.files && handleGalleryFiles(e.target.files)} />
              <button type="button" onClick={() => galleryInputRef.current?.click()} disabled={uploadingGallery}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium hover:bg-gray-50 disabled:opacity-50">
                {uploadingGallery ? <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</> : <><Plus className="w-4 h-4" /> Add Gallery Images</>}
              </button>
              {form.galleryImages.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mt-4">
                  {form.galleryImages.map((url, i) => (
                    <div key={i} className="relative group rounded-lg overflow-hidden border">
                      <img src={resolveImageUrl(url)} alt={`Gallery ${i + 1}`} className="w-full h-32 object-cover" />
                      <button type="button" onClick={() => handleChange('galleryImages', form.galleryImages.filter((_, idx) => idx !== i))}
                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'tags-seo' && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
              <div className="flex gap-2">
                <input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                  placeholder="Type tag and press Enter" className="input-field flex-1" />
                <button type="button" onClick={addTag} className="btn-secondary">Add</button>
              </div>
              {form.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {form.tags.map((t) => (
                    <span key={t} className="inline-flex items-center gap-1 bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-sm">
                      {t}
                      <button type="button" onClick={() => removeTag(t)} className="hover:text-red-600"><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="pt-4 border-t">
              <p className="text-sm font-medium text-gray-700 mb-3">SEO Settings</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Meta Title</label>
                  <input type="text" value={form.metaTitle} onChange={(e) => handleChange('metaTitle', e.target.value)} className="input-field" placeholder="SEO title" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Meta Description</label>
                  <textarea value={form.metaDescription} onChange={(e) => handleChange('metaDescription', e.target.value)} className="input-field" rows={3} placeholder="SEO description" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Keywords (comma separated)</label>
                  <input type="text" value={form.metaKeywords} onChange={(e) => handleChange('metaKeywords', e.target.value)} className="input-field" placeholder="keyword, keyword" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">OG Image URL</label>
                  <input type="url" value={form.ogImage} onChange={(e) => handleChange('ogImage', e.target.value)} className="input-field" placeholder="https://..." />
                  {form.ogImage && <img src={form.ogImage} alt="OG Preview" className="mt-3 w-full max-h-48 object-cover rounded-lg border" />}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'advanced' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
                <input type="number" value={form.sortOrder} onChange={(e) => handleChange('sortOrder', Number(e.target.value))} className="input-field" />
              </div>
              {initialData?.createdAt && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Created</label>
                  <input type="text" value={new Date(initialData.createdAt).toLocaleString()} disabled className="input-field bg-gray-100" />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? 'Saving...' : mode === 'edit' ? 'Update Post' : 'Create Post'}
        </button>
        <button type="button" onClick={() => router.push('/admin/blog')} className="btn-secondary">Cancel</button>
      </div>
    </form>
  );
}