'use client';

import Link from 'next/link';
import { Check, ArrowRight, Zap } from 'lucide-react';
import PublicLayout from '@/components/PublicLayout';
import { useEffect, useState } from 'react';
import { publicApi } from '@/lib/api';
import { useLanguage } from '@/lib/LanguageContext';

export default function PricingPage() {
  const { t } = useLanguage();
  const [categories, setCategories] = useState<any[]>([]);
  const [hosting, setHosting] = useState<any[]>([]);
  const [customServices, setCustomServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchAll = async () => {
      try {
        const res = await publicApi.getPricing().catch(() => ({ data: null }));
        if (!mounted) return;
        const data = (res as any)?.data ?? {};
        setCategories(Array.isArray(data?.categories) ? data.categories : []);
        setHosting(Array.isArray(data?.hosting) ? data.hosting : []);
        setCustomServices(Array.isArray(data?.custom) ? data.custom : []);
      } catch (e) {
        console.error('Failed to load pricing', e);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchAll();
    return () => { mounted = false; };
  }, []);

  if (loading) {
    return (
      <PublicLayout>
        <section className="section-padding bg-gradient-to-b from-primary-900 to-primary-800 text-white">
          <div className="container-custom text-center max-w-3xl">
            <span className="text-gold-500 font-semibold text-sm uppercase tracking-wider">{t('nav.pricing')}</span>
            <h1 className="text-4xl md:text-6xl font-bold mt-4 mb-6">{t('pricing.title')}</h1>
            <p className="text-xl text-white/70">{t('pricing.loadingSub')}</p>
          </div>
        </section>
        <div className="section-padding text-center"><p className="text-gray-500 animate-pulse">{t('common.loading')}</p></div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <section className="section-padding bg-gradient-to-b from-primary-900 to-primary-800 text-white">
        <div className="container-custom text-center max-w-3xl">
          <span className="text-gold-500 font-semibold text-sm uppercase tracking-wider">{t('nav.pricing')}</span>
          <h1 className="text-4xl md:text-6xl font-bold mt-4 mb-6">{t('pricing.title')}</h1>
          <p className="text-xl text-white/70">{t('pricing.heroSub')}</p>
        </div>
      </section>

      {categories.length === 0 ? (
        <section className="section-padding">
          <div className="container-custom">
            <div className="card p-12 text-center max-w-5xl mx-auto"><p className="text-gray-400">{t('pricing.noBundles')}</p></div>
          </div>
        </section>
      ) : (
        categories.map((category, ci) => {
          const plans: any[] = Array.isArray(category.plans) ? category.plans : [];
          return (
            <section key={category.id || category.slug || ci} className={`section-padding ${ci % 2 === 1 ? 'bg-gray-50' : ''}`}>
              <div className="container-custom">
                <h2 className="text-3xl font-bold text-center text-primary-900 mb-4">{category.name}</h2>
                {category.description && <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">{category.description}</p>}
                {plans.length === 0 ? (
                  <div className="card p-12 text-center max-w-5xl mx-auto"><p className="text-gray-400">{t('pricing.noBundles')}</p></div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    {plans.map((plan) => (
                      <div
                        key={plan.id || plan.slug}
                        className={`card p-8 relative ${plan.isPopular ? 'ring-2 ring-gold-500 scale-[1.02] z-10' : ''}`}
                      >
                        {plan.isPopular && (
                          <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gold-500 text-white px-6 py-1.5 rounded-full text-sm font-bold flex items-center gap-1">
                            <Zap className="w-4 h-4" /> {t('pricing.mostPopular')}
                          </div>
                        )}
                        <h3 className="text-2xl font-bold text-primary-900">{plan.name}</h3>
                        {plan.tagline && <p className="text-gray-500 text-sm mt-1 mb-6">{plan.tagline}</p>}
                        <div className="mb-6">
                          <span className="text-4xl font-bold text-primary-900">
                            {Number(plan.price).toLocaleString()}
                          </span>
                          <span className="text-gray-500 ml-1">{plan.currency || 'TZS'}</span>
                          {plan.period && plan.period !== 'one-time' && <span className="text-gray-400 text-sm">/{plan.period}</span>}
                        </div>
                        <ul className="space-y-3 mb-8">
                          {(Array.isArray(plan.features) ? plan.features : []).map((f: string, index: number) => (
                            <li key={`${plan.id || plan.slug}-feature-${index}`} className="flex items-start gap-2 text-sm text-gray-700">
                              <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                              {f}
                            </li>
                          ))}
                        </ul>
                        <Link
                          href="/contact"
                          className={`w-full text-center py-3 rounded-lg font-semibold block transition-all ${
                            plan.isPopular ? 'btn-primary' : 'btn-secondary'
                          }`}
                        >
                          {t('pricing.getStarted')}
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          );
        })
      )}

      <section className="section-padding bg-gray-50">
        <div className="container-custom">
          <h2 className="text-3xl font-bold text-center text-primary-900 mb-4">{t('pricing.hostingTitle')}</h2>
          <p className="text-gray-600 text-center mb-12">{t('pricing.hostingSub')}</p>
          {hosting.length === 0 ? (
            <div className="card p-12 text-center max-w-4xl mx-auto"><p className="text-gray-400">{t('pricing.noHosting')}</p></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {hosting.map((plan) => (
                <div key={plan.id || plan.slug} className={`card p-8 text-center ${plan.isPopular ? 'ring-2 ring-gold-500' : ''}`}>
                  {plan.isPopular && <div className="bg-gold-500 text-white text-xs font-bold px-3 py-1 rounded-full inline-block mb-2">{t('pricing.mostPopular')}</div>}
                  <h3 className="text-xl font-bold text-primary-900 mb-2">{plan.name}</h3>
                  <div className="mb-6">
                    <span className="text-3xl font-bold text-gold-500">{Number(plan.price).toLocaleString()}</span>
                    <span className="text-gray-500 text-sm">/{plan.billingPeriod || plan.period || 'year'}</span>
                  </div>
                  <ul className="space-y-2 mb-8">
                    {(Array.isArray(plan.features) ? plan.features : []).map((f: string, index: number) => (
                      <li key={`${plan.id || plan.slug}-feature-${index}`} className="text-sm text-gray-600">
                        <Check className="w-4 h-4 text-green-500 inline mr-2" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link href="/contact" className="btn-secondary w-full text-center py-2.5 block">
                    {t('pricing.choosePlan')}
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="section-padding">
        <div className="container-custom">
          <h2 className="text-3xl font-bold text-center text-primary-900 mb-4">{t('pricing.customTitle')}</h2>
          <p className="text-gray-600 text-center mb-12">{t('pricing.customSub')}</p>
          {customServices.length === 0 ? (
            <div className="card p-12 text-center max-w-4xl mx-auto"><p className="text-gray-400">{t('pricing.noCustom')}</p></div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              {customServices.map((cs) => (
                <div key={cs.id || cs.slug} className="card p-5 text-center">
                  <h4 className="font-semibold text-primary-900 text-sm mb-2">{cs.name}</h4>
                  <p className="text-gold-500 font-bold text-sm">{t('pricing.from')} {Number(cs.price).toLocaleString()} {cs.currency || 'TZS'}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="section-padding bg-primary-900 text-white">
        <div className="container-custom text-center">
          <h2 className="text-3xl font-bold mb-4">{t('pricing.finalTitle')}</h2>
          <p className="text-white/70 text-lg mb-8">{t('pricing.finalSub')}</p>
          <Link href="/contact" className="btn-primary text-lg px-8 py-4 gap-2 inline-flex">
            {t('pricing.contactUs')} <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </PublicLayout>
  );
}
