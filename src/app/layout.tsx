
"use client";

import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from '@/components/theme-provider';
import Script from 'next/script';
import { CookieConsentBanner } from '@/components/cookie-consent-banner';
import { useEffect, useState } from 'react';

const Analytics = () => {
  const [consent, setConsent] = useState<boolean | null>(null);

  useEffect(() => {
    const consentValue = localStorage.getItem('cookie_consent');
    if (consentValue) {
      setConsent(consentValue === 'true');
    } else {
      // If no consent is stored, we assume null and the banner will show.
      // We don't render analytics until consent is explicitly true.
      setConsent(null);
    }
  }, []);

  if (consent !== true) {
    return null;
  }

  return (
    <>
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
    </>
  )
}

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
        <Analytics />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="icon" href="/imgresizerlogo.ico" />
        <link rel="apple-touch-icon" href="/imgresizerlogo.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="ImgResizer: Free, Private Online Image & Photo Editor" />
        <meta name="twitter:description" content="The simple, powerful, and privacy-focused online tool to resize, crop, and edit your images and photos directly in your browser. No watermarks." />
        <meta name="twitter:creator" content="@ImgResizer" />
        <meta property="og:title" content="ImgResizer: Free, Private Online Image & Photo Editor" />
        <meta property="og:description" content="The simple, powerful, and privacy-focused online tool to resize, crop, and edit your images and photos directly in your browser. No watermarks." />
        <meta property="og:url" content="https://imgresizer.xyz" />
        <meta property="og:site_name" content="ImgResizer" />
        <meta property="og:image" content="https://imgresizer.xyz/og-image.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:locale" content="en_US" />
        <meta property="og:type" content="website" />
        <meta name="twitter:image" content="https://imgresizer.xyz/og-image.png" />
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
