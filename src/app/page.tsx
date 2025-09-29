
"use client";

import React from 'react';
import type { Metadata } from 'next';
import { AppHeader } from '@/components/app-header';
import { ControlPanel } from '@/components/control-panel';
import { ImageCanvas } from '@/components/image-canvas';
import { UploadPlaceholder } from '@/components/upload-placeholder';
import type { ImageSettings, OriginalImage, CropSettings, TextOverlay, SignatureOverlay, CollageSettings, ImageLayer, SheetSettings, CollagePage, CornerPoints, DrawingPath } from '@/lib/types';
import { useToast } from "@/hooks/use-toast"
import { SiteFooter } from '@/components/site-footer';
import { Loader2 } from 'lucide-react';
import jsPDF from 'jspdf';
import * as pdfjsLib from 'pdfjs-dist';
import { applyPerspectiveTransform, autoDetectBorders } from '@/lib/utils';
import { HeroSection } from '@/components/hero-section';
import { PdfPageSelectorDialog } from '@/components/pdf-page-selector-dialog';
import { TextEditor } from '@/components/text-editor';
import { FeatureGrid } from '@/components/feature-grid';
import { InstallPwaBanner } from '@/components/install-pwa-banner';

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
  drawing: {
    paths: [],
    brushColor: '#ff0000',
    brushSize: 10,
    isErasing: false,
  },
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

const initialSheetSettings: SheetSettings = {
  enabled: false,
  horizontalLines: true,
  verticalLines: false,
  lineColor: '#d1d5db',
  spacing: 20,
  marginTop: 20,
  marginLeft: 20,
};

const initialCollageSettings: CollageSettings = {
  width: 2481, // A4 Portrait at 300 DPI
  height: 3507, // A4 Portrait at 300 DPI
  backgroundColor: '#ffffff',
  pages: [{
    id: Date.now().toString(),
    layers: [],
    texts: [],
    signatures: [],
    sheet: initialSheetSettings,
  }],
  activePageIndex: 0,
  format: 'application/pdf',
  quality: 1.0,
  layout: null,
  syncSheetSettings: false,
};


