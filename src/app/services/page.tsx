'use client';

import PublicLayout from '@/components/PublicLayout';
import { publicApi } from '@/lib/api';
import { useLanguage } from '@/lib/LanguageContext';
import type { Service } from '@/types/service';
import { ServiceCard } from '@/components/services/ServiceCard';
import { useEffect, useState } from 'react';

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
      <section className="section-padding bg-gradient-to-b from-primary-900 to-primary-800 text-white">
        <div className="container-custom text-center max-w-3xl">
          <span className="text-gold-500 font-semibold text-sm uppercase tracking-wider">{t('nav.services')}</span>
          <h1 className="text-4xl md:text-6xl font-bold mt-4 mb-6">{t('servicesList.title')}</h1>
          <p className="text-xl text-white/70">{t('servicesList.subtitle')}</p>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-custom">
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
              <p className="text-gray-400 text-lg">{t('servicesList.empty')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((service, i) => (
                <ServiceCard key={service.id} service={service} style={{ animationDelay: `${i * 0.1}s` }} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="section-padding bg-gray-50">
        <div className="container-custom text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-900 mb-4">{t('servicesList.customTitle')}</h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            {t('servicesList.customSub')}
          </p>
          <a href="/contact" className="btn-primary text-lg px-8 py-4">
            {t('servicesList.cta')}
          </a>
        </div>
      </section>
    </PublicLayout>
  );
}
