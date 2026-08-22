'use client';

import Link from 'next/link';
import { use } from 'react';
import { Clock, User, BookOpen, Check, MessageCircle } from 'lucide-react';
import PublicLayout from '@/components/PublicLayout';
import { publicApi } from '@/lib/api';
import { useEffect, useState } from 'react';
import { whatsappLink } from '@/lib/utils';

const courseData: Record<string, any> = {
  'digital-marketing-masterclass': {
    title: 'Digital Marketing Masterclass', subtitle: 'Master the art of digital marketing', category: 'Marketing', level: 'Beginner',
    instructor: 'John Kimaro', instructorBio: '10+ years in digital marketing. Helped 200+ businesses grow online.',
    price: 150000, students: 324, estimatedHours: 24,
    description: 'A comprehensive course covering everything from social media marketing to SEO, email marketing, and paid advertising.',
    lessons: [
      { title: 'Introduction to Digital Marketing', duration: 45, type: 'video' },
      { title: 'Social Media Marketing Fundamentals', duration: 60, type: 'video' },
      { title: 'Search Engine Optimization (SEO)', duration: 90, type: 'video' },
      { title: 'Google Ads & PPC', duration: 75, type: 'video' },
      { title: 'Email Marketing Strategies', duration: 50, type: 'video' },
      { title: 'Analytics & Reporting', duration: 60, type: 'video' },
    ],
  },
};

export default function CourseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [course, setCourse] = useState(courseData[slug]);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    publicApi.getCourse(slug).then((response) => {
      const item = response.data;
      setCourse({ title: item.title, subtitle: item.subtitle || '', category: item.category || '', level: item.level || '', instructor: item.instructorName || '', students: item.enrolledCount, estimatedHours: item.estimatedHours || 0, price: item.price, description: item.description || '', lessons: item.lessons || [] });
    }).catch(() => {}).finally(() => setLoaded(true));
  }, [slug]);
  if (!course && !loaded) return <PublicLayout><div className="section-padding text-center">Loading course...</div></PublicLayout>;
  if (!course) return <PublicLayout><div className="section-padding text-center"><h1 className="text-3xl font-bold">Course not found</h1><Link href="/academy" className="btn-primary mt-4">Back to Academy</Link></div></PublicLayout>;

  return (
    <PublicLayout>
      <section className="section-padding bg-gradient-to-b from-primary-900 to-primary-800 text-white">
        <div className="container-custom max-w-4xl">
          <Link href="/academy" className="text-white/60 hover:text-gold-500 text-sm mb-4 inline-block">← Back to Academy</Link>
          <div className="flex gap-3 mb-4">
            <span className="bg-gold-500/20 text-gold-400 px-3 py-1 rounded-full text-sm">{course.category}</span>
            <span className="bg-white/10 text-white px-3 py-1 rounded-full text-sm">{course.level}</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold mb-3">{course.title}</h1>
          <p className="text-xl text-white/70 mb-4">{course.subtitle}</p>
          <div className="flex flex-wrap items-center gap-6 text-white/70 text-sm">
            <span className="flex items-center gap-1"><User className="w-4 h-4" /> {course.instructor}</span>
            <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {course.estimatedHours}h</span>
            <span className="flex items-center gap-1"><BookOpen className="w-4 h-4" /> {course.lessons.length} lessons</span>
            <span>{course.students} enrolled</span>
          </div>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-custom max-w-4xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold text-primary-900 mb-4">About This Course</h2>
              <p className="text-gray-600 leading-relaxed mb-8">{course.description}</p>
              <h2 className="text-2xl font-bold text-primary-900 mb-4">Curriculum</h2>
              <div className="space-y-3">
                {course.lessons.map((lesson: any, i: number) => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-sm">{i + 1}</div>
                    <div className="flex-1">
                      <p className="font-medium text-primary-900">{lesson.title}</p>
                      <p className="text-xs text-gray-400">{lesson.duration} min</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="card p-6 sticky top-28">
                <div className="text-3xl font-bold text-primary-900 text-center mb-4">
                  {course.price.toLocaleString()} TZS
                </div>
                <a href={whatsappLink(course.title)} target="_blank" rel="noopener noreferrer" className="btn-primary w-full text-center py-3 mb-4 block">
                  <MessageCircle className="w-4 h-4 inline mr-2" /> Contact via WhatsApp
                </a>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> {course.lessons.length} lessons</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> {course.estimatedHours} hours of content</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> Lifetime access</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> Certificate of completion</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
