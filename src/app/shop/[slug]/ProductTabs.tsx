'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import FrameImage from '@/components/FrameImage';

type GalleryImage = { url: string; alt?: string };

export default function ProductTabs({
  description,
  gallery,
}: {
  description: string;
  gallery: GalleryImage[];
}) {
  const [tab, setTab] = useState<'info' | 'reviews'>('info');

  return (
    <div className="mt-8">
      <div className="flex gap-1 border-b border-gray-200">
        <button
          type="button"
          onClick={() => setTab('info')}
          className={`relative px-5 py-3 text-sm font-semibold transition-colors ${
            tab === 'info' ? 'text-gold-600' : 'text-gray-500 hover:text-primary-900'
          }`}
        >
          Product Info
          {tab === 'info' && <span className="absolute inset-x-0 -bottom-px h-0.5 bg-gold-500" />}
        </button>
        <button
          type="button"
          onClick={() => setTab('reviews')}
          className={`relative px-5 py-3 text-sm font-semibold transition-colors ${
            tab === 'reviews' ? 'text-gold-600' : 'text-gray-500 hover:text-primary-900'
          }`}
        >
          Reviews
          {tab === 'reviews' && <span className="absolute inset-x-0 -bottom-px h-0.5 bg-gold-500" />}
        </button>
      </div>

      {tab === 'info' ? (
        <div className="pt-7">
          <h2 className="text-2xl font-bold text-primary-900">Product Info</h2>
          {description ? (
            <p className="mt-4 whitespace-pre-wrap leading-relaxed text-gray-600">{description}</p>
          ) : (
            <p className="mt-4 text-gray-500">No description available.</p>
          )}

          {gallery.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-bold text-primary-900">Gallery</h3>
              <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3">
                {gallery.map((image, index) => (
                  <div key={`${image.url}-${index}`} className="relative aspect-video overflow-hidden rounded-xl border border-gray-100 bg-gray-100 shadow-sm">
                    <FrameImage src={image.url} alt={image.alt || `Product image ${index + 2}`} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="pt-7">
          <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center shadow-sm">
            <div className="flex justify-center gap-1 text-gold-500">
              {[...Array(5)].map((_, index) => (
                <Star key={index} className="h-6 w-6" fill="currentColor" />
              ))}
            </div>
            <p className="mx-auto mt-4 max-w-md text-gray-500">
              No reviews yet. Be the first to review this product.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
