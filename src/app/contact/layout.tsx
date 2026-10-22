import type { Metadata } from 'next';
import { buildMetadata } from '@/components/SEO';

export const metadata: Metadata = buildMetadata({
  title: 'Contact',
  description: 'Contact CadorDigital for branding, web development, digital marketing and automation.',
  url: '/contact',
});

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
