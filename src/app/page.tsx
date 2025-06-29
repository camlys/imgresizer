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
import * as pdfjsLib from 'pdfjs-dist';
import { SeoContent } from '@/components/seo-content';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

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

  const handleTabChange = (tab: string) => {
    if (tab === 'crop' && originalImage && pendingCrop) {
      // If the user is entering the crop tab and the crop is still set to the full image,
      // present a smaller, centered crop box to make the tool more intuitive.
      if (pendingCrop.width === originalImage.width && pendingCrop.height === originalImage.height) {
        const newWidth = originalImage.width * 0.8;
        const newHeight = originalImage.height * 0.8;
        const newX = (originalImage.width - newWidth) / 2;
        const newY = (originalImage.height - newHeight) / 2;
        
        const centeredCrop = {
          x: Math.round(newX),
          y: Math.round(newY),
          width: Math.round(newWidth),
          height: Math.round(newHeight),
        };
        setPendingCrop(centeredCrop);
      }
    }
    setActiveTab(tab);
  };

  const handleImageUpload = async (file: File) => {
    if (file.type.startsWith('image/')) {
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
    } else if (file.type === 'application/pdf') {
        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
            const page = await pdf.getPage(1);
            const viewport = page.getViewport({ scale: 2.0 });

            const tempCanvas = document.createElement('canvas');
            const tempCtx = tempCanvas.getContext('2d');
            if (!tempCtx) {
                toast({
                    title: "Error",
                    description: "Could not create canvas context to render PDF.",
                    variant: "destructive",
                });
                return;
            }
            tempCanvas.width = viewport.width;
            tempCanvas.height = viewport.height;

            const renderContext = {
                canvasContext: tempCtx,
                viewport: viewport,
            };

            await page.render(renderContext).promise;
            
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
            img.src = tempCanvas.toDataURL('image/png');
        } catch (error) {
            console.error("Error processing PDF:", error);
            toast({
                title: "PDF Error",
                description: "Could not process the PDF file. It may be corrupted or in an unsupported format.",
                variant: "destructive",
            });
        }
    } else {
        toast({
            title: "Invalid File",
            description: "Please upload a valid image or PDF file.",
            variant: "destructive",
        });
    }
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

  const handleDownload = useCallback((filename: string) => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const downloadName = filename || 'camly-export';
      
      if (settings.format === 'application/pdf') {
        const imgData = canvas.toDataURL('image/png');
        const orientation = canvas.width > canvas.height ? 'l' : 'p';
        const pdf = new jsPDF({
          orientation: orientation,
          unit: 'px',
          format: [canvas.width, canvas.height]
        });
        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
        pdf.save(`${downloadName}.pdf`);
        
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
        link.download = `${downloadName}.svg`;
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
          const extension = settings.format.split('/')[1].split('+')[0];
          link.download = `${downloadName}.${extension}`;
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
        <main className="flex-1 w-full">
          <div className="w-full max-w-2xl mx-auto py-12 px-4">
            <UploadPlaceholder onUpload={handleImageUpload} />
          </div>
          <SeoContent />
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
            onTabChange={handleTabChange}
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
