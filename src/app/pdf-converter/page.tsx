
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';

const blogPosts = [
    {
        title: "1. Why Convert Images to PDF?",
        content: "Converting images like JPEGs, PNGs, or GIFs into a single PDF document is incredibly useful for organization, sharing, and printing. A PDF bundles multiple images into one file, ensuring that they are viewed in the correct order and that their quality is preserved. It's the standard for creating portfolios, reports, and archives that are easy to share and look professional on any device."
    },
    {
        title: "2. How to Combine Multiple JPEGs into a Single PDF",
        content: "With a tool like ImgResizer, combining JPEGs is simple. Just upload your images, and the tool will place each one on a separate page of a PDF. You can reorder the pages by dragging and dropping them before exporting. This is perfect for creating a digital photo album, a project submission, or a presentation. The final PDF is a single, easy-to-manage file."
    },
    {
        title: "3. The Benefits of a Secure, Client-Side PDF Converter",
        content: "Privacy is paramount, especially with sensitive documents. ImgResizer is a client-side tool, meaning your images and PDFs are processed directly in your browser. Your files are never uploaded to a server, eliminating the risk of data breaches. This approach provides total security and peace of mind, whether you're converting personal photos or confidential work documents."
    },
    {
        title: "4. Editing and Annotating PDFs Online",
        content: "Modern online tools do more than just convert files. With ImgResizer, you can perform basic edits on your PDFs. You can add text overlays to annotate pages, insert a signature, or even draw directly on a page to highlight important information. This turns a static document into an interactive one, without needing complex desktop software."
    },
    {
        title: "5. Optimizing PDFs for Email and Web",
        content: "Large PDF files can be difficult to share. A good PDF tool should allow you to optimize your file for size. ImgResizer offers compression options that reduce the file size of your PDF without significant quality loss. This makes it easy to attach your PDF to an email or upload it to a website, ensuring a smooth and fast sharing experience."
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
                    Your Guide to PDF Conversion
                </h1>
                <p className="text-lg text-muted-foreground">
                    Everything you need to know about converting, editing, and managing your PDF files online, for free.
                </p>
            </div>
            {blogPosts.map((post, index) => (
                <Card key={index} className="overflow-hidden">
                    <CardHeader className="bg-muted/40">
                        <CardTitle className="flex items-start gap-3 text-2xl font-bold">
                            <CheckCircle className="text-primary mt-1 h-6 w-6 shrink-0"/>
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
