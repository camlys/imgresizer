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
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie_consent', 'true');
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
      <Card className="container mx-auto p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xl">
        <div className="text-sm text-muted-foreground">
          <p>
            We use cookies to enhance your experience and ensure our site functions correctly. By continuing to use our site, you agree to our use of cookies. Read our{' '}
            <Link href="/privacy-policy" className="underline text-primary">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
        <Button onClick={handleAccept} className="shrink-0">
          Accept & Close
        </Button>
      </Card>
    </div>
  );
}
