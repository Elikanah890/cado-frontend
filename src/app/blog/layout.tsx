import type { Metadata } from 'next';
import { buildMetadata } from '@/components/SEO';

export const metadata: Metadata = buildMetadata({
  title: 'Blog',
  description: 'Insights and practical guides on branding, marketing, web development and business growth.',
  url: '/blog',
});

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return children;
}
