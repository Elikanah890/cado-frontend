'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Plus, Save, Trash2, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { adminApi } from '@/lib/api';
import { slugify } from '@/lib/utils';
import { normalizePortraitImage } from '@/lib/portraitImage';
import PosterImage from '@/components/PosterImage';

interface ProductImage {
  url: string;
  alt: string;
}

interface ProductFormData {
  title: string;
  slug: string;
  description: string;
  price: string;
  originalPrice: string;
  currency: string;
  images: ProductImage[];
  isActive: boolean;
  sortOrder: string;
}

interface Props {
  initialData?: Partial<ProductFormData> & { id?: string; images?: any };
  mode: 'create' | 'edit';
}

const emptyData: ProductFormData = {
  title: '',
  slug: '',
  description: '',
  price: '',
  originalPrice: '',
  currency: 'TZS',
  images: [],
  isActive: true,
  sortOrder: '0',
};

function normalizeImages(value: any): ProductImage[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((image) => typeof image === 'string'
      ? { url: image, alt: '' }
      : { url: image?.url || '', alt: image?.alt || '' })
    .filter((image) => image.url);
}

export default function ProductForm({ initialData, mode }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<ProductFormData>(() => ({
    ...emptyData,
    ...initialData,
    price: initialData?.price !== undefined && initialData?.price !== null ? String(initialData.price) : '',
    originalPrice: initialData?.originalPrice !== undefined && initialData?.originalPrice !== null ? String(initialData.originalPrice) : '',
    sortOrder: initialData?.sortOrder !== undefined && initialData?.sortOrder !== null ? String(initialData.sortOrder) : '0',
    images: normalizeImages(initialData?.images),
  }));
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialData && mode === 'edit') {
      setForm({
        ...emptyData,
        ...initialData,
        price: initialData.price !== undefined && initialData.price !== null ? String(initialData.price) : '',
        originalPrice: initialData.originalPrice !== undefined && initialData.originalPrice !== null ? String(initialData.originalPrice) : '',
        sortOrder: initialData.sortOrder !== undefined && initialData.sortOrder !== null ? String(initialData.sortOrder) : '0',
        images: normalizeImages(initialData.images),
      });
    }
  }, [initialData, mode]);

  useEffect(() => {
    if (mode === 'create' && form.title && !initialData?.slug) {
      setForm((prev) => ({ ...prev, slug: slugify(prev.title) }));
    }
  }, [form.title, mode, initialData?.slug]);

  const handleChange = <K extends keyof ProductFormData>(key: K, value: ProductFormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const uploadSingleFile = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'shop');
    const res: any = await adminApi.uploadMedia(formData);
    const url = res?.data?.fileUrl
      || res?.data?.data?.fileUrl
      || res?.data?.url
      || res?.data?.data?.url
      || res?.fileUrl
      || res?.url
      || res?.data?.media?.fileUrl;
    if (!url) throw new Error('Upload failed: no URL returned');
    return url;
  };

  const handleImageFiles = async (files: FileList | File[]) => {
    const imageFiles = Array.from(files).filter((file) => file.type.startsWith('image/'));
    if (imageFiles.length === 0) {
      toast.error('Only image files are allowed');
      return;
    }

    setUploading(true);
    try {
      const uploaded = await Promise.all(
        imageFiles.map(async (file) => {
          const prepared = await normalizePortraitImage(file);
          const url = await uploadSingleFile(prepared);
          return { url, alt: form.title || file.name.replace(/\.[^.]+$/, '') };
        })
      );
      handleChange('images', [...form.images, ...uploaded]);
      toast.success(`${uploaded.length} image(s) uploaded`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || 'Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    handleChange('images', form.images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!form.title.trim()) {
      toast.error('Title is required');
      return;
    }
    if (!form.slug.trim()) {
      toast.error('Slug is required');
      return;
    }
    if (form.price === '' || Number.isNaN(Number(form.price)) || Number(form.price) < 0) {
      toast.error('Enter a valid price');
      return;
    }
    if (form.originalPrice !== '' && (Number.isNaN(Number(form.originalPrice)) || Number(form.originalPrice) < 0)) {
      toast.error('Enter a valid original price');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        slug: slugify(form.slug || form.title),
        description: form.description,
        price: Number(form.price),
        originalPrice: form.originalPrice.trim() === '' ? null : Number(form.originalPrice),
        currency: form.currency.trim() || 'TZS',
        images: form.images,
        isActive: form.isActive,
        sortOrder: Number(form.sortOrder) || 0,
      };

      if (mode === 'edit' && initialData?.id) {
        await adminApi.updateProduct(initialData.id, payload);
        toast.success('Product updated');
      } else {
        await adminApi.createProduct(payload);
        toast.success('Product created');
      }

      router.push('/admin/shop');
      router.refresh();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="card p-6 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={form.title}
              onChange={(event) => handleChange('title', event.target.value)}
              className="input-field"
              placeholder="Premium Social Media Templates"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
            <input
              type="text"
              value={form.slug}
              onChange={(event) => handleChange('slug', slugify(event.target.value))}
              className="input-field"
              placeholder="premium-social-media-templates"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={(event) => handleChange('price', event.target.value)}
              className="input-field"
              placeholder="25000"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Original Price (Optional)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.originalPrice}
              onChange={(event) => handleChange('originalPrice', event.target.value)}
              className="input-field"
              placeholder="35000"
            />
            <p className="text-xs text-gray-400 mt-1">Leave empty if there is no discount. This will show as a strikethrough price.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
            <input
              type="text"
              value={form.currency}
              onChange={(event) => handleChange('currency', event.target.value.toUpperCase())}
              className="input-field"
              placeholder="TZS"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
            <input
              type="number"
              value={form.sortOrder}
              onChange={(event) => handleChange('sortOrder', event.target.value)}
              className="input-field"
              placeholder="0"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            value={form.description}
            onChange={(event) => handleChange('description', event.target.value)}
            className="input-field"
            rows={7}
            placeholder="Describe what the buyer gets, file formats, and usage details."
          />
        </div>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(event) => handleChange('isActive', event.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-gold-500 focus:ring-gold-500"
          />
          <span className="text-sm font-medium text-gray-700">Active (visible in the public shop)</span>
        </label>
      </div>

      <div className="card p-6">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div>
            <h2 className="text-lg font-bold text-primary-900">Product Images</h2>
            <p className="text-xs text-gray-400 mt-1">Recommended: 1080 × 1350 px (4:5 portrait). Other ratios are auto-fitted into a 4:5 frame.</p>
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="btn-secondary gap-2 shrink-0"
          >
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            {uploading ? 'Uploading...' : 'Add Images'}
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(event) => event.target.files && handleImageFiles(event.target.files)}
        />

        {form.images.length === 0 ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => { event.preventDefault(); if (event.dataTransfer.files) handleImageFiles(event.dataTransfer.files); }}
            className="border-2 border-dashed border-gray-300 rounded-xl p-10 text-center cursor-pointer hover:bg-gray-50 transition-colors"
          >
            {uploading ? <Loader2 className="w-8 h-8 text-gold-500 animate-spin mx-auto" /> : <Upload className="w-8 h-8 text-gray-400 mx-auto" />}
            <p className="mt-2 text-sm font-medium text-gray-600">Click or drag & drop product images</p>
            <p className="text-xs text-gray-400 mt-1">The first image becomes the main product image.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {form.images.map((image, index) => (
              <div key={`${image.url}-${index}`} className="relative group rounded-xl overflow-hidden border bg-white">
                <PosterImage src={image.url} alt={image.alt || form.title || 'Product image'} className="rounded-none" />
                {index === 0 && (
                  <span className="absolute left-2 top-2 z-10 rounded-full bg-gold-500 px-2 py-1 text-[10px] font-semibold text-white">Main</span>
                )}
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  aria-label="Remove image"
                  className="absolute right-2 top-2 z-10 inline-flex h-7 w-7 items-center justify-center rounded-full bg-red-600 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-700"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-end gap-3">
        <button type="button" onClick={() => router.push('/admin/shop')} className="btn-secondary">Cancel</button>
        <button type="submit" disabled={saving || uploading} className="btn-primary gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving...' : mode === 'edit' ? 'Update Product' : 'Save Product'}
        </button>
      </div>
    </form>
  );
}
