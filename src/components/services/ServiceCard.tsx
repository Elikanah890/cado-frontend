'use client';

import { BookOpen, Globe, Palette, Cpu, Briefcase, Camera, Building2, Megaphone, ArrowRight } from 'lucide-react';
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
};

export function ServiceCard({ service, showLink = true, showIcon = true, style }: ServiceCardProps) {
  const { t } = useLanguage();
  const IconComponent = showIcon ? (iconMap[(service.icon || '').toLowerCase()] || Globe) : null;

  return (
    <Link
      href={showLink ? `/services/${service.slug}` : '#'}
      className="card p-8 group animate-slide-up"
      style={style}
    >
      <div className="w-14 h-14 rounded-2xl bg-primary-50 flex items-center justify-center mb-5 group-hover:bg-gold-500/10 transition-colors">
        {IconComponent && <IconComponent className="w-7 h-7 text-primary-700 group-hover:text-gold-500 transition-colors" />}
      </div>
      <h3 className="text-xl font-bold text-primary-900 mb-3 group-hover:text-gold-500 transition-colors">
        {service.name}
      </h3>
      <p className="text-gray-600 text-sm leading-relaxed mb-4">
        {service.description || service.overview || ''}
      </p>
      {showLink && (
        <span className="text-gold-500 text-sm font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
          {t('common.viewDetails')} <ArrowRight className="w-4 h-4" />
        </span>
      )}
    </Link>
  );
}
