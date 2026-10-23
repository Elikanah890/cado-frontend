'use client';

import Link from 'next/link';
import { ArrowRight, Phone } from 'lucide-react';
import PublicLayout from '@/components/PublicLayout';
import PortfolioCarousel from '@/components/PortfolioCarousel';
import TestimonialsCarousel from '@/components/TestimonialsCarousel';
import AcademyCarousel from '@/components/AcademyCarousel';
import PosterImage from '@/components/PosterImage';
import { publicApi } from '@/lib/api';
import { useLanguage } from '@/lib/LanguageContext';
import { formatCurrency, whatsappLink } from '@/lib/utils';
import { resolveImageUrl } from '@/lib/imageUtils';
import type { Service } from '@/types/service';
import type { HeroSetting, Portfolio, Product } from '@/types';
import { ServiceCard } from '@/components/services/ServiceCard';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const DEFAULT_HERO: HeroSetting = {
  id: 'main_hero',
  tagline: 'Build. Market. Automate. Grow.',
  heading: 'We Build Brands & Smart Systems That Drive Real Growth.',
  subtext: 'Tailored digital solutions for ambitious businesses in Tanzania and beyond.',
  primaryButtonText: 'Chat on WhatsApp',
  primaryButtonUrl: 'https://wa.me/255716168903',
  secondaryButtonText: 'View Portfolio',
  secondaryButtonUrl: '/portfolio',
  stat1Value: '6+',
  stat1Label: 'Happy Clients',
  stat2Value: '10+',
  stat2Label: 'Projects Delivered',
  heroImages: [
    '/hero/hero1.jpeg',
    '/hero/hero2.jpeg',
    '/hero/hero3.jpeg',
    '/hero/hero4.jpeg',
    '/hero/hero5.jpeg',
    '/hero/hero6.jpeg',
  ],
};

