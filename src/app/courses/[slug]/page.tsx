import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  BookOpen,
  ChevronRight,
  Clock,
  GraduationCap,
  MessageCircle,
  Unlock,
  User,
  Users,
} from 'lucide-react';
import PublicLayout from '@/components/PublicLayout';
import ShareButtons from '@/components/ShareButtons';
import JsonLd from '@/components/JsonLd';
import CourseTabs from './CourseTabs';
import { siteConfig, absoluteUrl, getApiBase } from '@/lib/seo';
import { courseSchema, breadcrumbSchema } from '@/lib/jsonLd';
import { resolveImageUrl } from '@/lib/imageUtils';
import { sanitizeHtml } from '@/lib/sanitize';
import { formatCurrency } from '@/lib/utils';

export const dynamic = 'force-dynamic';

async function getCourse(slug: string) {
  try {
    const base = getApiBase();
    const res = await fetch(`${base}/academy/${encodeURIComponent(slug)}`, { cache: 'no-store' });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data ?? json;
  } catch {
    return null;
  }
}

function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'CD';
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const course = await getCourse(slug);
  if (!course) return { title: 'Course Not Found' };
  const title = course.title;
  const description = course.subtitle || (course.description ? String(course.description).replace(/<[^>]*>/g, ' ').slice(0, 160) : siteConfig.description);
  const url = absoluteUrl(`/courses/${slug}`);
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
  const lessons: any[] = modules.flatMap((module) => (Array.isArray(module.lessons) ? module.lessons : []));
  const cover = course.thumbnail || course.featuredImage;
  const introVideo: string | null = course.introVideo || null;
  const freeCount = lessons.filter((lesson) => lesson.isFree).length;
  const instructor = course.instructorName || course.instructor || 'CadorDigital';
  const instructorAvatar = course.instructorAvatar ? resolveImageUrl(course.instructorAvatar) : null;
  const hours = course.estimatedHours ?? 0;
  const enrolled = course.enrolledCount ?? 0;
  const currency = course.currency || 'TZS';
  const price = typeof course.price === 'number' ? course.price : null;
  const originalPrice = typeof course.originalPrice === 'number' ? course.originalPrice : null;
  const hasPrice = price !== null && price > 0;
  const hasDiscount = hasPrice && originalPrice !== null && originalPrice > price!;
  const descriptionHtml = course.description ? sanitizeHtml(course.description) : '';

  const breadcrumbJson = breadcrumbSchema([
    { name: 'Home', url: siteConfig.url },
    { name: 'Courses', url: absoluteUrl('/courses') },
    { name: course.title, url: absoluteUrl(`/courses/${slug}`) },
  ]);
  const courseJson = courseSchema({
    title: course.title,
    description: course.subtitle || String(course.description || '').replace(/<[^>]*>/g, ' ').slice(0, 160),
    slug,
    image: cover,
  });

  const videoPlayer = introVideo
    ? (() => {
        const isYouTube = introVideo.includes('youtube.com') || introVideo.includes('youtu.be');
        const youtubeId = isYouTube ? (introVideo.match(/(?:v=|youtu\.be\/)([^&]+)/)?.[1] || '') : '';
        const vimeoId = introVideo.match(/vimeo\.com\/(?:video\/)?(\d+)/)?.[1] || '';
        const poster = cover ? resolveImageUrl(cover) : undefined;

        if (isYouTube && youtubeId) {
          return (
            <div className="aspect-video w-full overflow-hidden rounded-2xl bg-black shadow-lg">
              <iframe
                src={`https://www.youtube.com/embed/${youtubeId}`}
                title={course.title}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                loading="lazy"
              />
            </div>
          );
        }

        if (vimeoId) {
          return (
            <div className="aspect-video w-full overflow-hidden rounded-2xl bg-black shadow-lg">
              <iframe
                src={`https://player.vimeo.com/video/${vimeoId}`}
                title={course.title}
                className="h-full w-full"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
                loading="lazy"
              />
            </div>
          );
        }

        if (introVideo.startsWith('http') || introVideo.startsWith('/uploads/') || introVideo.startsWith('//')) {
          return (
            <div className="aspect-video w-full overflow-hidden rounded-2xl bg-black shadow-lg">
              <video
                src={resolveImageUrl(introVideo)}
                controls
                poster={poster}
                className="h-full w-full object-contain"
                preload="metadata"
              >
                Your browser does not support the video tag.
              </video>
            </div>
          );
        }

        return null;
      })()
    : null;

  return (
    <PublicLayout>
      <JsonLd data={[courseJson, breadcrumbJson]} />

      <section className="bg-slate-50">
        <div className="container-custom py-10 md:py-14">
          <nav className="flex items-center gap-1 text-sm text-gray-500" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-gold-600">Home</Link>
            <ChevronRight className="h-4 w-4" />
            <Link href="/courses" className="hover:text-gold-600">Courses</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="truncate text-gray-700">{course.title}</span>
          </nav>

          <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-12">
            <div className="lg:col-span-2">
              <div className="flex flex-wrap gap-2">
                {course.category ? (
                  <span className="rounded-full bg-gold-50 px-3 py-1 text-xs font-semibold text-gold-700">{course.category}</span>
                ) : null}
                {course.level ? (
                  <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700">{course.level}</span>
                ) : null}
                {course.isFeatured ? (
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">Featured</span>
                ) : null}
              </div>

              <h1 className="mt-4 text-3xl font-bold leading-tight text-primary-900 md:text-5xl">{course.title}</h1>
              {course.subtitle ? <p className="mt-3 text-lg text-gray-600">{course.subtitle}</p> : null}

              <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-gray-500">
                <span className="inline-flex items-center gap-1.5"><User className="h-4 w-4 text-gold-500" /> {instructor}</span>
                <span className="inline-flex items-center gap-1.5"><Users className="h-4 w-4 text-gold-500" /> {enrolled} enrolled</span>
                <span className="inline-flex items-center gap-1.5"><Clock className="h-4 w-4 text-gold-500" /> {hours} hours</span>
                <span className="inline-flex items-center gap-1.5"><BookOpen className="h-4 w-4 text-gold-500" /> {lessons.length} lessons</span>
                <span className="inline-flex items-center gap-1.5"><Unlock className="h-4 w-4 text-green-500" /> {freeCount} free previews</span>
              </div>

              <div className="mt-5"><ShareButtons title={course.title} /></div>

              <div className="mt-8 max-w-[1066px]">
                {videoPlayer ?? (cover ? (
                  <div className="aspect-video w-full overflow-hidden rounded-2xl bg-gray-100 shadow-lg">
                    <img
                      src={resolveImageUrl(cover)}
                      alt={course.title}
                      loading="eager"
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex aspect-video w-full items-center justify-center rounded-2xl bg-gradient-to-br from-primary-800 to-primary-900 shadow-lg">
                    <BookOpen className="h-16 w-16 text-white/20" />
                  </div>
                ))}
              </div>

              <CourseTabs
                descriptionHtml={descriptionHtml}
                modules={modules}
                lessons={lessons}
                freeCount={freeCount}
                courseSlug={course.slug}
              />
            </div>

            <aside className="lg:col-span-1">
              <div className="space-y-5 lg:sticky lg:top-28">
                <div className="rounded-2xl border-t-4 border-gold-500 bg-white p-6 shadow-xl">
                  {hasPrice ? (
                    <>
                      {hasDiscount ? (
                        <p className="text-sm text-gray-400 line-through">
                          {formatCurrency(originalPrice!, currency)}
                        </p>
                      ) : null}
                      <p className="text-4xl font-bold text-primary-900">{formatCurrency(price!, currency)}</p>
                    </>
                  ) : (
                    <p className="text-4xl font-bold text-green-600">Free</p>
                  )}

                  <Link
                    href={`/register?type=course&slug=${course.slug}`}
                    className="btn-primary mt-5 w-full justify-center py-4 text-lg"
                  >
                    <MessageCircle className="h-5 w-5" /> Register Now
                  </Link>
                  <p className="mt-3 text-center text-xs text-gray-400">Continue on WhatsApp after registration.</p>

                  <ul className="mt-6 space-y-3 border-t border-gray-100 pt-5 text-sm text-gray-600">
                    <li className="flex items-center gap-2"><GraduationCap className="h-4 w-4 text-gold-500" /> {course.level || 'All Levels'}</li>
                    <li className="flex items-center gap-2"><Users className="h-4 w-4 text-gold-500" /> {enrolled} enrolled</li>
                    <li className="flex items-center gap-2"><Clock className="h-4 w-4 text-gold-500" /> {hours} hours</li>
                    <li className="flex items-center gap-2"><BookOpen className="h-4 w-4 text-gold-500" /> {lessons.length} lessons</li>
                    <li className="flex items-center gap-2"><Unlock className="h-4 w-4 text-green-500" /> {freeCount} free previews</li>
                  </ul>
                </div>

                <div className="rounded-2xl bg-white p-6 shadow-md">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">A Course By</p>
                  <div className="mt-4 flex items-center gap-3">
                    {instructorAvatar ? (
                      <img src={instructorAvatar} alt={instructor} className="h-12 w-12 rounded-full object-cover" />
                    ) : (
                      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-50 text-sm font-bold text-primary-700">
                        {initials(instructor)}
                      </span>
                    )}
                    <div>
                      <p className="font-bold text-primary-900">{instructor}</p>
                      {course.instructorBio ? (
                        <p className="mt-1 line-clamp-3 text-xs leading-relaxed text-gray-500">{course.instructorBio}</p>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
