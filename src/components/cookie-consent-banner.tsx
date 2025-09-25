
"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Link from 'next/link';

export function CookieConsentBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if consent has already been given
    const consent = localStorage.getItem('cookie_consent');

    if (consent === null) {
      setIsVisible(true);
    }
  }, []);

  const handleConsent = (consent: boolean) => {
    localStorage.setItem('cookie_consent', consent.toString());
    setIsVisible(false);
    // Reload to apply analytics script change
    window.location.reload(); 
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end justify-center">
      <Card className="container m-4 p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xl border-primary/20 animate-in slide-in-from-bottom-5">
        <div className="text-sm text-muted-foreground">
          <p>
            We use cookies to analyze site traffic and improve your experience. By clicking "Accept," you agree to our use of cookies for analytics. Read our{' '}
            <Link href="/privacy-policy" className="underline text-primary hover:text-primary/80 transition-colors">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
            <Button onClick={() => handleConsent(true)} >
                Accept
            </Button>
            <Button onClick={() => handleConsent(false)} variant="outline">
                Decline
            </Button>
        </div>
      </Card>
    </div>
  );
}
