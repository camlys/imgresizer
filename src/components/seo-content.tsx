
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Zap, ShieldCheck, LockKeyhole, Crop, SlidersHorizontal, Type, FileImage, GitCompareArrows } from 'lucide-react';
import React from 'react';

interface SeoContentProps {
  isEditing: boolean;
  children?: React.ReactNode;
}

export function SeoContent({ isEditing, children }: SeoContentProps) {
  if (isEditing) {
    return (
      <div className="container mx-auto py-16 px-6 space-y-20 bg-background">
        <section>
            <h2 className="text-3xl font-bold text-center font-headline mb-12">Why ImgResizer is Your Best Choice for Editing</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
                <div className="flex flex-col items-center">
                    <ShieldCheck className="w-12 h-12 text-primary mb-4"/>
                    <h3 className="text-xl font-semibold mb-2">Total Privacy</h3>
                    <p className="text-muted-foreground">Your images are processed locally in your browser. Nothing is ever stored on our servers, guaranteeing your work remains yours alone.</p>
                </div>
                <div className="flex flex-col items-center">
                    <Zap className="w-12 h-12 text-primary mb-4"/>
                    <h3 className="text-xl font-semibold mb-2">Instant Previews</h3>
                    <p className="text-muted-foreground">See your edits in real-time. Our fast and responsive editor ensures a smooth, lag-free creative workflow.</p>
                </div>
                <div className="flex flex-col items-center">
                    <LockKeyhole className="w-12 h-12 text-primary mb-4"/>
                    <h3 className="text-xl font-semibold mb-2">No Sign-Up Needed</h3>
                    <p className="text-muted-foreground">No accounts, no logins, no interruptions. Dive straight into editing your images without any barriers.</p>
                </div>
                <div className="flex flex-col items-center">
                    <CheckCircle className="w-12 h-12 text-primary mb-4"/>
                    <h3 className="text-xl font-semibold mb-2">Absolutely Free</h3>
                    <p className="text-muted-foreground">All our professional tools are available for free. Unlock your full potential without any hidden fees or subscriptions.</p>
                </div>
            </div>
        </section>
        
        {children}

        <section className="text-center">
            <h2 className="text-3xl font-bold font-headline mb-12">Perfect Your Image in 3 Simple Steps</h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                <div className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mb-4">1</div>
                    <h3 className="text-xl font-semibold mb-2">Upload Your Image</h3>
                    <p className="text-muted-foreground">You've already done this step! Your image is loaded and ready for editing.</p>
                </div>
                <div className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mb-4">2</div>
                    <h3 className="text-xl font-semibold mb-2">Edit Like a Pro</h3>
                    <p className="text-muted-foreground">Use the intuitive controls on the left to resize, crop, adjust colors, add text, and more.</p>
                </div>
                <div className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mb-4">3</div>
                    <h3 className="text-xl font-semibold mb-2">Download Your Masterpiece</h3>
                    <p className="text-muted-foreground">Click the "Download" button to choose your format and export your finished creation.</p>
                </div>
            </div>
        </section>
      </div>
    );
  }

  // Content for the home page (when not editing)
  return (
    <div className="container mx-auto py-16 px-6 space-y-20 bg-background">
      <section className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
        <div>
          <h3 className="text-2xl font-bold text-foreground mb-4">Precision Resizing and Perspective Correction</h3>
          <p className="text-muted-foreground mb-4">
            Whether you're preparing an image for social media, print, or the web, our tool gives you ultimate control. Resize by pixels, inches, or CM, and lock the aspect ratio to prevent distortion. Use our unique perspective crop tool to correct distortions and achieve the perfect composition, making your images stand out.
          </p>
        </div>
        <div>
            <div className="rounded-lg shadow-lg bg-primary/10 aspect-[3/2] flex items-center justify-center p-8">
              <Crop className="w-24 h-24 text-primary" />
            </div>
        </div>
      </section>
      
      <section className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
         <div className="md:order-last">
          <h3 className="text-2xl font-bold text-foreground mb-4">Master Your Image's Look and Feel</h3>
          <p className="text-muted-foreground mb-4">
            Become the master of your photo’s mood. Our color adjustment panel lets you fine-tune everything from brightness and contrast to saturation and vibrance. Apply artistic filters like Grayscale, Sepia, or Vintage with a single click, or create a custom look that's all your own.
          </p>
        </div>
        <div className="order-first md:order-first">
            <div className="rounded-lg shadow-lg bg-accent/10 aspect-video flex items-center justify-center p-8">
              <SlidersHorizontal className="w-24 h-24 text-accent" />
            </div>
        </div>
      </section>

      <section className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
        <div>
          <h3 className="text-2xl font-bold text-foreground mb-4">Add Stylish Text Overlays and Watermarks</h3>
          <p className="text-muted-foreground mb-4">
            Make your images speak. Add text overlays for quotes, memes, or important information. Customize with a variety of fonts, colors, and sizes. Add a background to your text for enhanced readability or style. It's the perfect tool for creating social media graphics, promotional content, or watermarking your photography.
          </p>
        </div>
        <div>
            <div className="rounded-lg shadow-lg bg-secondary aspect-[3/2] flex items-center justify-center p-8">
              <Type className="w-24 h-24 text-primary" />
            </div>
        </div>
      </section>

      <section className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
         <div className="md:order-last">
            <h3 className="text-2xl font-bold text-foreground mb-4">Flexible Format Conversion & Export</h3>
            <p className="text-muted-foreground mb-4">
             Your final image, your way. Export your creation to a variety of popular formats, including PNG, JPEG, WEBP, and even PDF. Our tool gives you control over the final quality and file size, ensuring your image is perfectly optimized for its intended use, whether for web, print, or sharing.
            </p>
          </div>
        <div className="order-first md:order-first">
            <div className="rounded-lg shadow-lg bg-primary/10 aspect-video flex items-center justify-center p-8">
              <div className="flex items-center gap-4">
                <FileImage className="w-20 h-20 text-primary" />
                <GitCompareArrows className="w-12 h-12 text-muted-foreground" />
                <img src="/ImgResizer.png" alt="Image format icon" className="w-20 h-20" />
              </div>
            </div>
        </div>
      </section>
      
      <section>
        <h2 className="text-3xl font-bold text-center font-headline mb-12">Frequently Asked Questions</h2>
        <div className="max-w-4xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Is ImgResizer really free to use?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Yes, absolutely. All features of ImgResizer, from resizing and cropping to color adjustments and format conversion, are completely free. We believe everyone should have access to powerful image editing tools without any cost.</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>How does ImgResizer protect my privacy?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Your privacy is our top priority. ImgResizer is a client-side application, which means all your images are processed directly on your computer within your web browser. Your files are never uploaded to our servers, ensuring your data remains 100% private and secure.</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>What file formats can I upload and download?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">You can upload most common image formats, including JPEG, PNG, WEBP, and BMP, as well as PDF files. You can then download your edited work as a JPEG, PNG, WEBP, GIF, BMP, SVG, or even a PDF document.</p>
            </CardContent>
          </Card>
           <Card>
            <CardHeader>
              <CardTitle>What is the difference between PNG, JPEG, and WEBP?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">JPEG is great for photos and offers excellent compression, but doesn't support transparency. PNG is ideal for graphics, logos, and images requiring transparency, offering lossless quality at a larger file size. WEBP is a modern format that provides superior compression for both photos and graphics, supports transparency, and is excellent for web use.</p>
            </CardContent>
          </Card>
           <Card>
            <CardHeader>
              <CardTitle>How do I resize an image to a specific file size?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">In the "Download" popover, you'll find an option to set a target file size (e.g., 500 KB). Our tool will automatically adjust the image quality (for JPEG or WEBP formats) to get as close as possible to your desired size, making it easy to meet file size requirements for emails or online forms.</p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
