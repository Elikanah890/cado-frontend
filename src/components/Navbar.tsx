'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, MessageCircle, Languages } from 'lucide-react';
import { cn } from '@/lib/utils';
import { whatsappLink } from '@/lib/utils';
import { useLanguage } from '@/lib/LanguageContext';

const NAV_KEYS: Record<string, string> = {
  '/': 'nav.home',
  '/services': 'nav.services',
  '/portfolio': 'nav.portfolio',
  '/courses': 'nav.academy',
  '/blog': 'nav.blog',
  '/shop': 'nav.shop',
  '/contact': 'nav.contact',
};

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { language, setLanguage, t } = useLanguage();

  const isAdmin = pathname.startsWith('/admin');
  if (isAdmin) return null;

  const navHrefs = Object.keys(NAV_KEYS);

  const langToggle = (
    <div className="inline-flex items-center rounded-xl border border-gray-200 bg-white p-1" role="group" aria-label="Language">
      <Languages className="w-4 h-4 text-gray-400 mx-1" />
      <button
        onClick={() => setLanguage('en')}
        className={cn(
          'px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors',
          language === 'en' ? 'bg-primary-900 text-white' : 'text-gray-500 hover:text-primary-900'
        )}
      >
        🇬🇧 EN
      </button>
      <button
        onClick={() => setLanguage('sw')}
        className={cn(
          'px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors',
          language === 'sw' ? 'bg-primary-900 text-white' : 'text-gray-500 hover:text-primary-900'
        )}
      >
        🇹🇿 SW
      </button>
    </div>
  );

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-lg shadow-gray-200/20 py-3">
      <div className="container-custom flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <img
            src="/cador-logo.png"
            alt="CadorDigital"
            width={140}
            height={56}
            loading="eager"
            className="h-14 w-auto"
          />
        </Link>

        <div className="hidden lg:flex items-center gap-8">
          {navHrefs.map((href) => {
            const isActive = pathname === href || (href !== '/' && pathname.startsWith(`${href}/`));
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'font-medium transition-colors text-sm',
                  isActive ? 'text-gold-500' : 'text-gray-700 hover:text-gold-500'
                )}
              >
                {t(NAV_KEYS[href])}
              </Link>
            );
          })}
        </div>

        <div className="hidden lg:flex items-center gap-3">
          {langToggle}
          <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="btn-primary text-sm py-2.5 px-5 gap-2">
            <MessageCircle className="w-4 h-4" /> {t('nav.whatsappUs')}
          </a>
        </div>

        <div className="lg:hidden flex items-center gap-2">
          {langToggle}
          <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-primary-900">
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 shadow-2xl animate-slide-down">
          <div className="container-custom py-4 space-y-1">
            {navHrefs.map((href) => {
              const isActive = pathname === href || (href !== '/' && pathname.startsWith(`${href}/`));
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'block py-3 px-4 rounded-lg text-sm font-medium transition-colors',
                    isActive ? 'text-gold-500 bg-primary-50' : 'text-gray-700 hover:bg-gray-50'
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  {t(NAV_KEYS[href])}
                </Link>
              );
            })}
            <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="btn-primary w-full text-center text-sm" onClick={() => setIsOpen(false)}>
              <MessageCircle className="w-4 h-4 inline mr-2" /> {t('nav.whatsappUs')}
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
