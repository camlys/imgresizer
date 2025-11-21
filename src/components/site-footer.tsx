
"use client"

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Github, Twitter, Facebook, Bell } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function SiteFooter() {
  const { toast } = useToast();
  const [notificationPermission, setNotificationPermission] = useState('default');

  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  const handleNotificationClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
        toast({ title: 'Error', description: 'Push notifications are not supported in this browser.', variant: 'destructive'});
        return;
    }

    if (notificationPermission === 'granted') {
        toast({ title: 'Already Subscribed', description: 'You are already subscribed to notifications.' });
        return;
    }

    if (notificationPermission === 'denied') {
        toast({ title: 'Permission Denied', description: 'Please enable notifications in your browser settings.', variant: 'destructive' });
        return;
    }

    const permission = await Notification.requestPermission();
    setNotificationPermission(permission);

    if (permission === 'granted') {
        try {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY // You need to generate and add this key
            });

            console.log('Push Subscription:', subscription);
            // TODO: Send this subscription object to your backend server
            toast({ title: 'Subscribed!', description: 'You will now receive notifications.' });

        } catch (error) {
            console.error('Failed to subscribe to push notifications:', error);
            toast({ title: 'Subscription Failed', description: 'Could not subscribe to notifications.', variant: 'destructive' });
        }
    }
  };
  
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
                <li><Link href="/about" className="text-muted-foreground hover:text-foreground">About</Link></li>
                <li><Link href="/contact" className="text-muted-foreground hover:text-foreground">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground">Legal</h4>
              <ul className="mt-4 space-y-2 text-sm">
                <li><Link href="/privacy-policy" className="text-muted-foreground hover:text-foreground">Privacy Policy</Link></li>
                <li><Link href="/data-related" className="text-muted-foreground hover:text-foreground">Data Related</Link></li>
                <li>
                  <a
                    href="#"
                    onClick={handleNotificationClick}
                    className="flex items-center text-muted-foreground hover:text-foreground"
                  >
                    Notifications <Bell size={14} className={`ml-2 ${notificationPermission === 'granted' ? 'text-primary' : ''}`} />
                  </a>
                </li>
              </ul>
            </div>
             <div>
              <h4 className="font-semibold text-foreground">Tools</h4>
              <ul className="mt-4 space-y-2 text-sm">
                <li><Link href="/hub" className="text-muted-foreground hover:text-foreground">App Hub</Link></li>
                <li><Link href="/features" className="text-muted-foreground hover:text-foreground">Features</Link></li>
                <li><Link href="https://imgresizer.xyz" className="text-muted-foreground hover:text-foreground">Image Resizer</Link></li>
                 <li><Link href="/pdf-converter" className="text-muted-foreground hover:text-foreground">PDF Converter</Link></li>
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
