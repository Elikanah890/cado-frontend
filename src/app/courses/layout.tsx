import type { Metadata } from 'next';
import { buildMetadata } from '@/components/SEO';

export const metadata: Metadata = buildMetadata({
  title: 'Courses',
  description: 'Practical online courses to build your skills and grow your business.',
  url: '/courses',
});

export default function CoursesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
