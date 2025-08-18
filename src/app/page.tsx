
"use client";

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { AppHeader } from '@/components/app-header';
import { ControlPanel } from '@/components/control-panel';
import { ImageCanvas } from '@/components/image-canvas';
import { UploadPlaceholder } from '@/components/upload-placeholder';
import type { ImageSettings, OriginalImage, CropSettings } from '@/lib/types';
import { useToast } from "@/hooks/use-toast"
import { SiteFooter } from '@/components/site-footer';
import { Loader2 } from 'lucide-react';
import jsPDF from 'jspdf';
import * as pdfjsLib from 'pdfjs-dist';
import { SeoContent } from '@/components/seo-content';
import { applyPerspectiveTransform } from '@/lib/utils';
import { HeroSection } from '@/components/hero-section';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url,
).toString();


const initialSettings: ImageSettings = {
  width: 512,
  height: 512,
  unit: 'px',
  dpi: 96,
  keepAspectRatio: true,
  rotation: 0,
  flipHorizontal: false,
  flipVertical: false,
  crop: null,
  cropMode: 'rect',
  perspectivePoints: null,
  texts: [],
  adjustments: {
    brightness: 100,
    contrast: 100,
    saturate: 100,
    grayscale: 0,
    sepia: 0,
    invert: 0,
  },
  format: 'image/jpeg',
  quality: 1.0,
};

