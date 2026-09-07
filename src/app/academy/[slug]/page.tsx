import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Clock, User, BookOpen, Check, MessageCircle, Lock, Unlock, PlayCircle, Video } from 'lucide-react';
import PublicLayout from '@/components/PublicLayout';
import ShareButtons from '@/components/ShareButtons';
import JsonLd from '@/components/JsonLd';
import { siteConfig, absoluteUrl, getApiBase } from '@/lib/seo';
import { courseSchema, breadcrumbSchema } from '@/lib/jsonLd';
import { resolveImageUrl } from '@/lib/imageUtils';
import { sanitizeHtml } from '@/lib/sanitize';
import { whatsappLink } from '@/lib/utils';

export const revalidate = 3600;

async function getCourse(slug: string) {
  try {
    const base = getApiBase();
    const res = await fetch(`${base}/academy/${encodeURIComponent(slug)}`, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data ?? json;
  } catch { return null; }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const course = await getCourse(slug);
  if (!course) return { title: 'Course Not Found' };
  const title = course.title;
  const description = course.subtitle || (course.description ? String(course.description).replace(/<[^>]*>/g, ' ').slice(0, 160) : siteConfig.description);
  const url = absoluteUrl(`/academy/${slug}`);
  const imageRaw = course.thumbnail || course.featuredImage || siteConfig.ogImage;
  const image = imageRaw?.startsWith('http') ? imageRaw : absoluteUrl(imageRaw || siteConfig.ogImage);
  return {
    title,
    description: String(description).slice(0, 160),
    alternates: { canonical: url },
    openGraph: { type: 'website', url, title, description: String(description).slice(0, 160), images: [{ url: image, width: 1200, height: 630, alt: title }] },
    twitter: { card: 'summary_large_image', title, description: String(description).slice(0, 160), images: [image] },
  };
}

export default async function CourseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const course = await getCourse(slug);
  if (!course) notFound();
  const modules: any[] = Array.isArray(course.modules) ? course.modules : [];
  const lessons: any[] = modules.flatMap((m) => (Array.isArray(m.lessons) ? m.lessons : []));
  const cover = course.thumbnail || course.featuredImage;
  const introVideo: string | null = course.introVideo || null;
  const waLink = whatsappLink(`enrolling in ${course.title}`);
  const freeCount = lessons.filter((l) => l.isFree).length;
  const currency = course.currency || 'TZS';
  const formatPrice = (price: any) => {
    if (price == null || price === '') return 'Free';
    const n = Number(price);
    if (Number.isNaN(n) || n === 0) return 'Free';
    return `${n.toLocaleString()} ${currency}`;
  };
  const breadcrumbJson = breadcrumbSchema([{ name: 'Home', url: siteConfig.url }, { name: 'Academy', url: absoluteUrl('/academy') }, { name: course.title, url: absoluteUrl(`/academy/${slug}`) }]);
  const courseJson = courseSchema({ title: course.title, description: course.subtitle || String(course.description || '').replace(/<[^>]*>/g, ' ').slice(0, 160), slug, image: cover });

  const renderVideo = (videoUrl: string | null, title: string) => {
    if (!videoUrl) return null;
    const isYT = videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be');
    const ytId = isYT ? (videoUrl.match(/(?:v=|youtu\.be\/)([^&]+)/)?.[1] || '') : '';
    if (isYT && ytId) return <iframe src={`https://www.youtube.com/embed/${ytId}`} title={title} className="w-full aspect-video rounded-xl" allowFullScreen loading="lazy" />;
    if (videoUrl.startsWith('http') || videoUrl.startsWith('/uploads/')) return <video src={resolveImageUrl(videoUrl)} controls className="w-full aspect-video rounded-xl bg-black" preload="metadata" />;
    return null;
  };

  return (
    <PublicLayout>
      <JsonLd data={[courseJson, breadcrumbJson]} />
      <section className="bg-gray-900">
        {cover ? <div className="relative h-72 md:h-96 w-full overflow-hidden"><img src={resolveImageUrl(cover)} alt={course.title} width={1200} height={600} loading="eager" className="w-full h-full object-cover" /></div> : <div className="h-56 w-full bg-gradient-to-b from-primary-800 to-primary-900" />}
        <div className="container-custom max-w-4xl -mt-16 relative z-10 text-white">
          <Link href="/academy" className="text-white/60 hover:text-gold-400 text-sm mb-4 inline-block">← Back to Academy</Link>
          <div className="flex gap-3 mb-4">
            {course.category ? <span className="bg-gold-500/20 text-gold-400 px-3 py-1 rounded-full text-sm">{course.category}</span> : null}
            {course.level ? <span className="bg-white/10 text-white px-3 py-1 rounded-full text-sm">{course.level}</span> : null}
          </div>
          <h1 className="text-3xl md:text-5xl font-bold mb-3">{course.title}</h1>
          {course.subtitle ? <p className="text-xl text-white/70 mb-4">{course.subtitle}</p> : null}
          <div className="flex flex-wrap items-center gap-6 text-white/70 text-sm">
            <span className="flex items-center gap-1"><User className="w-4 h-4" /> {course.instructor || course.instructorName || 'CadorDigital'}</span>
            <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {course.estimatedHours ?? 0} hours</span>
            <span className="flex items-center gap-1"><BookOpen className="w-4 h-4" /> {lessons.length} lessons</span>
            <span className="flex items-center gap-1"><Unlock className="w-4 h-4" /> {freeCount} free previews</span>
            <span>{course.enrolledCount ?? 0} enrolled</span>
          </div>
          <div className="mt-6 pb-6"><ShareButtons title={course.title} /></div>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-custom max-w-4xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              {introVideo ? <div className="mb-10"><h2 className="text-2xl font-bold text-primary-900 mb-4 flex items-center gap-2"><Video className="w-5 h-5 text-gold-500" /> Course Intro</h2>{renderVideo(introVideo, course.title)}</div> : null}
              <h2 className="text-2xl font-bold text-primary-900 mb-4">About this course</h2>
              {course.description ? <div className="text-gray-600 leading-relaxed mb-8 prose prose-primary max-w-none" dangerouslySetInnerHTML={{ __html: sanitizeHtml(course.description) }} /> : <p className="text-gray-600 leading-relaxed mb-8">No description available.</p>}
              <h2 className="text-2xl font-bold text-primary-900 mb-4">Curriculum</h2>
              {lessons.length === 0 ? <p className="text-gray-500">No lessons yet.</p> : <div className="space-y-6">{modules.map((module) => <div key={module.id || module.title} className="border rounded-xl overflow-hidden"><div className="bg-primary-900 text-white px-5 py-3 font-bold flex items-center justify-between"><span>{module.title || 'Course Content'}</span><span className="text-xs font-medium text-white/70">{module.lessons?.length || 0} lessons</span></div><div className="divide-y divide-gray-100">{(module.lessons || []).map((lesson: any, i: number) => <div key={lesson.id || i} className="flex items-center gap-4 p-4 bg-white hover:bg-gray-50 transition-colors">{lesson.isFree ? <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-green-100 text-green-700 shrink-0"><Unlock className="w-4 h-4" /></span> : <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-100 text-amber-700 shrink-0"><Lock className="w-4 h-4" /></span>}<div className="flex-1 min-w-0"><p className="font-medium text-primary-900 flex items-center gap-2">{lesson.isFree ? <PlayCircle className="w-4 h-4 text-green-600 shrink-0" /> : <Lock className="w-4 h-4 text-amber-500 shrink-0" />}{lesson.title}</p>{lesson.videoDuration ? <p className="text-xs text-gray-400 mt-0.5">{lesson.videoDuration} min</p> : null}</div>{lesson.isFree ? <span className="text-xs font-semibold text-green-700 bg-green-50 px-2.5 py-1 rounded-full shrink-0">Free Preview</span> : <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full shrink-0">Locked</span>}</div>)}</div></div>)}</div>}
              <div className="mt-8"><Link href={`/academy/${course.slug}/learn`} className="btn-primary inline-block">Start Learning →</Link></div>
            </div>
            <div>
              <div className="card p-6 sticky top-28">
                <div className="text-3xl font-bold text-primary-900 text-center mb-1">{formatPrice(course.price)}</div>
                {course.price != null && Number(course.price) > 0 && <p className="text-center text-xs text-gray-400 mb-4">One-time payment</p>}
                <a href={waLink} target="_blank" rel="noopener noreferrer" className="btn-primary w-full text-center py-3 mb-4 block"><MessageCircle className="w-4 h-4 inline mr-2" /> Enroll Now</a>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> {lessons.length} lessons</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> {freeCount} free preview lessons</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> {course.estimatedHours ?? 0} hours of content</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> Lifetime access</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> Certificate of completion</li>
                </ul>
                <div className="mt-5 p-3 rounded-lg bg-primary-50 text-sm text-primary-800 border border-primary-100 text-center">Click Enroll to chat on WhatsApp</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
