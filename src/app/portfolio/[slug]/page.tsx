import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowRight,
  Calendar,
  CheckCircle,
  ChevronRight,
  Clock,
  Download,
  ExternalLink,
  Star,
  Tag,
  User,
} from 'lucide-react';
import PublicLayout from '@/components/PublicLayout';
import ShareButtons from '@/components/ShareButtons';
import PortfolioLightbox from '@/components/PortfolioLightbox';
import ProjectTabs from './ProjectTabs';
import JsonLd from '@/components/JsonLd';
import { siteConfig, absoluteUrl, getApiBase } from '@/lib/seo';
import { portfolioSchema, breadcrumbSchema } from '@/lib/jsonLd';
import { resolveImageUrl } from '@/lib/imageUtils';

export const revalidate = 3600;

async function getProject(slug: string) {
  try {
    const base = getApiBase();
    const res = await fetch(`${base}/portfolio/${encodeURIComponent(slug)}`, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data ?? json;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProject(slug);
  if (!p) return { title: 'Project Not Found' };
  const title = p.title;
  const description = p.solution || p.challenge || p.results || p.category || siteConfig.description;
  const url = absoluteUrl(`/portfolio/${slug}`);
  const image = p.featuredImage ? resolveImageUrl(p.featuredImage) : absoluteUrl(siteConfig.ogImage);
  const ogImage = image.startsWith('http') ? image : absoluteUrl(image);
  return {
    title,
    description: String(description).slice(0, 160),
    alternates: { canonical: url },
    openGraph: { type: 'website', url, title, description: String(description).slice(0, 160), images: [{ url: ogImage, width: 1200, height: 630, alt: title }] },
    twitter: { card: 'summary_large_image', title, description: String(description).slice(0, 160), images: [ogImage] },
  };
}

export default async function CaseStudyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) notFound();

  const techStack: string[] = Array.isArray(project.techStack) ? project.techStack : [];
  const galleryImages: { url: string; alt?: string }[] = Array.isArray(project.galleryImages) ? project.galleryImages : [];
  const testimonial = (project.clientTestimonial as any) || null;
  const fallbackTestimonial = project.testimonialText
    ? { quote: project.testimonialText, author: project.testimonialAuthor || '', role: project.testimonialPosition || '' }
    : null;
  const displayTestimonial = testimonial && testimonial.quote ? testimonial : fallbackTestimonial;
  const completionDate = project.completionDate
    ? new Date(project.completionDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
    : null;
  const statusLabel = project.status ? project.status.replace(/_/g, ' ') : null;

  const getEmbedUrl = (url: string) => {
    if (!url) return null;
    if (url.includes('youtube.com/watch')) return url.replace('watch?v=', 'embed/');
    if (url.includes('youtu.be/')) return url.replace('youtu.be/', 'www.youtube.com/embed/');
    return url;
  };

  const videoEmbedUrl = project.videoUrl ? getEmbedUrl(project.videoUrl) || project.videoUrl : null;
  const galleryForTabs = galleryImages.map((image) => ({
    url: resolveImageUrl(image.url),
    alt: image.alt || `${project.title} gallery`,
  }));

  const breadcrumbJson = breadcrumbSchema([
    { name: 'Home', url: siteConfig.url },
    { name: 'Portfolio', url: absoluteUrl('/portfolio') },
    { name: project.title, url: absoluteUrl(`/portfolio/${slug}`) },
  ]);
  const creativeJson = portfolioSchema({
    title: project.title,
    description: project.solution || project.challenge || siteConfig.description,
    slug,
    image: project.featuredImage,
  });

  return (
    <PublicLayout>
      <JsonLd data={[creativeJson, breadcrumbJson]} />

      <section className="bg-slate-50">
        <div className="container-custom py-10 md:py-14">
          <nav className="flex items-center gap-1 text-sm text-gray-500" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-gold-600">Home</Link>
            <ChevronRight className="h-4 w-4" />
            <Link href="/portfolio" className="hover:text-gold-600">Portfolio</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="truncate text-gray-700">{project.title}</span>
          </nav>

          <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-12">
            <div className="lg:col-span-2">
              <div className="flex flex-wrap gap-2">
                {project.category ? (
                  <span className="rounded-full bg-gold-50 px-3 py-1 text-xs font-semibold text-gold-700">{project.category}</span>
                ) : null}
                {project.industry ? (
                  <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700">{project.industry}</span>
                ) : null}
                {project.status ? (
                  <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
                    project.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                  }`}>
                    {project.status === 'COMPLETED' ? <CheckCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                    {statusLabel}
                  </span>
                ) : null}
                {project.isFeatured ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-gold-500 px-3 py-1 text-xs font-semibold text-white">
                    <Star className="h-3 w-3" /> Featured
                  </span>
                ) : null}
              </div>

              <h1 className="mt-4 text-3xl font-bold leading-tight text-primary-900 md:text-5xl">{project.title}</h1>

              <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-gray-500">
                {project.clientName ? (
                  <span className="inline-flex items-center gap-1.5"><User className="h-4 w-4 text-gold-500" /> {project.clientName}</span>
                ) : null}
                {completionDate ? (
                  <span className="inline-flex items-center gap-1.5"><Calendar className="h-4 w-4 text-gold-500" /> {completionDate}</span>
                ) : null}
                {project.category ? (
                  <span className="inline-flex items-center gap-1.5"><Tag className="h-4 w-4 text-gold-500" /> {project.category}</span>
                ) : null}
              </div>

              <div className="mt-5"><ShareButtons title={project.title} /></div>

              <div className="mt-8 max-w-[1066px]">
                {project.featuredImage ? (
                  <PortfolioLightbox src={resolveImageUrl(project.featuredImage)} alt={project.title} />
                ) : (
                  <div className="flex aspect-[4/3] w-full items-center justify-center rounded-2xl bg-gradient-to-br from-primary-800 via-primary-900 to-primary-800 shadow-lg">
                    <div className="text-center">
                      <p className="text-lg text-white/30">No image available</p>
                      <p className="mt-1 text-sm text-white/20">{project.title}</p>
                    </div>
                  </div>
                )}
              </div>

              <ProjectTabs
                challenge={project.challenge}
                solution={project.solution}
                results={project.results}
                techStack={techStack}
                testimonial={displayTestimonial}
                videoEmbedUrl={videoEmbedUrl}
                galleryImages={galleryForTabs}
              />
            </div>

            <aside className="lg:col-span-1">
              <div className="space-y-5 lg:sticky lg:top-28">
                <div className="rounded-2xl border-t-4 border-gold-500 bg-white p-6 shadow-xl">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Project Snapshot</p>
                  <ul className="mt-4 space-y-3 text-sm text-gray-600">
                    {project.clientName ? (
                      <li className="flex items-center gap-2"><User className="h-4 w-4 text-gold-500" /> {project.clientName}</li>
                    ) : null}
                    {project.category ? (
                      <li className="flex items-center gap-2"><Tag className="h-4 w-4 text-gold-500" /> {project.category}</li>
                    ) : null}
                    {completionDate ? (
                      <li className="flex items-center gap-2"><Calendar className="h-4 w-4 text-gold-500" /> {completionDate}</li>
                    ) : null}
                    {statusLabel ? (
                      <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> {statusLabel}</li>
                    ) : null}
                    {project.industry ? (
                      <li className="flex items-center gap-2"><Tag className="h-4 w-4 text-gold-500" /> {project.industry}</li>
                    ) : null}
                  </ul>

                  <div className="mt-6 space-y-3 border-t border-gray-100 pt-5">
                    {project.projectUrl ? (
                      <a
                        href={project.projectUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-secondary w-full justify-center gap-2"
                      >
                        Visit Site <ExternalLink className="h-4 w-4" />
                      </a>
                    ) : null}
                    {project.pdfUrl ? (
                      <a
                        href={resolveImageUrl(project.pdfUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-secondary w-full justify-center gap-2"
                      >
                        <Download className="h-4 w-4" /> {project.pdfName || 'Download PDF'}
                      </a>
                    ) : null}
                  </div>
                </div>

                <div className="rounded-2xl bg-white p-6 shadow-md">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Need something similar?</p>
                  <p className="mt-2 text-sm leading-relaxed text-gray-600">
                    Let&apos;s discuss your project and build something amazing together.
                  </p>
                  <Link href="/contact" className="btn-primary mt-4 w-full justify-center gap-2 py-3">
                    Start a Project <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
