import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Course Player',
  robots: { index: false, follow: false },
};

export default function CoursePlayerLayout({ children }: { children: React.ReactNode }) {
  return children;
}
