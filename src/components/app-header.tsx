"use client"

import React from 'react';
import { Button } from '@/components/ui/button';
import { Upload, Download, Image as ImageIcon } from 'lucide-react';

interface AppHeaderProps {
  onUpload: (file: File) => void;
  onDownload: () => void;
  isImageLoaded: boolean;
}

export function AppHeader({ 
  onUpload, 
  onDownload, 
  isImageLoaded,
}: AppHeaderProps) {
  const uploadInputRef = React.useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    uploadInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onUpload(file);
    }
  };

  return (
    <header className="flex items-center justify-between p-4 border-b bg-card">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10 text-primary">
          <ImageIcon className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-foreground font-headline tracking-tight">ImageForge</h1>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="file"
          ref={uploadInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/*"
        />
        <Button variant="outline" onClick={handleUploadClick}>
          <Upload className="mr-2" />
          Upload New
        </Button>
        {isImageLoaded && (
          <Button onClick={onDownload}>
            <Download className="mr-2" />
            Download
          </Button>
        )}
      </div>
    </header>
  );
}
