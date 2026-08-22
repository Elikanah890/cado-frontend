import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string = 'TZS'): string {
  return new Intl.NumberFormat('en-TZ', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-TZ', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export const SITE_NAME = 'CadorDigital';
export const SITE_TAGLINE = 'Build. Market. Automate. Grow.';
export const SITE_DESCRIPTION = 'CadorDigital helps startups, companies and organizations build professional brands, websites, marketing systems and automation solutions that create real business growth.';
export const WHATSAPP_NUMBER = '255716168903';

export function whatsappLink(subject: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Hello CadorDigital, I am interested in ${subject}.`)}`;
}

export const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Services', href: '/services' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Portfolio', href: '/portfolio' },
  { label: 'Store', href: '/store' },
  { label: 'Academy', href: '/academy' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contact', href: '/contact' },
];

export const SERVICE_ICONS: Record<string, string> = {
  'brand-identity': 'Palette',
  'website-development': 'Globe',
  'digital-marketing': 'Megaphone',
  'ai-automation': 'Cpu',
  'business-solutions': 'Briefcase',
  'creative-studio': 'Camera',
  'company-registration': 'Building',
};
