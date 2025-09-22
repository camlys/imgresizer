import { AppHub } from '@/components/app-hub';
import { SiteHeader } from '@/components/site-header';

export default function HubPage() {
  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <SiteHeader />
      <main className="flex-1 overflow-hidden">
        <AppHub />
      </main>
    </div>
  );
}
