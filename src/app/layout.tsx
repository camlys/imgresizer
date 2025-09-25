
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from '@/components/theme-provider';
import Script from 'next/script';
import { CookieConsentBanner } from '@/components/cookie-consent-banner';

export const metadata: Metadata = {
  metadataBase: new URL('https://imgresizer.xyz'),
  title: {
    default: 'ImgResizer: Free, Private Online Image & Photo Editor',
    template: '%s | ImgResizer',
  },
  description: 'Edit, resize, crop, convert, and enhance images and photos for free. ImgResizer is a powerful, privacy-focused online tool that works right in your browser. No downloads, no sign-ups, no watermarks.',
  keywords: ['image editor', 'photo editor', 'online image editor', 'free image editor', 'image resizer', 'photo resizer', 'crop image', 'pdf to image converter', 'change image format', 'compress image', 'add text to image', 'perspective crop', 'photo effects', 'image manipulation'],
  
  authors: [{ name: 'ImgResizer Team', url: 'https://imgresizer.xyz/about' }],
  creator: 'ImgResizer',
  publisher: 'ImgResizer',

  openGraph: {
    title: 'ImgResizer: Free, Private Online Image & Photo Editor',
    description: 'The simple, powerful, and privacy-focused online tool to resize, crop, and edit your images and photos directly in your browser. No watermarks.',
    url: 'https://imgresizer.xyz',
    siteName: 'ImgResizer',
    images: [
      {
        url: '/og-image.png', // Ensure you have this file in your /public folder
        width: 1200,
        height: 630,
        alt: 'ImgResizer - Free Online Image and Photo Editor',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },

  twitter: {
    card: 'summary_large_image',
    title: 'ImgResizer: Free, Private Online Image & Photo Editor',
    description: 'The simple, powerful, and privacy-focused online tool to resize, crop, and edit your images and photos directly in your browser. No watermarks.',
    creator: '@ImgResizer', // Replace with your actual Twitter handle
    images: ['/og-image.png'], // Ensure you have this file in your /public folder
  },

  icons: {
    icon: '/imgresizer.jpeg',
    shortcut: '/imgresizer.jpeg',
    apple: '/imgresizer.jpeg',
  },

  manifest: '/site.webmanifest',
  
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  alternates: {
    canonical: 'https://imgresizer.xyz',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'ImgResizer',
    url: 'https://imgresizer.xyz',
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'All',
    description: 'A free, privacy-focused online tool to resize, crop, and edit images and photos directly in your browser.',
    featureList: [
      'Image Resizing',
      'Image Cropping',
      'Perspective Correction',
      'Image Format Conversion (PNG, JPEG, WEBP, etc.)',
      'Color Adjustments (Brightness, Contrast, Saturation)',
      'Photo Filters (Grayscale, Sepia, etc.)',
      'Add Text to Images',
      'Add Signature/Watermark to Images',
      'PDF to Image Conversion',
      'Image Collage Maker',
      'Client-side processing for privacy',
    ],
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    creator: {
      '@type': 'Organization',
      name: 'ImgResizer',
      url: 'https://imgresizer.xyz'
    }
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="google-site-verification" content="vAXaQAf1AwfzrK402zrQbne-DlogUKuiHaQAWg7P09A" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {/* <!-- Google tag (gtag.js) --> */}
        <Script async src="https://www.googletagmanager.com/gtag/js?id=G-RP9B39XVRB"></Script>
        <Script id="google-analytics">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-RP9B39XVRB');
          `}
        </Script>
      </head>
      <body className="font-body antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
          <CookieConsentBanner />
        </ThemeProvider>
      </body>
    </html>
  );
}
