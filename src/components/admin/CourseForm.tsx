'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Trash2, Upload, Loader2, Plus, ChevronUp, ChevronDown,
  Image as ImageIcon, FolderPlus, GripVertical,
} from 'lucide-react';
import { toast } from 'sonner';
import { adminApi } from '@/lib/api';
import { slugify } from '@/lib/utils';
import { resolveImageUrl } from '@/lib/imageUtils';
import RichTextEditor from './RichTextEditor';
import VideoUpload from './VideoUpload';
import LessonCard from './LessonCard';

const levels = ['Beginner', 'Intermediate', 'Advanced'];

function uid() {
  return typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `t-${Date.now()}-${Math.random()}`;
}

interface LessonState {
  id?: string;
  title: string;
  description: string;
  videoUrl: string;
  videoDuration: string;
  sortOrder: number;
  isFree: boolean;
  isNew: boolean;
}

interface ModuleState {
  id?: string;
  title: string;
  lessons: LessonState[];
  isNew: boolean;
}

const emptyModule = (): ModuleState => ({ title: '', lessons: [], isNew: true });
const emptyLesson = (): LessonState => ({ title: '', description: '', videoUrl: '', videoDuration: '', sortOrder: 0, isFree: false, isNew: true });

interface Props {
  initialData?: any;
  mode?: 'create' | 'edit';
}

const TABS = [
  { id: 'general', label: 'General' },
  { id: 'media', label: 'Image & Video' },
  { id: 'description', label: 'Description' },
  { id: 'lessons', label: 'Lessons' },
  { id: 'publishing', label: 'Publishing' },
];

