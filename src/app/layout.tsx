import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: {
    default: 'CadorDigital - Build. Market. Automate. Grow.',
    template: '%s | CadorDigital',
  },
  description: 'CadorDigital helps startups, companies and organizations build professional brands, websites, marketing systems and automation solutions.',
  keywords: 'digital agency, tanzania, web development, branding, digital marketing, AI, automation, business registration',
  openGraph: {
    type: 'website',
    locale: 'en_TZ',
    url: 'https://cador.digital',
    siteName: 'CadorDigital',
    title: 'CadorDigital - Build. Market. Automate. Grow.',
    description: 'Professional digital agency in Tanzania.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CadorDigital',
    description: 'Build. Market. Automate. Grow.',
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" style={{ colorScheme: 'dark' }} suppressHydrationWarning>
      <body className="min-h-screen flex flex-col">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
