
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check } from 'lucide-react';
import Link from 'next/link';

const faqList = [
    {
        question: "How can I resize an image for Instagram without losing quality?",
        answer: "ImgResizer is perfect for this. Use our 'Resize' tool and input Instagram's recommended dimensions (e.g., 1080x1080 for a square post). For best results, keep the 'Keep Aspect Ratio' option locked and export as a high-quality JPEG. This ensures your photo resizer output is crisp and clear."
    },
    {
        question: "Is there a truly free image editor with no watermark?",
        answer: "Yes, ImgResizer is a completely free online photo editor that never adds a watermark to your images. All features, from the JPG converter to the perspective correction tool, are free to use without limitations."
    },
    {
        question: "Can I convert a multi-page PDF to a JPG online?",
        answer: "Absolutely. ImgResizer functions as a powerful PDF to image converter. When you upload a multi-page PDF, our tool lets you select the exact page you want to edit or convert, which you can then export as a JPG, PNG, or other formats."
    }
];

const keywordList = [
    "Free Image Resizer", "Online Photo Editor", "Crop Image Online", "Resize PNG", "Convert to JPEG",
    "PDF to Image", "Private Image Editing", "No Sign-Up Photo Editor", "Client-Side Image Processing",
    "ImgResizer Features", "Perspective Correction Tool", "Add Text to Photo", "Image Watermark", "Collage Maker Online"
];


export function SeoContent() {
  return (
    <section className="container mx-auto py-16 px-4">
        <Card className="bg-muted/40">
            <CardHeader>
                <CardTitle className="text-3xl md:text-4xl font-extrabold font-headline tracking-tighter">
                The Ultimate Free & Private Online Image Editor
                </CardTitle>
                 <p className="text-muted-foreground pt-2">
                    An SEO-optimized guide to ImgResizer. Learn about resizing, cropping, converting (PNG, JPEG, PDF), and editing photos online for free, with total privacy. Your top-ranking solution for image editing.
                </p>
            </CardHeader>
            <CardContent className="space-y-8">
                 <section>
                    <h2 className="text-2xl font-bold text-foreground mb-3">Core Focus: Privacy-First Image Editing</h2>
                    <p className="text-muted-foreground">
                        At its core, <strong className="text-primary">ImgResizer</strong> is a <strong className="text-primary">free online image editor</strong> that redefines user privacy. All operations—from a simple <strong className="text-primary">image resize</strong> to a complex <strong className="text-primary">perspective crop</strong>—happen directly in your browser. This client-side processing means your files are never uploaded to a server, making ImgResizer a truly <strong className="text-primary">private photo editor</strong> and a tool for <strong className="text-primary">secure document editing</strong>. No sign-ups, no tracking, and no watermarks, just powerful tools at your fingertips.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-foreground mb-3">Target Meta Keywords for Search Engines</h2>
                    <p className="text-muted-foreground">To rank effectively, we target a wide range of search queries. This ensures that anyone looking for a high-quality, <strong className="text-primary">free online photo editor</strong> finds ImgResizer.</p>
                    <div className="flex flex-wrap gap-2 mt-4">
                        {keywordList.map(keyword => (
                            <div key={keyword} className="bg-muted text-foreground rounded-full px-3 py-1 text-sm border">
                                {keyword}
                            </div>
                        ))}
                    </div>
                </section>
                
                <section>
                    <h2 className="text-2xl font-bold text-foreground mb-3">Frequently Asked SEO Questions (FAQ)</h2>
                    <div className="space-y-4">
                        {faqList.map((faq, index) => (
                            <div key={index}>
                                <h3 className="text-lg font-semibold text-foreground">{faq.question}</h3>
                                <p className="mt-1 text-muted-foreground">{faq.answer}</p>
                            </div>
                        ))}
                    </div>
                </section>

                 <section>
                    <h2 className="text-2xl font-bold text-foreground mb-3">Why ImgResizer Ranks as a Top Free Tool</h2>
                    <ul className="list-disc list-inside space-y-3 text-muted-foreground">
                        <li><strong className="text-primary">Unmatched Privacy:</strong> Your data stays on your device thanks to client-side processing. No server uploads mean zero risk of data breaches for your files.</li>
                        <li><strong className="text-primary">Completely Free & No Watermarks:</strong> All professional-grade features are available for free, and we never add a watermark to your edited images. It's the best <strong className="text-primary">free photo editor</strong>, no strings attached.</li>
                        <li><strong className="text-primary">Rich Feature Set:</strong> From a simple <Link href="https://www.imgresizer.xyz" className="text-primary hover:underline">image resizer online</Link> to multi-page PDF creation and collage layouts, we cover all bases for a complete <strong className="text-primary">online picture editor</strong>. See all our capabilities on the <Link href="/features" className="text-primary hover:underline">features page</Link>.</li>
                    </ul>
                </section>
                
            </CardContent>
        </Card>
    </section>
  );
}
