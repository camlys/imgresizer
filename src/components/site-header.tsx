
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
        <Link href="https://www.imgresizer.xyz/" className="flex items-center gap-3">
          <LogoIcon className="w-28 object-contain" />
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
