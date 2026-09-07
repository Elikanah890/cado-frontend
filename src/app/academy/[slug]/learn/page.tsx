'use client';

import Link from 'next/link';
import { use } from 'react';
import { ChevronLeft, ChevronRight, Play, CheckCircle, Lock, Unlock, Menu as MenuIcon, X, MessageCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { publicApi } from '@/lib/api';
import { whatsappLink } from '@/lib/utils';
import { resolveImageUrl } from '@/lib/imageUtils';
import { sanitizeHtml } from '@/lib/sanitize';
import { useLanguage } from '@/lib/LanguageContext';

export default function CoursePlayerPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { t } = useLanguage();
  const [course, setCourse] = useState<any>(null);
  const [lessons, setLessons] = useState<any[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [progress, setProgress] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await publicApi.getCourse(slug);
        const data = (res as any)?.data;
        if (!mounted) return;
        setCourse(data);
        const list = Array.isArray(data?.modules)
          ? data.modules.flatMap((m: any) => Array.isArray(m?.lessons) ? m.lessons : [])
          : (Array.isArray(data?.lessons) ? data.lessons : []);
        setLessons(list);
        if (list.length > 0) setCurrentId(list[0].id);
        const saved = localStorage.getItem(`course_${slug}_progress`);
        if (saved) {
          try {
            const p = JSON.parse(saved);
            setProgress(p.completed || {});
            if (p.currentId && list.find((l:any)=> l.id===p.currentId)) setCurrentId(p.currentId);
          } catch {}
        }
      } catch (e: any) {
        if (mounted) setError(e?.response?.data?.message || t('academyDetail.loadError'));
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const currentLesson = lessons.find((l) => l.id === currentId) || lessons[0];
  const currentIndex = lessons.findIndex((l) => l.id === currentId);

  const completeLesson = (id: string) => {
    const newProgress = { ...progress, [id]: true };
    setProgress(newProgress);
    localStorage.setItem(`course_${slug}_progress`, JSON.stringify({ completed: newProgress, currentId: id }));
  };

  const completedCount = Object.keys(progress).filter((k) => progress[k]).length;
  const progressPercent = lessons.length ? Math.round((completedCount / lessons.length) * 100) : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-white border-t-transparent mx-auto" />
          <p className="mt-4 text-gray-400">{t('coursePlayer.loading')}</p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white p-8">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error || t('coursePlayer.notFound')}</p>
          <Link href="/academy" className="text-gold-500 hover:text-gold-400">← {t('coursePlayer.backAcademy')}</Link>
        </div>
      </div>
    );
  }

  if (lessons.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col">
        <header className="bg-gray-800 border-b border-gray-700 px-4 py-3">
          <Link href={`/academy/${slug}`} className="text-gray-400 hover:text-white text-sm flex items-center gap-1">
            <ChevronLeft className="w-4 h-4" /> {t('coursePlayer.backCourse')}
          </Link>
        </header>
        <div className="flex-1 flex items-center justify-center text-white p-8">
          <p className="text-gray-400">{t('coursePlayer.noLessons')}</p>
        </div>
      </div>
    );
  }

  const videoUrl: string | null = currentLesson?.videoUrl || null;
  const isYouTube = videoUrl && (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be'));
  const youTubeId = isYouTube ? (videoUrl.match(/(?:v=|youtu\.be\/)([^&]+)/)?.[1] || '') : '';
  const isLocked = currentLesson ? !currentLesson.isFree : false;
  const waLink = whatsappLink(`enrolling in ${course.title}`);

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <header className="bg-gray-800 border-b border-gray-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-white p-2 hover:bg-gray-700 rounded-lg lg:hidden">
            <MenuIcon className="w-5 h-5" />
          </button>
          <Link href={`/academy/${slug}`} className="text-gray-400 hover:text-white text-sm flex items-center gap-1">
            <ChevronLeft className="w-4 h-4" /> {t('coursePlayer.backCourse')}
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400 hidden sm:block">{progressPercent}{t('coursePlayer.complete')}</span>
          <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-green-500 transition-all" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>
      </header>

      <div className="flex-1 flex">
        <div className="flex-1 flex flex-col items-center justify-center p-4 lg:p-8">
          {isLocked ? (
            <div className="max-w-md w-full bg-gray-800 rounded-2xl border border-gray-700 p-10 text-center">
              <div className="w-20 h-20 mx-auto rounded-full bg-amber-500/20 flex items-center justify-center mb-6">
                <Lock className="w-10 h-10 text-amber-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">{t('coursePlayer.lockedTitle')}</h2>
              <p className="text-gray-400 mb-6">{t('coursePlayer.lockedSub')}</p>
              <a href={waLink} target="_blank" rel="noopener noreferrer" className="btn-primary w-full justify-center gap-2 inline-flex">
                <MessageCircle className="w-4 h-4" /> {t('coursePlayer.enrollViaWhatsApp')}
              </a>
              <Link href={`/academy/${slug}`} className="block mt-4 text-sm text-gold-500 hover:text-gold-400">
                {t('coursePlayer.viewCourseDetails')}
              </Link>
            </div>
          ) : (
            <>
              <div className="max-w-3xl w-full aspect-video bg-gray-800 rounded-2xl flex items-center justify-center border border-gray-700 overflow-hidden">
                {videoUrl ? (
                  isYouTube && youTubeId ? (
                    <iframe src={`https://www.youtube.com/embed/${youTubeId}`} title={currentLesson.title} className="w-full h-full" allowFullScreen />
                  ) : videoUrl.startsWith('http') || videoUrl.startsWith('/uploads/') ? (
                    <video src={resolveImageUrl(videoUrl)} controls className="w-full h-full" />
                  ) : (
                    <div className="p-4 text-gray-300 text-sm break-all">{currentLesson.content || t('coursePlayer.noVideo')}</div>
                  )
                ) : currentLesson?.content ? (
                  <div className="p-8 text-gray-200 overflow-auto max-h-full prose prose-invert" dangerouslySetInnerHTML={{ __html: sanitizeHtml(currentLesson.content) }} />
                ) : (
                  <div className="text-center p-8">
                    <Play className="w-16 h-16 text-gold-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-white">{currentLesson?.title}</h2>
                    <p className="text-gray-400 mt-2">
                      {t('coursePlayer.lessonOf').replace('{a}', String(currentIndex + 1)).replace('{b}', String(lessons.length))}
                    </p>
                    <p className="text-gray-500 mt-1">{currentLesson?.videoDuration ? `${currentLesson.videoDuration} ${t('coursePlayer.min')}` : currentLesson?.lessonType || t('coursePlayer.videoLesson')}</p>
                    <button onClick={() => currentId && completeLesson(currentId)} className="mt-6 btn-primary gap-2">
                      <CheckCircle className="w-4 h-4" /> {t('coursePlayer.markComplete')}
                    </button>
                  </div>
                )}
              </div>
              {(videoUrl || currentLesson?.content) && (
                <button onClick={() => currentId && completeLesson(currentId)} className="mt-6 btn-primary gap-2">
                  <CheckCircle className="w-4 h-4" /> {t('coursePlayer.markComplete')}
                </button>
              )}
            </>
          )}
          {!isLocked && (
          <div className="flex items-center gap-4 mt-6">
            <button
              onClick={() => setCurrentId(lessons[Math.max(0, currentIndex - 1)].id)}
              disabled={currentIndex <= 0}
              className="px-4 py-2 rounded-lg border border-gray-700 text-white hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" /> {t('coursePlayer.previous')}
            </button>
            <button
              onClick={() => setCurrentId(lessons[Math.min(lessons.length - 1, currentIndex + 1)].id)}
              disabled={currentIndex >= lessons.length - 1}
              className="px-4 py-2 rounded-lg border border-gray-700 text-white hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            >
              {t('coursePlayer.next')} <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          )}
          {currentLesson && (
            <div className="max-w-3xl w-full mt-6 text-left">
              <h3 className="text-white font-bold text-lg">{currentLesson.title}</h3>
              {currentLesson.description && <p className="text-gray-400 mt-2">{currentLesson.description}</p>}
            </div>
          )}
        </div>

        <div className={`${sidebarOpen ? 'translate-x-0' : 'translate-x-full'} lg:translate-x-0 fixed lg:static right-0 top-0 bottom-0 w-80 bg-gray-800 border-l border-gray-700 overflow-y-auto transition-transform z-40`}>
          <div className="p-4 border-b border-gray-700 flex items-center justify-between">
            <h3 className="text-white font-bold">{t('coursePlayer.courseContent')}</h3>
            <button onClick={() => setSidebarOpen(false)} className="text-gray-400 hover:text-white lg:hidden">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-2">
            {lessons.map((lesson: any, idx: number) => (
              <button
                key={lesson.id}
                onClick={() => { setCurrentId(lesson.id); setSidebarOpen(false); }}
                className={`w-full text-left p-3 rounded-lg mb-1 transition-colors flex items-center gap-3 ${
                  currentId === lesson.id ? 'bg-gold-500/20 text-gold-400' : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  progress[lesson.id] ? 'bg-green-500 text-white' :
                  currentId === lesson.id ? 'bg-gold-500 text-white' : 'bg-gray-700 text-gray-400'
                }`}>
                  {progress[lesson.id] ? <CheckCircle className="w-4 h-4" /> : idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{lesson.title}</p>
                  <p className="text-xs opacity-60 flex items-center gap-1">
                    {lesson.isFree ? <><Unlock className="w-3 h-3 text-green-400" /> {t('coursePlayer.free')}</> : <><Lock className="w-3 h-3 text-amber-400" /> {t('coursePlayer.locked')}</>}
                    {lesson.videoDuration ? ` • ${lesson.videoDuration} ${t('coursePlayer.min')}` : ''}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
