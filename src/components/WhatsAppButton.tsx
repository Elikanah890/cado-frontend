'use client';

import { whatsappLink } from '@/lib/utils';

export default function WhatsAppButton() {
  return (
    <a
      href={whatsappLink()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full shadow-xl hover:scale-110 transition-transform"
      style={{ backgroundColor: '#25D366' }}
    >
      <svg viewBox="0 0 32 32" className="w-8 h-8 fill-white" aria-hidden="true">
        <path d="M19.11 17.27c-.29-.14-1.7-.84-1.97-.94-.26-.1-.45-.14-.64.14-.19.29-.74.94-.9 1.13-.17.19-.33.21-.62.07-.29-.14-1.22-.45-2.32-1.43-.86-.77-1.43-1.72-1.6-2.01-.17-.29-.02-.44.13-.58.13-.13.29-.33.43-.5.14-.17.19-.29.29-.48.1-.19.05-.36-.02-.5-.07-.14-.64-1.55-.88-2.12-.23-.56-.47-.48-.64-.49h-.55c-.19 0-.5.07-.76.36-.26.29-1 .98-1 2.38s1.02 2.76 1.16 2.95c.14.19 2 3.05 4.84 4.28.68.29 1.2.47 1.61.6.68.22 1.29.19 1.78.11.54-.08 1.7-.69 1.94-1.36.24-.67.24-1.24.17-1.36-.07-.12-.26-.19-.55-.33z"/>
        <path d="M16 3C8.82 3 3 8.82 3 16c0 2.29.6 4.44 1.65 6.3L3 29l6.86-1.8A12.94 12.94 0 0 0 16 29c7.18 0 13-5.82 13-13S23.18 3 16 3zm0 23.5c-2.03 0-3.93-.6-5.52-1.63l-.4-.24-4.07 1.07 1.09-3.97-.26-.41A10.44 10.44 0 0 1 5.5 16C5.5 10.2 10.2 5.5 16 5.5S26.5 10.2 26.5 16 21.8 26.5 16 26.5z"/>
      </svg>
    </a>
  );
}
