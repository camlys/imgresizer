"use client";

import React, { useState, useRef, useCallback } from 'react';
import { AppHeader } from '@/components/app-header';
import { ControlPanel } from '@/components/control-panel';
import { ImageCanvas } from '@/components/image-canvas';
import { UploadPlaceholder } from '@/components/upload-placeholder';
import type { ImageSettings, OriginalImage, CropSettings } from '@/lib/types';
import { useToast } from "@/hooks/use-toast"
import { SiteFooter } from '@/components/site-footer';
import jsPDF from 'jspdf';

const initialSettings: ImageSettings = {
  width: 512,
  height: 512,
  unit: 'px',
  keepAspectRatio: true,
  rotation: 0,
  flipHorizontal: false,
  flipVertical: false,
  crop: null,
  texts: [],
  adjustments: {
    brightness: 100,
    contrast: 100,
    saturate: 100,
    grayscale: 0,
    sepia: 0,
    hue: 0,
    invert: 0,
    blur: 0,
  },
  format: 'image/png',
  quality: 0.92,
};

export default function Home() {
  const [originalImage, setOriginalImage] = useState<OriginalImage | null>(null);
  const [settings, setSettings] = useState<ImageSettings>(initialSettings);
  const [activeTab, setActiveTab] = useState('resize');
  const [processedSize, setProcessedSize] = useState<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  const [pendingCrop, setPendingCrop] = useState<CropSettings | null>(null);

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
        const cropData = { x: 0, y: 0, width: img.width, height: img.height };
        setOriginalImage({
          src: img.src,
          width: img.width,
          height: img.height,
          size: file.size,
        });
        setSettings({
          ...initialSettings,
          width: img.width,
          height: img.height,
          crop: cropData,
        });
        setPendingCrop(cropData);
        setActiveTab('resize');
        setProcessedSize(null);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };
  
  const updateSettings = useCallback((newSettings: Partial<ImageSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
    if (newSettings.crop) {
      setPendingCrop(newSettings.crop);
    }
    setProcessedSize(null);
  }, []);

  const updateProcessedSize = useCallback(() => {
    if (canvasRef.current) {
      if (settings.format === 'image/svg+xml' || settings.format === 'application/pdf') {
        setProcessedSize(null);
        return;
      }
      canvasRef.current.toBlob(
        (blob) => {
          if (blob) {
            setProcessedSize(blob.size);
          }
        },
        settings.format,
        settings.quality
      );
    }
  }, [settings.format, settings.quality]);

  const handleDownload = useCallback(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      
      if (settings.format === 'application/pdf') {
        const imgData = canvas.toDataURL('image/png');
        const orientation = canvas.width > canvas.height ? 'l' : 'p';
        const pdf = new jsPDF({
          orientation: orientation,
          unit: 'px',
          format: [canvas.width, canvas.height]
        });
        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
        pdf.save('camly-export.pdf');
        
        toast({
          title: "Download Started",
          description: "Your PDF file has started downloading.",
        });
        return;
      }

      if (settings.format === 'image/svg+xml') {
        const dataUrl = canvas.toDataURL('image/png'); // Use PNG for best quality inside SVG
        const svgContent = `<svg width="${canvas.width}" height="${canvas.height}" xmlns="http://www.w3.org/2000/svg">
  <image href="${dataUrl}" width="${canvas.width}" height="${canvas.height}" />
</svg>`;
        const blob = new Blob([svgContent], { type: 'image/svg+xml' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'camly-export.svg';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
        toast({
          title: "Download Started",
          description: "Your SVG image has started downloading.",
        });
        return;
      }

      canvas.toBlob((blob) => {
        if (blob) {
          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          const extension = settings.format.split('/')[1];
          link.download = `camly-export.${extension}`;
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
  
  if (!originalImage) {
    return (
      <div className="flex flex-col min-h-screen bg-background text-foreground">
        <AppHeader 
          onUpload={handleImageUpload} 
          onDownload={handleDownload}
          isImageLoaded={!!originalImage}
          settings={settings}
          updateSettings={updateSettings}
          canvasRef={canvasRef}
          processedSize={processedSize}
          onUpdateProcessedSize={updateProcessedSize}
        />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl">
            <UploadPlaceholder onUpload={handleImageUpload} />
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
       <AppHeader 
        onUpload={handleImageUpload} 
        onDownload={handleDownload}
        isImageLoaded={!!originalImage}
        settings={settings}
        updateSettings={updateSettings}
        canvasRef={canvasRef}
        processedSize={processedSize}
        onUpdateProcessedSize={updateProcessedSize}
      />
      <main className="flex-1 flex p-4 gap-4 bg-muted/40 overflow-hidden">
        <div className="w-[380px] flex-shrink-0 bg-card rounded-lg border shadow-sm overflow-hidden">
            <ControlPanel 
              settings={settings} 
              updateSettings={updateSettings} 
              originalImage={originalImage}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              processedSize={processedSize}
              pendingCrop={pendingCrop}
              setPendingCrop={setPendingCrop}
            />
        </div>
        <div className="flex-1 flex items-center justify-center p-4 bg-card rounded-lg border shadow-sm relative">
            <ImageCanvas
              ref={canvasRef}
              originalImage={originalImage}
              settings={settings}
              updateSettings={updateSettings}
              activeTab={activeTab}
              pendingCrop={pendingCrop}
              setPendingCrop={setPendingCrop}
            />
        </div>
      </main>
    </div>
  );
}
