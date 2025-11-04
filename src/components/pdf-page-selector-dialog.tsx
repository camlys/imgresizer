
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
import { Loader2, Download, RotateCcw, RotateCw, Trash2, Undo, Edit, PlusSquare, Search, List } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import { Checkbox } from './ui/checkbox';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import jsPDF from 'jspdf';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from './ui/tooltip';
import type { PdfDocumentInfo, PageMetadata } from '@/lib/types';
import { DialogFooter } from './ui/dialog';


interface PagePreviewProps {
  pdfDoc: pdfjsLib.PDFDocumentProxy;
  pageMeta: PageMetadata;
  onSelectForEdit: () => void;
  onSelectForImport: () => void;
  isSelected: boolean;
  onRotate: (docId: string, pageNumber: number, degree: number) => void;
  onDelete: (docId: string, pageNumber: number) => void;
  onNameChange: (docId: string, pageNumber: number, newName: string) => void;
  onDownload: (pageMeta: PageMetadata) => void;
  onAddAfter: (pageMeta: PageMetadata) => void;
}


function PagePreview({ 
    pdfDoc, 
    pageMeta, 
    onSelectForEdit,
    onSelectForImport, 
    isSelected, 
    onRotate, 
    onDelete, 
    onNameChange, 
    onDownload,
    onAddAfter
}: PagePreviewProps) {
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
      onRotate(pageMeta.docId, pageMeta.pageNumber, degree);
    };

    const handleContainerClick = (e: React.MouseEvent) => {
      if ((e.target as HTMLElement).closest('button, input, label')) {
        return;
      }
      onSelectForEdit();
    };

    const handleNameSubmit = () => {
        if (tempName.trim()) {
            onNameChange(pageMeta.docId, pageMeta.pageNumber, tempName.trim());
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
                             <Button variant="destructive" size="icon" className="h-7 w-7" onClick={() => onDelete(pageMeta.docId, pageMeta.pageNumber)}>
                                <Trash2 size={14} />
                             </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>Delete this page</p></TooltipContent>
                    </Tooltip>
                </TooltipProvider>
                <Checkbox
                    id={`select-page-${pageMeta.docId}-${pageMeta.pageNumber}`}
                    checked={isSelected}
                    onCheckedChange={() => onSelectForImport()}
                    className="h-7 w-7 bg-background"
                    aria-label={`Select page ${pageMeta.pageNumber} from ${pageMeta.docName}`}
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
                <div className="absolute bottom-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button size="icon" className="h-8 w-8 shadow-md bg-lime-500 hover:bg-lime-600 text-white" onClick={() => onAddAfter(pageMeta)}>
                                    <PlusSquare size={16} />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>Insert pages after this</p></TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </div>
            <div className="flex items-center gap-1 w-full justify-center">
                {isEditingName ? (
                    <Input 
                        value={tempName}
                        onChange={(e) => setTempName(e.target.value)}
                        onBlur={handleNameSubmit}
                        onKeyDown={(e) => e.key === 'Enter' && handleNameSubmit()}
                        className="text-sm font-medium h-7 text-center"
                    />
                ) : (
                    <>
                        <p className="text-sm font-medium truncate" title={pageMeta.name}>{pageMeta.name}</p>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setIsEditingName(true)}>
                            <Edit size={14}/>
                        </Button>
                    </>
                )}
            </div>
        </div>
    );
}

interface ImportPagePreviewProps {
  pdfDoc: pdfjsLib.PDFDocumentProxy;
  pageNumber: number;
  onSelect: () => void;
  isSelected: boolean;
}

