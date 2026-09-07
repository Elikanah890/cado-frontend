'use client';

import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';
import { ReactNode } from 'react';
import { LanguageProvider } from '@/lib/LanguageContext';
import { ServicesProvider } from '@/lib/ServicesContext';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <LanguageProvider>
        <ServicesProvider>
          {children}
          <Toaster position="top-right" richColors closeButton />
        </ServicesProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
