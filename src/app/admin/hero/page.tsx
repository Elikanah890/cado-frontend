'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ExternalLink, Loader2, Plus, Save, Trash2, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { adminApi } from '@/lib/api';
import { normalizePortraitImage } from '@/lib/portraitImage';
import PosterImage from '@/components/PosterImage';
import type { HeroSetting } from '@/types';

const DEFAULTS: HeroSetting = {
  id: 'main_hero',
  tagline: 'Build. Market. Automate. Grow.',
  heading: 'We Build Brands & Smart Systems That Drive Real Growth.',
  subtext: 'Tailored digital solutions for ambitious businesses in Tanzania and beyond.',
  primaryButtonText: 'Chat on WhatsApp',
  primaryButtonUrl: 'https://wa.me/255716168903',
  secondaryButtonText: 'View Portfolio',
  secondaryButtonUrl: '/portfolio',
  stat1Value: '6+',
  stat1Label: 'Happy Clients',
  stat2Value: '10+',
  stat2Label: 'Projects Delivered',
  heroImages: [],
};

export default function AdminHeroPage() {
  const [form, setForm] = useState<HeroSetting>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    adminApi.getHero()
      .then((res) => {
        if (res.data) {
          setForm({
            ...DEFAULTS,
            ...res.data,
            heroImages: Array.isArray(res.data.heroImages) ? res.data.heroImages : [],
          });
        }
      })
      .catch(() => toast.error('Failed to load hero settings'))
      .finally(() => setLoading(false));
  }, []);

  const update = <K extends keyof HeroSetting>(key: K, value: HeroSetting[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const uploadSingleFile = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'hero');
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
          return uploadSingleFile(prepared);
        })
      );
      update('heroImages', [...form.heroImages, ...uploaded]);
      toast.success(`${uploaded.length} image(s) uploaded`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || 'Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    update('heroImages', form.heroImages.filter((_, i) => i !== index));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      const payload = {
        tagline: form.tagline,
        heading: form.heading,
        subtext: form.subtext,
        primaryButtonText: form.primaryButtonText,
        primaryButtonUrl: form.primaryButtonUrl,
        secondaryButtonText: form.secondaryButtonText,
        secondaryButtonUrl: form.secondaryButtonUrl,
        stat1Value: form.stat1Value,
        stat1Label: form.stat1Label,
        stat2Value: form.stat2Value,
        stat2Label: form.stat2Label,
        heroImages: form.heroImages,
      };
      const res = await adminApi.updateHero(payload);
      if (res.data) {
        setForm({
          ...DEFAULTS,
          ...res.data,
          heroImages: Array.isArray(res.data.heroImages) ? res.data.heroImages : [],
        });
      }
      toast.success('Hero settings saved');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to save hero settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-6"><p className="text-gray-500">Loading hero settings...</p></div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary-900">Hero Settings</h1>
          <p className="text-gray-500 mt-1">Manage the homepage hero text, buttons, stats and images.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/" target="_blank" className="btn-secondary gap-2 inline-flex items-center">
            <ExternalLink className="w-4 h-4" /> Preview
          </Link>
          <button type="submit" disabled={saving || uploading} className="btn-primary gap-2 inline-flex items-center">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="card p-6 space-y-5">
        <h2 className="text-lg font-bold text-primary-900">Hero Content</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tagline</label>
          <input
            type="text"
            value={form.tagline}
            onChange={(event) => update('tagline', event.target.value)}
            className="input-field"
            placeholder="Build. Market. Automate. Grow."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Heading</label>
          <textarea
            value={form.heading}
            onChange={(event) => update('heading', event.target.value)}
            className="input-field"
            rows={2}
            placeholder="We Build Brands & Smart Systems That Drive Real Growth."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Subtext</label>
          <textarea
            value={form.subtext}
            onChange={(event) => update('subtext', event.target.value)}
            className="input-field"
            rows={3}
            placeholder="Tailored digital solutions for ambitious businesses in Tanzania and beyond."
          />
        </div>
      </div>

      <div className="card p-6 space-y-5">
        <h2 className="text-lg font-bold text-primary-900">Buttons</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Primary Button Text</label>
            <input
              type="text"
              value={form.primaryButtonText}
              onChange={(event) => update('primaryButtonText', event.target.value)}
              className="input-field"
              placeholder="Chat on WhatsApp"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Primary Button URL</label>
            <input
              type="text"
              value={form.primaryButtonUrl}
              onChange={(event) => update('primaryButtonUrl', event.target.value)}
              className="input-field"
              placeholder="https://wa.me/255716168903"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Secondary Button Text</label>
            <input
              type="text"
              value={form.secondaryButtonText}
              onChange={(event) => update('secondaryButtonText', event.target.value)}
              className="input-field"
              placeholder="View Portfolio"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Secondary Button URL</label>
            <input
              type="text"
              value={form.secondaryButtonUrl}
              onChange={(event) => update('secondaryButtonUrl', event.target.value)}
              className="input-field"
              placeholder="/portfolio"
            />
          </div>
        </div>
      </div>

      <div className="card p-6 space-y-5">
        <h2 className="text-lg font-bold text-primary-900">Stats</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Stat 1 Value</label>
            <input
              type="text"
              value={form.stat1Value}
              onChange={(event) => update('stat1Value', event.target.value)}
              className="input-field"
              placeholder="6+"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Stat 1 Label</label>
            <input
              type="text"
              value={form.stat1Label}
              onChange={(event) => update('stat1Label', event.target.value)}
              className="input-field"
              placeholder="Happy Clients"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Stat 2 Value</label>
            <input
              type="text"
              value={form.stat2Value}
              onChange={(event) => update('stat2Value', event.target.value)}
              className="input-field"
              placeholder="10+"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Stat 2 Label</label>
            <input
              type="text"
              value={form.stat2Label}
              onChange={(event) => update('stat2Label', event.target.value)}
              className="input-field"
              placeholder="Projects Delivered"
            />
          </div>
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div>
            <h2 className="text-lg font-bold text-primary-900">Hero Images</h2>
            <p className="text-xs text-gray-400 mt-1">Add as many images as you need. Recommended: 1080 × 1350 px (4:5 portrait).</p>
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="btn-secondary gap-2 shrink-0 disabled:opacity-50"
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

        {form.heroImages.length === 0 ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => { event.preventDefault(); if (event.dataTransfer.files) handleImageFiles(event.dataTransfer.files); }}
            className="border-2 border-dashed border-gray-300 rounded-xl p-10 text-center cursor-pointer hover:bg-gray-50 transition-colors"
          >
            {uploading ? <Loader2 className="w-8 h-8 text-gold-500 animate-spin mx-auto" /> : <Upload className="w-8 h-8 text-gray-400 mx-auto" />}
            <p className="mt-2 text-sm font-medium text-gray-600">Click or drag & drop hero images</p>
            <p className="text-xs text-gray-400 mt-1">The first image appears in the center of the collage.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {form.heroImages.map((image, index) => (
              <div key={`${image}-${index}`} className="relative group rounded-xl overflow-hidden border bg-white">
                <PosterImage src={image} alt={`Hero image ${index + 1}`} className="rounded-none" />
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

      <div className="flex items-center justify-end gap-3">
        <Link href="/admin" className="btn-secondary">Cancel</Link>
        <button type="submit" disabled={saving || uploading} className="btn-primary gap-2 inline-flex items-center">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}