function ImportPagePreview({ pdfDoc, pageNumber, onSelect, isSelected }: ImportPagePreviewProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isVisible, setIsVisible] = useState(false);
    
    const renderPage = useCallback(async () => {
        setIsLoading(true);
        try {
            const page = await pdfDoc.getPage(pageNumber);
            const canvas = canvasRef.current;
            if (!canvas) return;

            const desiredWidth = 300;
            const viewport = page.getViewport({ scale: 1 });
            const scale = desiredWidth / viewport.width;
            const scaledViewport = page.getViewport({ scale });
            
            const context = canvas.getContext('2d');
            if (!context) return;
            
            canvas.height = scaledViewport.height;
            canvas.width = scaledViewport.width;
            
            const task = page.render({ canvasContext: context, viewport: scaledViewport });
            await task.promise;
        } catch (error) {
            console.error(`Failed to render page ${pageNumber}`, error);
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

        if (containerRef.current) observer.observe(containerRef.current);
        return () => {
          if (containerRef.current) {
            // eslint-disable-next-line react-hooks/exhaustive-deps
            observer.unobserve(containerRef.current);
          }
        };
    }, []);

    useEffect(() => {
        if (isVisible) renderPage();
    }, [isVisible, renderPage]);

    return (
        <div 
            ref={containerRef}
            className="relative group flex flex-col items-center gap-2 p-2 rounded-lg border-2 transition-all cursor-pointer"
            onClick={onSelect}
        >
             <div className="absolute top-3 right-3 z-10">
                <Checkbox checked={isSelected} className="h-7 w-7 bg-background" />
             </div>
             <div className={`relative w-full aspect-[8.5/11] bg-muted rounded-md flex items-center justify-center overflow-hidden ${isSelected ? 'border-primary border-2' : 'border-transparent border-2 hover:border-primary/50'}`}>
                {isLoading && <Loader2 className="w-6 h-6 text-primary animate-spin" />}
                <canvas ref={canvasRef} className={`rounded-md shadow-sm max-w-full max-h-full object-contain ${isLoading ? 'hidden' : ''}`} />
             </div>
             <p className="text-sm font-medium">Page {pageNumber}</p>
        </div>
    );
}

interface ImportDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  pdfDoc: PdfDocumentInfo;
  onImport: (pagesToImport: number[]) => void;
}

