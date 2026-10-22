import type { Metadata } from 'next';
import { buildMetadata } from '@/components/SEO';

export const metadata: Metadata = buildMetadata({
  title: 'Portfolio',
  description: 'Explore recent branding, web development and digital projects delivered by CadorDigital.',
  url: '/portfolio',
});

export default function PortfolioLayout({ children }: { children: React.ReactNode }) {
  return children;
}
