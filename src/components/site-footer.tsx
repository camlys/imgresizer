
import Link from 'next/link';
import { Github, Twitter, Facebook } from 'lucide-react';

export function SiteFooter() {
  return (
    <footer className="bg-card border-t">
      <div className="container mx-auto py-12 px-6">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <h3 className="text-xl font-bold font-headline">ImgResizer</h3>
            <p className="text-sm text-muted-foreground mt-2">
              The simple, powerful, and private online image editor.
            </p>
            <div className="flex space-x-4 mt-4">
              <Link href="https://twitter.com/imgresizer" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                <Twitter size={20} />
              </Link>
              <Link href="https://github.com/your-repo/imgresizer" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                <Github size={20} />
              </Link>
              <Link href="https://facebook.com/imgresizer" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                <Facebook size={20} />
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-2 md:col-span-3 gap-8">
            <div>
              <h4 className="font-semibold text-foreground">Company</h4>
              <ul className="mt-4 space-y-2 text-sm">
                <li><Link href="/about" className="text-muted-foreground hover:text-foreground">About</Link></li>
                <li><Link href="/contact" className="text-muted-foreground hover:text-foreground">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground">Legal</h4>
              <ul className="mt-4 space-y-2 text-sm">
                <li><Link href="/privacy-policy" className="text-muted-foreground hover:text-foreground">Privacy Policy</Link></li>
                <li><Link href="/data-related" className="text-muted-foreground hover:text-foreground">Data Related</Link></li>
              </ul>
            </div>
             <div>
              <h4 className="font-semibold text-foreground">Tools</h4>
              <ul className="mt-4 space-y-2 text-sm">
                <li><Link href="/hub" className="text-muted-foreground hover:text-foreground">App Hub</Link></li>
                <li><Link href="/" className="text-muted-foreground hover:text-foreground">Image Resizer</Link></li>
                 <li><Link href="/" className="text-muted-foreground hover:text-foreground">PDF Converter</Link></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Camly. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
