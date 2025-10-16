
"use client"

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, Download, Settings, Loader2, Share2, KeyRound, LayoutGrid, Zap, Printer, ChevronDown } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import type { ImageSettings, CollageSettings, CollagePage, QuickActionPreset, OriginalImage } from '@/lib/types';
import { formatBytes, autoDetectBorders, applyPerspectiveTransform } from '@/lib/utils';
import Link from 'next/link';
import { UploadTypeDialog } from './upload-type-dialog';
import { LogoIcon } from './logo';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { AppHubCard } from './app-hub-card';
import { InstallPwaButton } from './install-pwa-button';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { useRouter } from 'next/navigation';

interface AppHeaderProps {
  onUpload: (file: File) => void;
  onDownload: (filename: string) => Promise<void>;
  generateFinalCanvas: (pageToRender?: CollagePage, overrideSettings?: Partial<ImageSettings>, imageElement?: HTMLImageElement) => Promise<HTMLCanvasElement>;
  onShare: () => void;
  onPrint: () => void;
  isImageLoaded: boolean;
  settings: ImageSettings;
  updateSettings: (newSettings: Partial<ImageSettings>) => void;
  collageSettings: CollageSettings;
  updateCollageSettings: (newSettings: Partial<CollageSettings>) => void;
  processedSize: number | null;
  onUpdateProcessedSize: () => void;
  editorMode: 'single' | 'collage';
  imageElement: HTMLImageElement | null;
  maxQualitySize: number | null;
  setProcessedSize: (size: number | null) => void;
  originalImage: OriginalImage | null;
}

