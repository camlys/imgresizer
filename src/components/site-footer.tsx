
"use client"

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Github, Twitter, Facebook, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Define the event type for beforeinstallprompt
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: Array<string>;
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed',
    platform: string,
  }>;
  prompt(): Promise<void>;
}

export function SiteFooter() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the default mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    if (installPrompt) {
        installPrompt.prompt();
        installPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('User accepted the install prompt');
            } else {
                console.log('User dismissed the install prompt');
            }
            // We can't reuse the install prompt, so we null it out.
            // If the user uninstalls, the `beforeinstallprompt` event will fire again.
            setInstallPrompt(null);
        });
    } else {
        // Fallback for browsers that don't support the prompt or if it was already used/dismissed
        toast({
            title: "How to Install",
            description: "To install, use your browser's menu. In Chrome, look for 'Install ImgResizer...'. In Safari, use 'File > Add to Dock'.",
        });
    }
  }, [installPrompt, toast]);
  
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
          <div className="grid grid-cols-2 md:grid-cols-3 md:col-span-3 gap-8">
            <div>
              <h4 className="font-semibold text-foreground">Company</h4>
              <ul className="mt-4 space-y-2 text-sm">
                <li>
                  <a 
                    href="#" 
                    onClick={handleInstallClick} 
                    className='flex items-center text-muted-foreground hover:text-foreground'
                  >
                    Install App <Download size={14} className="ml-2" />
                  </a>
                </li>
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
                <li><Link href="/features" className="text-muted-foreground hover:text-foreground">Features</Link></li>
                <li><Link href="https://imgresizer.xyz" className="text-muted-foreground hover:text-foreground">Image Resizer</Link></li>
                 <li><Link href="https://imgresizer.xyz" className="text-muted-foreground hover:text-foreground">PDF Converter</Link></li>
                 <li><Link href="/seo-info" className="text-muted-foreground hover:text-foreground">SEO Info</Link></li>
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
