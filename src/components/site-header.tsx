import Link from 'next/link';
import { ThemeToggle } from './theme-toggle';
import { LogoIcon } from './logo';

export function SiteHeader() {
  return (
    <header className="py-3 px-6 bg-card border-b sticky top-0 z-10 overflow-hidden">
      <div className="container mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <LogoIcon />
          <div className="sun-rays">
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-primary bg-[size:200%_auto] animate-gradient-shift font-headline tracking-tight">
                ImgResizer
            </h1>
          </div>
        </Link>
        <ThemeToggle />
      </div>
    </header>
  );
}
