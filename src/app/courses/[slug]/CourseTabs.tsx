'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BookOpen, Lock, PlayCircle, Star, Unlock } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';

type Props = {
  descriptionHtml: string;
  modules: any[];
  lessons: any[];
  freeCount: number;
  courseSlug: string;
};

export default function CourseTabs({ descriptionHtml, modules, lessons, freeCount, courseSlug }: Props) {
  const { t } = useLanguage();
  const [tab, setTab] = useState<'info' | 'reviews'>('info');

  return (
    <div className="mt-8">
      <div className="flex gap-1 border-b border-gray-200">
        <button
          type="button"
          onClick={() => setTab('info')}
          className={`relative px-5 py-3 text-sm font-semibold transition-colors ${
            tab === 'info' ? 'text-gold-600' : 'text-gray-500 hover:text-primary-900'
          }`}
        >
          {t('academyDetail.courseInfo')}
          {tab === 'info' && <span className="absolute inset-x-0 -bottom-px h-0.5 bg-gold-500" />}
        </button>
        <button
          type="button"
          onClick={() => setTab('reviews')}
          className={`relative px-5 py-3 text-sm font-semibold transition-colors ${
            tab === 'reviews' ? 'text-gold-600' : 'text-gray-500 hover:text-primary-900'
          }`}
        >
          {t('academyDetail.reviews')}
          {tab === 'reviews' && <span className="absolute inset-x-0 -bottom-px h-0.5 bg-gold-500" />}
        </button>
      </div>

      {tab === 'info' ? (
        <div className="pt-7">
          <h2 className="text-2xl font-bold text-primary-900">{t('academyDetail.about')}</h2>
          {descriptionHtml ? (
            <div
              className="prose prose-primary mt-4 max-w-none text-gray-600 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: descriptionHtml }}
            />
          ) : (
            <p className="mt-4 text-gray-500">{t('academyDetail.noDescription')}</p>
          )}

          <h2 className="mt-10 text-2xl font-bold text-primary-900">{t('academyDetail.curriculum')}</h2>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-500">
            <span className="inline-flex items-center gap-1"><BookOpen className="h-4 w-4 text-gold-500" /> {lessons.length} {t('academyDetail.lessons')}</span>
            <span className="inline-flex items-center gap-1"><Unlock className="h-4 w-4 text-green-500" /> {freeCount} {t('academyDetail.freePreviews')}</span>
          </div>

          {lessons.length === 0 ? (
            <p className="mt-6 text-gray-500">{t('academyDetail.noLessons')}</p>
          ) : (
            <div className="mt-6 space-y-5">
              {modules.map((module) => (
                <div key={module.id || module.title} className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                  <div className="flex items-center justify-between bg-primary-900 px-5 py-3 text-white">
                    <span className="font-bold">{module.title || t('academyDetail.courseContent')}</span>
                    <span className="text-xs font-medium text-white/70">
                      {module.lessons?.length || 0} {t('academyDetail.lessons')}
                    </span>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {(module.lessons || []).map((lesson: any, index: number) => (
                      <div key={lesson.id || index} className="flex items-center gap-4 p-4 transition-colors hover:bg-gray-50">
                        {lesson.isFree ? (
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-700">
                            <Unlock className="h-4 w-4" />
                          </span>
                        ) : (
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                            <Lock className="h-4 w-4" />
                          </span>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="flex items-center gap-2 font-medium text-primary-900">
                            {lesson.isFree
                              ? <PlayCircle className="h-4 w-4 shrink-0 text-green-600" />
                              : <Lock className="h-4 w-4 shrink-0 text-amber-500" />}
                            {lesson.title}
                          </p>
                          {lesson.videoDuration ? (
                            <p className="mt-0.5 text-xs text-gray-400">
                              {lesson.videoDuration} {t('academyDetail.min')}
                            </p>
                          ) : null}
                        </div>
                        {lesson.isFree ? (
                          <span className="shrink-0 rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">
                            {t('academyDetail.freePreview')}
                          </span>
                        ) : (
                          <span className="shrink-0 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                            {t('academyDetail.locked')}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-8">
            <Link href={`/courses/${courseSlug}/learn`} className="btn-primary inline-flex items-center gap-2">
              {t('academyDetail.startLearning')} →
            </Link>
          </div>
        </div>
      ) : (
        <div className="pt-7">
          <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center shadow-sm">
            <div className="flex justify-center gap-1 text-gold-500">
              {[...Array(5)].map((_, index) => (
                <Star key={index} className="h-6 w-6" fill="currentColor" />
              ))}
            </div>
            <p className="mx-auto mt-4 max-w-md text-gray-500">{t('academyDetail.noReviews')}</p>
          </div>
        </div>
      )}
    </div>
  );
}
