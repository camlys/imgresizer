import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from '@/components/theme-provider';

export const metadata: Metadata = {
  title: 'Camly: Free Online Image Editor & Photo Resizer',
  description: 'Edit, resize, crop, and enhance your images and PDFs for free with Camly. Our powerful, privacy-focused online tool works right in your browser. No downloads required.',
  keywords: ['image editor', 'photo editor', 'online image editor', 'free image editor', 'image resizer', 'photo resizer', 'crop image', 'pdf editor', 'image enhancer'],
  openGraph: {
    title: 'Camly: Free Online Image Editor & Photo Resizer',
    description: 'The simple, powerful, and privacy-focused online image editor. Edit, resize, crop, and enhance images and PDFs right in your browser.',
    url: 'https://img-resizers.vercel.app/',
    siteName: 'Camly',
    images: [
      {
        url: 'https://img-resizers.vercel.app/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Camly Online Image Editor',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Camly: Free Online Image Editor & Photo Resizer',
    description: 'The simple, powerful, and privacy-focused online image editor. Edit, resize, crop, and enhance images and PDFs right in your browser.',
     images: ['https://img-resizers.vercel.app/og-image.png'],
  },
  icons: {
    icon: '/logo.png',
  },
  manifest: '/site.webmanifest',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />
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
