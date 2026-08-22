'use client';

import Link from 'next/link';
import { Download, BookOpen } from 'lucide-react';
import PublicLayout from '@/components/PublicLayout';
import { publicApi } from '@/lib/api';
import { useEffect, useState } from 'react';

export default function AcademyPage() {
  const fallbackCourses = [
    { id: '1', title: 'Digital Marketing Masterclass', category: 'Marketing', level: 'Beginner', price: 150000, instructor: 'John Kimaro', students: 324, slug: 'digital-marketing-masterclass', thumbnail: null },
    { id: '2', title: 'Web Development Bootcamp', category: 'Technology', level: 'Intermediate', price: 250000, instructor: 'Sarah Mushi', students: 186, slug: 'web-development-bootcamp', thumbnail: null },
    { id: '3', title: 'Graphic Design Fundamentals', category: 'Design', level: 'Beginner', price: 100000, instructor: 'Amina Rashid', students: 512, slug: 'graphic-design-fundamentals', thumbnail: null },
    { id: '4', title: 'AI for Business', category: 'AI', level: 'Advanced', price: 300000, instructor: 'Dr. Emmanuel K', students: 98, slug: 'ai-for-business', thumbnail: null },
    { id: '5', title: 'Brand Strategy 101', category: 'Branding', level: 'Beginner', price: 80000, instructor: 'Grace Mwakasege', students: 245, slug: 'brand-strategy-101', thumbnail: null },
    { id: '6', title: 'Social Media Management', category: 'Marketing', level: 'Beginner', price: 120000, instructor: 'Peter Makundi', students: 431, slug: 'social-media-management', thumbnail: null },
  ];
  const [courses, setCourses] = useState<any[]>(fallbackCourses);

  useEffect(() => {
    const fetchCourses = () => {
      publicApi.getCourses().then((response) => {
        if (Array.isArray(response.data) && response.data.length > 0) {
          setCourses(response.data.map((course) => ({
            id: course.id,
            title: course.title,
            category: course.category || '',
            level: course.level || '',
            price: course.price,
            instructor: course.instructorName || '',
            students: course.enrolledCount,
            slug: course.slug,
            thumbnail: course.thumbnail || null,
          })));
        } else if (Array.isArray(response.data) && response.data.length === 0) {
          setCourses([]);
        }
      }).catch((err) => console.error('Failed to fetch courses:', err?.message));
    };
    fetchCourses();
    const onFocus = () => fetchCourses();
    const onVis = () => { if (!document.hidden) fetchCourses(); };
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVis);
    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);

  return (
    <PublicLayout>
      <section className="section-padding bg-gradient-to-b from-primary-900 to-primary-800 text-white">
        <div className="container-custom text-center max-w-3xl">
          <span className="text-gold-500 font-semibold text-sm uppercase tracking-wider">Academy</span>
          <h1 className="text-4xl md:text-6xl font-bold mt-4 mb-6">Learn & Grow</h1>
          <p className="text-xl text-white/70">Online courses to build your skills and grow your business.</p>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course) => (
              <Link key={course.slug} href={`/academy/${course.slug}`} className="card group overflow-hidden">
                <div className="aspect-video bg-gradient-to-br from-primary-200 to-primary-400 flex items-center justify-center">
                  <BookOpen className="w-10 h-10 text-primary-400" />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs bg-primary-50 text-primary-600 px-2 py-1 rounded-full">{course.category}</span>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{course.level}</span>
                  </div>
                  <h3 className="text-lg font-bold text-primary-900 group-hover:text-gold-500 transition-colors mb-2">
                    {course.title}
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">by {course.instructor}</p>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-primary-900">{course.price.toLocaleString()} TZS</span>
                    <span className="text-xs text-gray-400">{course.students} enrolled</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