export default function Home() {
  const [originalImage, setOriginalImage] = React.useState<OriginalImage | null>(null);
  const [settings, setSettings] = React.useState<ImageSettings>(initialSettings);
  const [collageSettings, setCollageSettings] = React.useState<CollageSettings>(initialCollageSettings);
  const [editorMode, setEditorMode] = React.useState<'single' | 'collage'>('single');
  const [activeTab, setActiveTab] = React.useState('resize');
  const [processedSize, setProcessedSize] = React.useState<number | null>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);

  const [pendingCrop, setPendingCrop] = React.useState<CropSettings | null>(null);
  const [imageElement, setImageElement] = React.useState<HTMLImageElement | null>(null);
  const INSET_PX = 38; // Approx 10mm

  // PDF Page Selection
  const [isPdfSelectorOpen, setIsPdfSelectorOpen] = React.useState(false);
  const [pdfDoc, setPdfDoc] = React.useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [pdfFile, setPdfFile] = React.useState<File | null>(null);
  const [pdfSelectionSource, setPdfSelectionSource] = React.useState<'single' | 'collage'>('single');
  const [isFromMultiPagePdf, setIsFromMultiPagePdf] = React.useState(false);
  const [isPageSelecting, setIsPageSelecting] = React.useState(false);

  // Text Editing
  const [selectedTextId, setSelectedTextId] = React.useState<string | null>(null);
  const [editingTextId, setEditingTextId] = React.useState<string | null>(null);

  // Signature Editing
  const [selectedSignatureId, setSelectedSignatureId] = React.useState<string | null>(null);

  // Collage State
  const [selectedLayerIds, setSelectedLayerIds] = React.useState<string[]>([]);
  const activePage = collageSettings.pages[collageSettings.activePageIndex];

  React.useEffect(() => {
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
    if (tab === 'collage' && editorMode !== 'collage') {
        setEditorMode('collage');
        if (originalImage && imageElement && activePage.layers.length === 0) {
            const crop = settings.crop || { x: 0, y: 0, width: originalImage.width, height: originalImage.height };
            
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = crop.width;
            tempCanvas.height = crop.height;
            const tempCtx = tempCanvas.getContext('2d');
            if (tempCtx) {
                tempCtx.drawImage(imageElement, crop.x, crop.y, crop.width, crop.height, 0, 0, crop.width, crop.height);
                const croppedImageSrc = tempCanvas.toDataURL();
                const croppedImage = new Image();
                croppedImage.onload = () => {
                    const MARGIN_PERCENT = 2;
                    const gridCols = 2;
                    const itemWidthPercent = (100 - (gridCols + 1) * MARGIN_PERCENT) / gridCols;
                    const xPercent = MARGIN_PERCENT + 0 * (itemWidthPercent + MARGIN_PERCENT);
                    const yPercent = MARGIN_PERCENT + 0 * (itemWidthPercent + MARGIN_PERCENT);

                    const newLayer: ImageLayer = {
                        id: Date.now().toString(),
                        src: croppedImageSrc,
                        img: croppedImage,
                        x: xPercent + itemWidthPercent / 2, // Center X
                        y: yPercent + itemWidthPercent / 2, // Center Y
                        width: itemWidthPercent,
                        rotation: 0,
                        opacity: 1,
                        originalWidth: croppedImage.width,
                        originalHeight: croppedImage.height,
                    };
                    const newPages = [...collageSettings.pages];
                    newPages[collageSettings.activePageIndex] = { ...activePage, layers: [newLayer] };
                    setCollageSettings(prev => ({ ...prev, pages: newPages, layout: null }));
                    setSelectedLayerIds([newLayer.id]);
                };
                croppedImage.src = croppedImageSrc;
            }
        }
    } else if (tab !== 'collage' && editorMode !== 'single') {
        setEditorMode('single');
    }

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
    if (tab !== 'collage') {
      setSelectedLayerIds([]);
    }
  };
  
    const renderPdfPageToDataURL = React.useCallback(async (pdfDoc: pdfjsLib.PDFDocumentProxy, pageNum: number): Promise<string> => {
        const page = await pdfDoc.getPage(pageNum);
        const viewport = page.getViewport({ scale: 4.0 });

        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        if (!tempCtx) {
            throw new Error("Could not create canvas context to render PDF.");
        }
        tempCanvas.width = viewport.width;
        tempCanvas.height = viewport.height;

        const renderContext = { canvasContext: tempCtx, viewport: viewport };
        await page.render(renderContext).promise;
        return tempCanvas.toDataURL('image/png');
    }, []);

    const addImageToCollageFromSrc = React.useCallback((src: string) => {
        const img = new Image();
        img.onload = () => {
             const MARGIN_PERCENT = 2;
             const numLayers = activePage.layers.length;
             let x, y, width, height;

             const gridCols = 2;
             const itemWidthPercent = (100 - (gridCols + 1) * MARGIN_PERCENT) / gridCols;

             const col = numLayers % gridCols;
             const row = Math.floor(numLayers / gridCols);
             
             if (numLayers < 4) {
                 const xPercent = MARGIN_PERCENT + col * (itemWidthPercent + MARGIN_PERCENT);
                 const yPercent = MARGIN_PERCENT + row * (itemWidthPercent + MARGIN_PERCENT); // Assuming square-ish grid items for Y
                 
                 const newLayer: ImageLayer = {
                    id: Date.now().toString(),
                    src: img.src,
                    img: img,
                    x: xPercent + itemWidthPercent / 2, // Center X
                    y: yPercent + itemWidthPercent / 2, // Center Y
                    width: itemWidthPercent,
                    rotation: 0,
                    opacity: 1,
                    originalWidth: img.width,
                    originalHeight: img.height,
                };
                setCollageSettings(prev => {
                  const newPages = [...prev.pages];
                  const updatedPage = { ...newPages[prev.activePageIndex], layers: [...newPages[prev.activePageIndex].layers, newLayer] };
                  newPages[prev.activePageIndex] = updatedPage;
                  return { ...prev, pages: newPages };
                });
                setSelectedLayerIds([newLayer.id]);
             } else {
                 // Fallback for more than 4 images
                 const newLayer: ImageLayer = {
                    id: Date.now().toString(),
                    src: img.src,
                    img: img,
                    x: 50,
                    y: 50,
                    width: 50,
                    rotation: 0,
                    opacity: 1,
                    originalWidth: img.width,
                    originalHeight: img.height,
                };
                 setCollageSettings(prev => {
                  const newPages = [...prev.pages];
                  const updatedPage = { ...newPages[prev.activePageIndex], layers: [...newPages[prev.activePageIndex].layers, newLayer] };
                  newPages[prev.activePageIndex] = updatedPage;
                  return { ...prev, pages: newPages };
                });
                setSelectedLayerIds([newLayer.id]);
             }
            setActiveTab('collage');
            setEditorMode('collage');
        };
        img.onerror = () => {
            toast({ title: "Error", description: "Could not load image to add to collage.", variant: "destructive" });
        }
        img.src = src;
    }, [activePage, toast, collageSettings.width, collageSettings.height, collageSettings.activePageIndex, collageSettings.pages]);


    const loadPageAsImage = React.useCallback(async (pdfDoc: pdfjsLib.PDFDocumentProxy, pageNum: number, originalFileSize: number, isMultiPage: boolean) => {
    setIsLoading(true);
    try {
      const dataUrl = await renderPdfPageToDataURL(pdfDoc, pageNum);
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
      img.src = dataUrl;
    } catch (error) {
        console.error("Error processing PDF page:", error);
        toast({ title: "PDF Error", description: "Could not process the selected PDF page.", variant: "destructive" });
        setIsLoading(false);
    }
  }, [toast, renderPdfPageToDataURL]);


  const handlePdfPageSelect = React.useCallback(async (pageNum: number) => {
      if (pdfDoc && pdfFile) {
        setIsPageSelecting(true);
        setIsPdfSelectorOpen(false);

        try {
            if (pdfSelectionSource === 'collage') {
                const dataUrl = await renderPdfPageToDataURL(pdfDoc, pageNum);
                addImageToCollageFromSrc(dataUrl);
            } else {
                // Defer heavy operation to allow UI to update
                setTimeout(() => {
                    loadPageAsImage(pdfDoc, pageNum, pdfFile.size, pdfDoc.numPages > 1);
                }, 50);
            }
        } catch (error) {
            console.error("Error handling PDF page selection:", error);
            toast({ title: "Error", description: "Failed to process PDF page.", variant: "destructive" });
        } finally {
            setIsPageSelecting(false);
        }
      }
  }, [pdfDoc, pdfFile, loadPageAsImage, pdfSelectionSource, renderPdfPageToDataURL, addImageToCollageFromSrc, toast]);

  const handleMultiplePdfPageSelect = React.useCallback(async (pageNums: number[]) => {
    if (!pdfDoc) return;
  
    setIsPageSelecting(true);
    setIsPdfSelectorOpen(false);
    toast({ title: "Processing...", description: `Adding ${pageNums.length} pages to the collage.` });
  
    try {
      let updatedPages = [...collageSettings.pages];
      let currentActivePageIndex = collageSettings.activePageIndex;
      let lastSelectedLayerIds: string[] = [];
  
      const MARGIN = 12; // 1mm at 300 dpi
      const GRID_COLS = 2;
      const GRID_ROWS = 2;
      const MAX_IMAGES_PER_PAGE = 4;
  
      // Batch-process all page renderings first
      const imagePromises = pageNums.map(pageNum =>
        renderPdfPageToDataURL(pdfDoc, pageNum).then(dataUrl =>
          new Promise<HTMLImageElement>((resolve, reject) => {
            const image = new Image();
            image.onload = () => resolve(image);
            image.onerror = () => reject(new Error("Image load error"));
            image.src = dataUrl;
          })
        )
      );
  
      const newImages = await Promise.all(imagePromises);
  
      // Now, update the state in a single batch
      newImages.forEach((img, index) => {
        const pageNum = pageNums[index];
        let activePage = updatedPages[currentActivePageIndex];
  
        // If current page is full, create a new one
        if (activePage.layers.length >= MAX_IMAGES_PER_PAGE) {
          const newPage: CollagePage = {
            id: `${Date.now()}-page-${pageNum}`,
            layers: [],
            texts: [],
            signatures: [],
            sheet: initialSheetSettings,
          };
          updatedPages.push(newPage);
          currentActivePageIndex = updatedPages.length - 1;
          activePage = newPage;
        }
  
        // Add layer to the (potentially new) active page
        const layerIndex = activePage.layers.length;
        const itemWidth = (collageSettings.width - MARGIN * (GRID_COLS + 1)) / GRID_COLS;
        const itemHeight = (collageSettings.height - MARGIN * (GRID_ROWS + 1)) / GRID_ROWS;
        const row = Math.floor(layerIndex / GRID_COLS);
        const col = layerIndex % GRID_COLS;
  
        const newLayer: ImageLayer = {
          id: `${Date.now()}-${pageNum}`,
          src: img.src,
          img: img,
          x: MARGIN + col * (itemWidth + MARGIN),
          y: MARGIN + row * (itemHeight + MARGIN),
          width: itemWidth,
          rotation: 0,
          opacity: 1,
          originalWidth: img.width,
          originalHeight: img.height,
        };
  
        activePage.layers.push(newLayer);
        lastSelectedLayerIds = [newLayer.id];
      });
  
      // Single state update
      setCollageSettings(prev => ({
        ...prev,
        pages: updatedPages,
        activePageIndex: currentActivePageIndex,
      }));
  
      if (lastSelectedLayerIds.length > 0) {
        setSelectedLayerIds(lastSelectedLayerIds);
      }
      setActiveTab('collage');
      setEditorMode('collage');
  
    } catch (error) {
      console.error("Error handling multiple PDF page selection:", error);
      toast({ title: "Error", description: "Failed to process one or more PDF pages.", variant: "destructive" });
    } finally {
      setIsPageSelecting(false);
    }
  }, [pdfDoc, renderPdfPageToDataURL, toast, collageSettings]);


  const handleImageUpload = async (file: File) => {
    setIsLoading(true);
    setPdfDoc(null);
    setPdfFile(null);
    setIsFromMultiPagePdf(false);
    setIsPageSelecting(false);
    
    // Reset collage mode if a new single file is uploaded
    setEditorMode('single');
    setCollageSettings(initialCollageSettings);
    setSelectedLayerIds([]);
    if (activeTab === 'collage') setActiveTab('resize');

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
                setPdfSelectionSource('single');
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

   const addImageToCollage = async (file: File) => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        addImageToCollageFromSrc(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else if (file.type === 'application/pdf') {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const doc = await pdfjsLib.getDocument(arrayBuffer).promise;
        setPdfDoc(doc);
        setPdfFile(file);
        setPdfSelectionSource('collage');
        setIsPdfSelectorOpen(true);
      } catch (error) {
        console.error("Error processing PDF for collage:", error);
        toast({ title: "PDF Error", description: "Could not process PDF.", variant: "destructive" });
      }
    } else {
      toast({ title: "Invalid File", description: "Only image or PDF files can be added.", variant: "destructive" });
    }
  };

  const updateSettings = React.useCallback((newSettings: Partial<ImageSettings>) => {
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

  const updateCollageSettings = React.useCallback((newSettings: Partial<CollageSettings>) => {
    setCollageSettings(prev => {
      const updated = { ...prev, ...newSettings };
      const newActivePage = updated.pages[updated.activePageIndex];

      // Handle layer selection
      const currentSelectedLayerIds = selectedLayerIds;
      const existingLayerIds = newActivePage.layers.map(l => l.id);
      const newSelectedLayerIds = currentSelectedLayerIds.filter(id => existingLayerIds.includes(id));
      if (newSelectedLayerIds.length !== currentSelectedLayerIds.length) {
          setSelectedLayerIds(newSelectedLayerIds);
      }
      
      // Handle text selection
      const currentSelectedTextId = selectedTextId;
      if (currentSelectedTextId) {
          const textExists = newActivePage.texts.some(t => t.id === currentSelectedTextId);
          if (!textExists) {
              setSelectedTextId(null);
              setEditingTextId(null);
          }
      }

      // Handle signature selection
      const currentSelectedSignatureId = selectedSignatureId;
      if (currentSelectedSignatureId) {
          const signatureExists = newActivePage.signatures.some(s => s.id === currentSelectedSignatureId);
          if (!signatureExists) {
              setSelectedSignatureId(null);
          }
      }

      return updated;
    });
    setProcessedSize(null);
  }, [selectedLayerIds, selectedTextId, selectedSignatureId]);

  const handleAutoDetectBorder = React.useCallback(async () => {
    if (!imageElement) {
      toast({ title: "Error", description: "Image not loaded for border detection.", variant: "destructive" });
      return;
    }
    try {
      const newPoints = await autoDetectBorders(imageElement);
      updateSettings({ perspectivePoints: newPoints, cropMode: 'perspective' });
      setActiveTab('crop');
      toast({ title: "Success", description: "Border detected. Switched to Perspective mode." });
    } catch (e) {
      console.error(e);
      toast({ title: "Error", description: "Failed to auto-detect borders.", variant: "destructive" });
    }
  }, [imageElement, toast, updateSettings]);

  const handleApplyPerspectiveCrop = React.useCallback(async () => {
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
      };
      img.src = newDataUrl;

    } catch (e) {
      console.error(e);
      toast({ title: "Error", description: "Failed to apply perspective transformation.", variant: "destructive" });
    }
  }, [imageElement, settings.perspectivePoints, toast, INSET_PX]);

 const generateFinalCanvas = React.useCallback(async (pageToRender?: CollagePage, overrideSettings?: Partial<ImageSettings>, imageForCanvas?: HTMLImageElement): Promise<HTMLCanvasElement> => {
    return new Promise(async (resolve, reject) => {
        const currentQuality = overrideSettings?.quality ?? (editorMode === 'single' ? settings.quality : collageSettings.quality);

        if (editorMode === 'collage' && !overrideSettings) {
          const finalCanvas = document.createElement('canvas');
          const finalCtx = finalCanvas.getContext('2d');
          if (!finalCtx) return reject(new Error("Could not create collage canvas context."));
          
          const page = pageToRender || collageSettings.pages[collageSettings.activePageIndex];

          const { width, height, backgroundColor, format } = collageSettings;
          const { layers, sheet, texts, signatures } = page;
          finalCanvas.width = width;
          finalCanvas.height = height;
          
          if (backgroundColor !== 'transparent' || format !== 'image/png') {
            finalCtx.fillStyle = backgroundColor === 'transparent' ? '#ffffff' : backgroundColor;
            finalCtx.fillRect(0, 0, width, height);
          }
          
          if (sheet.enabled) {
              finalCtx.strokeStyle = sheet.lineColor;
              finalCtx.lineWidth = 1;
              if (sheet.horizontalLines) {
                  for (let y = sheet.marginTop; y < height; y += sheet.spacing) {
                      finalCtx.beginPath();
                      finalCtx.moveTo(sheet.marginLeft, y);
                      finalCtx.lineTo(width, y);
                      finalCtx.stroke();
                  }
              }
              if (sheet.verticalLines) {
                  for (let x = sheet.marginLeft; x < width; x += sheet.spacing) {
                      finalCtx.beginPath();
                      finalCtx.moveTo(x, sheet.marginTop);
                      finalCtx.lineTo(x, height);
                      finalCtx.stroke();
                  }
              }
          }

          // Draw layers in order
          for (const layer of layers) {
              const layerWidth = (layer.width / 100) * width;
              const layerHeight = layerWidth / (layer.originalWidth / layer.originalHeight);
              const layerX = (layer.x / 100) * width;
              const layerY = (layer.y / 100) * height;

              finalCtx.save();
              finalCtx.translate(layerX, layerY);
              finalCtx.rotate(layer.rotation * Math.PI / 180);
              finalCtx.globalAlpha = layer.opacity;
              finalCtx.drawImage(layer.img, -layerWidth / 2, -layerHeight / 2, layerWidth, layerHeight);
              finalCtx.restore();
          }
          
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
          return;
        }

        const currentImageElement = imageForCanvas || imageElement;
        if (!originalImage || !currentImageElement) return reject(new Error("No original image loaded."));
        
        try {
            const finalSettings = { ...settings, ...overrideSettings };
            const { width, height, rotation, flipHorizontal, flipVertical, crop, texts, signatures, adjustments, backgroundColor, drawing, format } = finalSettings;

            const adjustedCanvas = document.createElement('canvas');
            const adjustedCtx = adjustedCanvas.getContext('2d');
            if (!adjustedCtx) return reject(new Error("Could not create adjusted canvas context."));

            const cropData = crop || { x: 0, y: 0, width: currentImageElement.width, height: currentImageElement.height };
            adjustedCanvas.width = cropData.width;
            adjustedCanvas.height = cropData.height;

            adjustedCtx.drawImage(currentImageElement, cropData.x, cropData.y, cropData.width, cropData.height, 0, 0, cropData.width, cropData.height);
            
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

            if (backgroundColor !== 'transparent' || format !== 'image/png') {
                finalCtx.fillStyle = backgroundColor === 'transparent' ? '#ffffff' : backgroundColor;
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

            // Draw drawing paths
            finalCtx.lineCap = 'round';
            finalCtx.lineJoin = 'round';
            drawing.paths.forEach(path => {
                if (path.points.length < 2) return;
                finalCtx.strokeStyle = path.color;
                finalCtx.lineWidth = path.size;
                finalCtx.globalCompositeOperation = path.isEraser ? 'destination-out' : 'source-over';
                
                finalCtx.beginPath();
                finalCtx.moveTo(path.points[0].x, path.points[0].y);
                for (let i = 1; i < path.points.length; i++) {
                    finalCtx.lineTo(path.points[i].x, path.points[i].y);
                }
                finalCtx.stroke();
            });
            finalCtx.globalCompositeOperation = 'source-over'; // Reset composite operation

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
}, [originalImage, imageElement, settings, editorMode, collageSettings]);

  const updateProcessedSize = React.useCallback(async () => {
    try {
        const pageToRender = editorMode === 'collage' ? activePage : undefined;
        const currentFormat = editorMode === 'single' ? settings.format : collageSettings.format;
        const currentQuality = editorMode === 'single' ? settings.quality : collageSettings.quality;

        if (currentFormat === 'image/svg+xml') {
            setProcessedSize(null);
            return;
        }

        if (currentFormat === 'application/pdf') {
            const pdf = new jsPDF();
            const canvas = await generateFinalCanvas(pageToRender);
            const imgData = canvas.toDataURL('image/jpeg', currentQuality);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
            const blob = pdf.output('blob');
            setProcessedSize(blob.size);
            return;
        }

        const canvas = await generateFinalCanvas(pageToRender);
        canvas.toBlob(
            (blob) => {
                if (blob) setProcessedSize(blob.size);
            },
            currentFormat,
            currentQuality
        );
    } catch (error) {
        console.error("Error updating processed size:", error);
        setProcessedSize(null);
    }
  }, [generateFinalCanvas, editorMode, settings.format, settings.quality, collageSettings.format, collageSettings.quality, activePage]);

  const handleDownload = React.useCallback(async (filename: string) => {
    try {
        const downloadName = filename || 'imgresizer-export';
        const currentFormat = editorMode === 'single' ? settings.format : collageSettings.format;
        const currentQuality = editorMode === 'single' ? settings.quality : collageSettings.quality;

        if (currentFormat === 'application/pdf') {
            const pagesToRender = editorMode === 'collage' ? collageSettings.pages : [activePage!];
            if (pagesToRender.length === 0) {
              toast({ title: "Empty Project", description: "There are no pages to download.", variant: "destructive" });
              return;
            }
            
            const firstPageCanvas = await generateFinalCanvas(pagesToRender[0]);
            // A4 dimensions in points: 595.28 x 841.89
            // Use the canvas dimensions for custom sizes, but map to standard points for jsPDF
            const pdfWidth = (firstPageCanvas.width / 300) * 72;
            const pdfHeight = (firstPageCanvas.height / 300) * 72;
            
            const orientation = pdfWidth > pdfHeight ? 'l' : 'p';
            const pdf = new jsPDF({
              orientation: orientation,
              unit: 'pt',
              format: [pdfWidth, pdfHeight]
            });
            pdf.deletePage(1);

            for (const page of pagesToRender) {
                const canvas = await generateFinalCanvas(page);
                const imgData = canvas.toDataURL('image/jpeg', currentQuality);
                const pagePdfWidth = (canvas.width / 300) * 72;
                const pagePdfHeight = (canvas.height / 300) * 72;

                pdf.addPage([pagePdfWidth, pagePdfHeight], pagePdfWidth > pagePdfHeight ? 'l' : 'p');
                pdf.addImage(imgData, 'JPEG', 0, 0, pagePdfWidth, pagePdfHeight);
            }

            pdf.save(`${downloadName}.pdf`);
            toast({
              title: "Download Started",
              description: `Your ${pagesToRender.length}-page PDF file has started downloading.`,
            });
            return;
        }

        const canvasToDownload = await generateFinalCanvas(editorMode === 'collage' ? activePage : undefined);
        if (currentFormat === 'image/svg+xml') {
            const dataUrl = canvasToDownload.toDataURL('image/png');
            const svgContent = `<svg width="${canvasToDownload.width}" height="${canvasToDownload.height}" xmlns="http://www.w3.org/2000/svg">
<image href="${dataUrl}" width="${canvasToDownload.width}" height="${canvasToDownload.height}" />
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

        canvasToDownload.toBlob((blob) => {
            if (blob) {
              const link = document.createElement('a');
              link.href = URL.createObjectURL(blob);
              const extension = currentFormat.split('/')[1].split('+')[0];
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
        }, currentFormat, currentQuality);

    } catch (error) {
        console.error("Error preparing image for download:", error);
        toast({
            title: "Download Error",
            description: "There was a problem loading the image for export.",
            variant: "destructive",
        });
    }
  }, [generateFinalCanvas, settings.format, settings.quality, editorMode, collageSettings, activePage, toast]);

  const handleShare = React.useCallback(async () => {
    const fallbackShare = async () => {
        const url = 'https://www.imgresizer.xyz/';
        await navigator.clipboard.writeText(url);
        toast({
            title: "Link Copied!",
            description: "The website URL has been copied to your clipboard.",
        });
    };

    try {
        const canvasToShare = await generateFinalCanvas(editorMode === 'collage' ? activePage : undefined);
        const currentFormat = editorMode === 'single' ? settings.format : collageSettings.format;
        const currentQuality = editorMode === 'single' ? settings.quality : collageSettings.quality;

        canvasToShare.toBlob(async (blob) => {
            const shareData: ShareData = {
                title: 'ImgResizer: Free Online Image Editor',
                text: 'Check out this image I edited with the free and private ImgResizer web app!',
                url: 'https://www.imgresizer.xyz/',
            };

            if (blob && navigator.canShare && navigator.canShare({ files: [new File([blob], 'image.png', { type: blob.type })] })) {
                const extension = currentFormat.split('/')[1].split('+')[0] || 'png';
                const filename = `imgresizer-edited-image.${extension}`;
                const file = new File([blob], filename, { type: currentFormat });
                shareData.files = [file];
            }
            
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                await fallbackShare();
            }
        }, currentFormat, currentQuality);
    } catch (error) {
        console.error("Share error:", error);
        if ((error as Error).name !== 'AbortError') { // Don't show fallback if user cancels share
          await fallbackShare();
        }
    }
  }, [generateFinalCanvas, settings.format, settings.quality, editorMode, collageSettings.format, collageSettings.quality, activePage, toast]);

  const handleAutoLayout = React.useCallback((count: 2 | 3 | 4 | 5 | 6) => {
    const page = activePage;
    if (!page || page.layers.length === 0) return;

    let newLayers = [...page.layers];
    const margin = 2; // 2% margin

    const simpleGrid = (layers: ImageLayer[], cols: number, rows: number): ImageLayer[] => {
      const itemWidth = (100 - (cols + 1) * margin) / cols;
      const itemHeight = (100 - (rows + 1) * margin) / rows;
      return layers.map((layer, i) => {
        const row = Math.floor(i / cols);
        const col = i % cols;
        return {
          ...layer,
          x: margin + col * (itemWidth + margin) + itemWidth / 2,
          y: margin + row * (itemHeight + margin) + itemHeight / 2,
          width: itemWidth,
          rotation: 0,
        };
      });
    };

    if (count === 2) {
      newLayers = simpleGrid(newLayers.slice(0, 2), 1, 2);
    } else if (count === 3) {
      if (newLayers.length >= 3) {
        const w_large = 100 - 2 * margin;
        const h_large = (100 - 3 * margin) / 2;
        const w_small = (100 - 3 * margin) / 2;
        const h_small = h_large;
        
        newLayers[0] = { ...newLayers[0], x: 50, y: margin + h_large / 2, width: w_large, rotation: 0 };
        newLayers[1] = { ...newLayers[1], x: margin + w_small / 2, y: 2 * margin + h_large + h_small/2, width: w_small, rotation: 0 };
        newLayers[2] = { ...newLayers[2], x: 2 * margin + w_small + w_small/2, y: 2 * margin + h_large + h_small/2, width: w_small, rotation: 0 };
        newLayers = newLayers.slice(0, 3);
      } else {
        newLayers = simpleGrid(newLayers, 1, 3);
      }
    } else if (count === 4) {
      newLayers = simpleGrid(newLayers.slice(0, 4), 2, 2);
    } else if (count === 5) {
      if (newLayers.length >= 5) {
        const h = (100 - 3 * margin) / 2;
        const w_top = (100 - 3 * margin) / 2;
        const w_bottom = (100 - 4 * margin) / 3;

        newLayers[0] = { ...newLayers[0], x: margin + w_top/2, y: margin + h/2, width: w_top, rotation: 0 };
        newLayers[1] = { ...newLayers[1], x: 2 * margin + w_top + w_top/2, y: margin + h/2, width: w_top, rotation: 0 };
        
        newLayers[2] = { ...newLayers[2], x: margin + w_bottom/2, y: 2 * margin + h + h/2, width: w_bottom, rotation: 0 };
        newLayers[3] = { ...newLayers[3], x: 2 * margin + w_bottom + w_bottom/2, y: 2 * margin + h + h/2, width: w_bottom, rotation: 0 };
        newLayers[4] = { ...newLayers[4], x: 3 * margin + 2 * w_bottom + w_bottom/2, y: 2 * margin + h + h/2, width: w_bottom, rotation: 0 };
        newLayers = newLayers.slice(0, 5);
      } else {
         newLayers = simpleGrid(newLayers, 2, 3);
      }
    } else if (count === 6) {
      newLayers = simpleGrid(newLayers.slice(0, 6), 2, 3);
    }

    const finalLayers = [...newLayers, ...page.layers.slice(newLayers.length)];
    const newPages = [...collageSettings.pages];
    newPages[collageSettings.activePageIndex] = { ...page, layers: finalLayers };
    updateCollageSettings({ pages: newPages, layout: count });
  }, [activePage, collageSettings.pages, updateCollageSettings]);

  const editingTextObj = editorMode === 'single' 
    ? settings.texts.find(t => t.id === editingTextId)
    : activePage?.texts.find(t => t.id === editingTextId);
  
  if (!originalImage && editorMode === 'single') {
    return (
      <div className="flex flex-col min-h-screen bg-background text-foreground">
        <AppHeader 
          onUpload={handleImageUpload} 
          onDownload={handleDownload}
          isImageLoaded={!!originalImage || editorMode === 'collage'}
          settings={settings}
          updateSettings={updateSettings}
          collageSettings={collageSettings}
          updateCollageSettings={updateCollageSettings}
          processedSize={processedSize}
          onUpdateProcessedSize={updateProcessedSize}
          generateFinalCanvas={generateFinalCanvas}
          onShare={handleShare}
          editorMode={editorMode}
          imageElement={imageElement}
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
        </main>
        <SiteFooter />
        <InstallPwaBanner />
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
            onMultiplePagesSelect={handleMultiplePdfPageSelect}
            isPageSelecting={isPageSelecting}
            source={pdfSelectionSource}
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
          isImageLoaded={!!originalImage || editorMode === 'collage'}
          settings={settings}
          updateSettings={updateSettings}
          collageSettings={collageSettings}
          updateCollageSettings={updateCollageSettings}
          processedSize={processedSize}
          onUpdateProcessedSize={updateProcessedSize}
          generateFinalCanvas={generateFinalCanvas}
          onShare={handleShare}
          editorMode={editorMode}
          imageElement={imageElement}
        />
        <main className="flex-1 flex flex-col md:flex-row p-4 gap-4 bg-muted/40 overflow-y-auto md:overflow-hidden">
          <div className="w-full md:w-[380px] md:flex-shrink-0 bg-card rounded-lg border shadow-sm overflow-hidden">
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
              onViewPages={(source) => {
                setPdfSelectionSource(source);
                setIsPdfSelectorOpen(true);
              }}
              selectedTextId={selectedTextId}
              setSelectedTextId={setSelectedTextId}
              selectedSignatureId={selectedSignatureId}
              setSelectedSignatureId={setSelectedSignatureId}
              editorMode={editorMode}
              collageSettings={collageSettings}
              updateCollageSettings={updateCollageSettings}
              onAddImageToCollage={addImageToCollage}
              selectedLayerIds={selectedLayerIds}
              setSelectedLayerIds={setSelectedLayerIds}
              onAutoLayout={handleAutoLayout}
              onAutoDetectBorder={handleAutoDetectBorder}
            />
          </div>
          <div className="flex-1 flex items-center justify-center p-4 bg-card rounded-lg border shadow-sm relative min-h-[50vh] md:min-h-0">
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
              editorMode={editorMode}
              collageSettings={collageSettings}
              updateCollageSettings={updateCollageSettings}
              selectedLayerIds={selectedLayerIds}
              setSelectedLayerIds={setSelectedLayerIds}
            />
            {editingTextObj && canvasRef.current && (
              <TextEditor
                  text={editingTextObj}
                  canvas={canvasRef.current}
                  onSave={(newContent) => {
                      if (editorMode === 'single') {
                        const newTexts = settings.texts.map(t =>
                            t.id === editingTextId ? { ...t, text: newContent } : t
                        );
                        updateSettings({ texts: newTexts });
                      } else {
                        const newPageTexts = activePage.texts.map(t =>
                            t.id === editingTextId ? { ...t, text: newContent } : t
                        );
                        const newPages = collageSettings.pages.map((p, i) => i === collageSettings.activePageIndex ? {...p, texts: newPageTexts} : p);
                        updateCollageSettings({ pages: newPages });
                      }
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
              onMultiplePagesSelect={handleMultiplePdfPageSelect}
              isPageSelecting={isPageSelecting}
              source={pdfSelectionSource}
            />
          )}
      </div>
      <SiteFooter />
    </div>
  );
}

    