export default function HomePage() {
  const { t } = useLanguage();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hero, setHero] = useState<HeroSetting>(DEFAULT_HERO);
  const [portfolio, setPortfolio] = useState<Portfolio[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [academy, setAcademy] = useState<any[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    let mounted = true;
    publicApi.getHomepage()
      .then((res) => {
        if (!mounted) return;
        const data = res.data;
        setServices(Array.isArray(data?.services) ? data.services : []);
        setPortfolio(Array.isArray(data?.portfolio) ? data.portfolio : []);
        if (data?.hero) setHero(data.hero);
        setTestimonials(Array.isArray(data?.testimonials) ? data.testimonials : []);
        setAcademy(Array.isArray(data?.academy) ? data.academy : []);
        setProducts(Array.isArray(data?.products) ? data.products : []);
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

  const productImage = (product: Product) => {
    const first = Array.isArray(product.images) ? product.images[0] : null;
    if (!first) return null;
    return typeof first === 'string' ? first : first.url || null;
  };

  const [heroIndex, setHeroIndex] = useState(0);

  const heroImages = Array.isArray(hero.heroImages) && hero.heroImages.length > 0
    ? hero.heroImages
    : DEFAULT_HERO.heroImages;

  useEffect(() => {
    if (heroImages.length < 2) {
      setHeroIndex(0);
      return;
    }
    const id = setInterval(() => setHeroIndex((i) => (i + 1) % heroImages.length), 4000);
    return () => clearInterval(id);
  }, [heroImages.length]);

  const heroCollage = {
    main: resolveImageUrl(heroImages[heroIndex % heroImages.length]),
    left: resolveImageUrl(heroImages[(heroIndex + 1) % heroImages.length]),
    right: resolveImageUrl(heroImages[(heroIndex + 2) % heroImages.length]),
  };

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 right-0 w-72 h-72 bg-gold-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-10 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        </div>

        <div className="container-custom relative z-10 py-24 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: copy */}
            <div className="text-center lg:text-left">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-6xl xl:text-7xl font-bold text-white leading-[1.1]">
                {hero.heading}
              </h1>

              <p className="text-lg md:text-xl text-white/60 mt-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                {hero.subtext}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mt-10 justify-center lg:justify-start">
                <a
                  href={hero.primaryButtonUrl}
                  target={/^https?:\/\//i.test(hero.primaryButtonUrl) ? '_blank' : undefined}
                  rel={/^https?:\/\//i.test(hero.primaryButtonUrl) ? 'noopener noreferrer' : undefined}
                  className="btn-primary text-base px-8 py-4 gap-2 group"
                >
                  {hero.primaryButtonText}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </a>
                <a
                  href={hero.secondaryButtonUrl}
                  target={/^https?:\/\//i.test(hero.secondaryButtonUrl) ? '_blank' : undefined}
                  rel={/^https?:\/\//i.test(hero.secondaryButtonUrl) ? 'noopener noreferrer' : undefined}
                  className="btn-outline-light text-base px-8 py-4"
                >
                  {hero.secondaryButtonText}
                </a>
              </div>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-8 mt-12">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 border-2 border-primary-900 flex items-center justify-center text-xs font-bold text-white">
                      {i}
                    </div>
                  ))}
                </div>
                <p className="text-white/50 text-sm">
                  <span className="text-gold-400 font-bold">{hero.stat1Value}</span> {hero.stat1Label}
                  {' '}&middot;{' '}
                  <span className="text-gold-400 font-bold">{hero.stat2Value}</span> {hero.stat2Label}
                </p>
              </div>
            </div>

            {/* Right: floating collage */}
            <div className="relative w-full max-w-[650px] h-[500px] sm:h-[650px] mx-auto">
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] bg-gradient-to-tr from-gold-500/30 to-purple-500/30 blur-3xl rounded-full" />

              {/* Top-left */}
              <div className="absolute top-6 sm:top-10 left-0 w-[220px] sm:w-[280px] h-[280px] sm:h-[380px] -rotate-6 z-20">
                <motion.div className="w-full h-full" animate={{ y: [0, -15, 0] }} transition={{ duration: 4.6, repeat: Infinity, ease: 'easeInOut' }}>
                  <div className="relative w-full h-full rounded-2xl shadow-2xl border-4 border-white/10 bg-black/40 backdrop-blur-md overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={heroCollage.left} alt="" aria-hidden="true" className="w-full h-full object-contain" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                  </div>
                </motion.div>
              </div>

              {/* Center main */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] sm:w-[400px] h-[420px] sm:h-[520px] z-30">
                <motion.div className="w-full h-full" animate={{ y: [0, -15, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}>
                  <div className="relative w-full h-full rounded-2xl shadow-2xl border-4 border-white/10 bg-black/40 backdrop-blur-md overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={heroCollage.main} alt="CadorDigital creative work" className="w-full h-full object-contain" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                  </div>
                </motion.div>
              </div>

              {/* Bottom-right */}
              <div className="absolute bottom-6 sm:bottom-10 right-0 w-[240px] sm:w-[300px] h-[300px] sm:h-[400px] rotate-6 z-20">
                <motion.div className="w-full h-full" animate={{ y: [0, -15, 0] }} transition={{ duration: 5.2, repeat: Infinity, ease: 'easeInOut' }}>
                  <div className="relative w-full h-full rounded-2xl shadow-2xl border-4 border-white/10 bg-black/40 backdrop-blur-md overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={heroCollage.right} alt="" aria-hidden="true" className="w-full h-full object-contain" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* Auto-Scrolling Portfolio Section */}
      <PortfolioCarousel title={t('home.recentWork')} projects={portfolio} />

      {/* Shop */}
      {products.length > 0 && (
        <section className="section-padding bg-white">
          <div className="container-custom">
            <div className="text-center mb-12">
              <span className="text-gold-500 font-semibold text-sm uppercase tracking-wider">{t('home.shop.label')}</span>
              <h2 className="section-title mt-2">{t('home.shop.title')}</h2>
              <p className="section-subtitle mx-auto">{t('home.shop.subtitle')}</p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {products.slice(0, 4).map((product) => {
                const image = productImage(product);
                const price = formatCurrency(product.price, product.currency);
                const hasDiscount = Boolean(product.originalPrice && product.originalPrice > product.price);
                const message = `Habari CadorDigital, nahitaji kununua ${product.title} kwa bei ya ${price}`;
                const whatsappHref = `https://wa.me/255716168903?text=${encodeURIComponent(message)}`;
                return (
                  <div key={product.id} className="card group overflow-hidden flex flex-col">
                    <Link href="/shop" className="block bg-gradient-to-br from-primary-100 to-primary-200 overflow-hidden">
                      {image ? (
                        <PosterImage
                          src={image}
                          alt={product.title}
                          imageClassName="transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="aspect-[4/5] w-full flex items-center justify-center">
                          <ArrowRight className="w-8 h-8 text-primary-400" />
                        </div>
                      )}
                    </Link>
                    <div className="p-4 flex flex-col flex-1">
                      <Link href="/shop">
                        <h3 className="text-sm sm:text-base font-bold text-primary-900 group-hover:text-gold-500 transition-colors line-clamp-2">
                          {product.title}
                        </h3>
                      </Link>
                      {hasDiscount ? (
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-gray-400 line-through text-xs sm:text-sm">
                            {formatCurrency(product.originalPrice!, product.currency)}
                          </span>
                          <span className="font-bold text-base sm:text-lg text-gray-900">
                            {price}
                          </span>
                        </div>
                      ) : (
                        <p className="text-gold-600 font-semibold mt-2 text-sm sm:text-base">{price}</p>
                      )}
                      <a
                        href={whatsappHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-flex w-full items-center justify-center rounded-full bg-primary-900 px-4 py-2.5 text-sm sm:text-base font-bold text-white transition-all hover:bg-primary-800"
                      >
                        Buy Now
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="text-center mt-8">
              <Link href="/shop" className="btn-primary inline-flex items-center gap-2">
                {t('home.shop.viewAll')} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Testimonials Carousel */}
      <TestimonialsCarousel testimonials={testimonials} />

      {/* Academy Carousel */}
      <AcademyCarousel courses={academy} />

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
              <p className="text-gray-400 text-lg">{t('home.services.emptyTitle')}</p>
              <p className="text-gray-400 text-sm mt-2">{t('home.services.emptySub')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((service, index) => {
                const placement =
                  services.length % 3 === 1 && index === services.length - 1
                    ? 'lg:col-start-2'
                    : services.length % 3 === 2 && index === services.length - 2
                      ? 'lg:col-start-2'
                      : '';
                return (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    style={{ animationDelay: `${index * 0.1}s` }}
                    className={placement}
                  />
                );
              })}
            </div>
          )}
        </div>
      </section>

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
            <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="btn-primary text-lg px-10 py-4 gap-2 group">
              {t('home.hero.startProject')}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
            <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="btn-outline-light text-lg px-10 py-4 flex items-center gap-2">
              <Phone className="w-5 h-5" />
              {t('nav.whatsappUs')}
            </a>
          </div>
        </div>
      </section>

    </PublicLayout>
  );
}
