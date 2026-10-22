'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X, ZoomIn } from 'lucide-react';
import PosterImage from '@/components/PosterImage';

export default function PortfolioLightbox({ src, alt }: { src: string; alt: string }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`View ${alt} full size`}
        className="group relative block w-full overflow-hidden rounded-2xl bg-primary-800 shadow-2xl cursor-zoom-in focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:ring-offset-2 focus-visible:ring-offset-primary-900"
      >
        <PosterImage
          src={src}
          alt={alt}
          loading="eager"
          className="rounded-none"
          imageClassName="transition-transform duration-500 group-hover:scale-[1.02]"
        />
        <span className="pointer-events-none absolute bottom-4 right-4 inline-flex items-center gap-2 rounded-full bg-black/60 px-3 py-2 text-xs font-medium text-white backdrop-blur-sm opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <ZoomIn className="h-4 w-4" /> View full size
        </span>
      </button>

      {mounted &&
        createPortal(
          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
                role="dialog"
                aria-modal="true"
                aria-label={alt}
                onClick={() => setOpen(false)}
              >
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close image"
                  className="absolute right-4 top-4 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500"
                >
                  <X className="h-6 w-6" />
                </button>
                <motion.img
                  src={src}
                  alt={alt}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.2 }}
                  className="max-h-[90vh] max-w-[92vw] rounded-lg object-contain shadow-2xl"
                  onClick={(event) => event.stopPropagation()}
                />
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}