function ImportDialog({ isOpen, onOpenChange, pdfDoc, onImport }: ImportDialogProps) {
  const [selectedPages, setSelectedPages] = useState<number[]>([]);

  useEffect(() => {
    if (isOpen && pdfDoc) {
      // Select all pages by default
      setSelectedPages(Array.from({ length: pdfDoc.numPages }, (_, i) => i + 1));
    } else if (!isOpen) {
      setSelectedPages([]);
    }
  }, [isOpen, pdfDoc]);

  const togglePageSelection = (pageNum: number) => {
    setSelectedPages(prev => 
      prev.includes(pageNum) 
        ? prev.filter(p => p !== pageNum)
        : [...prev, pageNum]
    );
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedPages(Array.from({ length: pdfDoc.numPages }, (_, i) => i + 1));
    } else {
      setSelectedPages([]);
    }
  };
  
  const handleImport = () => {
    onImport(selectedPages.sort((a, b) => a - b));
    onOpenChange(false);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl w-[95vw] h-[90vh] flex flex-col rounded-lg">
        <DialogHeader>
          <DialogTitle>Import Pages</DialogTitle>
          <DialogDescription>Select pages from <span className="font-semibold text-primary">{pdfDoc?.file.name}</span> to add to the organizer.</DialogDescription>
        </DialogHeader>
        
        <div className="py-2 border-b">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                    <Checkbox
                        id="import-select-all"
                        checked={pdfDoc?.numPages > 0 && selectedPages.length === pdfDoc?.numPages}
                        onCheckedChange={(checked) => handleSelectAll(checked as boolean)}
                    />
                    <Label htmlFor="import-select-all" className="cursor-pointer text-sm">
                        {selectedPages.length === pdfDoc?.numPages ? 'Deselect All' : 'Select All'}
                    </Label>
                </div>
                <div className="flex items-center gap-4 sm:justify-end">
                    <p className="text-sm text-muted-foreground">{selectedPages.length} of {pdfDoc?.numPages} pages selected.</p>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>Cancel</Button>
                        <Button onClick={handleImport} disabled={selectedPages.length === 0} size="sm">
                            Import ({selectedPages.length}) Pages
                        </Button>
                    </div>
                </div>
            </div>
        </div>

        <ScrollArea className="flex-1 -mx-6 px-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 py-4">
            {pdfDoc && Array.from({ length: pdfDoc.numPages }, (_, i) => i + 1).map(pageNum => (
              <ImportPagePreview
                key={pageNum}
                pdfDoc={pdfDoc.doc}
                pageNumber={pageNum}
                onSelect={() => togglePageSelection(pageNum)}
                isSelected={selectedPages.includes(pageNum)}
              />
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}


interface PdfPageSelectorDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  pdfDocs: PdfDocumentInfo[];
  onPageSelect: (docId: string, pageNum: number) => void;
  onAddFile: (file: File, pagesToImport?: number[]) => Promise<PdfDocumentInfo | null>;
  isPageSelecting: boolean;
}

export function PdfPageSelectorDialog({ 
  isOpen, 
  onOpenChange, 
  pdfDocs: initialPdfDocs, 
  onPageSelect,
  onAddFile,
  isPageSelecting,
}: PdfPageSelectorDialogProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [pdfDocs, setPdfDocs] = useState<PdfDocumentInfo[]>(initialPdfDocs);
    const [pagesMeta, setPagesMeta] = useState<PageMetadata[]>([]);
    const [deletedPageKeys, setDeletedPageKeys] = useState<Set<string>>(new Set());
    const [deletionHistory, setDeletionHistory] = useState<string[][]>([]);
    const [selectedPageKeys, setSelectedPageKeys] = useState<string[]>([]);
    const [isDownloading, setIsDownloading] = useState(false);
    const { toast } = useToast();
    const [downloadFormat, setDownloadFormat] = useState<'image/png' | 'image/jpeg' | 'image/webp' | 'application/pdf'>('image/png');
    
    const [isConfirmDeleteDialogOpen, setIsConfirmDeleteDialogOpen] = useState(false);
    const [pagesToDelete, setPagesToDelete] = useState<string[] | null>(null);

    const [searchMode, setSearchMode] = useState<'text' | 'range'>('text');
    const [searchValue, setSearchValue] = useState('');
    
    const [isImporting, setIsImporting] = useState(false);
    const [pendingImportDoc, setPendingImportDoc] = useState<PdfDocumentInfo | null>(null);
    const [insertionIndex, setInsertionIndex] = useState<number | null>(null);

    const generatePageKey = (docId: string, pageNumber: number) => `${docId}__${pageNumber}`;

    const visiblePages = pagesMeta.filter(p => !deletedPageKeys.has(generatePageKey(p.docId, p.pageNumber)));
    
    const filteredPages = searchMode === 'text'
      ? visiblePages.filter(p =>
          p.name.toLowerCase().includes(searchValue.toLowerCase()) || p.pageNumber.toString().includes(searchValue)
        )
      : visiblePages;
    
    const visiblePageKeys = visiblePages.map(p => generatePageKey(p.docId, p.pageNumber));

    useEffect(() => {
        if (initialPdfDocs.length > 0 && isOpen) {
            setPdfDocs(initialPdfDocs);
            setIsLoading(true);
            const allMeta: PageMetadata[] = [];
            initialPdfDocs.forEach(docInfo => {
                const pageNumbers = docInfo.pagesToImport || Array.from({ length: docInfo.numPages }, (_, i) => i + 1);
                pageNumbers.forEach(pageNum => {
                    allMeta.push({
                        docId: docInfo.id,
                        docName: docInfo.file.name,
                        pageNumber: pageNum,
                        rotation: 0,
                        name: `${docInfo.file.name} - Page ${pageNum}`,
                    });
                });
            });
            setPagesMeta(allMeta);
            setIsLoading(false);
            setDeletedPageKeys(new Set());
            setSelectedPageKeys([]);
            setDeletionHistory([]);
            setSearchValue('');
            setSearchMode('text');
        }
    }, [initialPdfDocs, isOpen]);
    
    const handleAddAfter = useCallback((pageMeta: PageMetadata) => {
        const index = pagesMeta.findIndex(p => generatePageKey(p.docId, p.pageNumber) === generatePageKey(pageMeta.docId, pageMeta.pageNumber));
        setInsertionIndex(index + 1);
        fileInputRef.current?.click();
    }, [pagesMeta]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && file.type === 'application/pdf') {
          const newDoc = await onAddFile(file);
          if (newDoc) {
              setPdfDocs(prev => [...prev, newDoc]);
              setPendingImportDoc(newDoc);
              setIsImporting(true);
          }
      } else if (file) {
        toast({ title: "Invalid File", description: "Please select a PDF file to import pages.", variant: "destructive" });
      }
      if (e.target) {
        e.target.value = '';
      }
    };
    
    const handleImportPages = (pagesToImport: number[]) => {
      if (!pendingImportDoc) return;
      
      const newMetas = pagesToImport.map(pageNum => ({
        docId: pendingImportDoc.id,
        docName: pendingImportDoc.file.name,
        pageNumber: pageNum,
        rotation: 0,
        name: `${pendingImportDoc.file.name} - Page ${pageNum}`,
      }));

      setPagesMeta(prev => {
        const newArray = [...prev];
        if (insertionIndex !== null) {
          newArray.splice(insertionIndex, 0, ...newMetas);
        } else {
          // Fallback to appending at the end
          newArray.push(...newMetas);
        }
        return newArray;
      });
      setInsertionIndex(null);
    };

    const handleSelectPageForEdit = (docId: string, pageNum: number) => {
        onPageSelect(docId, pageNum); 
    };
    
    const handleToggleSelection = (docId: string, pageNumber: number) => {
        const key = generatePageKey(docId, pageNumber);
        setSelectedPageKeys(prev => 
            prev.includes(key) 
                ? prev.filter(pKey => pKey !== key) 
                : [...prev, key]
        );
    };

    const handleToggleSelectAll = () => {
        if (selectedPageKeys.length === visiblePageKeys.length) {
            setSelectedPageKeys([]);
        } else {
            setSelectedPageKeys(visiblePageKeys);
        }
    };
    
    const handleRangeSelect = () => {
        if (!searchValue) return;
        const newSelected = new Set(selectedPageKeys);
        
        visiblePages.forEach((p, index) => {
          const ranges = searchValue.split(',');
          let shouldAdd = false;
          for (const range of ranges) {
            const trimmedRange = range.trim();
            if (trimmedRange.includes('-')) {
                const [start, end] = trimmedRange.split('-').map(Number);
                if (!isNaN(start) && !isNaN(end) && (index + 1) >= Math.min(start, end) && (index + 1) <= Math.max(start, end)) {
                    shouldAdd = true;
                    break;
                }
            } else {
                const num = Number(trimmedRange);
                if (!isNaN(num) && (index + 1) === num) {
                    shouldAdd = true;
                    break;
                }
            }
          }
          if (shouldAdd) {
            newSelected.add(generatePageKey(p.docId, p.pageNumber));
          }
        });
        
        setSelectedPageKeys(Array.from(newSelected));
        setSearchValue('');
        toast({ title: "Selection Updated", description: `${newSelected.size} pages are now selected.`});
    };

    const handleSearchKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && searchMode === 'range') {
        handleRangeSelect();
      }
    };

    const handlePageRotate = (docId: string, pageNumber: number, degree: number) => {
        setPagesMeta(prev => prev.map(p => 
            p.docId === docId && p.pageNumber === pageNumber 
                ? { ...p, rotation: (p.rotation + degree + 360) % 360 }
                : p
        ));
    };

    const confirmDelete = (keys: string[]) => {
        setPagesToDelete(keys);
        setIsConfirmDeleteDialogOpen(true);
    };

    const executeDelete = () => {
        if (!pagesToDelete) return;
        setDeletedPageKeys(prev => new Set([...prev, ...pagesToDelete]));
        setDeletionHistory(prev => [...prev, pagesToDelete]);
        setSelectedPageKeys(prev => prev.filter(key => !pagesToDelete.includes(key)));
        setPagesToDelete(null);
    };
    
    const handleUndoDelete = () => {
        if (deletionHistory.length === 0) return;
        const lastDeletedGroup = deletionHistory[deletionHistory.length - 1];
        setDeletedPageKeys(prev => {
            const newSet = new Set(prev);
            lastDeletedGroup.forEach(key => newSet.delete(key));
            return newSet;
        });
        setDeletionHistory(prev => prev.slice(0, -1));
    };

    const handleNameChange = (docId: string, pageNumber: number, newName: string) => {
        setPagesMeta(prev => prev.map(p => 
            p.docId === docId && p.pageNumber === pageNumber ? { ...p, name: newName } : p
        ));
    };

    const downloadPage = useCallback(async (pageMeta: PageMetadata) => {
         const sourceDoc = pdfDocs.find(d => d.id === pageMeta.docId);
         if (!sourceDoc) return;

         toast({ title: `Downloading ${pageMeta.name}...`});
         try {
             const page = await sourceDoc.doc.getPage(pageMeta.pageNumber);
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
    }, [pdfDocs, toast]);
    
    const handleDownloadSelected = async () => {
        if (selectedPageKeys.length === 0) return;

        setIsDownloading(true);
        toast({
            title: "Download Started",
            description: `Preparing ${selectedPageKeys.length} page(s) for download...`
        });

        const pagesToDownload = selectedPageKeys.map(key => {
          const [docId, pageNum] = key.split('__');
          return pagesMeta.find(p => p.docId === docId && p.pageNumber === parseInt(pageNum))!;
        });
        
        if (downloadFormat === 'application/pdf') {
            try {
                const firstPageMeta = pagesToDownload[0];
                const firstDoc = pdfDocs.find(d => d.id === firstPageMeta.docId)!.doc;
                const firstPageForPdf = await firstDoc.getPage(firstPageMeta.pageNumber);
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
                    const doc = pdfDocs.find(d => d.id === pageMeta.docId)!.doc;
                    const page = await doc.getPage(pageMeta.pageNumber);
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
                    const doc = pdfDocs.find(d => d.id === pageMeta.docId)!.doc;
                    const page = await doc.getPage(pageMeta.pageNumber);
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
            description: `${selectedPageKeys.length} page(s) have been downloaded.`,
        });
        setSelectedPageKeys([]); // Deselect after download
    };

    return (
        <>
            <Dialog open={isOpen} onOpenChange={(open) => {
              if (!open) {
                  setPagesMeta([]);
                  setSelectedPageKeys([]);
                  setDeletedPageKeys(new Set());
                  setDeletionHistory([]);
              }
              onOpenChange(open);
            }}>
                <DialogContent
                  onOpenAutoFocus={(e) => e.preventDefault()}
                  className="max-w-6xl w-[95vw] h-[90vh] rounded-lg flex flex-col"
                >
                    <DialogHeader>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <div className="flex-1">
                              <DialogTitle>Organize and Select Pages</DialogTitle>
                              <DialogDescription className="hidden sm:block">
                                  Click a page to edit it, or use the icons to manage pages.
                              </DialogDescription>
                          </div>
                           <input 
                              type="file"
                              ref={fileInputRef}
                              onChange={handleFileChange}
                              accept="application/pdf"
                              className="hidden"
                            />
                           {!isLoading && (
                            <div className="relative w-full sm:w-auto sm:min-w-[200px] sm:max-w-xs">
                                <div className="absolute left-2 top-1/2 -translate-y-1/2 h-full flex items-center">
                                    {searchMode === 'text' ? 
                                        <Search className="h-4 w-4 text-muted-foreground" /> :
                                        <List className="h-4 w-4 text-muted-foreground" />
                                    }
                                </div>
                                <Input 
                                    placeholder={searchMode === 'text' ? 'Search by name...' : 'e.g., 1-5, 8'}
                                    value={searchValue}
                                    onChange={(e) => setSearchValue(e.target.value)}
                                    onKeyDown={handleSearchKeyDown}
                                    className="pl-8 pr-10 h-9"
                                />
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost" size="icon"
                                            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                                            onClick={() => {
                                                setSearchMode(prev => prev === 'text' ? 'range' : 'text');
                                                setSearchValue('');
                                            }}
                                        >
                                            {searchMode === 'text' ? <List size={16}/> : <Search size={16}/>}
                                        </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Switch to {searchMode === 'text' ? 'Range Select' : 'Text Search'}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                           )}
                      </div>
                    </DialogHeader>
                    
                    {!isLoading && (
                         <div className="flex flex-col gap-4 py-2 border-b">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-4 flex-wrap">
                                    <div className="flex items-center gap-2">
                                    <Checkbox
                                        id="select-all"
                                        checked={visiblePageKeys.length > 0 && selectedPageKeys.length === visiblePageKeys.length}
                                        onCheckedChange={handleToggleSelectAll}
                                    />
                                    <Label htmlFor="select-all" className="cursor-pointer text-sm">
                                        {selectedPageKeys.length === visiblePageKeys.length ? 'Deselect All' : `Select All (${visiblePages.length})`}
                                    </Label>
                                    </div>
                                    {selectedPageKeys.length > 0 && (
                                    <Button variant="destructive-outline" size="sm" onClick={() => confirmDelete(selectedPageKeys)}>
                                        <Trash2 size={16} className="mr-2"/>
                                        Delete ({selectedPageKeys.length})
                                    </Button>
                                    )}
                                    {deletionHistory.length > 0 && (
                                    <div className="text-sm text-muted-foreground">
                                        {deletedPageKeys.size} page(s) deleted.
                                        <Button variant="link" className="p-1 h-auto" onClick={handleUndoDelete}>Undo</Button>
                                    </div>
                                )}
                                </div>
                                <div className="flex items-center gap-2 flex-wrap">
                                <Select value={downloadFormat} onValueChange={(v: 'image/png' | 'image/jpeg' | 'image/webp' | 'application/pdf') => setDownloadFormat(v)}>
                                    <SelectTrigger className="w-[120px] h-9 text-sm">
                                        <SelectValue placeholder="Format" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="application/pdf">PDF</SelectItem>
                                        <SelectItem value="image/png">PNG</SelectItem>
                                        <SelectItem value="image/jpeg">JPEG</SelectItem>
                                        <SelectItem value="image/webp">WEBP</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Button onClick={handleDownloadSelected} disabled={selectedPageKeys.length === 0 || isDownloading} size="sm" className="min-w-[150px]">
                                    {isDownloading ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <Download className="mr-2 h-4 w-4" />
                                    )}
                                    Download ({selectedPageKeys.length})
                                </Button>
                                </div>
                            </div>
                         </div>
                    )}
                   
                    {isLoading || isPageSelecting ? (
                        <div className="flex-1 flex items-center justify-center">
                            <Loader2 className="w-8 h-8 text-primary animate-spin" />
                            <p className="ml-4 text-muted-foreground">{isPageSelecting ? 'Processing page...' : 'Loading PDF...'}</p>
                        </div>
                    ) : (
                        <ScrollArea className="flex-1 -mx-6 px-6">
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 py-4">
                               {filteredPages.map(pageMeta => {
                                const sourceDoc = pdfDocs.find(d => d.id === pageMeta.docId);
                                if (!sourceDoc) return null;
                                return (
                                   <PagePreview
                                       key={generatePageKey(pageMeta.docId, pageMeta.pageNumber)}
                                       pdfDoc={sourceDoc.doc}
                                       pageMeta={pageMeta}
                                       onSelectForEdit={() => handleSelectPageForEdit(pageMeta.docId, pageMeta.pageNumber)}
                                       onSelectForImport={() => handleToggleSelection(pageMeta.docId, pageMeta.pageNumber)}
                                       isSelected={selectedPageKeys.includes(generatePageKey(pageMeta.docId, pageMeta.pageNumber))}
                                       onRotate={handlePageRotate}
                                       onDelete={() => confirmDelete([generatePageKey(pageMeta.docId, pageMeta.pageNumber)])}
                                       onNameChange={handleNameChange}
                                       onDownload={downloadPage}
                                       onAddAfter={handleAddAfter}
                                   />
                               )})}
                            </div>
                             {filteredPages.length === 0 && (
                                <div className="text-center py-16 text-muted-foreground">
                                    <p>No pages found for your search.</p>
                                </div>
                            )}
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
            
            {pendingImportDoc && (
                <ImportDialog
                    isOpen={isImporting}
                    onOpenChange={(open) => {
                        if (!open) {
                            setPendingImportDoc(null);
                        }
                        setIsImporting(open);
                    }}
                    pdfDoc={pendingImportDoc}
                    onImport={handleImportPages}
                />
            )}
        </>
    );
}
