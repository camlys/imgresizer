
import Link from 'next/link';
import { LogoIcon } from './logo';
import { Button } from './ui/button';
import { LayoutGrid } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { AppHubCard } from './app-hub-card';

export function SiteHeader() {
  return (
    <header className="py-3 px-6 bg-card border-b sticky top-0 z-10 overflow-hidden">
      <div className="container mx-auto flex items-center justify-between">
        <Link href="/" className="flex flex-col md:flex-row md:items-center md:gap-3">
          <LogoIcon className="size-8" />
          <h1 className="text-sm -mt-1 md:mt-0 md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-primary bg-[size:200%_auto] animate-gradient-shift font-headline tracking-tight">
              ImgResizer
          </h1>
        </Link>
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon">
                <LayoutGrid />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 bg-background/80 backdrop-blur-md border-primary/20">
              <AppHubCard />
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </header>
  );
}
