
"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Upload } from 'lucide-react';
import { UploadTypeDialog } from './upload-type-dialog';

interface HeroSectionProps {
  onUpload: (file: File) => void;
}

export function HeroSection({ onUpload }: HeroSectionProps) {
  const [isUploadTypeDialogOpen, setIsUploadTypeDialogOpen] = useState(false);
  const uploadInputRef = React.useRef<HTMLInputElement>(null);

  const handleSelectUploadType = (type: 'image' | 'pdf') => {
    if (uploadInputRef.current) {
      uploadInputRef.current.accept = type === 'image' ? 'image/*' : 'application/pdf';
      uploadInputRef.current.click();
    }
    setIsUploadTypeDialogOpen(false);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onUpload(file);
    }
  };

  return (
    <>
      <input
        type="file"
        ref={uploadInputRef}
        onChange={handleFileChange}
        className="hidden"
      />
      <section className="relative bg-background text-foreground overflow-hidden">
         <div 
          className="absolute inset-0 z-0 bg-white"
          style={{
            backgroundImage: 'radial-gradient(circle at 70% 30%, hsl(var(--primary) / 0.1), transparent 40%), radial-gradient(circle at 20% 80%, hsl(var(--accent) / 0.05), transparent 30%)',
          }}
        >
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: 'linear-gradient(rgba(128, 128, 128, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(128, 128, 128, 0.1) 1px, transparent 1px)',
              backgroundSize: '2rem 2rem',
              opacity: 0.5,
            }}
          ></div>
        </div>
        <div className="relative container mx-auto px-6 py-24 md:py-32 text-center">
            <div className="bg-background/80 backdrop-blur-md rounded-xl p-8 inline-block shadow-2xl">
                <h1 className="text-4xl md:text-6xl font-extrabold font-headline tracking-tighter mb-4 text-transparent bg-clip-text bg-gradient-to-r from-foreground to-primary">
                    Transform Your Images Instantly
                </h1>
                <p className="max-w-3xl mx-auto text-lg md:text-xl text-muted-foreground mb-8">
                    Camly provides a powerful, free, and intuitive online editor to resize, crop, and enhance your photos and PDFs. No downloads, no sign-ups—just seamless editing right in your browser.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Button 
                        size="lg" 
                        className="text-lg py-7 px-8"
                        onClick={() => setIsUploadTypeDialogOpen(true)}
                    >
                        <Upload className="mr-2" />
                        Start Editing for Free
                    </Button>
                    <Button size="lg" variant="outline" className="text-lg py-7 px-8 bg-background/50">
                        Learn More
                        <ArrowRight className="ml-2" />
                    </Button>
                </div>
            </div>
        </div>
      </section>
      <UploadTypeDialog
        isOpen={isUploadTypeDialogOpen}
        onOpenChange={setIsUploadTypeDialogOpen}
        onSelectType={handleSelectUploadType}
      />
    </>
  );
}



