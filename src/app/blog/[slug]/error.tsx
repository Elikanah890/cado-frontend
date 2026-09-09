'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import PublicLayout from '@/components/PublicLayout';

export default function BlogPostError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[blog] Error rendering post:', error);
  }, [error]);

  return (
    <PublicLayout>
      <section className="section-padding">
        <div className="container-custom max-w-2xl text-center">
          <h1 className="text-3xl font-bold text-primary-900 mb-4">This page couldn&apos;t load</h1>
          <p className="text-gray-600 mb-6">
            Something went wrong while displaying this article. Please try again in a moment.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button onClick={reset} className="btn-primary">Try again</button>
            <Link href="/blog" className="btn-secondary">← Back to Blog</Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
