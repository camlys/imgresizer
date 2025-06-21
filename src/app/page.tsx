"use client";

import React, { useState, useRef, useCallback } from 'react';
import { AppHeader } from '@/components/app-header';
import { ControlPanel } from '@/components/control-panel';
import { ImageCanvas } from '@/components/image-canvas';
import { UploadPlaceholder } from '@/components/upload-placeholder';
import type { ImageSettings, OriginalImage } from '@/lib/types';
import { useToast } from "@/hooks/use-toast"

const initialSettings: ImageSettings = {
  width: 512,
  height: 512,
  unit: 'px',
  keepAspectRatio: true,
  rotation: 0,
  crop: null,
  texts: [],
  adjustments: {
    brightness: 100,
    contrast: 100,
    saturate: 100,
    grayscale: 0,
    sepia: 0,
    hue: 0,
  },
  format: 'image/png',
  quality: 0.92,
};

export default function Home() {
  const [originalImage, setOriginalImage] = useState<OriginalImage | null>(null);
  const [settings, setSettings] = useState<ImageSettings>(initialSettings);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  const handleImageUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
        toast({
            title: "Invalid File",
            description: "Please upload a valid image file.",
            variant: "destructive",
        })
        return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        setOriginalImage({
          src: img.src,
          width: img.width,
          height: img.height,
        });
        setSettings({
          ...initialSettings,
          width: img.width,
          height: img.height,
          crop: { x: 0, y: 0, width: img.width, height: img.height },
        });
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };
  
  const updateSettings = useCallback((newSettings: Partial<ImageSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  const handleDownload = useCallback(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.toBlob((blob) => {
        if (blob) {
          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          const extension = settings.format.split('/')[1];
          link.download = `imageforge-export.${extension}`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(link.href);
           toast({
            title: "Download Started",
            description: "Your image has started downloading.",
        })
        }
      }, settings.format, settings.quality);
    }
  }, [settings.format, settings.quality, toast]);

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <AppHeader 
        onUpload={handleImageUpload} 
        onDownload={handleDownload}
        isImageLoaded={!!originalImage}
        settings={settings}
        updateSettings={updateSettings}
      />
      <main className="flex-1 grid grid-cols-1 md:grid-cols-[380px_1fr] gap-4 p-4 overflow-hidden">
        {originalImage ? (
          <>
            <div className="bg-card rounded-xl shadow-sm border overflow-y-auto">
              <ControlPanel 
                settings={settings} 
                updateSettings={updateSettings} 
                originalImage={originalImage}
              />
            </div>
            <div className="bg-card rounded-xl shadow-sm border flex items-center justify-center p-4 overflow-hidden">
               <ImageCanvas
                ref={canvasRef}
                originalImage={originalImage}
                settings={settings}
                updateSettings={updateSettings}
              />
            </div>
          </>
        ) : (
          <div className="md:col-span-2">
            <UploadPlaceholder onUpload={handleImageUpload} />
          </div>
        )}
      </main>
    </div>
  );
}
