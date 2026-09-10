'use client';

import Link from 'next/link';
import {
  ArrowRight, Rocket, BookOpen, Hotel, HardHat,
  HeartPulse, Handshake, ShoppingBag, Phone
} from 'lucide-react';
import PublicLayout from '@/components/PublicLayout';
import PortfolioCarousel from '@/components/PortfolioCarousel';
import TestimonialsCarousel from '@/components/TestimonialsCarousel';
import AcademyCarousel from '@/components/AcademyCarousel';
import { publicApi } from '@/lib/api';
import { useLanguage } from '@/lib/LanguageContext';
import type { Service } from '@/types/service';
import type { Portfolio } from '@/types';
import { ServiceCard } from '@/components/services/ServiceCard';
import { useEffect, useState } from 'react';

const industries = [
  { key: 'home.industries.startups', icon: Rocket },
  { key: 'home.industries.education', icon: BookOpen },
  { key: 'home.industries.tourism', icon: Hotel },
  { key: 'home.industries.construction', icon: HardHat },
  { key: 'home.industries.healthcare', icon: HeartPulse },
  { key: 'home.industries.ngos', icon: Handshake },
  { key: 'home.industries.retail', icon: ShoppingBag },
];

export default function HomePage() {
  const { t } = useLanguage();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clientCount, setClientCount] = useState<number | null>(null);
  const [projectCount, setProjectCount] = useState<number | null>(null);
  const [portfolio, setPortfolio] = useState<Portfolio[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [academy, setAcademy] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;
    publicApi.getHomepage()
      .then((res) => {
        if (!mounted) return;
        const data = res.data;
        setServices(Array.isArray(data?.services) ? data.services : []);
        setPortfolio(Array.isArray(data?.portfolio) ? data.portfolio : []);
        setProjectCount(Array.isArray(data?.portfolio) ? data.portfolio.length : 0);
        setClientCount(typeof data?.testimonialCount === 'number' ? data.testimonialCount : Array.isArray(data?.testimonials) ? data.testimonials.length : 0);
        setTestimonials(Array.isArray(data?.testimonials) ? data.testimonials : []);
        setAcademy(Array.isArray(data?.academy) ? data.academy : []);
        setError(null);
      })
      .catch((err) => {
        if (!mounted) return;
        console.error('Failed to fetch services:', err);
        setError(t('home.services.error'));
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
              {t('home.hero.badge')}
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1]">
              {t('home.hero.l1')}
              <br />
              <span className="text-gradient">{t('home.hero.l2')}</span>
              <br />
              {t('home.hero.l3')}
              <br />
              {t('home.hero.l4')}<span className="text-gold-500">.</span>
            </h1>

            <p className="text-lg md:text-xl text-white/60 mt-8 max-w-2xl mx-auto leading-relaxed">
              {t('home.hero.sub')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mt-10 justify-center">
              <Link href="/contact" className="btn-primary text-base px-8 py-4 gap-2 group">
                {t('home.hero.startProject')}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/portfolio" className="btn-outline-light text-base px-8 py-4">
                {t('home.hero.viewPortfolio')}
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
                <span className="text-gold-400 font-bold">{clientCount ?? '10'}+</span> {t('home.hero.happyClients')}
                {' '}&middot;{' '}
                <span className="text-gold-400 font-bold">{projectCount ?? '10'}+</span> {t('home.hero.projectsDelivered')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="section-padding bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-16">
            <span className="text-gold-500 font-semibold text-sm uppercase tracking-wider">{t('home.services.label')}</span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-900 mt-2">{t('home.services.title')}</h2>
            <p className="text-lg text-gray-600 mt-4 max-w-2xl mx-auto">{t('home.services.subtitle')}</p>
          </div>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="card p-8 animate-pulse">
                  <div className="w-14 h-14 rounded-2xl bg-primary-50 mb-5" />
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-3" />
                  <div className="h-4 bg-gray-200 rounded w-full mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-5/6" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500 mb-4">{error}</p>
              <button onClick={() => window.location.reload()} className="btn-primary">
                {t('common.retry')}
              </button>
            </div>
          ) : services.length === 0 ? (
            <div className="card p-12 text-center">
              <p className="text-gray-400 text-lg">{t('home.services.emptyTitle')}</p>
              <p className="text-gray-400 text-sm mt-2">{t('home.services.emptySub')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((service, index) => (
                <ServiceCard key={service.id} service={service} style={{ animationDelay: `${index * 0.1}s` }} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Industries */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="text-center mb-16">
            <span className="text-gold-500 font-semibold text-sm uppercase tracking-wider">{t('home.industries.label')}</span>
            <h2 className="section-title mt-2">{t('home.industries.title')}</h2>
            <p className="section-subtitle mx-auto">{t('home.industries.subtitle')}</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {industries.map((ind) => (
              <div key={ind.key} className="card p-6 text-center hover:border-gold-500/50 cursor-default transition-all">
                <ind.icon className="w-8 h-8 text-primary-600 mx-auto mb-3" />
                <p className="text-sm font-medium text-primary-800">{t(ind.key)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Carousel */}
      <TestimonialsCarousel testimonials={testimonials} />

      {/* Academy Carousel */}
      <AcademyCarousel courses={academy} />

      {/* Auto-Scrolling Portfolio Section */}
      <PortfolioCarousel title={t('home.recentWork')} projects={portfolio} />

      {/* Final CTA */}
      <section className="section-padding bg-gradient-to-br from-primary-900 to-primary-700 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="container-custom relative z-10 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            {t('home.cta.pre')}<span className="text-gold-500">{t('home.cta.highlight')}</span>{t('home.cta.post')}
          </h2>
          <p className="text-xl text-white/70 mb-10 max-w-2xl mx-auto">
            {t('home.cta.sub')}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/contact" className="btn-primary text-lg px-10 py-4 gap-2 group">
              {t('home.hero.startProject')}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a href="https://wa.me/255716168903" target="_blank" rel="noopener noreferrer" className="btn-outline-light text-lg px-10 py-4 flex items-center gap-2">
              <Phone className="w-5 h-5" />
              {t('nav.whatsappUs')}
            </a>
          </div>
        </div>
      </section>

    </PublicLayout>
  );
}
