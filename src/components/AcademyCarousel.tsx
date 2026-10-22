'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BookOpen, User } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';
import PosterImage from '@/components/PosterImage';

interface AcademyCourse {
  id: string;
  slug: string;
  title: string;
  instructorName?: string | null;
  instructor?: string | null;
  level?: string | null;
  category?: string | null;
  price?: number | null;
  currency?: string | null;
  thumbnail?: string | null;
  featuredImage?: string | null;
}

export default function AcademyCarousel({ title, courses }: { title?: string; courses: AcademyCourse[] }) {
  const { t } = useLanguage();
  const heading = title ?? t('home.academyTitle');
  const [paused, setPaused] = useState(false);

  if (!courses || courses.length === 0) {
    return null;
  }

  const items = courses.slice(0, 9);
  const doubled = [...items, ...items];

  const CARD_WIDTH = 320;
  const GAP = 24;
  const singleSetWidth = items.length * (CARD_WIDTH + GAP);
  const duration = items.length * 5;

  return (
    <section className="py-16 bg-gray-50 border-t border-gray-200 overflow-hidden">
      <div className="container-custom">
        <span className="block text-center text-gold-500 font-semibold text-sm uppercase tracking-wider">{t('home.academyLabel')}</span>
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 mt-2 text-primary-900">{heading}</h2>
        <p className="text-center text-gray-600 mb-10 max-w-2xl mx-auto">{t('home.academySubtitle')}</p>

        <div
          className="relative w-full overflow-hidden"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div
            className="flex gap-6"
            style={{
              width: 'max-content',
              animation: `scroll-left ${duration}s linear infinite`,
              animationPlayState: paused ? 'paused' : 'running',
            }}
          >
            {doubled.map((course, i) => (
              <Link
                key={`${course.id}-${i}`}
                href={`/courses/${course.slug}`}
                className="flex-shrink-0 w-[320px] bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 block"
              >
                <div className="relative overflow-hidden bg-primary-100">
                  {course.thumbnail || course.featuredImage ? (
                    <PosterImage
                      src={course.thumbnail || course.featuredImage || ''}
                      alt={course.title}
                      className="rounded-none"
                    />
                  ) : (
                    <div className="aspect-[4/5] w-full bg-gradient-to-br from-primary-200 to-primary-400 flex items-center justify-center">
                      <BookOpen className="w-10 h-10 text-primary-600" />
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    {course.level && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-primary-50 text-primary-600 font-medium">{course.level}</span>
                    )}
                    {course.category && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">{course.category}</span>
                    )}
                  </div>
                  <h3 className="font-semibold text-primary-900 leading-snug line-clamp-2">{course.title}</h3>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-sm text-gray-500 flex items-center gap-1 truncate">
                      <User className="w-3.5 h-3.5" /> {course.instructorName || course.instructor || 'CadorDigital'}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="text-center mt-6">
          <Link
            href="/courses"
            className="inline-block px-6 py-3 bg-primary-900 text-white font-semibold rounded-lg hover:bg-primary-800 transition-colors"
          >
            {t('nav.academy')} →
          </Link>
        </div>
      </div>

      <style jsx>{`
        @keyframes scroll-left {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-${singleSetWidth}px);
          }
        }
      `}</style>
    </section>
  );
}
