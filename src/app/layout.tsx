
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from '@/components/theme-provider';
import Script from 'next/script';

export const metadata: Metadata = {
  metadataBase: new URL('https://imgresizer.app'),
  title: 'ImgResizer: Free Online Image & Photo Editor',
  description: 'Edit, resize, and enhance images for free with ImgResizer. Our powerful, privacy-focused online tool works right in your browser. No downloads, no sign-ups.',
  keywords: ['image editor', 'photo editor', 'online image editor', 'free image editor', 'image resizer', 'photo resizer', 'crop image', 'pdf to image', 'change image format', 'image compressor'],
  openGraph: {
    title: 'ImgResizer: Free Online Image & Photo Editor',
    description: 'The simple, powerful, and privacy-focused online tool to resize, crop, and edit images right in your browser.',
    url: 'https://imgresizer.app',
    siteName: 'ImgResizer',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'ImgResizer Online Image Editor',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ImgResizer: Free Online Image & Photo Editor',
    description: 'The simple, powerful, and privacy-focused online tool to resize, crop, and edit images right in your browser.',
     images: ['/og-image.png'],
  },
  icons: {
    icon: '/ImgResizer.png',
  },
  manifest: '/site.webmanifest',
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
    url: 'https://imgresizer.app',
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'All',
    description: 'A free, privacy-focused online tool to resize, crop, and edit images and photos directly in your browser.',
    featureList: [
      'Image Resizing',
      'Image Cropping',
      'Image Format Conversion (PNG, JPEG, WEBP, etc.)',
      'Color Adjustments (Brightness, Contrast, Saturation)',
      'Add Text to Images',
      'PDF to Image Conversion',
      'Client-side processing for privacy',
    ],
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
      <meta name="google-site-verification" content="vAXaQAf1AwfzrK402zrQbne-DlogUKuiHaQAWg7P09A" />
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
        </ThemeProvider>
      </body>
    </html>
  );
}
