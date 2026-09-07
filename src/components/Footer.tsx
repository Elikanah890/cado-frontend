'use client';

import Link from 'next/link';
import {
  Facebook, Instagram, Linkedin, Twitter, Youtube,
  MapPin, Mail, Phone, ArrowUp
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { publicApi } from '@/lib/api';
import { useLanguage } from '@/lib/LanguageContext';
import { useServices } from '@/lib/ServicesContext';

const quickLinks = [
  { key: 'nav.pricing', href: '/pricing' },
  { key: 'nav.portfolio', href: '/portfolio' },
  { key: 'nav.academy', href: '/academy' },
  { key: 'nav.blog', href: '/blog' },
  { key: 'nav.contact', href: '/contact' },
  { key: 'nav.whatsappUs', href: 'https://wa.me/255716168903' },
];

export default function Footer() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [showScroll, setShowScroll] = useState(false);
  const services = useServices();
  const { t } = useLanguage();

  useEffect(() => {
    const handleScroll = () => setShowScroll(window.scrollY > 500);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await publicApi.subscribeNewsletter(email);
      toast.success(t('footer.subscribeSuccess'));
      setEmail('');
    } catch {
      toast.error(t('footer.subscribeError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="bg-primary-900 text-white">
      <div className="container-custom py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div>
            <Link href="/">
              <img
                src="/cador-logo.png"
                alt="CadorDigital"
                width={140}
                height={56}
                loading="lazy"
                className="h-14 w-auto"
              />
            </Link>
            <p className="mt-4 text-gray-400 text-sm leading-relaxed">
              {t('footer.tagline')}
            </p>
            <div className="flex gap-3 mt-6">
              {[
                { icon: Facebook, href: '#' },
                { icon: Instagram, href: '#' },
                { icon: Linkedin, href: '#' },
                { icon: Twitter, href: '#' },
                { icon: Youtube, href: '#' },
              ].map((social, i) => (
                <a
                  key={i}
                  href={social.href}
                  className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center hover:bg-gold-500 transition-colors"
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">{t('footer.servicesTitle')}</h4>
            <ul className="space-y-2.5">
              {services.length > 0 ? (
                services.map((s) => (
                  <li key={s.id}>
                    <Link
                      href={`/services/${s.slug}`}
                      className="text-gray-400 hover:text-gold-500 text-sm transition-colors"
                    >
                      {s.name}
                    </Link>
                  </li>
                ))
              ) : (
                <li className="text-gray-500 text-sm">{t('footer.noServices')}</li>
              )}
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">{t('footer.quickLinks')}</h4>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-gray-400 hover:text-gold-500 text-sm transition-colors">
                    {t(link.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">{t('footer.getInTouch')}</h4>
            <ul className="space-y-3 text-gray-400 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gold-500 flex-shrink-0 mt-0.5" />
                <span>{t('footer.location')}</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gold-500 flex-shrink-0" />
                <a href="mailto:admin@cador.digital" className="hover:text-gold-500 transition-colors">
                  admin@cador.digital
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gold-500 flex-shrink-0" />
                <a href="https://wa.me/255716168903" className="hover:text-gold-500 transition-colors">
                  +255 716 168 903
                </a>
              </li>
            </ul>

            <h4 className="text-lg font-semibold mt-8 mb-3">{t('footer.newsletter')}</h4>
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('footer.emailPlaceholder')}
                className="flex-1 px-4 py-2.5 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-gray-400 focus:outline-none focus:border-gold-500 text-sm"
                required
              />
              <button type="submit" disabled={loading} className="btn-primary text-sm py-2.5 px-4 whitespace-nowrap">
                {loading ? '...' : t('footer.subscribe')}
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-custom py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} CadorDigital. {t('footer.rights')}
          </p>
          <div className="flex gap-6">
            <Link href="/privacy" className="text-gray-400 hover:text-gold-500 text-sm transition-colors">
              {t('footer.privacy')}
            </Link>
            <Link href="/terms" className="text-gray-400 hover:text-gold-500 text-sm transition-colors">
              {t('footer.terms')}
            </Link>
          </div>
        </div>
      </div>

      {showScroll && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 w-12 h-12 bg-gold-500 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-gold-600 transition-colors z-50"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
    </footer>
  );
}
