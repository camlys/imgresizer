
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Metadata } from 'next';
import { Check } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Advanced Image Editing SEO Information | ImgResizer',
    description: 'A comprehensive overview of ImgResizer\'s features, including image resizing, cropping, format conversion (PNG, JPEG, PDF), and privacy details. Your go-to free online photo editor.',
    keywords: 'image resizer, photo editor, online image editor, free photo editor, crop image, resize image, convert image format, private image editor, ImgResizer, SEO, metadata, keywords',
};

const keywordList = [
    "Free Image Resizer", "Online Photo Editor", "Crop Image Online", "Resize PNG", "Convert to JPEG",
    "PDF to Image", "Private Image Editing", "No Sign-Up Photo Editor", "Client-Side Image Processing",
    "ImgResizer Features", "Perspective Correction Tool", "Add Text to Photo", "Image Watermark", "Collage Maker Online"
];

export default function SeoInfoPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main className="flex-1 container mx-auto py-12 px-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl md:text-4xl font-extrabold font-headline tracking-tighter">
              ImgResizer: The Ultimate Free Online Image Editor (SEO & Keyword Guide)
            </CardTitle>
            <p className="text-muted-foreground pt-2">
              This page provides a detailed, keyword-rich overview of ImgResizer to enhance search engine visibility. We are the premier destination for free, private, and powerful online image and photo editing.
            </p>
          </CardHeader>
          <CardContent className="space-y-8 text-muted-foreground">
            
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-3">Core Focus: Privacy and Accessibility</h2>
              <p>
                At its core, <strong className="text-primary">ImgResizer</strong> is a <strong className="text-primary">free online image editor</strong> that prioritizes user privacy. All operations—from a simple <strong className="text-primary">image resize</strong> to a complex <strong className="text-primary">perspective crop</strong>—happen directly in your browser. This client-side processing means your files are never uploaded to a server, making ImgResizer a truly <strong className="text-primary">private photo editor</strong>. No sign-ups, no tracking, just powerful tools.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-3">Comprehensive Feature Set for All Your Needs</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold text-foreground flex items-center"><Check className="text-primary mr-2" />Image Resizing and Scaling</h3>
                  <p>Easily <strong className="text-primary">resize an image</strong> using pixels (px), centimeters (cm), millimeters (mm), or inches. Our tool helps you prepare images for any platform, whether you need to <strong className="text-primary">resize a photo for Instagram</strong> or for professional printing with DPI controls.</p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground flex items-center"><Check className="text-primary mr-2" />Cropping and Composition</h3>
                  <p>Our tool allows you to <strong className="text-primary">crop an image online</strong> with ease. Use standard aspect ratios (1:1, 16:9, 4:3) or a freeform selection. The advanced <strong className="text-primary">perspective correction</strong> tool is perfect for fixing skewed photos.</p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground flex items-center"><Check className="text-primary mr-2" />Format Conversion</h3>
                  <p>ImgResizer is also a powerful <strong className="text-primary">image format converter</strong>. You can <strong className="text-primary">convert PNG to JPEG</strong>, <strong className="text-primary">WEBP to PNG</strong>, or even turn a high-resolution image into an optimized JPEG with a specific file size target. We also handle <strong className="text-primary">PDF to image conversion</strong> seamlessly.</p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground flex items-center"><Check className="text-primary mr-2" />Creative Editing and Overlays</h3>
                  <p>Go beyond basic edits. <strong className="text-primary">Add text to a photo</strong> with custom fonts and colors, apply a <strong className="text-primary">signature or watermark</strong>, and adjust brightness, contrast, and saturation. Create stunning visuals with our one-click filters or build a multi-image layout with our <strong className="text-primary">online collage maker</strong>.</p>
                </div>
              </div>
            </section>

            <section>
                <h2 className="text-2xl font-bold text-foreground mb-3">Target Meta Keywords for Search Engines</h2>
                <p>To rank effectively, we target a wide range of search queries. This ensures that anyone looking for a high-quality, <strong className="text-primary">free online photo editor</strong> finds ImgResizer.</p>
                <div className="flex flex-wrap gap-2 mt-4">
                    {keywordList.map(keyword => (
                        <div key={keyword} className="bg-muted text-foreground rounded-full px-3 py-1 text-sm">
                            {keyword}
                        </div>
                    ))}
                </div>
            </section>

            <section>
                <h2 className="text-2xl font-bold text-foreground mb-3">Why ImgResizer Ranks as a Top Tool</h2>
                <ul className="list-disc list-inside space-y-2">
                    <li><strong className="text-primary">No Server Uploads:</strong> Unmatched privacy for all users. Your data stays on your device.</li>
                    <li><strong className="text-primary">Completely Free:</strong> All features are available for free, with no hidden costs or subscriptions.</li>
                    <li><strong className="text-primary">Cross-Platform:</strong> Works on any modern browser, on any device.</li>
                    <li><strong className="text-primary">Rich Feature Set:</strong> From simple resizing to multi-page PDF creation and collage layouts, we cover all bases.</li>
                </ul>
            </section>
          </CardContent>
        </Card>
      </main>
      <SiteFooter />
    </div>
  );
}
