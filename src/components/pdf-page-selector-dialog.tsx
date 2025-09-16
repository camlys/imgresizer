
"use client";

import React, { useState, useEffect, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';

interface PdfPageSelectorDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  pdfDoc: pdfjsLib.PDFDocumentProxy | null;
  onPageSelect: (pageNumber: number) => void;
}

function PagePreview({ pdfDoc, pageNumber, onSelect }: { pdfDoc: pdfjsLib.PDFDocumentProxy, pageNumber: number, onSelect: () => void }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        let renderTask: pdfjsLib.RenderTask | null = null;
        
        async function renderPage() {
            try {
                const page = await pdfDoc.getPage(pageNumber);
                const canvas = canvasRef.current;
                if (!canvas || !isMounted) return;

                const viewport = page.getViewport({ scale: 1.0 });
                const context = canvas.getContext('2d');
                if (!context) return;
                
                canvas.height = viewport.height;
                canvas.width = viewport.width;
                
                renderTask = page.render({ canvasContext: context, viewport: viewport });
                await renderTask.promise;
                if(isMounted) setIsLoading(false);
            } catch (error) {
                console.error(`Failed to render page ${pageNumber}`, error);
            }
        }
        
        renderPage();

        return () => {
            isMounted = false;
            if (renderTask) {
                renderTask.cancel();
            }
        }
    }, [pdfDoc, pageNumber]);

    return (
        <div
            className="flex flex-col items-center gap-2 p-2 rounded-lg border border-transparent hover:border-primary hover:bg-primary/10 cursor-pointer transition-all"
            onClick={onSelect}
        >
            <div className="relative w-full aspect-[8.5/11] bg-muted rounded-md flex items-center justify-center">
                {isLoading && <Loader2 className="w-6 h-6 text-primary animate-spin" />}
                <canvas ref={canvasRef} className={`rounded-md shadow-sm ${isLoading ? 'hidden' : ''}`} />
            </div>
            <p className="text-sm font-medium">Page {pageNumber}</p>
        </div>
    );
}


export function PdfPageSelectorDialog({ isOpen, onOpenChange, pdfDoc, onPageSelect }: PdfPageSelectorDialogProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [pageNumbers, setPageNumbers] = useState<number[]>([]);

    useEffect(() => {
        if (pdfDoc) {
            setIsLoading(true);
            const numPages = pdfDoc.numPages;
            setPageNumbers(Array.from({ length: numPages }, (_, i) => i + 1));
            setIsLoading(false);
        }
    }, [pdfDoc]);

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Select a Page to Edit</DialogTitle>
                    <DialogDescription>
                        Your PDF has multiple pages. Click on a page preview to select it for editing.
                    </DialogDescription>
                </DialogHeader>
                {isLoading ? (
                    <div className="flex-1 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                        <p className="ml-4 text-muted-foreground">Loading page previews...</p>
                    </div>
                ) : (
                    <ScrollArea className="flex-1 -mx-6 px-6">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 py-4">
                           {pageNumbers.map(pageNum => (
                               <PagePreview
                                   key={pageNum}
                                   pdfDoc={pdfDoc!}
                                   pageNumber={pageNum}
                                   onSelect={() => onPageSelect(pageNum)}
                               />
                           ))}
                        </div>
                    </ScrollArea>
                )}
            </DialogContent>
        </Dialog>
    );
}

