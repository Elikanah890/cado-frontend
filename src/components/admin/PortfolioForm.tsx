'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { X, Plus, Trash2, Upload, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { adminApi } from '@/lib/api';
import { slugify } from '@/lib/utils';
import { resolveImageUrl } from '@/lib/imageUtils';

type Tab = 'general' | 'content' | 'media' | 'testimonial' | 'tech' | 'seo' | 'advanced';

const TABS: { id: Tab; label: string }[] = [
  { id: 'general', label: 'General' },
  { id: 'content', label: 'Content' },
  { id: 'media', label: 'Media' },
  { id: 'testimonial', label: 'Testimonial' },
  { id: 'tech', label: 'Tech Stack' },
  { id: 'seo', label: 'SEO' },
  { id: 'advanced', label: 'Advanced' },
];

export interface PortfolioFormData {
  slug: string;
  title: string;
  clientName: string;
  industry: string;
  category: string;
  projectUrl: string;
  status: 'COMPLETED' | 'IN_PROGRESS';
  completionDate: string;
  isFeatured: boolean;
  challenge: string;
  solution: string;
  results: string;
  featuredImage: string;
  galleryImages: { url: string; alt: string }[];
  videoUrl: string;
  clientTestimonial: { quote: string; author: string; role: string };
  techStack: string[];
  seo: { metaTitle: string; metaDescription: string; keywords: string; ogImage: string };
  sortOrder: number;
}

const emptyData: PortfolioFormData = {
  slug: '',
  title: '',
  clientName: '',
  industry: '',
  category: '',
  projectUrl: '',
  status: 'COMPLETED',
  completionDate: '',
  isFeatured: false,
  challenge: '',
  solution: '',
  results: '',
  featuredImage: '',
  galleryImages: [],
  videoUrl: '',
  clientTestimonial: { quote: '', author: '', role: '' },
  techStack: [],
  seo: { metaTitle: '', metaDescription: '', keywords: '', ogImage: '' },
  sortOrder: 0,
};

interface Props {
  initialData?: Partial<PortfolioFormData> & { id?: string; createdAt?: string; updatedAt?: string };
  mode: 'create' | 'edit';
}

