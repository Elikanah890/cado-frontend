'use client';

import { useState } from 'react';
import { ImageIcon, Quote } from 'lucide-react';

type Testimonial = { quote: string; author?: string | null; role?: string | null } | null;
type GalleryImage = { url: string; alt?: string | null };

export default function ProjectTabs({
  challenge,
  solution,
  results,
  techStack,
  testimonial,
  videoEmbedUrl,
  galleryImages,
}: {
  challenge?: string | null;
  solution?: string | null;
  results?: string | null;
  techStack: string[];
  testimonial: Testimonial;
  videoEmbedUrl: string | null;
  galleryImages: GalleryImage[];
}) {
  const [tab, setTab] = useState<'info' | 'gallery'>('info');

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
          Project Info
          {tab === 'info' && <span className="absolute inset-x-0 -bottom-px h-0.5 bg-gold-500" />}
        </button>
        <button
          type="button"
          onClick={() => setTab('gallery')}
          className={`relative px-5 py-3 text-sm font-semibold transition-colors ${
            tab === 'gallery' ? 'text-gold-600' : 'text-gray-500 hover:text-primary-900'
          }`}
        >
          Gallery
          {tab === 'gallery' && <span className="absolute inset-x-0 -bottom-px h-0.5 bg-gold-500" />}
        </button>
      </div>

      {tab === 'info' ? (
        <div className="pt-7">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-bold text-primary-900">Challenge</h3>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-gray-600">{challenge || 'No challenge described.'}</p>
            </div>
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-bold text-primary-900">Solution</h3>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-gray-600">{solution || 'No solution described.'}</p>
            </div>
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-bold text-primary-900">Results</h3>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-gray-600">{results || 'No results described.'}</p>
            </div>
          </div>

          {techStack.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-bold text-primary-900">Tech Stack</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {techStack.map((tech) => (
                  <span key={tech} className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-primary-700 shadow-sm">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}

          {testimonial?.quote && (
            <div className="mt-8 rounded-2xl bg-gradient-to-br from-primary-50 to-white p-6 shadow-sm">
              <Quote className="h-7 w-7 text-gold-500" />
              <p className="mt-3 text-lg italic leading-relaxed text-gray-700">“{testimonial.quote}”</p>
              <p className="mt-3 font-semibold text-primary-900">{testimonial.author}</p>
              {testimonial.role ? <p className="text-sm text-gray-500">{testimonial.role}</p> : null}
            </div>
          )}
        </div>
      ) : (
        <div className="pt-7">
          {videoEmbedUrl ? (
            <div className="aspect-video overflow-hidden rounded-2xl border border-gray-100 bg-black shadow-lg">
              <iframe
                src={videoEmbedUrl}
                title="Project Video"
                className="h-full w-full"
                allowFullScreen
                loading="lazy"
              />
            </div>
          ) : null}

          {galleryImages.length > 0 ? (
            <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3">
              {galleryImages.map((image, index) => (
                <div key={`${image.url}-${index}`} className="aspect-video overflow-hidden rounded-xl border border-gray-100 bg-gray-100 shadow-sm">
                  <img
                    src={image.url}
                    alt={image.alt || `Project gallery ${index + 1}`}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          ) : !videoEmbedUrl ? (
            <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center shadow-sm">
              <ImageIcon className="mx-auto h-10 w-10 text-gray-300" />
              <p className="mt-3 text-gray-500">No gallery images available yet.</p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