export function AppHeader({ 
  onUpload, 
  onDownload,
  generateFinalCanvas,
  onShare,
  onPrint,
  isImageLoaded,
  settings,
  updateSettings,
  collageSettings,
  updateCollageSettings,
  processedSize,
  onUpdateProcessedSize,
  editorMode,
  imageElement,
  maxQualitySize,
  setProcessedSize,
  originalImage,
}: AppHeaderProps) {
  const uploadInputRef = React.useRef<HTMLInputElement>(null);
  const [targetSize, setTargetSize] = useState('');
  const [targetUnit, setTargetUnit] = useState<'KB' | 'MB'>('KB');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [filename, setFilename] = useState('imgresizer-export');
  const [isUploadTypeDialogOpen, setIsUploadTypeDialogOpen] = useState(false);
  const { toast } = useToast();
  const [isProcessingQuickAction, setIsProcessingQuickAction] = useState(false);
  const router = useRouter();
  
  const currentSettings = editorMode === 'single' ? settings : collageSettings;
  const currentUpdateSettings = editorMode === 'single' ? updateSettings : updateCollageSettings;

  useEffect(() => {
    if (isPopoverOpen && isImageLoaded) {
      onUpdateProcessedSize();
    }
  }, [isPopoverOpen, isImageLoaded, onUpdateProcessedSize, settings, collageSettings]);

    const handleCompress = async (quality: 'less' | 'medium' | 'extreme') => {
    if (!isImageLoaded || !imageElement || !originalImage) {
      toast({ title: 'No Image', description: 'Please upload an image first.', variant: 'destructive' });
      return;
    }
    
    setIsProcessingQuickAction(true);
    toast({ title: 'Compressing...', description: 'Finding the best quality for your target size.' });

    try {
      const qualityMap = { less: 0.7, medium: 0.5, extreme: 0.25 };
      const targetRatio = qualityMap[quality];
      const targetBytes = originalImage.size * targetRatio;
      const format = 'image/jpeg';
      
      const getBlobForQuality = (quality: number): Promise<Blob | null> => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return Promise.resolve(null);
        canvas.width = imageElement.naturalWidth;
        canvas.height = imageElement.naturalHeight;
        ctx.drawImage(imageElement, 0, 0);
        return new Promise(res => canvas.toBlob(res, format, quality));
      };

      let high = 1.0, low = 0.0, mid = 0.5;
      let bestQuality = 0.5;
      
      for(let i = 0; i < 15; i++) { // 15 iterations for good balance of speed/accuracy
          mid = (low + high) / 2;
          const blob = await getBlobForQuality(mid);
          if (!blob) throw new Error("Could not create blob for quality check.");
          
          if(blob.size > targetBytes) high = mid;
          else low = mid;
      }
      bestQuality = (low + high) / 2;

      const finalCanvas = document.createElement('canvas');
      const finalCtx = finalCanvas.getContext('2d');
      if (!finalCtx) throw new Error("Could not create final canvas.");

      finalCanvas.width = imageElement.naturalWidth;
      finalCanvas.height = imageElement.naturalHeight;
      finalCtx.drawImage(imageElement, 0, 0);

      const dataUrl = finalCanvas.toDataURL(format, bestQuality);
      const finalBlob = await new Promise<Blob | null>(res => finalCanvas.toBlob(res, format, bestQuality));
      if (!finalBlob) throw new Error("Could not create final blob.");

      const compressionResult = {
        dataUrl,
        originalSize: originalImage.size,
        compressedSize: finalBlob.size,
        quality: quality,
      };

      sessionStorage.setItem('compressionResult', JSON.stringify(compressionResult));
      
      router.push('/compress');

    } catch (e) {
      console.error("Compression failed:", e);
      toast({ title: 'Error', description: 'Failed to compress image.', variant: 'destructive' });
    } finally {
      setIsProcessingQuickAction(false);
    }
  };


  const handleQuickAction = async () => {
    if (editorMode === 'collage' || !isImageLoaded || !imageElement) return;
    
    let quickActionPreset: QuickActionPreset | null = null;
    try {
      const savedPreset = localStorage.getItem('quickActionPreset');
      if (savedPreset) {
        quickActionPreset = JSON.parse(savedPreset);
      }
    } catch (e) {
      console.error("Failed to load quick action preset from local storage", e);
      toast({ title: 'Error', description: 'Could not load the Quick Action preset.', variant: 'destructive'});
      return;
    }

    if (!quickActionPreset) {
       toast({ title: 'No Preset Found', description: 'Please configure and save a Quick Action preset first.', variant: 'destructive'});
       return;
    }

    setIsProcessingQuickAction(true);
    
    try {
      let currentImageElement = imageElement;
      
      if (quickActionPreset.autoCrop) {
        toast({ title: 'Quick Action', description: 'Auto-cropping image...' });
        const points = await autoDetectBorders(currentImageElement);
        const transformedCanvas = await applyPerspectiveTransform(currentImageElement, points);
        
        const newImage = new Image();
        await new Promise((resolve, reject) => {
          newImage.onload = resolve;
          newImage.onerror = reject;
          newImage.src = transformedCanvas.toDataURL('image/png');
        });
        currentImageElement = newImage;
      }
      
      const format = quickActionPreset.format || 'image/jpeg';
      let finalQuality = 1.0;

      const overrideSettings: Partial<ImageSettings> = {
        width: quickActionPreset.width || currentImageElement.width,
        height: quickActionPreset.height || currentImageElement.height,
        format: format,
        crop: {x: 0, y: 0, width: currentImageElement.width, height: currentImageElement.height},
      };
      
      if (quickActionPreset.targetSize && (format === 'image/jpeg' || format === 'image/webp')) {
          toast({ title: 'Quick Action', description: 'Optimizing file size...' });
          const targetBytes = quickActionPreset.targetUnit === 'KB' 
              ? quickActionPreset.targetSize * 1024 
              : quickActionPreset.targetSize * 1024 * 1024;
          
          let high = 1.0, low = 0.0, mid = 0.5;
          for(let i = 0; i < 25; i++) {
              mid = (low + high) / 2;
              const tempCanvas = await generateFinalCanvas(undefined, { ...overrideSettings, quality: mid }, currentImageElement);
              const blob = await new Promise<Blob|null>(res => tempCanvas.toBlob(res, format, mid));
              if (!blob) throw new Error("Could not generate blob for quality check.");
              
              if(blob.size > targetBytes) high = mid;
              else low = mid;
          }
          finalQuality = (low + high) / 2;
      }
      
      overrideSettings.quality = finalQuality;
      
      toast({ title: 'Quick Action', description: 'Generating final image...' });
      const finalCanvas = await generateFinalCanvas(undefined, overrideSettings, currentImageElement);
      
      if (format === 'application/pdf') {
        const pdfWidth = (finalCanvas.width / 300) * 72;
        const pdfHeight = (finalCanvas.height / 300) * 72;
        const orientation = pdfWidth > pdfHeight ? 'l' : 'p';
        const pdf = new jsPDF({
          orientation: orientation,
          unit: 'pt',
          format: [pdfWidth, pdfHeight]
        });
        const imgData = finalCanvas.toDataURL('image/jpeg', finalQuality);
        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
        pdf.save('imgresizer-quick-action.pdf');
      } else {
        const extension = format.split('/')[1].split('+')[0];
        const downloadName = `imgresizer-quick-action.${extension}`;
        
        finalCanvas.toBlob((blob) => {
          if (blob) {
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = downloadName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);
          }
        }, format, finalQuality);
      }
      
      toast({
        title: "Quick Action Complete",
        description: `Your image has been downloaded.`,
      });

    } catch (e) {
      console.error("Quick Action failed:", e);
      toast({ title: 'Error', description: 'Quick Action failed to process the image.', variant: 'destructive'});
    } finally {
      setIsProcessingQuickAction(false);
    }
  };


  const handleUploadClick = () => {
    setIsUploadTypeDialogOpen(true);
  };

  const handleSelectUploadType = (type: 'image' | 'pdf') => {
    if (uploadInputRef.current) {
      uploadInputRef.current.accept = type === 'image' ? 'image/*,image/webp' : 'application/pdf';
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
  
  const getBlobFromCanvas = useCallback(async (quality: number): Promise<Blob | null> => {
    const format = currentSettings.format;

    if (format === 'application/pdf') {
        const pagesToRender = editorMode === 'collage' ? collageSettings.pages : [collageSettings.pages[collageSettings.activePageIndex]!];
        
        if (pagesToRender.length === 0) return new Blob();

        // For size estimation, only render the first page to avoid blocking
        const firstPageCanvas = await generateFinalCanvas(pagesToRender[0], { quality });
        const pdfWidth = (firstPageCanvas.width / 300) * 72;
        const pdfHeight = (firstPageCanvas.height / 300) * 72;
        
        const orientation = pdfWidth > pdfHeight ? 'l' : 'p';
        const pdf = new jsPDF({
            orientation,
            unit: 'pt',
            format: [pdfWidth, pdfHeight]
        });

        const imgData = firstPageCanvas.toDataURL('image/jpeg', quality);
        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);

        // Multiply the size of the first page by the total number of pages for a rough estimate
        const singlePageBlob = pdf.output('blob');
        const estimatedSize = singlePageBlob.size * pagesToRender.length;
        
        // Return a blob with the estimated size. The content doesn't matter here.
        return new Blob([new ArrayBuffer(estimatedSize)], { type: 'application/pdf' });
    }

    const pageToRender = editorMode === 'collage' ? collageSettings.pages[collageSettings.activePageIndex] : undefined;
    const canvas = await generateFinalCanvas(pageToRender, { quality });

    return new Promise((resolve) => {
        canvas.toBlob(resolve, format === 'application/pdf' ? 'image/jpeg' : format, quality);
    });
}, [generateFinalCanvas, editorMode, collageSettings, currentSettings.format]);


  const handleTargetSize = async () => {
    const numericSize = parseFloat(targetSize);
    if (!numericSize || numericSize <= 0) return;

    setIsOptimizing(true);
    const targetBytes = targetUnit === 'KB' ? numericSize * 1024 : numericSize * 1024 * 1024;
    
    let high = 1.0;
    let low = 0.0;
    let mid = 0.5;
    let bestQuality = 0.5;
    let finalBlob: Blob | null = null;
    
    for(let i = 0; i < 25; i++) { 
      mid = (low + high) / 2;
      const blob = await getBlobFromCanvas(mid);
      if (!blob) {
        setIsOptimizing(false);
        return;
      }
      finalBlob = blob;
      
      if(blob.size > targetBytes) {
        high = mid;
      } else {
        low = mid;
      }
      bestQuality = (low + high) / 2;
    }
    
    if (finalBlob) {
        const quality = parseFloat(bestQuality.toFixed(2));
        if (editorMode === 'single') {
            (currentUpdateSettings as (s: Partial<ImageSettings>) => void)({ quality });
        } else {
            (currentUpdateSettings as (s: Partial<CollageSettings>) => void)({ quality });
        }
        setProcessedSize(finalBlob.size);
    }
    
    setIsOptimizing(false);
  };

  const handleDownloadClick = () => {
    onDownload(filename);
  };


  return (
    <header className="flex items-center justify-between p-2 sm:p-4 sm:pl-6 border-b bg-card overflow-hidden">
      <Link href="https://www.imgresizer.xyz/" className="flex flex-col md:flex-row md:items-center md:gap-3">
        <LogoIcon className="size-8 md:size-9" />
        <div className="text-sm -mt-1 md:mt-0 md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-primary bg-[size:200%_auto] animate-gradient-shift font-headline tracking-tight">
            ImgResizer
        </div>
      </Link>
      <div className="flex items-center gap-2">
        <input
          type="file"
          ref={uploadInputRef}
          onChange={handleFileChange}
          className="hidden"
        />
        <Button variant="outline" size="icon" onClick={handleUploadClick}>
          <Upload />
        </Button>
         <UploadTypeDialog
          isOpen={isUploadTypeDialogOpen}
          onOpenChange={setIsUploadTypeDialogOpen}
          onSelectType={handleSelectUploadType}
        />
        <div className="flex items-center gap-2" style={{minWidth: 'auto'}}>
        {isImageLoaded && editorMode === 'single' && (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" disabled={isProcessingQuickAction}>
                        {isProcessingQuickAction ? <Loader2 className="animate-spin" /> : <Zap />}
                        <span className="hidden sm:inline ml-2">Quick Actions</span>
                        <ChevronDown className="ml-1 h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleQuickAction}>Run Saved Preset</DropdownMenuItem>
                    <Separator />
                    <DropdownMenuItem onClick={() => handleCompress('less')}>Compress: Less</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleCompress('medium')}>Compress: Medium</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleCompress('extreme')}>Compress: Extreme</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        )}
        {isImageLoaded && (
          <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
            <PopoverTrigger asChild>
              <Button>
                <Download className="mr-2" />
                Download
              </Button>
            </PopoverTrigger>
            <PopoverContent 
              className="w-[calc(100vw-2rem)] sm:w-80" 
              align="end"
              onOpenAutoFocus={(e) => e.preventDefault()}
            >
              <div className="grid gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium leading-none flex items-center gap-2"><Settings size={18}/> Export Settings</h4>
                  <p className="text-sm text-muted-foreground">
                    { editorMode === 'collage' && currentSettings.format === 'application/pdf' 
                      ? `Downloads all ${collageSettings.pages.length} pages as a single PDF.`
                      : 'Adjust settings for your download.'
                    }
                  </p>
                </div>
                <Separator />
                <div className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="filename">Filename</Label>
                        <Input
                            id="filename"
                            value={filename}
                            onChange={(e) => setFilename(e.target.value)}
                            placeholder="imgresizer-export"
                        />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="format">Format</Label>
                      <Select
                        value={currentSettings.format}
                        onValueChange={(value) => {
                          const newSettings: Partial<ImageSettings | CollageSettings> = { format: value as any };
                          if (value === 'image/svg+xml') {
                            newSettings.quality = 1.0;
                          }
                           if (editorMode === 'single') {
                                (currentUpdateSettings as (s: Partial<ImageSettings>) => void)({ ...newSettings, format: value as any });
                            } else {
                                (currentUpdateSettings as (s: Partial<CollageSettings>) => void)({ ...newSettings, format: value as any });
                            }
                          setTimeout(onUpdateProcessedSize, 100);
                        }}
                      >
                        <SelectTrigger id="format">
                          <SelectValue placeholder="Select format" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="application/pdf">PDF</SelectItem>
                          <SelectItem value="image/jpeg">JPEG</SelectItem>
                          <SelectItem value="image/png">PNG</SelectItem>
                          <SelectItem value="image/webp">WEBP</SelectItem>
                          {editorMode === 'single' && <SelectItem value="image/gif">GIF</SelectItem>}
                          {editorMode === 'single' && <SelectItem value="image/bmp">BMP</SelectItem>}
                          <SelectItem value="image/svg+xml">SVG</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {(currentSettings.format === 'image/jpeg' || currentSettings.format === 'image/webp' || currentSettings.format === 'application/pdf') && (
                      <>
                        <div className="grid gap-2">
                          <div className="flex justify-between items-center">
                            <Label htmlFor="quality">Quality</Label>
                            <span className="text-sm text-muted-foreground">{Math.round(currentSettings.quality * 100)}%</span>
                          </div>
                          <Slider
                            id="quality"
                            min={0} max={1} step={0.01}
                            value={[currentSettings.quality]}
                            onValueChange={(value) => {
                                if (editorMode === 'single') {
                                    (currentUpdateSettings as (s: Partial<ImageSettings>) => void)({ quality: value[0] });
                                } else {
                                    (currentUpdateSettings as (s: Partial<CollageSettings>) => void)({ quality: value[0] });
                                }
                            }}
                            onValueCommit={() => onUpdateProcessedSize()}
                          />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground">Target File Size (Optional)</Label>
                            <div className="flex items-center gap-2">
                            <Input 
                                type="number"
                                placeholder="e.g. 500"
                                value={targetSize}
                                onChange={(e) => setTargetSize(e.target.value)}
                                disabled={isOptimizing}
                            />
                            <Select value={targetUnit} onValueChange={(val: 'KB' | 'MB') => setTargetUnit(val)} disabled={isOptimizing}>
                                <SelectTrigger className="w-[80px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="KB">KB</SelectItem>
                                    <SelectItem value="MB">MB</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button variant="outline" onClick={handleTargetSize} disabled={isOptimizing || !targetSize} className="px-4">
                                {isOptimizing ? <Loader2 className="animate-spin"/> : 'Set'}
                            </Button>
                            </div>
                        </div>
                      </>
                    )}
                    <div className="flex justify-between text-sm text-muted-foreground">
                        <div>
                            Est. size: <span className="font-medium text-foreground">
                            {currentSettings.format === 'image/svg+xml' ? 'N/A' : processedSize !== null ? formatBytes(processedSize) : 'Calculating...'}
                            </span>
                        </div>
                        <div>
                            Original: <span className="font-medium text-foreground">
                                {maxQualitySize !== null ? formatBytes(maxQualitySize) : (originalImage && formatBytes(originalImage.size))}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button onClick={handleDownloadClick} className="w-full">
                          <Download className="mr-2"/>
                          Download
                      </Button>
                       <Button variant="outline" size="icon" onClick={onPrint} className="shrink-0">
                          <Printer />
                      </Button>
                      <Button variant="outline" size="icon" onClick={onShare} className="shrink-0">
                          <Share2 />
                      </Button>
                    </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        )}
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon" className="hidden sm:inline-flex">
              <LayoutGrid />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 bg-background/80 backdrop-blur-md border-primary/20">
            <AppHubCard />
          </PopoverContent>
        </Popover>
      </div>
    </header>
  );
}

    
