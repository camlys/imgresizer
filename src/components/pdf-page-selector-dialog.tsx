
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2, Download, RotateCcw, RotateCw, Trash2, Undo, Edit } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import { Checkbox } from './ui/checkbox';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import jsPDF from 'jspdf';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from './ui/tooltip';


interface PageMetadata {
  pageNumber: number;
  rotation: number;
  name: string;
}

interface PagePreviewProps {
  pdfDoc: pdfjsLib.PDFDocumentProxy;
  pageMeta: PageMetadata;
  onSelect: () => void;
  isSelected: boolean;
  onToggleSelection: (pageNumber: number) => void;
  onRotate: (pageNumber: number, degree: number) => void;
  onDelete: (pageNumber: number) => void;
  onNameChange: (pageNumber: number, newName: string) => void;
  onDownload: (pageMeta: PageMetadata) => void;
}


function PagePreview({ pdfDoc, pageMeta, onSelect, isSelected, onToggleSelection, onRotate, onDelete, onNameChange, onDownload }: PagePreviewProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const renderTaskRef = useRef<pdfjsLib.RenderTask | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isVisible, setIsVisible] = useState(false);
    const [isEditingName, setIsEditingName] = useState(false);
    const [tempName, setTempName] = useState(pageMeta.name);

    const renderPage = useCallback(async (currentRotation: number) => {
        if (renderTaskRef.current) {
            renderTaskRef.current.cancel();
        }
        setIsLoading(true);
        try {
            const page = await pdfDoc.getPage(pageMeta.pageNumber);
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
            
            const task = page.render({ canvasContext: context, viewport: scaledViewport });
            renderTaskRef.current = task;
            await task.promise;
            renderTaskRef.current = null;
        } catch (error) {
            if (error instanceof Error && error.name !== 'RenderingCancelledException') {
              console.error(`Failed to render page ${pageMeta.pageNumber}`, error);
            }
        } finally {
            setIsLoading(false);
        }
    }, [pdfDoc, pageMeta.pageNumber]);

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
        if (isVisible) {
          renderPage(pageMeta.rotation);
        }
        return () => {
            if (renderTaskRef.current) {
                renderTaskRef.current.cancel();
            }
        }
    }, [isVisible, pageMeta.rotation, renderPage]);
    
    const handleRotate = (degree: number) => {
      onRotate(pageMeta.pageNumber, degree);
    };

    const handleContainerClick = (e: React.MouseEvent) => {
      if ((e.target as HTMLElement).closest('button, input, label')) {
        return;
      }
      onSelect();
    };

    const handleNameSubmit = () => {
        if (tempName.trim()) {
            onNameChange(pageMeta.pageNumber, tempName.trim());
        } else {
            setTempName(pageMeta.name); // Reset if empty
        }
        setIsEditingName(false);
    };

    return (
        <div
            ref={containerRef}
            className="relative group flex flex-col items-center gap-2 p-2 rounded-lg border-2 transition-all"
            onClick={handleContainerClick}
        >
             <div className="absolute top-3 right-3 z-10 flex gap-1" onClick={(e) => e.stopPropagation()}>
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="outline" size="icon" className="h-7 w-7 bg-background/80" onClick={() => onDownload(pageMeta)}>
                                <Download size={14} />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>Download this page</p></TooltipContent>
                    </Tooltip>
                     <Tooltip>
                        <TooltipTrigger asChild>
                             <Button variant="destructive" size="icon" className="h-7 w-7" onClick={() => onDelete(pageMeta.pageNumber)}>
                                <Trash2 size={14} />
                             </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>Delete this page</p></TooltipContent>
                    </Tooltip>
                </TooltipProvider>
                <Checkbox
                    id={`select-page-${pageMeta.pageNumber}`}
                    checked={isSelected}
                    onCheckedChange={() => onToggleSelection(pageMeta.pageNumber)}
                    className="h-7 w-7 bg-background"
                    aria-label={`Select page ${pageMeta.pageNumber}`}
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
                  className={`rounded-md shadow-sm max-w-full max-h-full object-contain ${isLoading ? 'hidden' : ''} cursor-pointer`}
                />
            </div>
            <div className="flex items-center gap-1 w-full justify-center">
                {isEditingName ? (
                    <Input 
                        value={tempName}
                        onChange={(e) => setTempName(e.target.value)}
                        onBlur={handleNameSubmit}
                        onKeyDown={(e) => e.key === 'Enter' && handleNameSubmit()}
                        autoFocus
                        className="text-sm font-medium h-7 text-center"
                    />
                ) : (
                    <>
                        <p className="text-sm font-medium truncate">{pageMeta.name}</p>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setIsEditingName(true)}>
                            <Edit size={14}/>
                        </Button>
                    </>
                )}
            </div>
        </div>
    );
}

