'use client';

import Link from 'next/link';
import { ArrowRight, Calendar, User } from 'lucide-react';
import PublicLayout from '@/components/PublicLayout';
import { publicApi } from '@/lib/api';
import { useEffect, useState } from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import type { Portfolio } from '@/types';
import { resolveImageUrl } from '@/lib/imageUtils';

export default function PortfolioPage() {
  const { t } = useLanguage();
  const [activeCategory, setActiveCategory] = useState('All');
  const [allProjects, setAllProjects] = useState<Portfolio[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    publicApi.getPortfolioPage()
      .then((res) => {
        if (!mounted) return;
        const data = res.data;
        setAllProjects(Array.isArray(data?.portfolio) ? data.portfolio : []);
        setCategories(Array.isArray(data?.categories) ? data.categories : []);
      })
      .catch((err) => {
        if (!mounted) return;
        console.error('Failed to fetch portfolio:', err);
        setError(t('portfolioList.error'));
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const projects = activeCategory === 'All' ? allProjects : allProjects.filter((p) => p.category === activeCategory);

  const allCategories = ['All', ...categories];

  return (
    <PublicLayout>
      <section className="section-padding bg-gradient-to-b from-primary-900 to-primary-800 text-white">
        <div className="container-custom text-center max-w-3xl">
          <span className="text-gold-500 font-semibold text-sm uppercase tracking-wider">{t('nav.portfolio')}</span>
          <h1 className="text-4xl md:text-6xl font-bold mt-4 mb-6">{t('portfolioList.title')}</h1>
          <p className="text-xl text-white/70">{t('portfolioList.subtitle')}</p>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-custom">
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {allCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                  activeCategory === cat
                    ? 'bg-gold-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat === 'All' ? t('common.all') : cat}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="card overflow-hidden animate-pulse">
                  <div className="h-[250px] bg-gray-200" />
                  <div className="p-6 space-y-3">
                    <div className="h-5 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500 mb-4">{error}</p>
              <button onClick={() => window.location.reload()} className="btn-primary">{t('common.retry')}</button>
            </div>
          ) : projects.length === 0 ? (
            <div className="card p-12 text-center">
              <p className="text-gray-400 text-lg">{t('portfolioList.empty')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {projects.map((project) => (
                <Link key={project.slug} href={`/portfolio/${project.slug}`} className="card group overflow-hidden">
                  <div className="h-[250px] bg-gradient-to-br from-primary-200 to-primary-400 relative overflow-hidden">
                    {project.featuredImage ? (
                      <img src={resolveImageUrl(project.featuredImage)} alt={project.title} width={600} height={400} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    ) : null}
                    <div className="absolute inset-0 bg-primary-900/0 group-hover:bg-primary-900/40 transition-colors flex items-center justify-center">
                      <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity text-sm font-semibold flex items-center gap-1">
                        {t('portfolioList.viewProject')} <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                    {project.category && (
                      <span className="absolute top-3 left-3 bg-white/90 text-primary-900 px-3 py-1 rounded-full text-xs font-medium">
                        {project.category}
                      </span>
                    )}
                    {project.isFeatured && (
                      <span className="absolute top-3 right-3 bg-gold-500 text-white px-2 py-1 rounded-full text-xs font-medium">{t('portfolioList.featured')}</span>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-primary-900 group-hover:text-gold-500 transition-colors line-clamp-1">
                      {project.title}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                      <User className="w-3 h-3" /> {project.clientName || '—'}
                    </p>
                    <div className="flex items-center gap-2 mt-3 flex-wrap">
                      {project.industry && (
                        <span className="inline-block text-xs bg-primary-50 text-primary-600 px-3 py-1 rounded-full">
                          {project.industry}
                        </span>
                      )}
                      {project.completionDate && (
                        <span className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
                          <Calendar className="w-3 h-3" /> {new Date(project.completionDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </PublicLayout>
  );
}
