
"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Loader2, Download, RotateCcw, RotateCw } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import { Checkbox } from './ui/checkbox';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface PdfPageSelectorDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  pdfDoc: pdfjsLib.PDFDocumentProxy | null;
  onPageSelect: (pageNumber: number) => void;
}

function PagePreview({ pdfDoc, pageNumber, onSelect, isSelected, onToggleSelection }: { pdfDoc: pdfjsLib.PDFDocumentProxy, pageNumber: number, onSelect: () => void, isSelected: boolean, onToggleSelection: (pageNumber: number) => void }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isVisible, setIsVisible] = useState(false);
    const [rotation, setRotation] = useState(0);

    const renderPage = useCallback(async (currentRotation: number) => {
        setIsLoading(true);
        try {
            const page = await pdfDoc.getPage(pageNumber);
            const canvas = canvasRef.current;
            if (!canvas) return;

            const desiredWidth = 300;
            const viewport = page.getViewport({ scale: 1, rotation: currentRotation });
            const scale = desiredWidth / viewport.width;
            const scaledViewport = page.getViewport({ scale, rotation: currentRotation });
            
            const context = canvas.getContext('2d');
            if (!context) return;
            
            canvas.height = scaledViewport.height;
            canvas.width = scaledViewport.width;
            
            const renderTask = page.render({ canvasContext: context, viewport: scaledViewport });
            await renderTask.promise;
        } catch (error) {
            if (error instanceof Error && error.name !== 'RenderingCancelledException') {
              console.error(`Failed to render page ${pageNumber}`, error);
            }
        } finally {
            setIsLoading(false);
        }
    }, [pdfDoc, pageNumber]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            { rootMargin: "200px" } 
        );

        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => {
            if (containerRef.current) {
                // eslint-disable-next-line react-hooks/exhaustive-deps
                observer.unobserve(containerRef.current);
            }
        };
    }, []);

    useEffect(() => {
        if (!isVisible) return;
        let isMounted = true;
        
        if (isMounted) {
          renderPage(rotation);
        }

        return () => {
            isMounted = false;
        }
    }, [isVisible, rotation, renderPage]);
    
    const handleRotate = (degree: number) => {
      setRotation(prev => {
          const newRotation = (prev + degree + 360) % 360;
          renderPage(newRotation);
          return newRotation;
      });
    };

    const handleContainerClick = (e: React.MouseEvent) => {
      // Prevent click from propagating if a button was clicked
      if ((e.target as HTMLElement).closest('button')) {
        return;
      }
      onSelect();
    };

    return (
        <div
            ref={containerRef}
            className="relative group flex flex-col items-center gap-2 p-2 rounded-lg border-2 transition-all cursor-pointer"
            onClick={handleContainerClick}
        >
             <div className="absolute top-3 right-3 z-10" onClick={(e) => e.stopPropagation()}>
                <Checkbox
                    id={`select-page-${pageNumber}`}
                    checked={isSelected}
                    onCheckedChange={() => onToggleSelection(pageNumber)}
                    className="h-5 w-5 bg-background"
                    aria-label={`Select page ${pageNumber}`}
                />
            </div>
            <div className="absolute top-3 left-3 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                 <Button variant="outline" size="icon" className="h-7 w-7 bg-background/80" onClick={() => handleRotate(-90)}>
                    <RotateCcw size={14} />
                 </Button>
                 <Button variant="outline" size="icon" className="h-7 w-7 bg-background/80" onClick={() => handleRotate(90)}>
                    <RotateCw size={14} />
                 </Button>
            </div>
            <div className={`relative w-full aspect-[8.5/11] bg-muted rounded-md flex items-center justify-center overflow-hidden ${isSelected ? 'border-primary border-2' : 'border-transparent border-2 hover:border-primary/50'}`}>
                {(isLoading || !isVisible) && <Loader2 className="w-6 h-6 text-primary animate-spin" />}
                <canvas 
                  ref={canvasRef} 
                  className={`rounded-md shadow-sm max-w-full max-h-full object-contain ${isLoading ? 'hidden' : ''}`}
                />
            </div>
            <p className="text-sm font-medium">Page {pageNumber}</p>
        </div>
    );
}


