import type { Metadata } from 'next';
import { buildMetadata } from '@/components/SEO';

export const metadata: Metadata = buildMetadata({
  title: 'Services',
  description: 'Branding, web development, digital marketing and automation services for businesses in Tanzania.',
  url: '/services',
});

export default function ServicesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
