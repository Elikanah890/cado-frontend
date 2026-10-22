import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, ExternalLink, Calendar, Tag, User, CheckCircle, Clock, Star, Quote, FileText, Download } from 'lucide-react';
import PublicLayout from '@/components/PublicLayout';
import ShareButtons from '@/components/ShareButtons';
import PortfolioLightbox from '@/components/PortfolioLightbox';
import PosterImage from '@/components/PosterImage';
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
  } catch { return null; }
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
  const fallbackTestimonial = project.testimonialText ? { quote: project.testimonialText, author: project.testimonialAuthor || '', role: project.testimonialPosition || '' } : null;
  const displayTestimonial = testimonial && testimonial.quote ? testimonial : fallbackTestimonial;
  const completionDate = project.completionDate ? new Date(project.completionDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : null;
  const getEmbedUrl = (url: string) => {
    if (!url) return null;
    if (url.includes('youtube.com/watch')) return url.replace('watch?v=', 'embed/');
    if (url.includes('youtu.be/')) return url.replace('youtu.be/', 'www.youtube.com/embed/');
    return url;
  };
  const breadcrumbJson = breadcrumbSchema([{ name: 'Home', url: siteConfig.url }, { name: 'Portfolio', url: absoluteUrl('/portfolio') }, { name: project.title, url: absoluteUrl(`/portfolio/${slug}`) }]);
  const creativeJson = portfolioSchema({ title: project.title, description: project.solution || project.challenge || siteConfig.description, slug, image: project.featuredImage });

  return (
    <PublicLayout>
      <JsonLd data={[creativeJson, breadcrumbJson]} />
      <section className="relative bg-primary-900 overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 right-0 h-72 w-72 rounded-full bg-gold-500/10 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />
        </div>
        <div className="container-custom relative z-10 py-12 md:py-16">
          <Link href="/portfolio" className="text-white/60 hover:text-gold-500 text-sm mb-6 inline-block">← Back to Portfolio</Link>

          <div className="w-full max-w-md sm:max-w-2xl md:max-w-3xl mx-auto">
            {project.featuredImage ? (
              <PortfolioLightbox src={resolveImageUrl(project.featuredImage)} alt={project.title} />
            ) : (
              <div className="aspect-[4/5] w-full rounded-2xl bg-gradient-to-br from-primary-800 via-primary-900 to-primary-800 shadow-2xl flex items-center justify-center">
                <div className="text-center">
                  <p className="text-white/30 text-lg">No image available</p>
                  <p className="text-white/20 text-sm mt-1">{project.title}</p>
                </div>
              </div>
            )}
          </div>

          <div className="mx-auto mt-8 max-w-3xl text-center">
            <div className="flex flex-wrap justify-center gap-2 mb-4">
              {project.category && <span className="bg-white/15 text-white px-3 py-1 rounded-full text-sm flex items-center gap-1"><Tag className="w-3 h-3" /> {project.category}</span>}
              {project.industry && <span className="bg-white/15 text-white px-3 py-1 rounded-full text-sm">{project.industry}</span>}
              {project.status && <span className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 ${project.status === 'COMPLETED' ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'}`}>{project.status === 'COMPLETED' ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />} {project.status.replace('_', ' ')}</span>}
              {project.isFeatured && <span className="bg-gold-500 text-white px-3 py-1 rounded-full text-sm flex items-center gap-1"><Star className="w-3 h-3" /> Featured</span>}
            </div>

            <h1 className="text-3xl md:text-5xl font-bold text-white mb-3">{project.title}</h1>

            <div className="flex flex-wrap items-center justify-center gap-4 text-white/70">
              {project.clientName && <span className="flex items-center gap-1"><User className="w-4 h-4" /> {project.clientName}</span>}
              {completionDate && <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {completionDate}</span>}
            </div>

            {(project.projectUrl || project.pdfUrl) && (
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                {project.projectUrl && <a href={project.projectUrl} target="_blank" rel="noopener noreferrer" className="btn-primary inline-flex items-center gap-2">Visit Site <ExternalLink className="w-4 h-4" /></a>}
                {project.pdfUrl && (
                  <a href={resolveImageUrl(project.pdfUrl)} target="_blank" rel="noopener noreferrer" className="btn-secondary inline-flex items-center gap-2">
                    <Download className="w-4 h-4" /> {project.pdfName ? 'Download PDF' : 'View PDF'}
                  </a>
                )}
              </div>
            )}

            <div className="mt-5 flex justify-center"><ShareButtons title={project.title} /></div>
          </div>
        </div>
      </section>

      {project.pdfUrl && (
        <section className="section-padding bg-gold-50">
          <div className="container-custom max-w-4xl">
            <div className="card p-8 flex flex-col sm:flex-row items-center gap-6 border-gold-200">
              <div className="w-16 h-16 rounded-2xl bg-gold-500 text-white flex items-center justify-center shrink-0"><FileText className="w-8 h-8" /></div>
              <div className="flex-1 text-center sm:text-left">
                <h3 className="text-xl font-bold text-primary-900 mb-1">Company Profile</h3>
                <p className="text-gray-600 text-sm">Download the full company profile / case study document for this project.</p>
              </div>
              <a href={resolveImageUrl(project.pdfUrl)} target="_blank" rel="noopener noreferrer" className="btn-primary inline-flex items-center gap-2 shrink-0">
                <Download className="w-4 h-4" /> {project.pdfName || 'Download PDF'}
              </a>
            </div>
          </div>
        </section>
      )}

      <section className="section-padding">
        <div className="container-custom max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card p-8"><h3 className="text-xl font-bold text-primary-900 mb-4">Challenge</h3><p className="text-gray-600 whitespace-pre-wrap">{project.challenge || 'No challenge described.'}</p></div>
            <div className="card p-8"><h3 className="text-xl font-bold text-primary-900 mb-4">Solution</h3><p className="text-gray-600 whitespace-pre-wrap">{project.solution || 'No solution described.'}</p></div>
            <div className="card p-8"><h3 className="text-xl font-bold text-primary-900 mb-4">Results</h3><p className="text-gray-600 whitespace-pre-wrap">{project.results || 'No results described.'}</p></div>
          </div>
        </div>
      </section>

      {project.videoUrl && (
        <section className="section-padding">
          <div className="container-custom max-w-4xl">
            <h2 className="text-3xl font-bold text-primary-900 text-center mb-8">Project Video</h2>
            <div className="aspect-video rounded-xl overflow-hidden border bg-black"><iframe src={getEmbedUrl(project.videoUrl) || project.videoUrl} title="Project Video" className="w-full h-full" allowFullScreen loading="lazy" /></div>
          </div>
        </section>
      )}

      {galleryImages.length > 0 && (
        <section className="section-padding bg-gray-50">
          <div className="container-custom max-w-4xl">
            <h2 className="text-3xl font-bold text-primary-900 text-center mb-8">Project Gallery</h2>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {galleryImages.map((img, i) => (
                <div key={i} className="rounded-xl overflow-hidden border bg-white shadow-sm hover:shadow-md transition-shadow">
                  <PosterImage src={img.url} alt={img.alt || `${project.title} gallery ${i + 1}`} className="rounded-none" />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {techStack.length > 0 && (
        <section className="section-padding bg-gray-50">
          <div className="container-custom max-w-4xl text-center">
            <h2 className="text-2xl font-bold text-primary-900 mb-6">Tech Stack</h2>
            <div className="flex flex-wrap justify-center gap-3">{techStack.map((tech) => <span key={tech} className="bg-white border border-gray-200 text-primary-700 px-4 py-2 rounded-full text-sm font-medium shadow-sm">{tech}</span>)}</div>
          </div>
        </section>
      )}

      {displayTestimonial && (
        <section className="section-padding">
          <div className="container-custom max-w-3xl">
            <div className="card p-8 bg-gradient-to-br from-primary-50 to-white border-primary-100">
              <Quote className="w-8 h-8 text-gold-500 mb-4" />
              <p className="text-lg text-gray-700 italic leading-relaxed">“{displayTestimonial.quote}”</p>
              <p className="mt-4 font-semibold text-primary-900">{displayTestimonial.author}</p>
              {displayTestimonial.role && <p className="text-sm text-gray-500">{displayTestimonial.role}</p>}
            </div>
          </div>
        </section>
      )}

      <section className="section-padding bg-primary-900 text-white">
        <div className="container-custom text-center">
          <h2 className="text-3xl font-bold mb-4">Want a similar project?</h2>
          <p className="text-white/70 mb-8 max-w-2xl mx-auto">Let&apos;s build something amazing together. Get in touch for a free consultation.</p>
          <Link href="/contact" className="btn-primary text-lg px-8 py-4 gap-2 inline-flex">Start a Project <ArrowRight className="w-5 h-5" /></Link>
        </div>
      </section>
    </PublicLayout>
  );
}
