'use client';

import Link from 'next/link';
import { Download, BookOpen, MessageCircle } from 'lucide-react';
import PublicLayout from '@/components/PublicLayout';
import { publicApi } from '@/lib/api';
import { useEffect, useState } from 'react';
import { whatsappLink } from '@/lib/utils';
import { useLanguage } from '@/lib/LanguageContext';
import { resolveImageUrl } from '@/lib/imageUtils';

export default function AcademyPage() {
  const { t } = useLanguage();
  const [courses, setCourses] = useState<any[]>([]);
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
            currency: course.currency || 'TZS',
            instructor: course.instructorName || course.instructor || 'CadorDigital',
            students: course.enrolledCount ?? 0,
            slug: course.slug,
            whatsappNumber: course.whatsappNumber || '',
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

  const formatPrice = (price: any, currency = 'TZS') => {
    if (price == null || price === '') return t('academy.free');
    const n = Number(price);
    if (Number.isNaN(n)) return t('academy.free');
    return `${n.toLocaleString()} ${currency}`;
  };

  if (loading) {
    return (
      <PublicLayout>
        <section className="section-padding">
          <div className="container-custom text-center py-20">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary-900 border-t-transparent" />
            <p className="mt-4 text-gray-500">{t('academy.loading')}</p>
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
      <section className="section-padding bg-gradient-to-b from-primary-900 to-primary-800 text-white">
        <div className="container-custom text-center max-w-3xl">
          <span className="text-gold-500 font-semibold text-sm uppercase tracking-wider">{t('nav.academy')}</span>
          <h1 className="text-4xl md:text-6xl font-bold mt-4 mb-6">{t('academy.title')}</h1>
          <p className="text-xl text-white/70">{t('academy.subtitle')}</p>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-custom">
          {courses.length === 0 ? (
            <div className="text-center py-16">
              <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">{t('academy.empty')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {courses.map((course) => (
                <div key={course.slug} className="card group overflow-hidden flex flex-col">
                  <Link href={`/academy/${course.slug}`}>
                    <div className="aspect-video bg-gradient-to-br from-primary-200 to-primary-400 flex items-center justify-center overflow-hidden">
                      {course.thumbnail ? (
                        <img src={resolveImageUrl(course.thumbnail)} alt={course.title} width={600} height={340} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <BookOpen className="w-10 h-10 text-primary-400" />
                      )}
                    </div>
                  </Link>
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {course.category ? (
                        <span className="text-xs bg-primary-50 text-primary-600 px-2 py-1 rounded-full">{course.category}</span>
                      ) : null}
                      {course.level ? (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{course.level}</span>
                      ) : null}
                    </div>
                    <Link href={`/academy/${course.slug}`}>
                      <h3 className="text-lg font-bold text-primary-900 group-hover:text-gold-500 transition-colors mb-2">
                        {course.title}
                      </h3>
                    </Link>
                    <p className="text-sm text-gray-500 mb-4">{t('academy.by')} {course.instructor}</p>
                    <div className="flex items-center justify-between mb-4 mt-auto">
                      <span className="font-bold text-primary-900">{formatPrice(course.price, course.currency)}</span>
                      <span className="text-xs text-gray-400">{course.students} {t('academy.enrolled')}</span>
                    </div>
                    <a
                      href={whatsappLink(`enrolling in ${course.title}`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary w-full text-center justify-center gap-2 inline-flex"
                    >
                      <MessageCircle className="w-4 h-4" /> {t('academy.enroll')}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </PublicLayout>
  );
}
