
"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Download } from 'lucide-react';

// Define the event type for beforeinstallprompt
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: Array<string>;
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed',
    platform: string,
  }>;
  prompt(): Promise<void>;
}

export function InstallPwaBanner() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = () => {
    if (!installPrompt) {
      return;
    }
    // Show the prompt
    installPrompt.prompt();
    // Wait for the user to respond to the prompt
    installPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      setInstallPrompt(null);
    });
  };

  if (!installPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-16 left-0 right-0 z-50 p-4 sm:bottom-0">
      <Card className="container mx-auto p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xl bg-primary/90 text-primary-foreground backdrop-blur-md">
        <div className="text-sm text-center sm:text-left">
          <p className="font-semibold">Install ImgResizer</p>
          <p>Get a native app experience. Add ImgResizer to your home screen for quick and easy access.</p>
        </div>
        <Button onClick={handleInstallClick} variant="secondary" className="shrink-0">
          <Download className="mr-2 h-4 w-4" />
          Install App
        </Button>
      </Card>
    </div>
  );
}
