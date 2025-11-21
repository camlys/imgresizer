
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Layers, FilePlus, ShieldCheck, Edit, Minimize2 } from 'lucide-react';

const blogPosts = [
    {
        icon: <Layers className="text-primary mt-1 h-6 w-6 shrink-0"/>,
        title: "From Many to One: The Power of PDF Conversion",
        content: "Tired of juggling multiple image files? Converting images like JPEGs, PNGs, or even scanned documents into a single PDF is a game-changer. It's the perfect way to create professional portfolios, organize receipts for expense reports, or bundle project sketches into one cohesive document. A PDF preserves the order and quality of your images, making them easy to share, print, and archive."
    },
    {
        icon: <FilePlus className="text-primary mt-1 h-6 w-6 shrink-0"/>,
        title: "Effortless Combination: JPEGs to a Single PDF",
        content: "With ImgResizer, combining images is as simple as a few clicks. Upload your JPEGs, and our tool automatically arranges them onto separate pages. You can then drag and drop to reorder them, ensuring your story is told exactly the way you want. It’s ideal for creating a digital photo album, submitting a multi-page assignment, or compiling a visual presentation into one easy-to-manage file."
    },
    {
        icon: <ShieldCheck className="text-primary mt-1 h-6 w-6 shrink-0"/>,
        title: "Your Privacy, Guaranteed: Secure PDF Conversion",
        content: "In a world of data breaches, privacy is non-negotiable. ImgResizer is a 100% client-side tool, which means your sensitive documents—from personal photos to confidential business files—are processed directly in your browser. Nothing is ever uploaded to our servers, giving you complete security and total peace of mind."
    },
    {
        icon: <Edit className="text-primary mt-1 h-6 w-6 shrink-0"/>,
        title: "More Than a Converter: Edit and Annotate PDFs",
        content: "A modern PDF tool should do more than just convert. ImgResizer allows you to perform essential edits on your PDFs. Add text overlays to annotate pages, insert a digital signature to approve documents, or even draw directly on a page to highlight key information. Turn any static document into an interactive file without needing complex desktop software."
    },
    {
        icon: <Minimize2 className="text-primary mt-1 h-6 w-6 shrink-0"/>,
        title: "Share with Ease: Optimize PDFs for Any Platform",
        content: "Large PDF files can be a nightmare to email or upload. A great PDF tool must help you optimize for size. ImgResizer provides powerful compression options that dramatically reduce your PDF's file size without sacrificing quality. This ensures your documents are light enough for any platform, guaranteeing a fast and smooth sharing experience every time."
    }
];

export default function PdfConverterPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main className="flex-1 container mx-auto py-12 px-6">
        <div className="space-y-12 max-w-4xl mx-auto">
            <div className="text-center">
                <h1 className="text-4xl md:text-5xl font-extrabold font-headline tracking-tighter mb-4">
                    The Ultimate Guide to PDF Conversion
                </h1>
                <p className="text-lg text-muted-foreground">
                    Unlock the full potential of your documents. Learn how to convert, combine, and edit PDF files online—for free, and with total privacy.
                </p>
            </div>
            {blogPosts.map((post, index) => (
                <Card key={index} className="overflow-hidden">
                    <CardHeader className="bg-muted/40">
                        <CardTitle className="flex items-start gap-3 text-2xl font-bold">
                            {post.icon}
                            <span>{post.title}</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <p className="text-muted-foreground text-lg leading-relaxed">{post.content}</p>
                    </CardContent>
                </Card>
            ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
