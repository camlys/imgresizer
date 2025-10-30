
"use client";

import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from '@/components/theme-provider';
import Script from 'next/script';
import { CookieConsentBanner } from '@/components/cookie-consent-banner';
import { useEffect, useState, useCallback } from 'react';
import { ClientOnly } from '@/components/client-only';
import { Inter, Space_Grotesk } from 'next/font/google';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
});

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: Array<string>;
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed',
    platform: string,
  }>;
  prompt(): Promise<void>;
}

const Analytics = () => {
  const [consent, setConsent] = useState<boolean | null>(null);

  useEffect(() => {
    const checkConsent = () => {
      const consentValue = localStorage.getItem('cookie_consent');
      setConsent(consentValue === 'true');
    };

    checkConsent();

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'cookie_consent') {
        checkConsent();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
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

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };
    
    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Disable F12
      if (e.key === 'F12' || e.keyCode === 123) {
        e.preventDefault();
      }
      // Disable Ctrl+Shift+I
      if (e.ctrlKey && e.shiftKey && e.key === 'I') {
        e.preventDefault();
      }
      // Disable Ctrl+Shift+J
      if (e.ctrlKey && e.shiftKey && e.key === 'J') {
        e.preventDefault();
      }
       // Disable Ctrl+Shift+C
      if (e.ctrlKey && e.shiftKey && e.key === 'C') {
        e.preventDefault();
      }
      // Disable Ctrl+U
      if (e.ctrlKey && e.key === 'U') {
        e.preventDefault();
      }
    };
    
    // Log a warning message to the console
    console.log('%cHold Up!', 'color: red; font-size: 50px; font-weight: bold;');
    console.log('%cThis area is for developers. Please do not copy or paste any code here.', 'font-size: 18px;');


    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('copy', handleCopy);
    document.addEventListener('cut', handleCopy);


    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('cut', handleCopy);
    };
  }, []);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'ImgResizer',
    url: 'https://www.imgresizer.xyz',
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'All',
    description: 'A free, privacy-focused online tool to resize, crop, edit images, and create photo collages from images and PDFs.',
    featureList: [
      'Image Resizing',
      'Image Cropping',
      'Perspective Correction',
      'Image Format Conversion (PNG, JPEG, WEBP, PDF)',
      'Color Adjustments (Brightness, Contrast, Saturation)',
      'Photo Filters (Grayscale, Sepia, etc.)',
      'Add Text to Images',
      'Add Signature/Watermark to Images',
      'PDF to Image Conversion',
      'Online Photo Collage Maker',
      'Client-side processing for privacy',
      'Secure PDF password handling',
      'Drawing and annotation tools',
    ],
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    creator: {
      '@type': 'Organization',
      name: 'ImgResizer',
      url: 'https://www.imgresizer.xyz'
    }
  };

  return (
    <html lang="en" suppressHydrationWarning className={spaceGrotesk.variable}>
      <head>
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5066894312897940"
     crossOrigin="anonymous"></script>
        <link rel="canonical" href="https://www.imgresizer.xyz" />
        <meta name="description" content="The simple, powerful, and privacy-focused online tool to resize, crop, edit your images, and create photo collages from images and PDFs. No watermarks." />
        <meta name="keywords" content="image resizer, photo editor, online image editor, free photo editor, crop image, resize image, convert image format, private image editor, ImgResizer, SEO, metadata, keywords, free image editor no watermark, online photo collage maker, pdf to jpg converter online, perspective correction, photo resizer, JPG converter, image to PDF, online picture editor, photo collage maker, image compressor, change image size, edit photos online, best free photo editor, picture editor, photo editor free, edit pictures, image resizer online, resize image online, png to jpg, webp to png, image to pdf converter, secure document editing" />
        <meta name="google-site-verification" content="vAXaQAf1AwfzrK402zrQbne-DlogUKuiHaQAWg7P09A" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <ClientOnly>
          <Analytics />
        </ClientOnly>
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#ffffff" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Image Resizer, ImgResizer.xyz - Free Online Image & PDF Resizer, Editor & Background Remover Tool" />
        <meta name="twitter:description" content="The simple, powerful, and privacy-focused online tool to resize, crop, edit images, and create photo collages from images and PDFs. No watermarks." />
        <meta name="twitter:creator" content="@ImgResizer" />
        <meta name="twitter:image" content="https://www.imgresizer.xyz/imgresizer.png" />
        <meta property="og:title" content="Image Resizer, ImgResizer.xyz - Free Online Image & PDF Resizer, Editor & Background Remover Tool" />
        <meta property="og:description" content="The simple, powerful, and privacy-focused online tool to resize, crop, edit images, and create photo collages from images and PDFs. No watermarks." />
        <meta property="og:url" content="https://www.imgresizer.xyz" />
        <meta property="og:site_name" content="ImgResizer" />
        <meta property="og:image" content="https://www.imgresizer.xyz/imgresizer.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:locale" content="en_US" />
        <meta property="og:type" content="website" />
      </head>
      <body className="font-body antialiased has-[[data-radix-popper-content-wrapper]]:min-h-screen">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
          <ClientOnly>
            <CookieConsentBanner />
          </ClientOnly>
        </ThemeProvider>
      </body>
    </html>
  );
}
