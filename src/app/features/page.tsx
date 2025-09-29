
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Zap, ShieldCheck, LockKeyhole, Crop, SlidersHorizontal, Type, FileImage, GitCompareArrows } from 'lucide-react';
import React, { useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { Metadata } from 'next';


export const metadata: Metadata = {
    title: 'Features - ImgResizer | Free Online Image & Photo Editor',
    description: 'Explore all the features of ImgResizer, including precision resizing, perspective correction, color adjustments, text overlays, format conversion (PNG, JPEG, PDF), and more. All private and free.',
};

const faqs = [
  {
    id: "faq-1",
    question: "Is ImgResizer really free to use?",
    answer: "Yes, absolutely. All features of ImgResizer, from resizing and cropping to color adjustments and format conversion, are completely free. We believe everyone should have access to powerful image editing tools without any cost."
  },
  {
    id: "faq-2",
    question: "How does ImgResizer protect my privacy?",
    answer: "Your privacy is our top priority. ImgResizer is a client-side application, which means all your images are processed directly on your computer within your web browser. Your files are never uploaded to our servers, ensuring your data remains 100% private and secure."
  },
  {
    id: "faq-3",
    question: "What file formats can I upload and download?",
    answer: "You can upload most common image formats, including JPEG, PNG, WEBP, and BMP, as well as PDF files. You can then download your edited work as a JPEG, PNG, WEBP, GIF, BMP, SVG, or even a PDF document."
  },
  {
    id: "faq-4",
    question: "What is the difference between PNG, JPEG, and WEBP?",
    answer: "JPEG is great for photos and offers excellent compression, but doesn't support transparency. PNG is ideal for graphics, logos, and images requiring transparency, offering lossless quality at a larger file size. WEBP is a modern format that provides superior compression for both photos and graphics, supports transparency, and is excellent for web use."
  },
  {
    id: "faq-5",
    question: "How do I resize an image to a specific file size?",
    answer: "In the \"Download\" popover, you'll find an option to set a target file size (e.g., 500 KB). Our tool will automatically adjust the image quality (for JPEG or WEBP formats) to get as close as possible to your desired size, making it easy to meet file size requirements for emails or online forms."
  },
];

function FaqSection() {
    // This state is not used on server, but good for potential future client-side enhancements
    const [activeFaq, setActiveFaq] = React.useState(faqs[0].id);

    return (
        <section>
            <h2 className="text-3xl font-bold text-center font-headline mb-12">Frequently Asked Questions</h2>
            
            <div className="max-w-4xl mx-auto space-y-4 md:hidden">
              <Accordion type="single" collapsible defaultValue={faqs[0].id}>
                  {faqs.map(faq => (
                      <AccordionItem value={faq.id} key={faq.id} className="border-b-0">
                          <Card>
                            <AccordionTrigger className="text-left p-6 hover:no-underline">
                              <CardTitle className="text-base font-semibold">{faq.question}</CardTitle>
                            </AccordionTrigger>
                            <AccordionContent className="px-6">
                              <p className="text-muted-foreground">{faq.answer}</p>
                            </AccordionContent>
                          </Card>
                      </AccordionItem>
                  ))}
              </Accordion>
            </div>

            <div className="hidden md:grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
                <div className="flex flex-col gap-4">
                    {faqs.map(faq => (
                        <Card 
                            key={faq.id}
                            className={`p-6 rounded-lg text-left transition-all duration-300 cursor-pointer bg-muted/50 hover:bg-muted`}
                        >
                            <h4 className="text-lg font-semibold">{faq.question}</h4>
                        </Card>
                    ))}
                </div>
                <div className="relative">
                    <Card className="sticky top-24 p-8 min-h-[300px] shadow-lg">
                        {faqs.map(faq => (
                             <div key={faq.id} className={`transition-opacity duration-300 opacity-100`}>
                                <h3 className="text-xl font-bold text-foreground mb-4">{faq.question}</h3>
                                <p className="text-muted-foreground text-lg leading-relaxed">{faq.answer}</p>
                            </div>
                        ))[0]}
                    </Card>
                </div>
            </div>
        </section>
    );
}


export default function FeaturesPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main className="flex-1">
        <section className="relative bg-muted/40 text-foreground py-20 md:py-32">
          <div className="container mx-auto px-6 text-center">
            <h1 className="text-4xl md:text-6xl font-extrabold font-headline tracking-tighter mb-4">
              ImgResizer: A Full Suite of Editing Tools
            </h1>
            <p className="max-w-3xl mx-auto text-lg md:text-xl text-muted-foreground">
                Discover the powerful, free, and privacy-focused features that make ImgResizer the ultimate online tool for all your image and PDF editing needs. Everything you need, right in your browser.
            </p>
          </div>
        </section>

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
                        <img src="/camly.png" alt="Image format icon" className="w-20 h-20" />
                    </div>
                    </div>
                </div>
            </section>
            
            <FaqSection />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
