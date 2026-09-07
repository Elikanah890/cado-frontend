'use client';

import PublicLayout from '@/components/PublicLayout';
import { useLanguage } from '@/lib/LanguageContext';

export default function TermsPage() {
  const { t } = useLanguage();
  return (
    <PublicLayout>
      <section className="section-padding bg-gradient-to-b from-primary-900 to-primary-800 text-white">
        <div className="container-custom text-center max-w-3xl">
          <h1 className="text-4xl md:text-6xl font-bold">{t('terms.title')}</h1>
          <p className="text-xl text-white/70 mt-4">{t('terms.lastUpdated')}</p>
        </div>
      </section>
      <section className="section-padding">
        <div className="container-custom max-w-3xl prose prose-lg">
          <h2>{t('terms.s1Title')}</h2>
          <p>{t('terms.s1Body')}</p>
          <h2>{t('terms.s2Title')}</h2>
          <p>{t('terms.s2Body')}</p>
          <h2>{t('terms.s3Title')}</h2>
          <p>{t('terms.s3Body')}</p>
          <h2>{t('terms.s4Title')}</h2>
          <p>{t('terms.s4Body')}</p>
          <h2>{t('terms.s5Title')}</h2>
          <p>{t('terms.s5Body')}</p>
        </div>
      </section>
    </PublicLayout>
  );
}