export function PdfPageSelectorDialog({ isOpen, onOpenChange, pdfDoc, onPageSelect }: PdfPageSelectorDialogProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [isPageSelecting, setIsPageSelecting] = useState(false);
    const [pageNumbers, setPageNumbers] = useState<number[]>([]);
    const [selectedPages, setSelectedPages] = useState<number[]>([]);
    const [isDownloading, setIsDownloading] = useState(false);
    const { toast } = useToast();
    const [downloadFormat, setDownloadFormat] = useState<'image/png' | 'image/jpeg' | 'image/webp'>('image/png');


    useEffect(() => {
        if (pdfDoc) {
            setIsLoading(true);
            const numPages = pdfDoc.numPages;
            setPageNumbers(Array.from({ length: numPages }, (_, i) => i + 1));
            setIsLoading(false);
        }
        // Reset selections when dialog opens with a new doc
        setSelectedPages([]);
        setIsPageSelecting(false);
    }, [pdfDoc, isOpen]);

    const handleSelectPageForEdit = (pageNum: number) => {
        setIsPageSelecting(true);
        // A small timeout to allow the spinner to render before the blocking operation starts
        setTimeout(() => {
            onPageSelect(pageNum);
            // The dialog will close, but we reset the state in the useEffect on next open.
        }, 50);
    };
    
    const handleToggleSelection = (pageNumber: number) => {
        setSelectedPages(prev => 
            prev.includes(pageNumber) 
                ? prev.filter(p => p !== pageNumber) 
                : [...prev, pageNumber]
        );
    };

    const handleToggleSelectAll = () => {
        if (selectedPages.length === pageNumbers.length) {
            setSelectedPages([]);
        } else {
            setSelectedPages(pageNumbers);
        }
    };
    
    const handleDownloadSelected = async () => {
        if (!pdfDoc || selectedPages.length === 0) return;

        setIsDownloading(true);
        toast({
            title: "Download Started",
            description: `Preparing ${selectedPages.length} page(s) for download...`
        });

        const sortedPages = [...selectedPages].sort((a, b) => a - b);
        const extension = downloadFormat.split('/')[1];
        
        for (const pageNum of sortedPages) {
            try {
                const page = await pdfDoc.getPage(pageNum);
                const viewport = page.getViewport({ scale: 4.0 }); // High resolution

                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                if (!context) continue;

                canvas.width = viewport.width;
                canvas.height = viewport.height;

                await page.render({ canvasContext: context, viewport }).promise;

                const dataUrl = canvas.toDataURL(downloadFormat, 1.0);
                const link = document.createElement('a');
                link.href = dataUrl;
                link.download = `page_${pageNum}.${extension}`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(link.href);
                // A small delay to help browsers manage multiple downloads
                await new Promise(resolve => setTimeout(resolve, 200)); 
            } catch (error) {
                console.error(`Failed to download page ${pageNum}`, error);
                toast({
                    title: "Download Error",
                    description: `Could not download page ${pageNum}.`,
                    variant: "destructive"
                });
            }
        }
        
        setIsDownloading(false);
        toast({
            title: "Download Complete",
            description: `${selectedPages.length} page(s) have been downloaded.`,
        });
        setSelectedPages([]); // Deselect after download
    };


    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
          if (!open) setSelectedPages([]);
          onOpenChange(open);
        }}>
            <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Select a Page to Edit</DialogTitle>
                    <DialogDescription>
                        Click on a page to start editing, or select multiple pages to download them as images.
                    </DialogDescription>
                </DialogHeader>
                
                {!isLoading && (
                     <div className="flex flex-wrap items-center justify-between gap-4 py-2 border-b">
                         <div className="flex items-center gap-2">
                             <Checkbox
                                id="select-all"
                                checked={pageNumbers.length > 0 && selectedPages.length === pageNumbers.length}
                                onCheckedChange={handleToggleSelectAll}
                             />
                             <Label htmlFor="select-all" className="cursor-pointer">
                                {selectedPages.length === pageNumbers.length ? 'Deselect All' : 'Select All'}
                             </Label>
                         </div>
                         <div className="flex items-center gap-2">
                            <Select value={downloadFormat} onValueChange={(v: 'image/png' | 'image/jpeg' | 'image/webp') => setDownloadFormat(v)}>
                                <SelectTrigger className="w-[120px]">
                                    <SelectValue placeholder="Format" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="image/png">PNG</SelectItem>
                                    <SelectItem value="image/jpeg">JPEG</SelectItem>
                                    <SelectItem value="image/webp">WEBP</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button onClick={handleDownloadSelected} disabled={selectedPages.length === 0 || isDownloading} className="min-w-[160px]">
                                {isDownloading ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <Download className="mr-2 h-4 w-4" />
                                )}
                                Download ({selectedPages.length})
                            </Button>
                         </div>
                     </div>
                )}
               
                {isLoading || isPageSelecting ? (
                    <div className="flex-1 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                        <p className="ml-4 text-muted-foreground">{isPageSelecting ? 'Loading page for editing...' : 'Loading PDF...'}</p>
                    </div>
                ) : (
                    <ScrollArea className="flex-1 -mx-6 px-6">
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 py-4">
                           {pageNumbers.map(pageNum => (
                               <PagePreview
                                   key={pageNum}
                                   pdfDoc={pdfDoc!}
                                   pageNumber={pageNum}
                                   onSelect={() => handleSelectPageForEdit(pageNum)}
                                   isSelected={selectedPages.includes(pageNum)}
                                   onToggleSelection={handleToggleSelection}
                               />
                           ))}
                        </div>
                    </ScrollArea>
                )}
            </DialogContent>
        </Dialog>
    );
}