export default function PortfolioForm({ initialData, mode }: Props) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('general');
  const [form, setForm] = useState<PortfolioFormData>(() => ({
    ...emptyData,
    ...initialData,
    galleryImages: Array.isArray((initialData as any)?.galleryImages) ? (initialData as any).galleryImages : [],
    techStack: initialData?.techStack || [],
    clientTestimonial: initialData?.clientTestimonial || emptyData.clientTestimonial,
    seo: initialData?.seo || emptyData.seo,
  } as PortfolioFormData));
  const [saving, setSaving] = useState(false);
  const [techInput, setTechInput] = useState('');
  const [uploadingFeatured, setUploadingFeatured] = useState(false);
  const [dragOverFeatured, setDragOverFeatured] = useState(false);
  const featuredInputRef = useRef<HTMLInputElement>(null);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [dragOverGallery, setDragOverGallery] = useState(false);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // Sync form when initialData loads (edit mode) — fixes preview not showing
  useEffect(() => {
    if (initialData && mode === 'edit') {
      setForm({
        ...emptyData,
        ...initialData,
        galleryImages: Array.isArray((initialData as any)?.galleryImages) ? (initialData as any).galleryImages : [],
        techStack: (initialData as any).techStack || [],
        clientTestimonial: (initialData as any).clientTestimonial || emptyData.clientTestimonial,
        seo: (initialData as any).seo || emptyData.seo,
      } as PortfolioFormData);
    }
  }, [initialData, mode]);

  // Auto-generate slug from title when creating
  useEffect(() => {
    if (mode === 'create' && form.title && !initialData?.slug) {
      setForm((prev) => ({ ...prev, slug: slugify(prev.title) }));
    }
  }, [form.title, mode, initialData?.slug]);

  const handleChange = (field: keyof PortfolioFormData, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSeoChange = (field: keyof PortfolioFormData['seo'], value: string) => {
    setForm((prev) => ({ ...prev, seo: { ...prev.seo, [field]: value } }));
  };

  const handleTestimonialChange = (field: keyof PortfolioFormData['clientTestimonial'], value: string) => {
    setForm((prev) => ({ ...prev, clientTestimonial: { ...prev.clientTestimonial, [field]: value } }));
  };

  const addTech = () => {
    const v = techInput.trim();
    if (!v) return;
    if (form.techStack.includes(v)) {
      setTechInput('');
      return;
    }
    handleChange('techStack', [...form.techStack, v]);
    setTechInput('');
  };

  const removeTech = (tech: string) => {
    handleChange('techStack', form.techStack.filter((t) => t !== tech));
  };

  const uploadSingleFile = async (file: File, folder: string = 'portfolio'): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);
    const res: any = await adminApi.uploadMedia(formData);
    // Backend returns { status, code, data: { fileUrl, fileName, ... } } — handle all shapes
    const url =
      res?.data?.fileUrl ||
      res?.data?.data?.fileUrl ||
      res?.data?.url ||
      res?.data?.data?.url ||
      res?.fileUrl ||
      res?.url ||
      res?.data?.media?.fileUrl;
    if (!url) {
      console.error('Upload response:', res);
      throw new Error('Upload failed: no URL returned');
    }
    return url;
  };

  const handleFeaturedFiles = async (files: FileList | File[]) => {
    const file = Array.from(files)[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Only image files are allowed');
      return;
    }
    setUploadingFeatured(true);
    try {
      const url = await uploadSingleFile(file, 'portfolio');
      handleChange('featuredImage', url);
      toast.success('Featured image uploaded');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Upload failed');
    } finally {
      setUploadingFeatured(false);
      if (featuredInputRef.current) featuredInputRef.current.value = '';
    }
  };

  const handleGalleryFiles = async (files: FileList | File[]) => {
    const imageFiles = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (imageFiles.length === 0) {
      toast.error('Only image files are allowed');
      return;
    }
    setUploadingGallery(true);
    try {
      const uploaded = await Promise.all(
        imageFiles.map(async (file) => {
          const url = await uploadSingleFile(file, 'portfolio/gallery');
          return { url, alt: file.name.replace(/\.[^.]+$/, '') };
        })
      );
      handleChange('galleryImages', [...form.galleryImages, ...uploaded]);
      toast.success(`${uploaded.length} image(s) uploaded`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Upload failed');
    } finally {
      setUploadingGallery(false);
      if (galleryInputRef.current) galleryInputRef.current.value = '';
    }
  };

  const removeGalleryImage = (index: number) => {
    handleChange('galleryImages', form.galleryImages.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error('Project Title is required');
      setActiveTab('general');
      return;
    }
    if (!form.slug.trim()) {
      toast.error('Slug is required');
      setActiveTab('general');
      return;
    }
    setSaving(true);
    try {
      const payload: any = {
        slug: slugify(form.slug || form.title),
        title: form.title.trim(),
        clientName: form.clientName.trim() || null,
        industry: form.industry.trim() || null,
        category: form.category.trim() || null,
        projectUrl: form.projectUrl.trim() || null,
        status: form.status,
        completionDate: form.completionDate || null,
        isFeatured: form.isFeatured,
        challenge: form.challenge.trim() || null,
        solution: form.solution.trim() || null,
        results: form.results.trim() || null,
        featuredImage: form.featuredImage.trim() ? form.featuredImage.trim() : null,
        galleryImages: form.galleryImages.length > 0 ? form.galleryImages : null,
        videoUrl: form.videoUrl.trim() || null,
        clientTestimonial: form.clientTestimonial.quote.trim() ? form.clientTestimonial : null,
        techStack: form.techStack,
        seo: form.seo.metaTitle || form.seo.metaDescription || form.seo.keywords || form.seo.ogImage ? form.seo : null,
        sortOrder: Number(form.sortOrder) || 0,
      };
      if (mode === 'edit' && initialData?.id) {
        await adminApi.updatePortfolio(initialData.id, payload);
        toast.success('Project updated');
      } else {
        await adminApi.createPortfolio(payload);
        toast.success('Project created');
      }
      router.push('/admin/portfolio');
      router.refresh();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to save project');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Tabs */}
      <div className="border-b border-gray-200 overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'border-gold-500 text-gold-600 bg-gold-50/50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="card p-6">
        {activeTab === 'general' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Title *</label>
                <input type="text" value={form.title} onChange={(e) => handleChange('title', e.target.value)} className="input-field" placeholder="e.g., Tourism Booking Platform" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
                <input type="text" value={form.slug} onChange={(e) => handleChange('slug', e.target.value)} className="input-field" placeholder="auto-generated from title" />
                <p className="text-xs text-gray-400 mt-1">Auto-generated, editable. Used in URL: /portfolio/{form.slug || 'slug'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Client Name</label>
                <input type="text" value={form.clientName} onChange={(e) => handleChange('clientName', e.target.value)} className="input-field" placeholder="Safari Adventures Ltd" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                <input type="text" value={form.industry} onChange={(e) => handleChange('industry', e.target.value)} className="input-field" placeholder="Tourism" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select value={form.status} onChange={(e) => handleChange('status', e.target.value as any)} className="input-field">
                  <option value="COMPLETED">Completed</option>
                  <option value="IN_PROGRESS">In Progress</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Completion Date</label>
                <input type="date" value={form.completionDate ? form.completionDate.slice(0, 10) : ''} onChange={(e) => handleChange('completionDate', e.target.value)} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category <span className="text-gray-400 font-normal">(type anything)</span></label>
                <input type="text" value={form.category} onChange={(e) => handleChange('category', e.target.value)} className="input-field" placeholder="e.g., Websites, Branding, Mobile App" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project URL</label>
                <input type="url" value={form.projectUrl} onChange={(e) => handleChange('projectUrl', e.target.value)} className="input-field" placeholder="https://www.project.com" />
              </div>
            </div>
            <label className="flex items-center gap-2 pt-2">
              <input type="checkbox" checked={form.isFeatured} onChange={(e) => handleChange('isFeatured', e.target.checked)} />
              <span className="text-sm text-gray-700">Featured (show on homepage)</span>
            </label>
          </div>
        )}

        {activeTab === 'content' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Challenge</label>
              <textarea value={form.challenge} onChange={(e) => handleChange('challenge', e.target.value)} className="input-field" rows={5} placeholder="Describe the client's challenge..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Solution</label>
              <textarea value={form.solution} onChange={(e) => handleChange('solution', e.target.value)} className="input-field" rows={5} placeholder="Describe your solution..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Results</label>
              <textarea value={form.results} onChange={(e) => handleChange('results', e.target.value)} className="input-field" rows={5} placeholder="Describe the results / outcomes..." />
            </div>
          </div>
        )}

        {activeTab === 'media' && (
          <div className="space-y-6">
            {/* Featured Image - Single Image Only */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Project Image (Featured)</label>
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
                      <p className="text-sm font-semibold text-gray-700">{uploadingFeatured ? 'Uploading...' : '📤 Upload Featured Image'}</p>
                      <p className="text-xs text-gray-400 mt-1">Click or drag & drop (max 5MB - JPEG, PNG, WebP, GIF)</p>
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
                    <button type="button" onClick={() => featuredInputRef.current?.click()} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium hover:bg-gray-50">
                      🔄 Change Image
                    </button>
                    <button type="button" onClick={() => handleChange('featuredImage', '')} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700">
                      <Trash2 className="w-4 h-4" /> Remove Image
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Gallery Images</label>
              <input ref={galleryInputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={(e) => e.target.files && handleGalleryFiles(e.target.files)} />
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOverGallery(true); }}
                onDragLeave={() => setDragOverGallery(false)}
                onDrop={(e) => { e.preventDefault(); setDragOverGallery(false); if (e.dataTransfer.files) handleGalleryFiles(e.dataTransfer.files); }}
                onClick={() => galleryInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${dragOverGallery ? 'border-gold-500 bg-gold-50' : 'border-gray-200 hover:border-gold-300 hover:bg-gray-50'}`}
              >
                <div className="flex flex-col items-center gap-2">
                  {uploadingGallery ? <Loader2 className="w-8 h-8 text-gold-500 animate-spin" /> : <Upload className="w-8 h-8 text-gray-400" />}
                  <div>
                    <p className="text-sm font-semibold text-gray-700">{uploadingGallery ? 'Uploading...' : '📤 Upload Gallery Images'}</p>
                    <p className="text-xs text-gray-400 mt-1">Click or drag & drop multiple images (JPEG, PNG, WEBP)</p>
                  </div>
                </div>
              </div>
              {form.galleryImages.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-4">
                  {form.galleryImages.map((img, i) => (
                    <div key={i} className="relative group rounded-lg overflow-hidden border">
                      <img src={resolveImageUrl(img.url)} alt={img.alt} className="w-full h-28 object-cover" />
                      <button type="button" onClick={() => removeGalleryImage(i)} className="absolute top-1.5 right-1.5 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Video URL (YouTube/Vimeo)</label>
              <input type="url" value={form.videoUrl} onChange={(e) => handleChange('videoUrl', e.target.value)} className="input-field" placeholder="https://www.youtube.com/embed/..." />
              <p className="text-xs text-gray-400 mt-1">Paste YouTube/Vimeo embed URL — keep as text, no upload needed.</p>
            </div>
          </div>
        )}

        {activeTab === 'testimonial' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Client Quote</label>
              <textarea value={form.clientTestimonial.quote} onChange={(e) => handleTestimonialChange('quote', e.target.value)} className="input-field" rows={4} placeholder="“CadorDigital delivered beyond our expectations...”" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Client Name (Author)</label>
                <input type="text" value={form.clientTestimonial.author} onChange={(e) => handleTestimonialChange('author', e.target.value)} className="input-field" placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Client Role / Title</label>
                <input type="text" value={form.clientTestimonial.role} onChange={(e) => handleTestimonialChange('role', e.target.value)} className="input-field" placeholder="CEO, Safari Adventures" />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tech' && (
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Tech Stack</label>
            <div className="flex gap-2">
              <input type="text" value={techInput} onChange={(e) => setTechInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTech(); } }} placeholder="Type tech and press Enter" className="input-field flex-1" />
              <button type="button" onClick={addTech} className="btn-secondary">Add</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {form.techStack.length === 0 ? (
                <p className="text-sm text-gray-400">No technologies added. Type a tech (e.g., Next.js) and press Enter.</p>
              ) : (
                form.techStack.map((tech) => (
                  <span key={tech} className="inline-flex items-center gap-1 bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-sm">
                    {tech}
                    <button type="button" onClick={() => removeTech(tech)} className="hover:text-red-600"><X className="w-3 h-3" /></button>
                  </span>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'seo' && (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">SEO settings for search engines and social sharing.</p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Meta Title</label>
              <input type="text" value={form.seo.metaTitle} onChange={(e) => handleSeoChange('metaTitle', e.target.value)} className="input-field" placeholder="Custom meta title" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Meta Description</label>
              <textarea value={form.seo.metaDescription} onChange={(e) => handleSeoChange('metaDescription', e.target.value)} className="input-field" rows={3} placeholder="Custom meta description" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Keywords (comma separated)</label>
              <input type="text" value={form.seo.keywords} onChange={(e) => handleSeoChange('keywords', e.target.value)} className="input-field" placeholder="portfolio, web design, branding" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">OG Image URL</label>
              <input type="url" value={form.seo.ogImage} onChange={(e) => handleSeoChange('ogImage', e.target.value)} className="input-field" placeholder="https://..." />
              {form.seo.ogImage && <img src={form.seo.ogImage} alt="OG Preview" className="mt-3 w-full max-h-48 object-cover rounded-lg border" />}
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                <input type="text" value={form.slug} onChange={(e) => handleChange('slug', e.target.value)} className="input-field" />
              </div>
            </div>
            {initialData?.createdAt && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Created At</label>
                  <input type="text" value={new Date(initialData.createdAt).toLocaleString()} disabled className="input-field bg-gray-100" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Updated At</label>
                  <input type="text" value={initialData.updatedAt ? new Date(initialData.updatedAt).toLocaleString() : ''} disabled className="input-field bg-gray-100" />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? 'Saving...' : mode === 'edit' ? 'Update Project' : 'Create Project'}
        </button>
        <button type="button" onClick={() => router.push('/admin/portfolio')} className="btn-secondary">
          Cancel
        </button>
      </div>
    </form>
  );
}
