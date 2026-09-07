'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/LanguageContext';

interface PortfolioProject {
  id: string;
  title: string;
  slug: string;
  clientName: string | null;
  category: string | null;
  featuredImage: string | null;
}

export default function PortfolioCarousel({ title, projects }: { title?: string; projects: PortfolioProject[] }) {
  const { t } = useLanguage();
  const heading = title ?? t('home.recentWork');
  const [paused, setPaused] = useState(false);

  const getBackendOrigin = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    return apiUrl.replace(/\/api\/?$/, '');
  };

  const resolveImageUrl = (url: string | null | undefined): string => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    if (url.startsWith('/uploads/')) {
      return `${getBackendOrigin()}${url}`;
    }
    return url;
  };

  if (!projects || projects.length === 0) {
    return null;
  }

  const items = projects.slice(0, 9);
  const doubled = [...items, ...items];

  const CARD_WIDTH = 360;
  const GAP = 24;
  const singleSetWidth = items.length * (CARD_WIDTH + GAP);
  const duration = items.length * 4;

  return (
    <section className="py-16 bg-gray-50 border-t border-gray-200 overflow-hidden">
      <div className="container-custom">
        <h2 className="text-3xl font-bold text-center mb-4 text-primary-900">{heading}</h2>
        <p className="text-center text-gray-600 mb-10 max-w-2xl mx-auto">
          {t('carousel.explore')}
        </p>

        <div
          className="relative w-full overflow-hidden"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div
            className="flex gap-6"
            style={{
              width: 'max-content',
              animation: `scroll-left ${duration}s linear infinite`,
              animationPlayState: paused ? 'paused' : 'running',
            }}
          >
            {doubled.map((project, i) => (
              <Link
                key={`${project.id}-${i}`}
                href={`/portfolio/${project.slug || project.id}`}
                className="flex-shrink-0 w-[360px] bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 block"
              >
                <div className="relative h-48 overflow-hidden bg-gray-200">
                  {project.featuredImage ? (
                    <img
                      src={resolveImageUrl(project.featuredImage)}
                      alt={project.title}
                      width={360}
                      height={192}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-600 flex items-center justify-center">
                      <span className="text-white font-semibold text-sm text-center px-2">{project.title}</span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-primary-900 truncate">{project.title}</h3>
                  {project.clientName && (
                    <p className="text-sm text-gray-500 mt-1">{project.clientName}</p>
                  )}
                  {project.category && (
                    <span className="inline-block mt-2 px-2 py-1 text-xs font-semibold bg-primary-50 text-primary-700 rounded-full">
                      {project.category}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="text-center mt-6">
          <Link
            href="/portfolio"
            className="inline-block px-6 py-3 bg-primary-900 text-white font-semibold rounded-lg hover:bg-primary-800 transition-colors"
          >
            {t('carousel.viewAll')} →
          </Link>
        </div>
      </div>

      <style jsx>{`
        @keyframes scroll-left {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-${singleSetWidth}px);
          }
        }
      `}</style>
    </section>
  );
}
