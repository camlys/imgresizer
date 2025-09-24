
"use client";

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { AppHeader } from '@/components/app-header';
import { ControlPanel } from '@/components/control-panel';
import { ImageCanvas } from '@/components/image-canvas';
import { UploadPlaceholder } from '@/components/upload-placeholder';
import type { ImageSettings, OriginalImage, CropSettings, TextOverlay, SignatureOverlay } from '@/lib/types';
import { useToast } from "@/hooks/use-toast"
import { SiteFooter } from '@/components/site-footer';
import { Loader2 } from 'lucide-react';
import jsPDF from 'jspdf';
import * as pdfjsLib from 'pdfjs-dist';
import { SeoContent } from '@/components/seo-content';
import { applyPerspectiveTransform } from '@/lib/utils';
import { HeroSection } from '@/components/hero-section';
import { PdfPageSelectorDialog } from '@/components/pdf-page-selector-dialog';
import { TextEditor } from '@/components/text-editor';
import { FeatureGrid } from '@/components/feature-grid';

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
  signatures: [],
  adjustments: {
    brightness: 100,
    contrast: 100,
    saturate: 100,
    grayscale: 0,
    sepia: 0,
    invert: 0,
  },
  backgroundColor: 'transparent',
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

  // PDF Page Selection
  const [isPdfSelectorOpen, setIsPdfSelectorOpen] = useState(false);
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isFromMultiPagePdf, setIsFromMultiPagePdf] = useState(false);
  const [isPageSelecting, setIsPageSelecting] = useState(false);

  // Text Editing
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);

  // Signature Editing
  const [selectedSignatureId, setSelectedSignatureId] = useState<string | null>(null);


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
     if (tab !== 'text') {
      setSelectedTextId(null);
      setEditingTextId(null);
      setSelectedSignatureId(null);
    }
  };
  
    const loadPageAsImage = useCallback(async (pdfDoc: pdfjsLib.PDFDocumentProxy, pageNum: number, originalFileSize: number, isMultiPage: boolean) => {
    setIsLoading(true);
    try {
      const page = await pdfDoc.getPage(pageNum);
      const viewport = page.getViewport({ scale: 4.0 });

      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');
      if (!tempCtx) {
        toast({ title: "Error", description: "Could not create canvas context to render PDF.", variant: "destructive" });
        setIsLoading(false);
        return;
      }
      tempCanvas.width = viewport.width;
      tempCanvas.height = viewport.height;

      const renderContext = { canvasContext: tempCtx, viewport: viewport };
      await page.render(renderContext).promise;
      
      const img = new Image();
      img.onload = () => {
        const inset = Math.min(INSET_PX, img.width / 4, img.height / 4);
        const cropData = { x: 0, y: 0, width: img.width, height: img.height };
        setOriginalImage({
          src: img.src,
          width: img.width,
          height: img.height,
          size: originalFileSize, // Use original file size for info
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
        setIsFromMultiPagePdf(isMultiPage);
      };
      img.onerror = () => {
        toast({ title: "Error", description: "Could not load PDF page as image.", variant: "destructive" });
        setIsLoading(false);
      }
      img.src = tempCanvas.toDataURL('image/png');
    } catch (error) {
        console.error("Error processing PDF page:", error);
        toast({ title: "PDF Error", description: "Could not process the selected PDF page.", variant: "destructive" });
        setIsLoading(false);
    }
  }, [toast]);


  const handlePdfPageSelect = useCallback((pageNum: number) => {
      if (pdfDoc && pdfFile) {
        setIsPageSelecting(true);
        // Defer heavy operation to allow UI to update
        setTimeout(() => {
          loadPageAsImage(pdfDoc, pageNum, pdfFile.size, pdfDoc.numPages > 1);
          setIsPdfSelectorOpen(false);
          setIsPageSelecting(false);
        }, 50);
      }
  }, [pdfDoc, pdfFile, loadPageAsImage]);


  const handleImageUpload = async (file: File) => {
    setIsLoading(true);
    setPdfDoc(null);
    setPdfFile(null);
    setIsFromMultiPagePdf(false);
    setIsPageSelecting(false);

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
            const doc = await pdfjsLib.getDocument(arrayBuffer).promise;
            
            setPdfDoc(doc);
            setPdfFile(file);
            
            if (doc.numPages > 1) {
                setIsLoading(false);
                setIsPdfSelectorOpen(true);
            } else {
                loadPageAsImage(doc, 1, file.size, false);
            }
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
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      if (newSettings.texts) {
        // If texts are being updated, ensure the selected ID still exists
        const currentSelectedId = selectedTextId;
        const textExists = newSettings.texts.some(t => t.id === currentSelectedId);
        if (!textExists) {
          setSelectedTextId(null);
          setEditingTextId(null);
        }
      }
      if (newSettings.signatures) {
        const currentSelectedId = selectedSignatureId;
        const signatureExists = newSettings.signatures.some(s => s.id === currentSelectedId);
        if (!signatureExists) {
          setSelectedSignatureId(null);
        }
      }
      return updated;
    });

    if (Object.keys(newSettings).some(key => key !== 'crop' && key !== 'perspectivePoints')) {
        setPendingCrop(null);
    }
    if (newSettings.crop) {
      setPendingCrop(newSettings.crop);
    }
    setProcessedSize(null);
  }, [selectedTextId, selectedSignatureId]);

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


 const generateFinalCanvas = useCallback(async (): Promise<HTMLCanvasElement> => {
    return new Promise(async (resolve, reject) => {
        if (!originalImage || !imageElement) return reject(new Error("No original image loaded."));
        
        try {
            const { width, height, rotation, flipHorizontal, flipVertical, crop, texts, signatures, adjustments, backgroundColor } = settings;

            const adjustedCanvas = document.createElement('canvas');
            const adjustedCtx = adjustedCanvas.getContext('2d');
            if (!adjustedCtx) return reject(new Error("Could not create adjusted canvas context."));

            const cropData = crop || { x: 0, y: 0, width: imageElement.width, height: imageElement.height };
            adjustedCanvas.width = cropData.width;
            adjustedCanvas.height = cropData.height;

            adjustedCtx.drawImage(imageElement, cropData.x, cropData.y, cropData.width, cropData.height, 0, 0, cropData.width, cropData.height);
            
            if (Object.values(adjustments).some((v, i) => v !== Object.values(initialSettings.adjustments)[i])) {
                let imageData = adjustedCtx.getImageData(0, 0, adjustedCanvas.width, adjustedCanvas.height);
                const data = imageData.data;
                const { brightness, contrast, saturate, grayscale, sepia, invert } = adjustments;
                for (let i = 0; i < data.length; i += 4) {
                    let r = data[i], g = data[i+1], b = data[i+2];
                    if (brightness !== 100) { const bVal = (255 * (brightness - 100)) / 100; r += bVal; g += bVal; b += bVal; }
                    if (contrast !== 100) { const cVal = contrast / 100; r = cVal * (r - 128) + 128; g = cVal * (g - 128) + 128; b = cVal * (b - 128) + 128; }
                    if (saturate !== 100) { const sVal = saturate / 100; const gray = 0.299 * r + 0.587 * g + 0.114 * b; r = gray + (r - gray) * sVal; g = gray + (g - gray) * sVal; b = gray + (b - gray) * sVal; }
                    const tempR = r, tempG = g, tempB = b;
                    if (sepia > 0) { const sVal = sepia / 100; const sepiaR = tempR * 0.393 + tempG * 0.769 + tempB * 0.189; const sepiaG = tempR * 0.349 + tempG * 0.686 + tempB * 0.168; const sepiaB = tempR * 0.272 + tempG * 0.534 + tempB * 0.131; r = r * (1 - sVal) + sepiaR * sVal; g = g * (1 - sVal) + sepiaG * sVal; b = b * (1 - sVal) + sepiaB * sVal; }
                    if (grayscale > 0) { const gVal = grayscale / 100; const gray = r * 0.299 + g * 0.587 + b * 0.114; r = r * (1 - gVal) + gray * gVal; g = g * (1 - gVal) + gray * gVal; b = b * (1 - gVal) + gray * gVal; }
                    if (invert > 0) { const iVal = invert / 100; r = r * (1 - iVal) + (255 - r) * iVal; g = g * (1 - iVal) + (255 - g) * iVal; b = b * (1 - iVal) + (255 - b) * iVal; }
                    data[i] = Math.max(0, Math.min(255, r)); data[i+1] = Math.max(0, Math.min(255, g)); data[i+2] = Math.max(0, Math.min(255, b));
                }
                adjustedCtx.putImageData(imageData, 0, 0);
            }
            
            const finalCanvas = document.createElement('canvas');
            const finalCtx = finalCanvas.getContext('2d');
            if (!finalCtx) return reject(new Error("Could not create final canvas context."));
            
            finalCanvas.width = width;
            finalCanvas.height = height;

            if (backgroundColor !== 'transparent') {
                finalCtx.fillStyle = backgroundColor;
                finalCtx.fillRect(0, 0, width, height);
            }
            
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
            finalCtx.drawImage(adjustedCanvas, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
            finalCtx.restore();

            signatures.forEach(sig => {
                if (sig.img) {
                    const sigWidth = (sig.width / 100) * width;
                    const sigHeight = sigWidth / (sig.img.width / sig.img.height);
                    const sigX = (sig.x / 100) * width;
                    const sigY = (sig.y / 100) * height;

                    finalCtx.save();
                    finalCtx.translate(sigX, sigY);
                    finalCtx.rotate(sig.rotation * Math.PI / 180);
                    finalCtx.globalAlpha = sig.opacity;
                    finalCtx.drawImage(sig.img, -sigWidth / 2, -sigHeight / 2, sigWidth, sigHeight);
                    finalCtx.restore();
                }
            });

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
            
            resolve(finalCanvas);
        } catch (error) {
            reject(error);
        }
    });
}, [originalImage, imageElement, settings]);

  const updateProcessedSize = useCallback(async () => {
    try {
        const canvas = await generateFinalCanvas();
        if (settings.format === 'image/svg+xml' || settings.format === 'application/pdf') {
            setProcessedSize(null);
            return;
        }
        canvas.toBlob(
            (blob) => {
                if (blob) setProcessedSize(blob.size);
            },
            settings.format,
            settings.quality
        );
    } catch (error) {
        console.error("Error updating processed size:", error);
        setProcessedSize(null);
    }
  }, [generateFinalCanvas, settings.format, settings.quality]);

  const handleDownload = useCallback(async (filename: string) => {
    try {
        const finalCanvas = await generateFinalCanvas();
        const downloadName = filename || 'imgresizer-export';

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
  }, [generateFinalCanvas, settings.format, settings.quality, toast]);

  const handleShare = useCallback(async () => {
    const fallbackShare = async () => {
        const url = 'https://imgresizer.xyz/';
        await navigator.clipboard.writeText(url);
        toast({
            title: "Link Copied!",
            description: "The website URL has been copied to your clipboard.",
        });
    };

    try {
        const finalCanvas = await generateFinalCanvas();
        finalCanvas.toBlob(async (blob) => {
            const shareData: ShareData = {
                title: 'ImgResizer: Free Online Image Editor',
                text: 'Check out this image I edited with the free and private ImgResizer web app!',
                url: 'https://imgresizer.xyz/',
            };

            if (blob && navigator.canShare && navigator.canShare({ files: [new File([blob], 'image.png', { type: blob.type })] })) {
                const extension = settings.format.split('/')[1].split('+')[0] || 'png';
                const filename = `imgresizer-edited-image.${extension}`;
                const file = new File([blob], filename, { type: settings.format });
                shareData.files = [file];
            }
            
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                await fallbackShare();
            }
        }, settings.format, settings.quality);
    } catch (error) {
        console.error("Share error:", error);
        if ((error as Error).name !== 'AbortError') { // Don't show fallback if user cancels share
          await fallbackShare();
        }
    }
  }, [generateFinalCanvas, settings.format, settings.quality, toast]);

  const editingText = settings.texts.find(t => t.id === editingTextId);
  
  if (!originalImage) {
    return (
      <div className="flex flex-col min-h-screen bg-background text-foreground">
        <AppHeader 
          onUpload={handleImageUpload} 
          onDownload={handleDownload}
          isImageLoaded={!!originalImage}
          settings={settings}
          updateSettings={updateSettings}
          generateFinalCanvas={generateFinalCanvas}
          processedSize={processedSize}
          onUpdateProcessedSize={updateProcessedSize}
          onShare={handleShare}
        />
        <main className="flex-1 w-full overflow-y-auto">
          <HeroSection onUpload={handleImageUpload} />
          <div className="w-full max-w-2xl mx-auto py-12 px-4">
            <UploadPlaceholder onUpload={handleImageUpload} isLoading={isLoading} />
          </div>
          <section className="container mx-auto pb-12 px-4 text-center">
            <h2 className="text-2xl font-bold font-headline mb-4">A Full Suite of Editing Tools</h2>
            <p className="max-w-3xl mx-auto text-muted-foreground">
              Beyond simple resizing, ImgResizer offers a complete set of tools to perfect your images. Crop, rotate, adjust colors, and add text overlays with ease. Our powerful editor works for both images and PDF files, giving you full control over your creative assets—all for free and with complete privacy.
            </p>
          </section>
          <FeatureGrid />
          <SeoContent isEditing={false} />
        </main>
        <SiteFooter />
        {pdfDoc && (
          <PdfPageSelectorDialog
            isOpen={isPdfSelectorOpen}
            onOpenChange={(isOpen) => {
              if (!isOpen) {
                 if (isPageSelecting) setIsPageSelecting(false);
                 else setIsLoading(false);
              }
              setIsPdfSelectorOpen(isOpen);
            }}
            pdfDoc={pdfDoc}
            onPageSelect={handlePdfPageSelect}
            isPageSelecting={isPageSelecting}
          />
        )}
      </div>
    );
  }

  return (
    <div className="h-[100vh] overflow-y-auto">
      <div className="flex flex-col h-full bg-background text-foreground">
        <AppHeader 
          onUpload={handleImageUpload} 
          onDownload={handleDownload}
          isImageLoaded={!!originalImage}
          settings={settings}
          updateSettings={updateSettings}
          generateFinalCanvas={generateFinalCanvas}
          processedSize={processedSize}
          onUpdateProcessedSize={updateProcessedSize}
          onShare={handleShare}
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
              isFromMultiPagePdf={isFromMultiPagePdf}
              onViewPages={() => setIsPdfSelectorOpen(true)}
              selectedTextId={selectedTextId}
              setSelectedTextId={setSelectedTextId}
              selectedSignatureId={selectedSignatureId}
              setSelectedSignatureId={setSelectedSignatureId}
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
              selectedTextId={selectedTextId}
              setSelectedTextId={setSelectedTextId}
              setEditingTextId={setEditingTextId}
              selectedSignatureId={selectedSignatureId}
              setSelectedSignatureId={setSelectedSignatureId}
            />
            {editingText && canvasRef.current && (
              <TextEditor
                  text={editingText}
                  canvas={canvasRef.current}
                  onSave={(newContent) => {
                      const newTexts = settings.texts.map(t =>
                          t.id === editingTextId ? { ...t, text: newContent } : t
                      );
                      updateSettings({ texts: newTexts });
                      setEditingTextId(null);
                  }}
                  onCancel={() => setEditingTextId(null)}
              />
            )}
            {isLoading && (
              <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center rounded-lg z-10">
                <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                <p className="text-lg font-medium text-foreground">Loading file...</p>
              </div>
            )}
          </div>
        </main>
         {pdfDoc && (
            <PdfPageSelectorDialog
              isOpen={isPdfSelectorOpen}
              onOpenChange={(isOpen) => {
                 if (!isOpen) {
                  if (isPageSelecting) setIsPageSelecting(false);
                  else setIsLoading(false);
                }
                setIsPdfSelectorOpen(isOpen);
              }}
              pdfDoc={pdfDoc}
              onPageSelect={handlePdfPageSelect}
              isPageSelecting={isPageSelecting}
            />
          )}
      </div>
      <SeoContent isEditing={true}>
        <FeatureGrid />
      </SeoContent>
      <SiteFooter />
    </div>
  );
}

    
