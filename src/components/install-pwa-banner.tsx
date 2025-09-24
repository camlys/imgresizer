
"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Download, X } from 'lucide-react';

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
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setInstallPrompt(e as BeforeInstallPromptEvent);
      
      const isBannerDismissed = sessionStorage.getItem('pwa_banner_dismissed') === 'true';
      if (!isBannerDismissed) {
          setIsVisible(true);
      }
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
      setIsVisible(false);
    });
  };

  const handleClose = () => {
    setIsVisible(false);
    sessionStorage.setItem('pwa_banner_dismissed', 'true');
  };

  if (!installPrompt || !isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-16 left-0 right-0 z-50 p-4 sm:bottom-0">
      <Card className="container mx-auto p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xl bg-primary/90 text-primary-foreground backdrop-blur-md relative">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 h-6 w-6"
          onClick={handleClose}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </Button>
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

    