export default function Home() {
  const [originalImage, setOriginalImage] = useState<OriginalImage | null>(null);
  const [settings, setSettings] = useState<ImageSettings>(initialSettings);
  const [activeTab, setActiveTab] = useState('resize');
  const [processedSize, setProcessedSize] = useState<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const [pendingCrop, setPendingCrop] = useState<CropSettings | null>(null);
  const [imageElement, setImageElement] = useState<HTMLImageElement | null>(null);
  const INSET_PX = 38; // Approx 10mm

  useEffect(() => {
    if (!originalImage) return;
    const img = new Image();
    if (!originalImage.src.startsWith('data:')) {
      img.crossOrigin = 'anonymous';
    }
    img.src = originalImage.src;
    img.onload = () => {
      setImageElement(img);
    };
  }, [originalImage]);


  const handleTabChange = (tab: string) => {
    if (tab === 'crop' && originalImage && !pendingCrop) {
      const currentCrop = settings.crop || { x: 0, y: 0, width: originalImage.width, height: originalImage.height };
       if (currentCrop.width === originalImage.width && currentCrop.height === originalImage.height) {
        const insetX = Math.min(INSET_PX, originalImage.width / 4);
        const insetY = Math.min(INSET_PX, originalImage.height / 4);

        const insetCrop = {
          x: Math.round(insetX),
          y: Math.round(insetY),
          width: Math.round(originalImage.width - insetX * 2),
          height: Math.round(originalImage.height - insetY * 2),
        };
        setPendingCrop(insetCrop);
      } else {
        setPendingCrop(currentCrop);
      }
    }
    setActiveTab(tab);
  };

  const handleImageUpload = async (file: File) => {
    setIsLoading(true);
    if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const inset = Math.min(INSET_PX, img.width / 4, img.height / 4);
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
                    perspectivePoints: {
                      tl: { x: inset, y: inset },
                      tr: { x: img.width - inset, y: inset },
                      bl: { x: inset, y: img.height - inset },
                      br: { x: img.width - inset, y: img.height - inset },
                    },
                });
                setPendingCrop(null);
                setActiveTab('resize');
                setProcessedSize(null);
                setIsLoading(false);
            };
            img.onerror = () => {
              toast({ title: "Error", description: "Could not load image file.", variant: "destructive" });
              setIsLoading(false);
            }
            img.src = e.target?.result as string;
        };
        reader.readAsDataURL(file);
    } else if (file.type === 'application/pdf') {
        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
            const page = await pdf.getPage(1);
            const viewport = page.getViewport({ scale: 4.0 });

            const tempCanvas = document.createElement('canvas');
            const tempCtx = tempCanvas.getContext('2d');
            if (!tempCtx) {
                toast({
                    title: "Error",
                    description: "Could not create canvas context to render PDF.",
                    variant: "destructive",
                });
                setIsLoading(false);
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
                const inset = Math.min(INSET_PX, img.width / 4, img.height / 4);
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
                    perspectivePoints: {
                      tl: { x: inset, y: inset },
                      tr: { x: img.width - inset, y: inset },
                      bl: { x: inset, y: img.height - inset },
                      br: { x: img.width - inset, y: img.height - inset },
                    },
                });
                setPendingCrop(null);
                setActiveTab('resize');
                setProcessedSize(null);
                setIsLoading(false);
            };
            img.onerror = () => {
              toast({ title: "Error", description: "Could not load PDF as image.", variant: "destructive" });
              setIsLoading(false);
            }
            img.src = tempCanvas.toDataURL('image/png');
        } catch (error) {
            console.error("Error processing PDF:", error);
            toast({
                title: "PDF Error",
                description: "Could not process the PDF file. It may be corrupted or in an unsupported format.",
                variant: "destructive",
            });
            setIsLoading(false);
        }
    } else {
        toast({
            title: "Invalid File",
            description: "Please upload a valid image or PDF file.",
            variant: "destructive",
        });
        setIsLoading(false);
    }
  };
  
  const updateSettings = useCallback((newSettings: Partial<ImageSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
    if (Object.keys(newSettings).some(key => key !== 'crop' && key !== 'perspectivePoints')) {
        setPendingCrop(null);
    }
    if (newSettings.crop) {
      setPendingCrop(newSettings.crop);
    }
    setProcessedSize(null);
  }, []);

  const handleApplyPerspectiveCrop = useCallback(async () => {
    if (!imageElement || !settings.perspectivePoints) {
      toast({ title: "Error", description: "Could not apply perspective crop.", variant: "destructive" });
      return;
    }
    try {
      const transformedCanvas = await applyPerspectiveTransform(imageElement, settings.perspectivePoints);
      const newDataUrl = transformedCanvas.toDataURL('image/png');
      const img = new Image();
      img.onload = () => {
        const newWidth = img.width;
        const newHeight = img.height;
        const inset = Math.min(INSET_PX, newWidth / 4, newHeight / 4);

        // Approximating new file size.
        const head = 'data:image/png;base64,';
        const size = Math.round((newDataUrl.length - head.length) * 3 / 4);

        setOriginalImage({
          src: newDataUrl,
          width: newWidth,
          height: newHeight,
          size: size, 
        });

        // Reset settings for the new image
        setSettings({
          ...initialSettings,
          width: newWidth,
          height: newHeight,
          crop: { x: 0, y: 0, width: newWidth, height: newHeight },
          perspectivePoints: {
            tl: { x: inset, y: inset },
            tr: { x: newWidth - inset, y: inset },
            bl: { x: inset, y: newHeight - inset },
            br: { x: newWidth - inset, y: newHeight - inset },
          },
        });
        setPendingCrop(null);
        toast({ title: "Success", description: "Perspective crop applied." });
        setActiveTab('resize');
      };
      img.src = newDataUrl;

    } catch (e) {
      console.error(e);
      toast({ title: "Error", description: "Failed to apply perspective transformation.", variant: "destructive" });
    }
  }, [imageElement, settings.perspectivePoints, toast, INSET_PX]);


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

        // Create a canvas with the cropped and pixel-adjusted image
        const adjustedCanvas = document.createElement('canvas');
        const adjustedCtx = adjustedCanvas.getContext('2d');
        if (!adjustedCtx) {
            toast({ title: "Download Error", description: "Could not create a canvas to process the image.", variant: "destructive" });
            return;
        }

        const cropData = crop || { x: 0, y: 0, width: imageElement.width, height: imageElement.height };
        adjustedCanvas.width = cropData.width;
        adjustedCanvas.height = cropData.height;

        // Draw cropped image
        adjustedCtx.drawImage(imageElement,
            cropData.x, cropData.y, cropData.width, cropData.height,
            0, 0,
            cropData.width, cropData.height
        );
        
        // Get image data and manipulate pixels for adjustments
        if (Object.values(adjustments).some((v, i) => v !== Object.values(initialSettings.adjustments)[i])) {
            let imageData = adjustedCtx.getImageData(0, 0, adjustedCanvas.width, adjustedCanvas.height);
            const data = imageData.data;
            const { brightness, contrast, saturate, grayscale, sepia, invert } = adjustments;

            for (let i = 0; i < data.length; i += 4) {
                let r = data[i], g = data[i + 1], b = data[i + 2];

                if (brightness !== 100) { const bVal = (255 * (brightness - 100)) / 100; r += bVal; g += bVal; b += bVal; }
                if (contrast !== 100) { const cVal = contrast / 100; r = cVal * (r - 128) + 128; g = cVal * (g - 128) + 128; b = cVal * (b - 128) + 128; }
                if (saturate !== 100) { const sVal = saturate / 100; const gray = 0.299 * r + 0.587 * g + 0.114 * b; r = gray + (r - gray) * sVal; g = gray + (g - gray) * sVal; b = gray + (b - gray) * sVal; }
                
                const tempR = r, tempG = g, tempB = b;
                if (sepia > 0) { const sVal = sepia / 100; const sepiaR = tempR * 0.393 + tempG * 0.769 + tempB * 0.189; const sepiaG = tempR * 0.349 + tempG * 0.686 + tempB * 0.168; const sepiaB = tempR * 0.272 + tempG * 0.534 + tempB * 0.131; r = r * (1 - sVal) + sepiaR * sVal; g = g * (1 - sVal) + sepiaG * sVal; b = b * (1 - sVal) + sepiaB * sVal; }
                if (grayscale > 0) { const gVal = grayscale / 100; const gray = r * 0.299 + g * 0.587 + b * 0.114; r = r * (1 - gVal) + gray * gVal; g = g * (1 - gVal) + gray * gVal; b = b * (1 - gVal) + gray * gVal; }
                if (invert > 0) { const iVal = invert / 100; r = r * (1 - iVal) + (255 - r) * iVal; g = g * (1 - iVal) + (255 - g) * iVal; b = b * (1 - iVal) + (255 - b) * iVal; }

                data[i] = Math.max(0, Math.min(255, r));
                data[i+1] = Math.max(0, Math.min(255, g));
                data[i+2] = Math.max(0, Math.min(255, b));
            }
            adjustedCtx.putImageData(imageData, 0, 0);
        }
        
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
        const boundingBoxWidth = adjustedCanvas.width * cos + adjustedCanvas.height * sin;
        const boundingBoxHeight = adjustedCanvas.width * sin + adjustedCanvas.height * cos;

        const scale = Math.min(width / boundingBoxWidth, height / boundingBoxHeight);
        
        const drawWidth = adjustedCanvas.width * scale;
        const drawHeight = adjustedCanvas.height * scale;
        
        finalCtx.translate(width / 2, height / 2);
        if (flipHorizontal) finalCtx.scale(-1, 1);
        if (flipVertical) finalCtx.scale(1, -1);
        finalCtx.rotate(rad);
        
        finalCtx.drawImage(adjustedCanvas, 
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
          <HeroSection onUpload={handleImageUpload} />
          <div className="w-full max-w-2xl mx-auto py-12 px-4">
            <UploadPlaceholder onUpload={handleImageUpload} isLoading={isLoading} />
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
            onApplyPerspectiveCrop={handleApplyPerspectiveCrop}
          />
        </div>
        <div className="flex-1 flex items-center justify-center p-4 bg-card rounded-lg border shadow-sm relative min-h-[50vh] lg:min-h-0">
          <ImageCanvas
            ref={canvasRef}
            originalImage={originalImage}
            imageElement={imageElement}
            settings={settings}
            updateSettings={updateSettings}
            activeTab={activeTab}
            pendingCrop={pendingCrop}
            setPendingCrop={setPendingCrop}
          />
          {isLoading && (
            <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center rounded-lg z-10">
              <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
              <p className="text-lg font-medium text-foreground">Loading file...</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

    