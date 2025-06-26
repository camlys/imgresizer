"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { UploadCloud } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { UploadTypeDialog } from './upload-type-dialog';

interface UploadPlaceholderProps {
  onUpload: (file: File) => void;
}

export function UploadPlaceholder({ onUpload }: UploadPlaceholderProps) {
  const uploadInputRef = React.useRef<HTMLInputElement>(null);
  const [isUploadTypeDialogOpen, setIsUploadTypeDialogOpen] = useState(false);

  const handleContainerClick = () => {
    setIsUploadTypeDialogOpen(true);
  };

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
    <>
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
          />
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
              <UploadCloud className="w-10 h-10 text-primary" />
            </div>
          </div>
          <h2 className="text-2xl font-semibold mb-2 font-headline">Upload Your File</h2>
          <p className="text-muted-foreground mb-4">Drag &amp; drop an image or PDF here, or click to browse.</p>
          <Button onClick={handleContainerClick}>
            Select File
          </Button>
        </CardContent>
      </Card>
      <UploadTypeDialog
        isOpen={isUploadTypeDialogOpen}
        onOpenChange={setIsUploadTypeDialogOpen}
        onSelectType={handleSelectUploadType}
      />
    </>
  );
}
