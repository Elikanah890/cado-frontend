'use client';

import Link from 'next/link';
import {
  ArrowRight, Palette, Globe, Megaphone, Cpu, Briefcase,
  Camera, Building2
} from 'lucide-react';
import PublicLayout from '@/components/PublicLayout';
import { publicApi } from '@/lib/api';
import { useEffect, useState } from 'react';

const iconMap: Record<string, typeof Palette> = { palette: Palette, globe: Globe, megaphone: Megaphone, cpu: Cpu, briefcase: Briefcase, camera: Camera, building: Building2 };

const fallbackServices = [
  { title: 'Brand Identity', desc: 'Logo design, brand guidelines, visual identity, brand strategy, and messaging that makes your business unforgettable.', icon: Palette, slug: 'brand-identity' },
  { title: 'Website Development', desc: 'Custom websites, e-commerce platforms, web applications, and portals built for performance and conversions.', icon: Globe, slug: 'website-development' },
  { title: 'Digital Marketing', desc: 'Social media management, SEO, Google Ads, content marketing, and email campaigns that drive growth.', icon: Megaphone, slug: 'digital-marketing' },
  { title: 'AI & Automation', desc: 'AI chatbots, workflow automation, data analytics, and intelligent systems that save time and cut costs.', icon: Cpu, slug: 'ai-automation' },
  { title: 'Business Solutions', desc: 'Custom ERP, CRM, POS systems, inventory management, and business intelligence solutions.', icon: Briefcase, slug: 'business-solutions' },
  { title: 'Creative Studio', desc: 'Professional photography, videography, animation, graphic design, and creative content production.', icon: Camera, slug: 'creative-studio' },
  { title: 'Company Registration', desc: 'BRELA registration, tax compliance, business permits, and company documentation services.', icon: Building2, slug: 'company-registration' },
];

export default function ServicesPage() {
  const [services, setServices] = useState(fallbackServices);

  useEffect(() => {
    const fetchServices = () => {
      publicApi.getServices().then((response) => {
        if (Array.isArray(response.data) && response.data.length > 0) {
          setServices(response.data.map((service) => ({
            title: service.name,
            desc: service.description || service.overview || '',
            icon: iconMap[service.icon || ''] || Globe,
            slug: service.slug,
          })));
        } else if (Array.isArray(response.data) && response.data.length === 0) {
          setServices([]);
        }
      }).catch((err) => console.error('Failed to fetch services:', err?.message));
    };
    fetchServices();
    const onFocus = () => fetchServices();
    const onVis = () => { if (!document.hidden) fetchServices(); };
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
          <span className="text-gold-500 font-semibold text-sm uppercase tracking-wider">Services</span>
          <h1 className="text-4xl md:text-6xl font-bold mt-4 mb-6">Our Services</h1>
          <p className="text-xl text-white/70">Comprehensive digital solutions for modern businesses.</p>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, i) => (
              <Link
                key={service.slug}
                href={`/services/${service.slug}`}
                className="card p-8 group animate-slide-up"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="w-14 h-14 rounded-2xl bg-primary-50 flex items-center justify-center mb-5 group-hover:bg-gold-500/10 transition-colors">
                  <service.icon className="w-7 h-7 text-primary-700 group-hover:text-gold-500 transition-colors" />
                </div>
                <h3 className="text-xl font-bold text-primary-900 mb-3 group-hover:text-gold-500 transition-colors">{service.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">{service.desc}</p>
                <span className="text-gold-500 text-sm font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
                  View Details <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding bg-gray-50">
        <div className="container-custom text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-900 mb-4">Need a Custom Solution?</h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            We create tailored solutions for unique business needs. Let&apos;s discuss your project.
          </p>
          <Link href="/contact" className="btn-primary text-lg px-8 py-4">
            Get a Free Consultation
          </Link>
        </div>
      </section>
    </PublicLayout>
  );
}
