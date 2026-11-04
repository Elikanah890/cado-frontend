'use client';

import { useState } from 'react';
import { Star, Quote } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';
import { resolveImageUrl } from '@/lib/imageUtils';

interface TestimonialItem {
  id: string;
  clientName: string;
  clientCompany: string | null;
  clientAvatar: string | null;
  content: string;
  rating: number | null;
  service?: { name?: string | null; slug?: string | null; featuredImage?: string | null } | null;
}

export default function TestimonialsCarousel({ title, testimonials }: { title?: string; testimonials: TestimonialItem[] }) {
  const { t } = useLanguage();
  const heading = title ?? t('home.testimonialsTitle');
  const [paused, setPaused] = useState(false);

  if (!testimonials || testimonials.length === 0) {
    return null;
  }

  const items = testimonials.slice(0, 9);
  const doubled = [...items, ...items];

  const CARD_WIDTH = 320;
  const GAP = 20;
  const singleSetWidth = items.length * (CARD_WIDTH + GAP);
  const duration = items.length * 5;

  return (
    <section className="py-10 bg-white border-t border-gray-100 overflow-hidden">
      <div className="container-custom">
        <span className="block text-center text-gold-500 font-semibold text-sm uppercase tracking-wider">{t('home.testimonialsLabel')}</span>
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-3 mt-2 text-primary-900">{heading}</h2>
        <p className="text-center text-gray-600 mb-8 max-w-2xl mx-auto">{t('home.testimonialsSubtitle')}</p>

        <div
          className="relative w-full overflow-hidden"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div
            className="flex gap-5"
            style={{
              width: 'max-content',
              animation: `scroll-left ${duration}s linear infinite`,
              animationPlayState: paused ? 'paused' : 'running',
            }}
          >
            {doubled.map((item, i) => (
              <div
                key={`${item.id}-${i}`}
                className="flex-shrink-0 w-[320px] bg-gray-50 border border-gray-100 rounded-2xl p-5 flex flex-col"
              >
                <div className="flex items-center gap-1 mb-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${star <= (item.rating ?? 5) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
                <Quote className="w-6 h-6 text-gold-500/30 mb-2" />
                <p className="line-clamp-4 text-sm text-gray-600 leading-relaxed flex-1">&ldquo;{item.content}&rdquo;</p>
                <div className="flex items-center gap-2.5 mt-4 pt-4 border-t border-gray-200">
                  {item.clientAvatar ? (
                    <img
                      src={resolveImageUrl(item.clientAvatar)}
                      alt={item.clientName}
                      width={48}
                      height={48}
                      loading="lazy"
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-bold">
                      {(item.clientName || '?')[0]?.toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-semibold text-primary-900 truncate">{item.clientName}</p>
                    <p className="text-sm text-gray-500 truncate">{item.clientCompany}</p>
                  </div>
                  {item.service?.featuredImage && (
                    <img
                      src={resolveImageUrl(item.service.featuredImage)}
                      alt={item.service.name || ''}
                      width={56}
                      height={56}
                      loading="lazy"
                      className="w-12 h-12 rounded-lg object-cover ml-auto shrink-0"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
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
