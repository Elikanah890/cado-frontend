import type { Metadata } from 'next';
import { buildMetadata } from '@/components/SEO';

export const metadata: Metadata = buildMetadata({
  title: 'Shop',
  description: 'Ready-made digital templates, graphics and tools for your business.',
  url: '/shop',
});

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return children;
}