export default function CourseForm({ initialData, mode = 'create' }: Props) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('general');
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    title: '',
    slug: '',
    subtitle: '',
    instructorName: '',
    level: '',
    category: '',
    price: 0,
    estimatedHours: 0,
    whatsappNumber: '',
    thumbnail: '',
    featuredImage: '',
    introVideo: '',
    description: '',
    isActive: true,
    isFeatured: false,
    isPublished: false,
    sortOrder: 0,
  });

  const [modules, setModules] = useState<ModuleState[]>([]);

  const [uploadingThumb, setUploadingThumb] = useState(false);
  const thumbInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialData && mode === 'edit') {
      setForm({
        title: initialData.title || '',
        slug: initialData.slug || '',
        subtitle: initialData.subtitle || '',
        instructorName: initialData.instructorName || initialData.instructor || '',
        level: initialData.level || '',
        category: initialData.category || '',
        price: initialData.price ?? 0,
        estimatedHours: initialData.estimatedHours || 0,
        whatsappNumber: initialData.whatsappNumber || '',
        thumbnail: initialData.thumbnail || '',
        featuredImage: initialData.featuredImage || '',
        introVideo: initialData.introVideo || '',
        description: initialData.description || '',
        isActive: initialData.isActive ?? true,
        isFeatured: initialData.isFeatured || false,
        isPublished: initialData.isPublished || false,
        sortOrder: initialData.sortOrder || 0,
      });
      setModules(
        Array.isArray(initialData.modules)
          ? initialData.modules.map((m: any) => ({
              id: m.id,
              title: m.title || '',
              lessons: Array.isArray(m.lessons)
                ? m.lessons.map((l: any, i: number) => ({
                    id: l.id,
                    title: l.title || '',
                    description: l.description || '',
                    videoUrl: l.videoUrl || '',
                    videoDuration: l.videoDuration != null ? String(l.videoDuration) : '',
                    sortOrder: l.sortOrder != null ? Number(l.sortOrder) : i,
                    isFree: l.isFree || false,
                    isNew: false,
                  }))
                : [],
              isNew: false,
            }))
          : []
      );
    }
  }, [initialData, mode]);

  const uploadSingleFile = async (file: File, folder: string = 'course'): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);
    const res: any = await adminApi.uploadMedia(formData);
    const url = res?.data?.fileUrl || res?.data?.data?.fileUrl || res?.data?.url || res?.data?.data?.url || res?.fileUrl || res?.url || res?.data?.media?.fileUrl;
    if (!url) throw new Error('Upload failed: no URL returned');
    return url;
  };

  const handleThumbFiles = async (files: FileList | File[]) => {
    const file = Array.from(files)[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Only image files allowed'); return; }
    setUploadingThumb(true);
    try {
      const url = await uploadSingleFile(file, 'course');
      setForm((f) => ({ ...f, thumbnail: url, featuredImage: url }));
      toast.success('Course image uploaded');
    } catch (err: any) {
      toast.error(err?.message || 'Upload failed');
    } finally {
      setUploadingThumb(false);
      if (thumbInputRef.current) thumbInputRef.current.value = '';
    }
  };

  const handleChange = (key: string, value: any) => {
    if (key === 'title') {
      setForm((f) => ({ ...f, title: value, slug: f.slug || slugify(value) }));
    } else {
      setForm((f) => ({ ...f, [key]: value }));
    }
  };

  // ---- Module management ----
  const addModule = () => setModules((ms) => [...ms, { ...emptyModule(), id: uid() }]);
  const removeModule = (mi: number) => setModules((ms) => ms.filter((_, i) => i !== mi));
  const updateModuleTitle = (mi: number, value: string) =>
    setModules((ms) => ms.map((m, i) => (i === mi ? { ...m, title: value } : m)));
  const moveModule = (mi: number, dir: number) =>
    setModules((ms) => {
      const next = [...ms];
      const t = mi + dir;
      if (t < 0 || t >= next.length) return ms;
      [next[mi], next[t]] = [next[t], next[mi]];
      return next;
    });

  // ---- Lesson management ----
  const addLesson = (mi: number) =>
    setModules((ms) => ms.map((m, i) => (i === mi ? { ...m, lessons: [...m.lessons, emptyLesson()] } : m)));
  const updateLesson = (mi: number, li: number, patch: Partial<LessonState>) =>
    setModules((ms) => ms.map((m, i) => (i === mi ? { ...m, lessons: m.lessons.map((l, j) => (j === li ? { ...l, ...patch } : l)) } : m)));
  const removeLesson = (mi: number, li: number) =>
    setModules((ms) => ms.map((m, i) => (i === mi ? { ...m, lessons: m.lessons.filter((_, j) => j !== li) } : m)));
  const moveLesson = (mi: number, li: number, dir: number) =>
    setModules((ms) => ms.map((m, i) => {
      if (i !== mi) return m;
      const next = [...m.lessons];
      const t = li + dir;
      if (t < 0 || t >= next.length) return m;
      [next[li], next[t]] = [next[t], next[li]];
      return { ...m, lessons: next };
    }));
  const moveLessonToModule = (fromMi: number, li: number, toMi: number) =>
    setModules((ms) => {
      const next = [...ms];
      const lesson = next[fromMi]?.lessons[li];
      if (!lesson || fromMi === toMi) return ms;
      next[fromMi] = { ...next[fromMi], lessons: next[fromMi].lessons.filter((_, j) => j !== li) };
      next[toMi] = { ...next[toMi], lessons: [...next[toMi].lessons, lesson] };
      return next;
    });

  const totalLessons = modules.reduce((sum, m) => sum + (m.lessons?.length || 0), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error('Title is required'); setActiveTab('general'); return; }
    if (!form.slug.trim()) { toast.error('Slug is required'); setActiveTab('general'); return; }
    setSaving(true);
    try {
      const payload: any = {
        title: form.title,
        slug: slugify(form.slug || form.title),
        subtitle: form.subtitle || '',
        instructorName: form.instructorName || '',
        level: form.level || '',
        category: form.category || '',
        price: Number(form.price) || 0,
        estimatedHours: Number(form.estimatedHours) || 0,
        whatsappNumber: form.whatsappNumber || '',
        thumbnail: form.thumbnail || '',
        featuredImage: form.featuredImage || '',
        introVideo: form.introVideo || '',
        description: form.description || '',
        isActive: form.isActive,
        isFeatured: form.isFeatured,
        isPublished: form.isPublished,
        sortOrder: Number(form.sortOrder) || 0,
        modules: modules.map((m) => ({
          id: m.isNew ? undefined : m.id,
          title: m.title || '',
          lessons: m.lessons.map((l, li) => ({
            id: l.isNew ? undefined : l.id,
            title: l.title,
            description: l.description || '',
            videoUrl: l.videoUrl || '',
            videoDuration: l.videoDuration ? Number(l.videoDuration) : null,
            sortOrder: li,
            isFree: l.isFree,
            lessonType: 'video',
          })),
        })),
      };

      if (mode === 'edit' && initialData?.id) {
        await adminApi.updateCourse(initialData.id, payload);
        toast.success('Course updated');
      } else {
        await adminApi.createCourse(payload);
        toast.success('Course created');
      }
      router.push('/admin/academy');
      router.refresh();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to save course');
    } finally {
      setSaving(false);
    }
  };

  const renderLessonsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-primary-900 flex items-center gap-2"><FolderPlus className="w-5 h-5 text-gold-500" /> Modules</h3>
          <p className="text-sm text-gray-500 mt-1">Organize lessons into modules. {totalLessons} lesson(s) total.</p>
        </div>
        <button type="button" onClick={addModule} className="btn-primary gap-1"><Plus className="w-4 h-4" /> Add Module</button>
      </div>

      {modules.length === 0 ? (
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-10 text-center bg-gray-50">
          <FolderPlus className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No modules yet. Create modules to organize your lessons.</p>
          <button type="button" onClick={addModule} className="btn-primary mt-4 gap-1"><Plus className="w-4 h-4" /> Create First Module</button>
        </div>
      ) : (
        <div className="space-y-4">
          {modules.map((mod, mi) => (
            <div key={mod.id} className="border rounded-xl overflow-hidden bg-gray-50">
              <div className="bg-white border-b px-4 py-3 flex items-center gap-3">
                <GripVertical className="w-4 h-4 text-gray-300 shrink-0" />
                <button type="button" onClick={() => moveModule(mi, -1)} disabled={mi === 0} className="p-1 rounded hover:bg-gray-100 disabled:opacity-30"><ChevronUp className="w-4 h-4" /></button>
                <button type="button" onClick={() => moveModule(mi, 1)} disabled={mi === modules.length - 1} className="p-1 rounded hover:bg-gray-100 disabled:opacity-30"><ChevronDown className="w-4 h-4" /></button>
                <span className="text-sm font-bold text-primary-900 whitespace-nowrap">Module {mi + 1}</span>
                <input
                  type="text"
                  value={mod.title}
                  onChange={(e) => updateModuleTitle(mi, e.target.value)}
                  className="input-field flex-1"
                  placeholder="Module title e.g. Introduction"
                />
                <span className="text-xs text-gray-400 whitespace-nowrap">{mod.lessons?.length || 0} lessons</span>
                <button type="button" onClick={() => removeModule(mi)} className="p-1.5 rounded hover:bg-red-50 text-red-500"><Trash2 className="w-4 h-4" /></button>
              </div>

              <div className="p-4 space-y-3">
                {mod.lessons?.length === 0 ? (
                  <div className="text-center py-4 text-sm text-gray-400 border border-dashed border-gray-300 rounded-lg">No lessons in this module yet.</div>
                ) : (
                  mod.lessons.map((lesson, li) => (
                    <LessonCard
                      key={lesson.id || `${mod.id}-${li}`}
                      lesson={lesson}
                      index={li}
                      modules={modules.map((x) => ({ id: x.id!, title: x.title }))}
                      moduleId={mod.id!}
                      saving={saving}
                      onUpdate={(i, patch) => updateLesson(mi, i, patch)}
                      onDelete={(i) => removeLesson(mi, i)}
                      onMoveModule={(i, targetModId) => moveLessonToModule(mi, i, modules.findIndex((x) => x.id === targetModId))}
                    />
                  ))
                )}
                <button type="button" onClick={() => addLesson(mi)} className="btn-secondary gap-1 w-full justify-center">
                  <Plus className="w-4 h-4" /> Add Lesson
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="border-b border-gray-200 overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${activeTab === t.id ? 'border-gold-500 text-gold-600 bg-gold-50/50' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
            >
              {t.label}{t.id === 'lessons' && totalLessons > 0 ? ` (${totalLessons})` : ''}
            </button>
          ))}
        </div>
      </div>

      <div className="card p-6">
        {activeTab === 'general' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input type="text" value={form.title} onChange={(e) => handleChange('title', e.target.value)} className="input-field" required />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
              <input type="text" value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} className="input-field" placeholder="/course-slug" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
              <input type="text" value={form.subtitle} onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Instructor</label>
              <input type="text" value={form.instructorName} onChange={(e) => setForm((f) => ({ ...f, instructorName: e.target.value }))} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
              <select value={form.level} onChange={(e) => setForm((f) => ({ ...f, level: e.target.value }))} className="input-field">
                <option value="">Select</option>
                {levels.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <input type="text" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} className="input-field" placeholder="e.g. Marketing" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price (TZS)</label>
              <input type="number" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) }))} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hours</label>
              <input type="number" value={form.estimatedHours} onChange={(e) => setForm((f) => ({ ...f, estimatedHours: Number(e.target.value) }))} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Number</label>
              <input type="text" value={form.whatsappNumber} onChange={(e) => setForm((f) => ({ ...f, whatsappNumber: e.target.value }))} className="input-field" placeholder="e.g. 255716168903" />
            </div>
          </div>
        )}

        {activeTab === 'media' && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2"><ImageIcon className="w-4 h-4" /> Course Cover Image</label>
              <input ref={thumbInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files && handleThumbFiles(e.target.files)} />
              {!form.thumbnail && !form.featuredImage ? (
                <div
                  onClick={() => thumbInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => { e.preventDefault(); if (e.dataTransfer.files) handleThumbFiles(e.dataTransfer.files); }}
                  className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  {uploadingThumb ? <Loader2 className="w-8 h-8 text-gold-500 animate-spin mx-auto" /> : <Upload className="w-8 h-8 text-gray-400 mx-auto" />}
                  <p className="mt-2 text-sm font-medium text-gray-600">Click or drag & drop to upload cover image</p>
                  <p className="text-xs text-gray-400 mt-1">No size limit</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="relative inline-block">
                    <img src={resolveImageUrl(form.thumbnail || form.featuredImage)} alt="Course cover" className="w-full max-w-[480px] h-auto max-h-[300px] object-cover rounded-xl border" />
                    {uploadingThumb && <div className="absolute inset-0 bg-white/70 flex items-center justify-center rounded-xl"><Loader2 className="w-6 h-6 animate-spin text-gold-500" /></div>}
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => thumbInputRef.current?.click()} className="btn-secondary gap-1"><ImageIcon className="w-4 h-4" /> Change</button>
                    <button type="button" onClick={() => setForm((f) => ({ ...f, thumbnail: '', featuredImage: '' }))} className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-red-600 text-white text-sm hover:bg-red-700"><Trash2 className="w-4 h-4" /> Remove</button>
                  </div>
                </div>
              )}
            </div>

            <div>
              <VideoUpload value={form.introVideo} onChange={(url) => setForm((f) => ({ ...f, introVideo: url }))} label="Intro Video" />
            </div>
          </div>
        )}

        {activeTab === 'description' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Course Description</label>
            <RichTextEditor value={form.description} onChange={(v) => setForm((f) => ({ ...f, description: v }))} placeholder="Describe the course..." />
          </div>
        )}

        {activeTab === 'lessons' && renderLessonsTab()}

        {activeTab === 'publishing' && (
          <div className="space-y-4">
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))} />
                <span className="text-sm font-medium">Active</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm((f) => ({ ...f, isFeatured: e.target.checked }))} />
                <span className="text-sm font-medium">Featured</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.isPublished} onChange={(e) => setForm((f) => ({ ...f, isPublished: e.target.checked }))} />
                <span className="text-sm font-medium">Published</span>
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
              <input type="number" value={form.sortOrder} onChange={(e) => setForm((f) => ({ ...f, sortOrder: Number(e.target.value) }))} className="input-field" />
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-3 border-t pt-5">
        <button type="submit" disabled={saving} className="btn-primary gap-2">
          {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : 'Save Course'}
        </button>
        <button type="button" onClick={() => router.push('/admin/academy')} className="btn-secondary">Cancel</button>
      </div>
    </form>
  );
}