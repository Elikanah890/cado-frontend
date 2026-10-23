'use client';

import { Globe, Palette, Cpu, Briefcase, Camera, Building2, Megaphone, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/lib/LanguageContext';
import type { Service } from '@/types';

const iconMap: Record<string, any> = {
  palette: Palette,
  globe: Globe,
  megaphone: Megaphone,
  cpu: Cpu,
  briefcase: Briefcase,
  camera: Camera,
  building: Building2,
  building2: Building2,
  code: Cpu,
  'bar-chart': Briefcase,
};

type ServiceCardProps = {
  service: Service;
  showLink?: boolean;
  showIcon?: boolean;
  style?: React.CSSProperties;
  className?: string;
};

export function ServiceCard({ service, showLink = true, showIcon = true, style, className = '' }: ServiceCardProps) {
  const { t } = useLanguage();
  const IconComponent = showIcon ? (iconMap[(service.icon || '').toLowerCase()] || Globe) : null;

  const content = (
    <>
      {IconComponent && (
        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-gold-50 text-gold-600 transition-colors duration-300 group-hover:bg-gold-500 group-hover:text-white">
          <IconComponent className="h-7 w-7" />
        </div>
      )}
      <h3 className="mb-3 text-xl font-bold text-gray-900">{service.name}</h3>
      <p className="mb-6 flex-1 text-sm leading-relaxed text-gray-600 sm:text-base">
        {service.description || service.overview || ''}
      </p>
      {showLink && (
        <span className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-gold-500/30 bg-gold-50/60 px-4 py-2.5 text-sm font-semibold text-gold-700 transition-all duration-300 group-hover:bg-gold-500 group-hover:text-white">
          {t('common.viewDetails')}
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
        </span>
      )}
    </>
  );

  return (
    <Link
      href={showLink ? `/services/${service.slug}` : '#'}
      className={`group flex h-full animate-slide-up flex-col rounded-2xl border-t-4 border-gold-500 bg-white p-8 shadow-md shadow-gray-200/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${className}`}
      style={style}
    >
      {content}
    </Link>
  );
}
