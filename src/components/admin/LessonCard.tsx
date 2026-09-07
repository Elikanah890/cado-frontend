'use client';

import { Lock, Unlock, Trash2, Link as LinkIcon } from 'lucide-react';
import VideoUpload from './VideoUpload';

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

interface Props {
  lesson: LessonState;
  index: number;
  modules: { id: string; title: string }[];
  moduleId: string;
  saving: boolean;
  onUpdate: (index: number, patch: Partial<LessonState>) => void;
  onDelete: (index: number) => void;
  onMoveModule: (index: number, moduleId: string) => void;
}

export default function LessonCard({ lesson, index, modules, moduleId, saving, onUpdate, onDelete, onMoveModule }: Props) {
  return (
    <div className="border rounded-xl p-4 bg-white border-l-4 border-l-gold-400 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-full bg-primary-900 text-white flex items-center justify-center text-sm font-bold">
            {index + 1}
          </span>
          <span className="font-bold text-primary-900">Lesson {index + 1}</span>
          {lesson.isNew && <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">New</span>}
          {lesson.id && <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">Saved</span>}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onUpdate(index, { isFree: !lesson.isFree })}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              lesson.isFree ? 'bg-green-50 text-green-700 border-green-300' : 'bg-red-50 text-red-700 border-red-300'
            }`}
            title={lesson.isFree ? 'Free Preview' : 'Locked'}
          >
            {lesson.isFree ? <><Unlock className="w-3.5 h-3.5" /> Free</> : <><Lock className="w-3.5 h-3.5" /> Locked</>}
          </button>
          <button type="button" onClick={() => onDelete(index)} disabled={saving} className="p-1.5 rounded hover:bg-red-50 text-red-500 disabled:opacity-40">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-gray-500 mb-1">Lesson Title *</label>
          <input type="text" value={lesson.title} onChange={(e) => onUpdate(index, { title: e.target.value })} className="input-field" placeholder="e.g. Introduction to concepts" />
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-gray-500 mb-1">Video <span className="text-gray-400">(upload from device — no size limit)</span></label>
          <div className="flex flex-col sm:flex-row gap-2 items-start">
            <div className="flex-1 relative">
              <LinkIcon className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input type="text" value={lesson.videoUrl} onChange={(e) => onUpdate(index, { videoUrl: e.target.value })} className="input-field pl-9" placeholder="Paste a YouTube or video URL" />
            </div>
            <div className="sm:w-24 shrink-0">
              <VideoUpload value={lesson.videoUrl} onChange={(url) => onUpdate(index, { videoUrl: url })} label="" compact />
            </div>
          </div>
        </div>

        {modules.length > 1 && (
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Module</label>
            <select value={moduleId || ''} disabled={saving} onChange={(e) => onMoveModule(index, e.target.value)} className="input-field">
              {modules.map((m) => <option key={m.id} value={m.id}>{m.title || 'Untitled module'}</option>)}
            </select>
          </div>
        )}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Duration (minutes)</label>
          <input type="number" value={lesson.videoDuration} onChange={(e) => onUpdate(index, { videoDuration: e.target.value })} className="input-field" placeholder="e.g. 15" />
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-gray-500 mb-1">Description (optional)</label>
          <textarea value={lesson.description} onChange={(e) => onUpdate(index, { description: e.target.value })} className="input-field" rows={2} />
        </div>
      </div>
    </div>
  );
}