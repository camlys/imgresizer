import { Camera } from 'lucide-react';

export function SiteHeader() {
  return (
    <header className="py-3 px-6 bg-card border-b sticky top-0 z-10">
      <div className="container mx-auto flex items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <Camera className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-foreground font-headline tracking-tight">
            Camly
          </h1>
        </div>
      </div>
    </header>
  );
}
