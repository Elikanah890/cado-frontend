'use client';

import Link from 'next/link';
import { BookOpen, Bookmark, Clock, ShoppingCart, Users } from 'lucide-react';
import PublicLayout from '@/components/PublicLayout';
import PosterImage from '@/components/PosterImage';
import { publicApi } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { useLanguage } from '@/lib/LanguageContext';

type CourseCard = {
  id: string;
  title: string;
  category: string;
  level: string;
  price: number | null;
  originalPrice: number | null;
  currency: string;
  instructor: string;
  instructorAvatar: string | null;
  students: number;
  hours: number | null;
  slug: string;
  thumbnail: string | null;
};

function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'CD';
}

export default function AcademyPage() {
  const { t } = useLanguage();
  const [courses, setCourses] = useState<CourseCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchCourses = async () => {
      try {
        setError(null);
        const response = await publicApi.getAcademyPage();
        const data = (response as any)?.data;
        const list = Array.isArray(data?.courses) ? data.courses : [];
        if (!mounted) return;
        setCourses(
          list.map((course: any) => ({
            id: course.id,
            title: course.title || 'Untitled',
            category: course.category || '',
            level: course.level || '',
            price: course.price ?? null,
            originalPrice: course.originalPrice ?? null,
            currency: course.currency || 'TZS',
            instructor: course.instructorName || course.instructor || 'CadorDigital',
            instructorAvatar: course.instructorAvatar || null,
            students: course.enrolledCount ?? 0,
            hours: course.estimatedHours ?? null,
            slug: course.slug,
            thumbnail: course.thumbnail || course.featuredImage || null,
          }))
        );
      } catch (err: any) {
        if (!mounted) return;
        console.error('Failed to fetch courses:', err?.message || err);
        setError(err?.response?.data?.message || t('academy.error'));
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchCourses();
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <PublicLayout>
        <section className="section-padding bg-slate-50">
          <div className="container-custom">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="animate-pulse overflow-hidden rounded-2xl bg-white shadow-md">
                  <div className="aspect-[4/5] bg-gray-200" />
                  <div className="space-y-3 p-5">
                    <div className="h-5 w-3/4 rounded bg-gray-200" />
                    <div className="h-4 w-1/2 rounded bg-gray-100" />
                    <div className="h-10 w-full rounded-full bg-gray-100" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </PublicLayout>
    );
  }

  if (error) {
    return (
      <PublicLayout>
        <section className="section-padding">
          <div className="container-custom text-center py-20">
            <p className="text-red-600 mb-4">{error}</p>
            <button onClick={() => window.location.reload()} className="btn-primary">{t('common.reload')}</button>
          </div>
        </section>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <section className="section-padding relative overflow-hidden bg-gradient-to-b from-primary-900 to-primary-800 text-white">
        <div aria-hidden className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-gold-500/10 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-gold-500/10 blur-3xl" />
        <div className="container-custom relative max-w-3xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-gold-500">{t('nav.academy')}</span>
          <h1 className="mb-6 mt-4 text-4xl font-bold md:text-6xl">{t('academy.title')}</h1>
          <p className="text-xl text-white/70">{t('academy.subtitle')}</p>
        </div>
      </section>

      <section className="section-padding bg-slate-50">
        <div className="container-custom">
          {courses.length === 0 ? (
            <div className="rounded-2xl border-t-4 border-gold-500 bg-white p-12 text-center shadow-md">
              <BookOpen className="mx-auto mb-4 h-12 w-12 text-gray-300" />
              <p className="text-gray-500">{t('academy.empty')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {courses.map((course) => {
                const price = typeof course.price === 'number' ? course.price : null;
                const originalPrice = typeof course.originalPrice === 'number' ? course.originalPrice : null;
                const hasPrice = price !== null && price > 0;
                const hasDiscount = hasPrice && originalPrice !== null && originalPrice > price!;

                return (
                  <article
                    key={course.id || course.slug}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-md shadow-gray-200/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                  >
                    <Link
                      href={`/courses/${course.slug}`}
                      className="relative block overflow-hidden bg-gradient-to-br from-primary-100 to-primary-200"
                    >
                      {course.thumbnail ? (
                        <PosterImage
                          src={course.thumbnail}
                          alt={course.title}
                          imageClassName="transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex aspect-[4/5] w-full items-center justify-center">
                          <BookOpen className="h-10 w-10 text-primary-400" />
                        </div>
                      )}
                      <div className="absolute inset-x-0 top-0 flex items-start justify-between p-4">
                        {course.category ? (
                          <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-primary-900 backdrop-blur">
                            {course.category}
                          </span>
                        ) : <span />}
                        <span
                          aria-hidden="true"
                          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-primary-700 shadow-sm backdrop-blur"
                        >
                          <Bookmark className="h-4 w-4" />
                        </span>
                      </div>
                    </Link>

                    <div className="flex flex-1 flex-col p-5">
                      <Link href={`/courses/${course.slug}`}>
                        <h3 className="min-h-[3.25rem] line-clamp-2 text-lg font-bold leading-snug text-primary-900 transition-colors group-hover:text-gold-600">
                          {course.title}
                        </h3>
                      </Link>

                      <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                        <span className="inline-flex items-center gap-1">
                          <Users className="h-4 w-4 text-gold-500" /> {course.students} {t('academy.enrolled')}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-4 w-4 text-gold-500" /> {course.hours ?? 0}{t('academyDetail.hours')}
                        </span>
                      </div>

                      <div className="mt-4 flex items-center gap-2">
                        {course.instructorAvatar ? (
                          <img
                            src={course.instructorAvatar}
                            alt={course.instructor}
                            className="h-7 w-7 rounded-full object-cover"
                          />
                        ) : (
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-50 text-[10px] font-bold text-primary-700">
                            {initials(course.instructor)}
                          </span>
                        )}
                        <p className="text-xs text-gray-500">
                          {t('academy.by')} <span className="font-medium text-gray-700">{course.instructor}</span>
                        </p>
                      </div>

                      <div className="mt-auto flex items-end justify-between gap-3 pt-5">
                        <div>
                          {hasPrice ? (
                            <>
                              {hasDiscount ? (
                                <p className="text-xs text-gray-400 line-through">
                                  {formatCurrency(originalPrice!, course.currency)}
                                </p>
                              ) : null}
                              <p className="text-xl font-bold text-primary-900">
                                {formatCurrency(price!, course.currency)}
                              </p>
                            </>
                          ) : (
                            <p className="text-xl font-bold text-green-600">{t('academy.free')}</p>
                          )}
                        </div>
                        <Link
                          href={`/register?type=course&slug=${course.slug}`}
                          className="inline-flex items-center justify-center gap-2 rounded-full bg-gold-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-gold-500/25 transition-all hover:-translate-y-0.5 hover:bg-gold-600"
                        >
                          <ShoppingCart className="h-4 w-4" /> {t('academy.buyNow')}
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </PublicLayout>
  );
}
