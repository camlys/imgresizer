
"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import { X } from 'lucide-react';

export function CookieConsentBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if consent has already been given or banner was dismissed
    const consent = localStorage.getItem('cookie_consent');
    const dismissed = sessionStorage.getItem('cookie_banner_dismissed');

    if (!consent && !dismissed) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie_consent', 'true');
    setIsVisible(false);
  };
  
  const handleDismiss = () => {
    sessionStorage.setItem('cookie_banner_dismissed', 'true');
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
      <Card className="container mx-auto p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xl bg-background/80 backdrop-blur-md border-primary/20 relative">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 h-6 w-6"
          onClick={handleDismiss}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </Button>
        <div className="text-sm text-muted-foreground pr-8">
          <p>
            We use cookies to enhance your experience and ensure our site functions correctly. By using our site, you agree to our use of cookies. Read our{' '}
            <Link href="/privacy-policy" className="underline text-primary hover:text-primary/80 transition-colors">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
        <Button onClick={handleAccept} className="shrink-0">
          Accept
        </Button>
      </Card>
    </div>
  );
}
