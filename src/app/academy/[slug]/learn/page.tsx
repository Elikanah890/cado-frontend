'use client';

import Link from 'next/link';
import { use } from 'react';
import { ChevronLeft, ChevronRight, Play, CheckCircle, Menu as MenuIcon, X } from 'lucide-react';
import { useState, useEffect } from 'react';

const lessons = [
  { id: 1, title: 'Introduction to Digital Marketing', duration: '45:00', completed: true },
  { id: 2, title: 'Social Media Marketing Fundamentals', duration: '1:00:00', completed: false },
  { id: 3, title: 'Search Engine Optimization (SEO)', duration: '1:30:00', completed: false },
  { id: 4, title: 'Google Ads & PPC', duration: '1:15:00', completed: false },
  { id: 5, title: 'Email Marketing Strategies', duration: '50:00', completed: false },
  { id: 6, title: 'Analytics & Reporting', duration: '1:00:00', completed: false },
];

export default function CoursePlayerPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [currentLesson, setCurrentLesson] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [progress, setProgress] = useState<Record<number, boolean>>({});
  const [watchedSeconds, setWatchedSeconds] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem(`course_${slug}_progress`);
    if (saved) {
      const p = JSON.parse(saved);
      setProgress(p.completed || {});
      setCurrentLesson(p.currentLesson || 1);
    }
  }, [slug]);

  const completeLesson = (id: number) => {
    const newProgress = { ...progress, [id]: true };
    setProgress(newProgress);
    localStorage.setItem(`course_${slug}_progress`, JSON.stringify({
      completed: newProgress,
      currentLesson: id,
      watchedSeconds,
    }));
  };

  const completedCount = Object.keys(progress).length;
  const progressPercent = Math.round((completedCount / lessons.length) * 100);

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <header className="bg-gray-800 border-b border-gray-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-white p-2 hover:bg-gray-700 rounded-lg lg:hidden">
            <MenuIcon className="w-5 h-5" />
          </button>
          <Link href="/academy" className="text-gray-400 hover:text-white text-sm flex items-center gap-1">
            <ChevronLeft className="w-4 h-4" /> Back to Academy
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400 hidden sm:block">{progressPercent}% Complete</span>
          <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-green-500 transition-all" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>
      </header>

      <div className="flex-1 flex">
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="max-w-3xl w-full aspect-video bg-gray-800 rounded-2xl flex items-center justify-center border border-gray-700">
            <div className="text-center">
              <Play className="w-16 h-16 text-gold-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-white">{lessons[currentLesson - 1]?.title}</h2>
              <p className="text-gray-400 mt-2">Lesson {currentLesson} of {lessons.length}</p>
              <p className="text-gray-500 mt-1">{lessons[currentLesson - 1]?.duration}</p>
              <button
                onClick={() => completeLesson(currentLesson)}
                className="mt-6 btn-primary gap-2"
              >
                <CheckCircle className="w-4 h-4" /> Mark as Complete
              </button>
            </div>
          </div>
          <div className="flex items-center gap-4 mt-6">
            <button
              onClick={() => setCurrentLesson(Math.max(1, currentLesson - 1))}
              disabled={currentLesson === 1}
              className="px-4 py-2 rounded-lg border border-gray-700 text-white hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>
            <button
              onClick={() => setCurrentLesson(Math.min(lessons.length, currentLesson + 1))}
              disabled={currentLesson === lessons.length}
              className="px-4 py-2 rounded-lg border border-gray-700 text-white hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className={`${sidebarOpen ? 'translate-x-0' : 'translate-x-full'} lg:translate-x-0 fixed lg:static right-0 top-0 bottom-0 w-80 bg-gray-800 border-l border-gray-700 overflow-y-auto transition-transform z-40`}>
          <div className="p-4 border-b border-gray-700 flex items-center justify-between">
            <h3 className="text-white font-bold">Course Content</h3>
            <button onClick={() => setSidebarOpen(false)} className="text-gray-400 hover:text-white lg:hidden">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-2">
            {lessons.map((lesson) => (
              <button
                key={lesson.id}
                onClick={() => { setCurrentLesson(lesson.id); setSidebarOpen(false); }}
                className={`w-full text-left p-3 rounded-lg mb-1 transition-colors flex items-center gap-3 ${
                  currentLesson === lesson.id ? 'bg-gold-500/20 text-gold-400' : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  progress[lesson.id] ? 'bg-green-500 text-white' :
                  currentLesson === lesson.id ? 'bg-gold-500 text-white' : 'bg-gray-700 text-gray-400'
                }`}>
                  {progress[lesson.id] ? <CheckCircle className="w-4 h-4" /> : lesson.id}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{lesson.title}</p>
                  <p className="text-xs opacity-60">{lesson.duration}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
