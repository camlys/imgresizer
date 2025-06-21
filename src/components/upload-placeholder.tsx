"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { UploadCloud } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface UploadPlaceholderProps {
  onUpload: (file: File) => void;
}

export function UploadPlaceholder({ onUpload }: UploadPlaceholderProps) {
  const uploadInputRef = React.useRef<HTMLInputElement>(null);

  const handleContainerClick = () => {
    uploadInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onUpload(file);
    }
    // Reset file input value to allow re-uploading the same file
    if (event.target) {
        event.target.value = '';
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const file = event.dataTransfer.files?.[0];
    if (file) {
      onUpload(file);
    }
  };

  return (
    <Card 
      className="w-full h-full flex items-center justify-center border-2 border-dashed border-gray-300 hover:border-primary transition-colors duration-300 cursor-pointer"
      onClick={handleContainerClick}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <CardContent className="text-center p-10">
        <input
          type="file"
          ref={uploadInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/*"
        />
        <div className="flex justify-center mb-4">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
            <UploadCloud className="w-10 h-10 text-primary" />
          </div>
        </div>
        <h2 className="text-2xl font-semibold mb-2 font-headline">Upload Your Image</h2>
        <p className="text-muted-foreground mb-4">Drag &amp; drop a file here or click to browse.</p>
        <Button>
          Select File
        </Button>
      </CardContent>
    </Card>
  );
}
