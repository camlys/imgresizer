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
  format: 'image/jpeg',
  quality: 0.92,
};

const getFilterString = (adjustments: ImageSettings['adjustments']) => {
    const { brightness, contrast, saturate, grayscale, sepia, hue, invert, blur } = adjustments;
    const filters = [];
    if (brightness !== 100) filters.push(`brightness(${brightness}%)`);
    if (contrast !== 100) filters.push(`contrast(${contrast}%)`);
    if (saturate !== 100) filters.push(`saturate(${saturate}%)`);
    if (grayscale !== 0) filters.push(`grayscale(${grayscale}%)`);
    if (sepia !== 0) filters.push(`sepia(${sepia}%)`);
    if (hue !== 0) filters.push(`hue-rotate(${hue}deg)`);
    if (invert !== 0) filters.push(`invert(${invert}%)`);
    if (blur !== 0) filters.push(`blur(${blur}px)`);
    return filters.length > 0 ? filters.join(' ') : '';
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
    if (tab === 'crop' && originalImage && !pendingCrop) {
      const currentCrop = settings.crop || { x: 0, y: 0, width: originalImage.width, height: originalImage.height };
       if (currentCrop.width === originalImage.width && currentCrop.height === originalImage.height) {
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
      } else {
        setPendingCrop(currentCrop);
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
                setPendingCrop(null);
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
                setPendingCrop(null);
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
    if (Object.keys(newSettings).some(key => key !== 'crop')) {
        setPendingCrop(null);
    }
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

  const handleDownload = useCallback(async (filename: string) => {
    if (!originalImage) return;

    const img = new Image();
    const imageLoadPromise = new Promise<HTMLImageElement>((resolve, reject) => {
        img.onload = () => resolve(img);
        img.onerror = reject;
        if (!originalImage.src.startsWith('data:')) {
            img.crossOrigin = 'anonymous';
        }
        img.src = originalImage.src;
    });

    try {
        const imageElement = await imageLoadPromise;
        const downloadName = filename || 'camly-export';
        const { width, height, rotation, flipHorizontal, flipVertical, crop, texts, adjustments } = settings;

        // Create a temporary canvas to bake in filters, which is more reliable across browsers
        const filterCanvas = document.createElement('canvas');
        const filterCtx = filterCanvas.getContext('2d');
        if (!filterCtx) {
            toast({ title: "Download Error", description: "Could not create a canvas to process the image.", variant: "destructive" });
            return;
        }

        const cropData = crop || { x: 0, y: 0, width: imageElement.width, height: imageElement.height };
        filterCanvas.width = cropData.width;
        filterCanvas.height = cropData.height;

        const filterString = getFilterString(adjustments);
        if (filterString) {
            filterCtx.filter = filterString;
        }

        filterCtx.drawImage(imageElement,
            cropData.x, cropData.y, cropData.width, cropData.height,
            0, 0,
            cropData.width, cropData.height
        );
        
        // Create the final canvas for output
        const finalCanvas = document.createElement('canvas');
        const finalCtx = finalCanvas.getContext('2d');
         if (!finalCtx) {
            toast({ title: "Download Error", description: "Could not create a canvas to generate the image.", variant: "destructive" });
            return;
        }
        finalCanvas.width = width;
        finalCanvas.height = height;
        
        finalCtx.save();
        
        const rad = (rotation * Math.PI) / 180;
        const sin = Math.abs(Math.sin(rad));
        const cos = Math.abs(Math.cos(rad));
        const boundingBoxWidth = filterCanvas.width * cos + filterCanvas.height * sin;
        const boundingBoxHeight = filterCanvas.width * sin + filterCanvas.height * cos;

        const scale = Math.min(width / boundingBoxWidth, height / boundingBoxHeight);
        
        const drawWidth = filterCanvas.width * scale;
        const drawHeight = filterCanvas.height * scale;
        
        finalCtx.translate(width / 2, height / 2);
        if (flipHorizontal) finalCtx.scale(-1, 1);
        if (flipVertical) finalCtx.scale(1, -1);
        finalCtx.rotate(rad);
        
        finalCtx.drawImage(filterCanvas, 
            -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight
        );

        finalCtx.restore();

        texts.forEach(text => {
            const textX = (text.x / 100) * width;
            const textY = (text.y / 100) * height;

            finalCtx.font = `${text.size}px ${text.font}`;
            finalCtx.textAlign = 'center';
            finalCtx.textBaseline = 'middle';
            
            const padding = text.padding || 0;
            if (text.backgroundColor && text.backgroundColor !== 'transparent' && padding >= 0) {
                const metrics = finalCtx.measureText(text.text);
                const rectWidth = metrics.width + padding * 2;
                const rectHeight = text.size + padding * 2;
                const rectX = textX - rectWidth / 2;
                const rectY = textY - rectHeight / 2;

                finalCtx.fillStyle = text.backgroundColor;
                finalCtx.fillRect(rectX, rectY, rectWidth, rectHeight);
            }

            finalCtx.fillStyle = text.color;
            finalCtx.fillText(text.text, textX, textY);
        });

        if (settings.format === 'application/pdf') {
            const imgData = finalCanvas.toDataURL('image/png');
            const orientation = finalCanvas.width > finalCanvas.height ? 'l' : 'p';
            const pdf = new jsPDF({
              orientation: orientation,
              unit: 'px',
              format: [finalCanvas.width, finalCanvas.height]
            });
            pdf.addImage(imgData, 'PNG', 0, 0, finalCanvas.width, finalCanvas.height);
            pdf.save(`${downloadName}.pdf`);
            
            toast({
              title: "Download Started",
              description: "Your PDF file has started downloading.",
            });
            return;
        }

        if (settings.format === 'image/svg+xml') {
            const dataUrl = finalCanvas.toDataURL('image/png');
            const svgContent = `<svg width="${finalCanvas.width}" height="${finalCanvas.height}" xmlns="http://www.w3.org/2000/svg">
<image href="${dataUrl}" width="${finalCanvas.width}" height="${finalCanvas.height}" />
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

        finalCanvas.toBlob((blob) => {
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

    } catch (error) {
        console.error("Error preparing image for download:", error);
        toast({
            title: "Download Error",
            description: "There was a problem loading the image for export.",
            variant: "destructive",
        });
    }
  }, [originalImage, settings, toast]);
  
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
        <main className="flex-1 w-full overflow-y-auto">
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
    <div className="flex flex-col h-[100vh] bg-background text-foreground">
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
      <main className="flex-1 flex flex-col lg:flex-row p-4 gap-4 bg-muted/40 overflow-y-auto lg:overflow-hidden">
        <div className="w-full lg:w-[380px] lg:flex-shrink-0 bg-card rounded-lg border shadow-sm overflow-hidden">
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
        <div className="flex-1 flex items-center justify-center p-4 bg-card rounded-lg border shadow-sm relative min-h-[50vh] lg:min-h-0">
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
