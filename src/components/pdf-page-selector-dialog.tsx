
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
import { Loader2, Download } from 'lucide-react';
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
                // This condition is to prevent errors if the component is unmounted before the observer is set up
                // eslint-disable-next-line react-hooks/exhaustive-deps
                observer.unobserve(containerRef.current);
            }
        };
    }, []);

    useEffect(() => {
        if (!isVisible) return;

        let isMounted = true;
        let renderTask: pdfjsLib.RenderTask | null = null;
        
        async function renderPage() {
            try {
                const page = await pdfDoc.getPage(pageNumber);
                const canvas = canvasRef.current;
                if (!canvas || !isMounted) return;

                const desiredWidth = 300;
                const viewport = page.getViewport({ scale: 1 });
                const scale = desiredWidth / viewport.width;
                const scaledViewport = page.getViewport({ scale });
                
                const context = canvas.getContext('2d');
                if (!context) return;
                
                canvas.height = scaledViewport.height;
                canvas.width = scaledViewport.width;
                
                renderTask = page.render({ canvasContext: context, viewport: scaledViewport });
                await renderTask.promise;
                if(isMounted) setIsLoading(false);
            } catch (error) {
                if (error instanceof Error && error.name !== 'RenderingCancelledException') {
                  console.error(`Failed to render page ${pageNumber}`, error);
                }
            }
        }
        
        renderPage();

        return () => {
            isMounted = false;
            if (renderTask) {
                renderTask.cancel();
            }
        }
    }, [pdfDoc, pageNumber, isVisible]);
    
    const handleContainerClick = (e: React.MouseEvent) => {
      // Prevent click from propagating to checkbox and vice-versa
      if ((e.target as HTMLElement).closest('.checkbox-container')) {
        return;
      }
      onSelect();
    };

    return (
        <div
            ref={containerRef}
            className={`relative flex flex-col items-center gap-2 p-2 rounded-lg border-2 transition-all cursor-pointer ${isSelected ? 'border-primary' : 'border-transparent hover:border-primary/50'}`}
            onClick={handleContainerClick}
        >
             <div className="absolute top-3 right-3 z-10 checkbox-container" onClick={(e) => e.stopPropagation()}>
                <Checkbox
                    id={`select-page-${pageNumber}`}
                    checked={isSelected}
                    onCheckedChange={() => onToggleSelection(pageNumber)}
                    className="h-5 w-5 bg-background"
                    aria-label={`Select page ${pageNumber}`}
                />
            </div>
            <div className="relative w-full aspect-[8.5/11] bg-muted rounded-md flex items-center justify-center overflow-hidden">
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
    }, [pdfDoc]);
    
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
               
                {isLoading ? (
                    <div className="flex-1 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                        <p className="ml-4 text-muted-foreground">Loading page previews...</p>
                    </div>
                ) : (
                    <ScrollArea className="flex-1 -mx-6 px-6">
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 py-4">
                           {pageNumbers.map(pageNum => (
                               <PagePreview
                                   key={pageNum}
                                   pdfDoc={pdfDoc!}
                                   pageNumber={pageNum}
                                   onSelect={() => onPageSelect(pageNum)}
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
