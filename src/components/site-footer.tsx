import Link from 'next/link';

export function SiteFooter() {
  return (
    <footer className="bg-card border-t">
      <div className="container mx-auto py-8 px-6">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <h3 className="text-xl font-bold font-headline">Camly</h3>
            <p className="text-sm text-muted-foreground mt-2">
              The simple, powerful online image editor.
            </p>
          </div>
          <div className="grid grid-cols-2 md:col-span-2 gap-8">
            <div>
              <h4 className="font-semibold text-foreground">Company</h4>
              <ul className="mt-4 space-y-2 text-sm">
                <li><Link href="#" className="text-muted-foreground hover:text-foreground">About</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-foreground">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground">Legal</h4>
              <ul className="mt-4 space-y-2 text-sm">
                <li><Link href="#" className="text-muted-foreground hover:text-foreground">Privacy Policy</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-foreground">Data Related</Link></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Camly. All rights reserved. Contact: <a href="mailto:camlysales@gmail.com" className="text-primary hover:underline">camlysales@gmail.com</a></p>
        </div>
      </div>
    </footer>
  );
}
