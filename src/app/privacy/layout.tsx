import type { Metadata } from 'next';
import { buildMetadata } from '@/components/SEO';

export const metadata: Metadata = buildMetadata({
  title: 'Privacy Policy',
  description: 'How CadorDigital collects, uses and protects your personal information.',
  url: '/privacy',
});

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
