import type { Metadata } from 'next';
import { buildMetadata } from '@/components/SEO';

export const metadata: Metadata = buildMetadata({
  title: 'Terms & Conditions',
  description: 'Terms and conditions for using the CadorDigital website and services.',
  url: '/terms',
});

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
