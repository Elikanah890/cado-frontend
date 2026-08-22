'use client';

import Link from 'next/link';
import {
  ArrowRight, Palette, Globe, Megaphone, Cpu, Briefcase,
  Camera, Building2, Rocket, BookOpen, Hotel, HardHat,
  HeartPulse, Handshake, ShoppingBag, TrendingUp, Zap,
  Sparkles, Phone
} from 'lucide-react';
import PublicLayout from '@/components/PublicLayout';
import { publicApi } from '@/lib/api';
import { useEffect, useState } from 'react';

const serviceIcons: Record<string, typeof Palette> = { palette: Palette, globe: Globe, megaphone: Megaphone, cpu: Cpu, briefcase: Briefcase, camera: Camera, building: Building2 };

const fallbackServices = [
  { title: 'Brand Identity', desc: 'Build a memorable brand that stands out from the competition.', icon: Palette, slug: 'brand-identity' },
  { title: 'Website Development', desc: 'Professional websites optimized for performance and conversions.', icon: Globe, slug: 'website-development' },
  { title: 'Digital Marketing', desc: 'Data-driven marketing that grows your business revenue.', icon: Megaphone, slug: 'digital-marketing' },
  { title: 'AI & Automation', desc: 'Smart systems and chatbots that save time and money.', icon: Cpu, slug: 'ai-automation' },
  { title: 'Business Solutions', desc: 'Custom ERP, CRM and business management systems.', icon: Briefcase, slug: 'business-solutions' },
  { title: 'Creative Studio', desc: 'Photography, videography and creative content production.', icon: Camera, slug: 'creative-studio' },
  { title: 'Company Registration', desc: 'Easy business registration and compliance in Tanzania.', icon: Building2, slug: 'company-registration' },
];

const industries = [
  { name: 'Startups', icon: Rocket },
  { name: 'Education', icon: BookOpen },
  { name: 'Tourism', icon: Hotel },
  { name: 'Construction', icon: HardHat },
  { name: 'Healthcare', icon: HeartPulse },
  { name: 'NGOs', icon: Handshake },
  { name: 'Retail & Ecommerce', icon: ShoppingBag },
];

const process = [
  { step: '01', title: 'Discovery', desc: 'We learn about your business, goals, and target audience.' },
  { step: '02', title: 'Strategy', desc: 'We create a tailored plan to achieve your objectives.' },
  { step: '03', title: 'Design & Dev', desc: 'Our team designs and builds your solution.' },
  { step: '04', title: 'Launch', desc: 'We deploy, test, and launch your project.' },
  { step: '05', title: 'Growth', desc: 'Ongoing support and optimization for success.' },
];

const whyUs = [
  { title: 'Business Focused', desc: 'Every solution is designed to drive real business results and ROI.', icon: TrendingUp },
  { title: 'Modern Technology', desc: 'We use cutting-edge tech stack for performance and scalability.', icon: Zap },
  { title: 'Creative Excellence', desc: 'Award-winning designs that captivate and convert.', icon: Sparkles },
  { title: 'Long-Term Support', desc: 'We stay with you beyond launch with maintenance and growth.', icon: Handshake },
];

