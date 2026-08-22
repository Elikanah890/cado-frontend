'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ChevronDown, MessageCircle } from 'lucide-react';
import { cn, NAV_LINKS } from '@/lib/utils';
import { whatsappLink } from '@/lib/utils';

const serviceLinks = [
  { label: 'Brand Identity', href: '/services/brand-identity' },
  { label: 'Website Development', href: '/services/website-development' },
  { label: 'Digital Marketing', href: '/services/digital-marketing' },
  { label: 'AI & Automation', href: '/services/ai-automation' },
  { label: 'Business Solutions', href: '/services/business-solutions' },
  { label: 'Creative Studio', href: '/services/creative-studio' },
  { label: 'Company Registration', href: '/services/company-registration' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const pathname = usePathname();

  const isAdmin = pathname.startsWith('/admin');
  if (isAdmin) return null;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-lg shadow-gray-200/20 py-3">
      <div className="container-custom flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <img
            src="/cador-logo.png"
            alt="CadorDigital"
            className="h-14 w-auto"
          />
        </Link>

        <div className="hidden lg:flex items-center gap-8">
          {NAV_LINKS.map((link) => {
            if (link.label === 'Services') {
              return (
                <div
                  key={link.href}
                  className="relative"
                  onMouseEnter={() => setServicesOpen(true)}
                  onMouseLeave={() => setServicesOpen(false)}
                >
                  <Link
                    href={link.href}
                    className="flex items-center gap-1 font-medium text-gray-700 hover:text-gold-500 transition-colors text-sm"
                  >
                    {link.label}
                    <ChevronDown className="w-4 h-4" />
                  </Link>
                  {servicesOpen && (
                    <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 animate-slide-down">
                      {serviceLinks.map((sl) => (
                        <Link
                          key={sl.href}
                          href={sl.href}
                          className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-900 transition-colors"
                          onClick={() => setServicesOpen(false)}
                        >
                          {sl.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            }
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'font-medium transition-colors text-sm',
                  pathname === link.href
                    ? 'text-gold-500'
                    : 'text-gray-700 hover:text-gold-500'
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        <div className="hidden lg:flex items-center gap-3">
          <a href={whatsappLink('a project or service')} target="_blank" rel="noopener noreferrer" className="btn-primary text-sm py-2.5 px-5 gap-2">
            <MessageCircle className="w-4 h-4" /> WhatsApp Us
          </a>
        </div>

        <button onClick={() => setIsOpen(!isOpen)} className="lg:hidden p-2 text-primary-900">
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {isOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 shadow-2xl animate-slide-down">
          <div className="container-custom py-4 space-y-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'block py-3 px-4 rounded-lg text-sm font-medium transition-colors',
                  pathname === link.href
                    ? 'text-gold-500 bg-primary-50'
                    : 'text-gray-700 hover:bg-gray-50'
                )}
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <a href={whatsappLink('a project or service')} target="_blank" rel="noopener noreferrer" className="btn-primary w-full text-center text-sm" onClick={() => setIsOpen(false)}>
              <MessageCircle className="w-4 h-4 inline mr-2" /> WhatsApp Us
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
