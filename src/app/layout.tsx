import type { Metadata, Viewport } from 'next';
import { Suspense } from 'react';
import Script from 'next/script';
import './globals.css';
import { Providers } from './providers';
import VisitorTracker from '@/components/VisitorTracker';
import MetaPixelTracker from '@/components/MetaPixelTracker';
import { GoogleAnalytics } from '@next/third-parties/google';
import { siteConfig, absoluteUrl, SOCIAL_LINKS, fetchSeo, type SocialLinks } from '@/lib/seo';
import { organizationSchema, websiteSchema } from '@/lib/jsonLd';

const META_PIXEL_ID = '1519130706241514';
const META_PIXEL_SCRIPT = `
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${META_PIXEL_ID}');
fbq('track', 'PageView');
`;

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
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
  manifest: '/manifest.json',
  verification: {
    google: '0-kpOCPwbbLFFgi03ydO8PUiBXwiWLYlZCMPwe71sME',
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

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await fetchSeo<Record<string, string | null>>('/settings', 3600);
  const social: SocialLinks = {
    instagram: settings?.social_instagram?.trim() || SOCIAL_LINKS.instagram,
    youtube: settings?.social_youtube?.trim() || SOCIAL_LINKS.youtube,
    facebook: settings?.social_facebook?.trim() || SOCIAL_LINKS.facebook,
  };
  const orgJsonLd = organizationSchema(social);
  const siteJsonLd = websiteSchema();
  return (
    <html lang="en" data-scroll-behavior="smooth" style={{ colorScheme: 'dark' }} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href={new URL(siteConfig.url).origin} />
        {process.env.NEXT_PUBLIC_API_URL ? <link rel="preconnect" href={new URL(process.env.NEXT_PUBLIC_API_URL).origin} /> : null}
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        <link rel="preload" as="image" href="/logo.png" />
      </head>
      <body className="min-h-screen flex flex-col">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd) }} />
        <Script id="facebook-pixel" strategy="afterInteractive">
          {META_PIXEL_SCRIPT}
        </Script>
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
            alt=""
          />
        </noscript>
        <Providers>
          {children}
          <VisitorTracker />
          <Suspense fallback={null}>
            <MetaPixelTracker />
          </Suspense>
        </Providers>
        <GoogleAnalytics gaId="G-GYF5V0K6F2" />
      </body>
    </html>
  );
}
