'use client';

import Link from 'next/link';
import {
  Globe, Palette, Cpu, Briefcase, Camera, Building2, Megaphone, ArrowRight,
} from 'lucide-react';
import PublicLayout from '@/components/PublicLayout';
import { whatsappLink } from '@/lib/utils';
import { publicApi } from '@/lib/api';
import { useLanguage } from '@/lib/LanguageContext';
import type { Service } from '@/types/service';
import { useEffect, useState } from 'react';

const iconMap: Record<string, any> = {
  palette: Palette,
  globe: Globe,
  megaphone: Megaphone,
  cpu: Cpu,
  briefcase: Briefcase,
  camera: Camera,
  building: Building2,
  building2: Building2,
  code: Cpu,
  'bar-chart': Briefcase,
};

export default function ServicesPage() {
  const { t } = useLanguage();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    publicApi.getServicesPage()
      .then((res) => {
        if (!mounted) return;
        const data = (res as any)?.data;
        setServices(Array.isArray(data?.services) ? data.services : []);
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
      <section className="section-padding relative overflow-hidden bg-gradient-to-b from-primary-900 to-primary-800 text-white">
        <div aria-hidden className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-gold-500/10 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-gold-500/10 blur-3xl" />
        <div className="container-custom relative max-w-3xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-gold-500">{t('nav.services')}</span>
          <h1 className="mb-6 mt-4 text-4xl font-bold md:text-6xl">{t('servicesList.title')}</h1>
          <p className="text-xl text-white/70">{t('servicesList.subtitle')}</p>
        </div>
      </section>

      <section className="section-padding relative overflow-hidden bg-slate-50">
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-gradient-to-b from-white/80 to-transparent" />
        <div className="container-custom relative">
          {loading ? (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse rounded-2xl border-t-4 border-gold-500/40 bg-white p-8 shadow-md shadow-gray-200/60">
                  <div className="mb-6 h-14 w-14 rounded-xl bg-gold-50" />
                  <div className="mb-3 h-6 w-3/4 rounded bg-gray-200" />
                  <div className="mb-2 h-4 w-full rounded bg-gray-200" />
                  <div className="mb-6 h-4 w-5/6 rounded bg-gray-200" />
                  <div className="h-10 w-full rounded-xl bg-gray-100" />
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
            <div className="rounded-2xl border-t-4 border-gold-500 bg-white p-12 text-center shadow-md shadow-gray-200/60">
              <p className="text-lg text-gray-400">{t('servicesList.empty')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {services.map((service, i) => {
                const IconComponent = iconMap[(service.icon || '').toLowerCase()] || Globe;
                const placement =
                  services.length % 3 === 1 && i === services.length - 1
                    ? 'lg:col-start-2'
                    : services.length % 3 === 2 && i === services.length - 2
                      ? 'lg:col-start-2'
                      : '';
                return (
                  <Link
                    key={service.id}
                    href={`/services/${service.slug}`}
                    style={{ animationDelay: `${i * 0.1}s` }}
                    className={`group flex h-full animate-slide-up flex-col rounded-2xl border-t-4 border-gold-500 bg-white p-8 shadow-md shadow-gray-200/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${placement}`}
                  >
                    <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-gold-50 text-gold-600 transition-colors duration-300 group-hover:bg-gold-500 group-hover:text-white">
                      <IconComponent className="h-7 w-7" />
                    </div>
                    <h3 className="mb-3 text-xl font-bold text-gray-900">{service.name}</h3>
                    <p className="mb-6 flex-1 text-sm leading-relaxed text-gray-600 sm:text-base">
                      {service.description || service.overview || ''}
                    </p>
                    <span className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-gold-500/30 bg-gold-50/60 px-4 py-2.5 text-sm font-semibold text-gold-700 transition-all duration-300 group-hover:bg-gold-500 group-hover:text-white">
                      {t('common.viewDetails')}
                      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <section className="bg-slate-50 pb-16 md:pb-24">
        <div className="container-custom">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900 px-6 py-14 text-center shadow-xl sm:px-12">
            <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-gold-500/10 blur-3xl" />
            <div aria-hidden className="pointer-events-none absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-gold-500/10 blur-3xl" />
            <h2 className="relative mb-4 text-3xl font-bold text-white md:text-4xl">{t('servicesList.customTitle')}</h2>
            <p className="relative mx-auto mb-8 max-w-2xl text-lg text-white/70">
              {t('servicesList.customSub')}
            </p>
            <a
              href={whatsappLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="relative inline-flex items-center justify-center gap-2 rounded-full bg-gold-500 px-8 py-4 text-base font-bold text-white shadow-lg shadow-gold-500/25 transition-all duration-300 hover:-translate-y-0.5 hover:bg-gold-600"
            >
              {t('servicesList.cta')}
            </a>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
