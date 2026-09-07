import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, Check, Palette, Globe, Megaphone, Cpu, Briefcase, Camera, Building2, MessageCircle } from 'lucide-react';
import PublicLayout from '@/components/PublicLayout';
import ShareButtons from '@/components/ShareButtons';
import JsonLd from '@/components/JsonLd';
import { siteConfig, absoluteUrl, getApiBase } from '@/lib/seo';
import { serviceSchema, breadcrumbSchema } from '@/lib/jsonLd';
import { whatsappLink } from '@/lib/utils';

export const revalidate = 3600;

const iconMap: Record<string, any> = {
  palette: Palette, globe: Globe, megaphone: Megaphone, cpu: Cpu, briefcase: Briefcase, camera: Camera, building: Building2, building2: Building2, code: Cpu,
};

async function getService(slug: string) {
  try {
    const base = getApiBase();
    const res = await fetch(`${base}/services/${encodeURIComponent(slug)}`, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    const json = await res.json();
    const data = json.data ?? json;
    const svc = data?.service ? data.service : data;
    if (svc && svc.slug) return svc;
    return null;
  } catch { return null; }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const svc = await getService(slug);
  if (!svc) return { title: 'Service Not Found' };
  const title = svc.name;
  const description = svc.description || svc.overview || siteConfig.description;
  const url = absoluteUrl(`/services/${slug}`);
  const image = svc.featuredImage ? (svc.featuredImage.startsWith('http') ? svc.featuredImage : absoluteUrl(svc.featuredImage)) : absoluteUrl(siteConfig.ogImage);
  return {
    title,
    description: String(description).slice(0, 160),
    alternates: { canonical: url },
    openGraph: { type: 'website', url, title, description: String(description).slice(0, 160), images: [{ url: image, width: 1200, height: 630, alt: title }] },
    twitter: { card: 'summary_large_image', title, description: String(description).slice(0, 160), images: [image] },
  };
}

export default async function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = await getService(slug);
  if (!service) notFound();
  const IconComponent = iconMap[(service.icon || '').toLowerCase()] || Globe;
  const benefits: string[] = Array.isArray(service.benefits) ? service.benefits : [];
  const processSteps: string[] = Array.isArray(service.process) ? service.process : [];
  const breadcrumbJson = breadcrumbSchema([{ name: 'Home', url: siteConfig.url }, { name: 'Services', url: absoluteUrl('/services') }, { name: service.name, url: absoluteUrl(`/services/${slug}`) }]);
  const serviceJson = serviceSchema({ name: service.name, description: service.description || service.overview || siteConfig.description, slug, image: service.featuredImage });

  return (
    <PublicLayout>
      <JsonLd data={[serviceJson, breadcrumbJson]} />
      <section className="section-padding bg-gradient-to-b from-primary-900 to-primary-800 text-white">
        <div className="container-custom">
          <div className="max-w-3xl">
            <Link href="/services" className="text-white/60 hover:text-gold-500 text-sm transition-colors mb-4 inline-block">← Back to Services</Link>
            <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mb-6">
              <IconComponent className="w-8 h-8 text-gold-400" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">{service.name}</h1>
            {service.description && <p className="text-xl text-white/70 leading-relaxed">{service.description}</p>}
            {service.overview && <p className="text-lg text-white/60 leading-relaxed mt-4">{service.overview}</p>}
            <div className="mt-6"><ShareButtons title={service.name} /></div>
          </div>
        </div>
      </section>

      {(benefits.length > 0 || processSteps.length > 0) && (
        <section className="section-padding">
          <div className="container-custom">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
              <div>
                <h2 className="text-3xl font-bold text-primary-900 mb-8">Benefits</h2>
                {benefits.length > 0 ? <ul className="space-y-4">{benefits.map((b: string) => <li key={b} className="flex items-start gap-3"><Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" /><span className="text-gray-700">{b}</span></li>)}</ul> : <p className="text-gray-400">No benefits listed.</p>}
              </div>
              <div>
                <h2 className="text-3xl font-bold text-primary-900 mb-8">Our Process</h2>
                {processSteps.length > 0 ? <div className="space-y-4">{processSteps.map((step: string, i: number) => <div key={step} className="flex items-center gap-4 p-4 card"><div className="w-10 h-10 rounded-full bg-gold-500 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">{i + 1}</div><span className="text-gray-700 font-medium">{step}</span></div>)}</div> : <p className="text-gray-400">No process steps listed.</p>}
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="section-padding bg-gray-50">
        <div className="container-custom text-center">
          <h2 className="text-3xl font-bold text-primary-900 mb-4">Interested in {service.name}?</h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">Let&apos;s discuss how {service.name.toLowerCase()} can help grow your business.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href={whatsappLink(service.name)} target="_blank" rel="noopener noreferrer" className="btn-primary text-lg px-8 py-4 gap-2">Chat on WhatsApp <MessageCircle className="w-5 h-5" /></a>
            <Link href="/pricing" className="btn-secondary text-lg px-8 py-4">View Pricing</Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
