import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Providers } from './providers';
import VisitorTracker from '@/components/VisitorTracker';
import GoogleAnalytics from '@/components/GoogleAnalytics';
import { siteConfig, absoluteUrl } from '@/lib/seo';
import { organizationSchema, websiteSchema } from '@/lib/jsonLd';

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: { default: siteConfig.title, template: `%s | ${siteConfig.name}` },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  authors: [{ name: siteConfig.author, url: siteConfig.url }],
  creator: siteConfig.author,
  publisher: siteConfig.author,
  category: siteConfig.category,
  alternates: { canonical: siteConfig.url },
  openGraph: {
    type: 'website',
    locale: siteConfig.locale,
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: siteConfig.title,
    description: siteConfig.description,
    images: [{ url: absoluteUrl(siteConfig.ogImage), width: 1200, height: 630, alt: siteConfig.title }],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.title,
    description: siteConfig.description,
    images: [absoluteUrl(siteConfig.ogImage)],
    creator: siteConfig.twitterHandle,
    site: siteConfig.twitterHandle,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 },
  },
  icons: {
    icon: [{ url: '/favicon.ico' }, { url: '/cador-logo.png', type: 'image/png' }],
    apple: [{ url: '/cador-logo.png' }],
    shortcut: '/favicon.ico',
  },
  manifest: '/manifest.json',
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || process.env.GOOGLE_SITE_VERIFICATION || undefined,
  },
  other: { 'theme-color': siteConfig.themeColor },
};

export const viewport: Viewport = {
  themeColor: siteConfig.themeColor,
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const orgJsonLd = organizationSchema();
  const siteJsonLd = websiteSchema();
  return (
    <html lang="en" style={{ colorScheme: 'dark' }} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href={new URL(siteConfig.url).origin} />
        {process.env.NEXT_PUBLIC_API_URL ? <link rel="preconnect" href={new URL(process.env.NEXT_PUBLIC_API_URL).origin} /> : null}
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        <link rel="preload" as="image" href="/cador-logo.png" />
      </head>
      <body className="min-h-screen flex flex-col">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd) }} />
        <GoogleAnalytics />
        <Providers>
          {children}
          <VisitorTracker />
        </Providers>
      </body>
    </html>
  );
}