interface PdfPageSelectorDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  pdfDoc: pdfjsLib.PDFDocumentProxy | null;
  onPageSelect: (pageNum: number) => void;
  isPageSelecting: boolean;
}

export function PdfPageSelectorDialog({ isOpen, onOpenChange, pdfDoc, onPageSelect, isPageSelecting }: PdfPageSelectorDialogProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [pagesMeta, setPagesMeta] = useState<PageMetadata[]>([]);
    const [deletedPages, setDeletedPages] = useState<Set<number>>(new Set());
    const [deletionHistory, setDeletionHistory] = useState<number[][]>([]);
    const [selectedPages, setSelectedPages] = useState<number[]>([]);
    const [isDownloading, setIsDownloading] = useState(false);
    const { toast } = useToast();
    const [downloadFormat, setDownloadFormat] = useState<'image/png' | 'image/jpeg' | 'image/webp' | 'application/pdf'>('image/png');
    
    // State for delete confirmation
    const [isConfirmDeleteDialogOpen, setIsConfirmDeleteDialogOpen] = useState(false);
    const [pagesToDelete, setPagesToDelete] = useState<number[] | null>(null);

    const visiblePages = pagesMeta.filter(p => !deletedPages.has(p.pageNumber));
    const visiblePageNumbers = visiblePages.map(p => p.pageNumber);

    useEffect(() => {
        if (pdfDoc && isOpen) {
            setIsLoading(true);
            const numPages = pdfDoc.numPages;
            const meta = Array.from({ length: numPages }, (_, i) => ({
                pageNumber: i + 1,
                rotation: 0,
                name: `Page ${i + 1}`,
            }));
            setPagesMeta(meta);
            setIsLoading(false);
            setDeletedPages(new Set());
            setSelectedPages([]);
            setDeletionHistory([]);
        }
    }, [pdfDoc, isOpen]);

    const handleSelectPageForEdit = (pageNum: number) => {
        onPageSelect(pageNum); 
    };
    
    const handleToggleSelection = (pageNumber: number) => {
        setSelectedPages(prev => 
            prev.includes(pageNumber) 
                ? prev.filter(p => p !== pageNumber) 
                : [...prev, pageNumber]
        );
    };

    const handleToggleSelectAll = () => {
        if (selectedPages.length === visiblePageNumbers.length) {
            setSelectedPages([]);
        } else {
            setSelectedPages(visiblePageNumbers);
        }
    };

    const handlePageRotate = (pageNumber: number, degree: number) => {
        setPagesMeta(prev => prev.map(p => 
            p.pageNumber === pageNumber 
                ? { ...p, rotation: (p.rotation + degree + 360) % 360 }
                : p
        ));
    };

    const confirmDelete = (pageNumbers: number[]) => {
        setPagesToDelete(pageNumbers);
        setIsConfirmDeleteDialogOpen(true);
    };

    const executeDelete = () => {
        if (!pagesToDelete) return;
        setDeletedPages(prev => new Set([...prev, ...pagesToDelete]));
        setDeletionHistory(prev => [...prev, pagesToDelete]);
        setSelectedPages(prev => prev.filter(p => !pagesToDelete.includes(p)));
        setPagesToDelete(null);
    };
    
    const handleUndoDelete = () => {
        if (deletionHistory.length === 0) return;
        const lastDeletedGroup = deletionHistory[deletionHistory.length - 1];
        setDeletedPages(prev => {
            const newSet = new Set(prev);
            lastDeletedGroup.forEach(num => newSet.delete(num));
            return newSet;
        });
        setDeletionHistory(prev => prev.slice(0, -1));
    };

    const handleNameChange = (pageNumber: number, newName: string) => {
        setPagesMeta(prev => prev.map(p => 
            p.pageNumber === pageNumber ? { ...p, name: newName } : p
        ));
    };

    const downloadPage = useCallback(async (pageMeta: PageMetadata) => {
         if (!pdfDoc) return;

         toast({ title: `Downloading ${pageMeta.name}...`});
         try {
             const page = await pdfDoc.getPage(pageMeta.pageNumber);
             const viewport = page.getViewport({ scale: 4.0, rotation: pageMeta.rotation });

             const canvas = document.createElement('canvas');
             const context = canvas.getContext('2d');
             if (!context) throw new Error("Could not create canvas context");

             canvas.width = viewport.width;
             canvas.height = viewport.height;
             await page.render({ canvasContext: context, viewport }).promise;
             
             const dataUrl = canvas.toDataURL('image/png', 1.0);
             const link = document.createElement('a');
             link.href = dataUrl;
             link.download = `${pageMeta.name}.png`;
             document.body.appendChild(link);
             link.click();
             document.body.removeChild(link);
             URL.revokeObjectURL(link.href);
         } catch (error) {
             console.error(`Failed to download page ${pageMeta.pageNumber}`, error);
             toast({
                 title: "Download Error",
                 description: `Could not download ${pageMeta.name}.`,
                 variant: "destructive"
             });
         }
    }, [pdfDoc, toast]);
    
    const handleDownloadSelected = async () => {
        if (!pdfDoc || selectedPages.length === 0) return;

        setIsDownloading(true);
        toast({
            title: "Download Started",
            description: `Preparing ${selectedPages.length} page(s) for download...`
        });

        const pagesToDownload = [...selectedPages].sort((a, b) => a - b).map(num => pagesMeta.find(p => p.pageNumber === num)!);
        
        if (downloadFormat === 'application/pdf') {
            try {
                const firstPageMeta = pagesToDownload[0];
                const firstPageForPdf = await pdfDoc.getPage(firstPageMeta.pageNumber);
                const viewportForPdf = firstPageForPdf.getViewport({ scale: 1, rotation: firstPageMeta.rotation });
                const orientation = viewportForPdf.width > viewportForPdf.height ? 'l' : 'p';
                
                const pdf = new jsPDF({
                    orientation,
                    unit: 'pt',
                    format: [viewportForPdf.width, viewportForPdf.height]
                });
                pdf.deletePage(1); // remove default page

                for (let i = 0; i < pagesToDownload.length; i++) {
                    const pageMeta = pagesToDownload[i];
                    const page = await pdfDoc.getPage(pageMeta.pageNumber);
                    const viewport = page.getViewport({ scale: 4.0, rotation: pageMeta.rotation }); // High res

                    const canvas = document.createElement('canvas');
                    const context = canvas.getContext('2d');
                    if (!context) continue;

                    canvas.width = viewport.width;
                    canvas.height = viewport.height;
                    await page.render({ canvasContext: context, viewport }).promise;

                    
                    const pageVp = page.getViewport({scale: 1, rotation: pageMeta.rotation});
                    pdf.addPage([pageVp.width, pageVp.height], pageVp.width > pageVp.height ? 'l' : 'p');
                    
                    const imgData = canvas.toDataURL('image/png');
                    pdf.addImage(imgData, 'PNG', 0, 0, pdf.internal.pageSize.getWidth(), pdf.internal.pageSize.getHeight());
                }
                pdf.save('imgresizer-pages.pdf');
            } catch (error) {
                 console.error(`Failed to generate PDF`, error);
                toast({
                    title: "Download Error",
                    description: `Could not generate PDF.`,
                    variant: "destructive"
                });
            }

        } else {
            const extension = downloadFormat.split('/')[1];
            for (const pageMeta of pagesToDownload) {
                try {
                    const page = await pdfDoc.getPage(pageMeta.pageNumber);
                    const viewport = page.getViewport({ scale: 4.0, rotation: pageMeta.rotation }); // High resolution

                    const canvas = document.createElement('canvas');
                    const context = canvas.getContext('2d');
                    if (!context) continue;

                    canvas.width = viewport.width;
                    canvas.height = viewport.height;

                    await page.render({ canvasContext: context, viewport }).promise;

                    const dataUrl = canvas.toDataURL(downloadFormat, 1.0);
                    const link = document.createElement('a');
                    link.href = dataUrl;
                    link.download = `${pageMeta.name}.${extension}`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(link.href);
                    await new Promise(resolve => setTimeout(resolve, 200)); 
                } catch (error) {
                    console.error(`Failed to download page ${pageMeta.pageNumber}`, error);
                    toast({
                        title: "Download Error",
                        description: `Could not download ${pageMeta.name}.`,
                        variant: "destructive"
                    });
                }
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
          if (!open) {
              setPagesMeta([]);
              setSelectedPages([]);
              setDeletedPages(new Set());
              setDeletionHistory([]);
          }
          onOpenChange(open);
        }}>
            <DialogContent className="max-w-6xl h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Organize and Select Pages</DialogTitle>
                    <DialogDescription>
                        Click a page to edit, or select multiple to download. You can rename, rotate, and delete pages before exporting.
                    </DialogDescription>
                </DialogHeader>
                
                {!isLoading && (
                     <div className="flex flex-wrap items-center justify-between gap-4 py-2 border-b">
                         <div className="flex items-center gap-4">
                             <div className="flex items-center gap-2">
                                <Checkbox
                                    id="select-all"
                                    checked={visiblePageNumbers.length > 0 && selectedPages.length === visiblePageNumbers.length}
                                    onCheckedChange={handleToggleSelectAll}
                                />
                                <Label htmlFor="select-all" className="cursor-pointer">
                                    {selectedPages.length === visiblePageNumbers.length ? 'Deselect All' : `Select All (${visiblePages.length})`}
                                </Label>
                             </div>
                             {selectedPages.length > 0 && (
                                <Button variant="destructive-outline" size="sm" onClick={() => confirmDelete(selectedPages)}>
                                    <Trash2 size={16} className="mr-2"/>
                                    Delete ({selectedPages.length})
                                </Button>
                             )}
                              {deletionHistory.length > 0 && (
                                <div className="text-sm text-muted-foreground">
                                    {deletedPages.size} page(s) deleted.
                                    <Button variant="link" className="p-1 h-auto" onClick={handleUndoDelete}>Undo</Button>
                                </div>
                            )}
                         </div>
                         <div className="flex items-center gap-2">
                            <Select value={downloadFormat} onValueChange={(v: 'image/png' | 'image/jpeg' | 'image/webp' | 'application/pdf') => setDownloadFormat(v)}>
                                <SelectTrigger className="w-[120px]">
                                    <SelectValue placeholder="Format" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="application/pdf">PDF</SelectItem>
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
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 py-4">
                           {visiblePages.map(pageMeta => (
                               <PagePreview
                                   key={pageMeta.pageNumber}
                                   pdfDoc={pdfDoc!}
                                   pageMeta={pageMeta}
                                   onSelect={() => handleSelectPageForEdit(pageMeta.pageNumber)}
                                   isSelected={selectedPages.includes(pageMeta.pageNumber)}
                                   onToggleSelection={handleToggleSelection}
                                   onRotate={handlePageRotate}
                                   onDelete={() => confirmDelete([pageMeta.pageNumber])}
                                   onNameChange={handleNameChange}
                                   onDownload={downloadPage}
                               />
                           ))}
                        </div>
                    </ScrollArea>
                )}
                 <AlertDialog open={isConfirmDeleteDialogOpen} onOpenChange={setIsConfirmDeleteDialogOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will hide {pagesToDelete?.length} page(s). You can undo this action, but they will be excluded from downloads unless restored.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={executeDelete}>Continue</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </DialogContent>
        </Dialog>
    );
}