export default function HomePage() {
  const [services, setServices] = useState(fallbackServices);

  useEffect(() => {
    const fetchServices = () => {
      publicApi.getServices().then((response) => {
        // Only replace fallback if we got data; if API returns array (even empty) use it
        if (Array.isArray(response.data)) {
          if (response.data.length === 0) {
            // Keep fallback for UX when DB is empty, but log
            console.log('API returned 0 services, keeping fallback until data exists');
            return;
          }
          setServices(response.data.map((service) => ({
            title: service.name,
            desc: service.description || service.overview || '',
            icon: serviceIcons[service.icon || ''] || Globe,
            slug: service.slug,
          })));
        }
      }).catch((err: any) => {
        console.error('Failed to fetch services:', err?.message, '| baseURL:', (err?.config?.baseURL || 'unknown'), '| url:', err?.config?.url, '| code:', err?.code, '| response:', err?.response?.status);
        console.error('Full error:', err);
      });
    };
    fetchServices();
    const onFocus = () => fetchServices();
    const onVisibility = () => { if (!document.hidden) fetchServices(); };
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 right-0 w-72 h-72 bg-gold-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-10 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        </div>

        <div className="container-custom relative z-10 py-24 lg:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white/90 text-sm mb-8">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              Tanzania&apos;s Leading Digital Agency
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1]">
              We Build Brands,
              <br />
              <span className="text-gradient">Digital Platforms</span>
              <br />
              & Smart Systems That
              <br />
              Grow Businesses<span className="text-gold-500">.</span>
            </h1>

            <p className="text-lg md:text-xl text-white/60 mt-8 max-w-2xl mx-auto leading-relaxed">
              CadorDigital helps startups, companies and organizations build professional brands,
              websites, marketing systems and automation solutions that create real business growth.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mt-10 justify-center">
              <Link href="/contact" className="btn-primary text-base px-8 py-4 gap-2 group">
                Start Your Project
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/portfolio" className="btn-outline-light text-base px-8 py-4">
                View Portfolio
              </Link>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-8 mt-12">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 border-2 border-primary-900 flex items-center justify-center text-xs font-bold text-white">
                    {i}
                  </div>
                ))}
              </div>
              <p className="text-white/50 text-sm">
                <span className="text-gold-400 font-bold">50+</span> Happy Clients
                {' '}&middot;{' '}
                <span className="text-gold-400 font-bold">100+</span> Projects Delivered
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="section-padding bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-16">
            <span className="text-gold-500 font-semibold text-sm uppercase tracking-wider">Our Services</span>
            <h2 className="section-title mt-2">Everything Your Business Needs</h2>
            <p className="section-subtitle mx-auto">Comprehensive digital solutions for modern businesses in Tanzania and beyond.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <Link
                key={service.slug}
                href={`/services/${service.slug}`}
                className="card p-8 group animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-14 h-14 rounded-2xl bg-primary-50 flex items-center justify-center mb-5 group-hover:bg-gold-500/10 transition-colors">
                  <service.icon className="w-7 h-7 text-primary-700 group-hover:text-gold-500 transition-colors" />
                </div>
                <h3 className="text-xl font-bold text-primary-900 mb-3 group-hover:text-gold-500 transition-colors">
                  {service.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">{service.desc}</p>
                <span className="text-gold-500 text-sm font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
                  Learn more <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Industries */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="text-center mb-16">
            <span className="text-gold-500 font-semibold text-sm uppercase tracking-wider">Industries We Serve</span>
            <h2 className="section-title mt-2">Solutions Across Every Industry</h2>
            <p className="section-subtitle mx-auto">We deliver tailored digital solutions for businesses across all sectors.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {industries.map((ind) => (
              <div key={ind.name} className="card p-6 text-center hover:border-gold-500/50 cursor-default transition-all">
                <ind.icon className="w-8 h-8 text-primary-600 mx-auto mb-3" />
                <p className="text-sm font-medium text-primary-800">{ind.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="section-padding bg-primary-900 text-white">
        <div className="container-custom">
          <div className="text-center mb-16">
            <span className="text-gold-500 font-semibold text-sm uppercase tracking-wider">Our Process</span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mt-2">How We Work</h2>
            <p className="text-lg text-white/60 mt-4 max-w-2xl mx-auto">A proven approach to deliver exceptional results.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {process.map((p, i) => (
              <div key={i} className="relative">
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 text-center h-full">
                  <span className="text-4xl font-bold text-gold-500/30">{p.step}</span>
                  <h3 className="text-xl font-bold mt-3 mb-2">{p.title}</h3>
                  <p className="text-white/60 text-sm">{p.desc}</p>
                </div>
                {i < process.length - 1 && (
                  <div className="hidden lg:flex absolute top-1/2 -right-3 text-gold-500/50 justify-center">
                    <ArrowRight className="w-5 h-5" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why CadorDigital */}
      <section className="section-padding bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-16">
            <span className="text-gold-500 font-semibold text-sm uppercase tracking-wider">Why Choose Us</span>
            <h2 className="section-title mt-2">Why CadorDigital?</h2>
            <p className="section-subtitle mx-auto">What makes us the preferred digital partner for businesses.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {whyUs.map((item, i) => (
              <div key={i} className="card p-8 text-center">
                <div className="w-14 h-14 rounded-2xl bg-primary-50 flex items-center justify-center mx-auto mb-5">
                  <item.icon className="w-7 h-7 text-primary-700" />
                </div>
                <h3 className="text-lg font-bold text-primary-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="section-padding bg-gradient-to-br from-primary-900 to-primary-700 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="container-custom relative z-10 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Ready to <span className="text-gold-500">Grow</span> Your Business?
          </h2>
          <p className="text-xl text-white/70 mb-10 max-w-2xl mx-auto">
            Let&apos;s build something amazing together. Get in touch today for a free consultation.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/contact" className="btn-primary text-lg px-10 py-4 gap-2 group">
              Start Your Project
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a href="https://wa.me/255716168903" target="_blank" rel="noopener noreferrer" className="btn-outline-light text-lg px-10 py-4 flex items-center gap-2">
              <Phone className="w-5 h-5" />
              WhatsApp Us
            </a>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
