

"use client";

import React, { useCallback, useRef } from 'react';
import type { Metadata } from 'next';
import { AppHeader } from '@/components/app-header';
import { ControlPanel } from '@/components/control-panel';
import { ImageCanvas } from '@/components/image-canvas';
import { UploadPlaceholder } from '@/components/upload-placeholder';
import type { ImageSettings, OriginalImage, CropSettings, TextOverlay, SignatureOverlay, CollageSettings, ImageLayer, SheetSettings, CollagePage, CornerPoints, DrawingPath, Unit, PdfDocumentInfo } from '@/lib/types';
import { useToast } from "@/hooks/use-toast"
import { SiteFooter } from '@/components/site-footer';
import { Loader2 } from 'lucide-react';
import jsPDF from 'jspdf';
import * as pdfjsLib from 'pdfjs-dist';
import { HeroSection } from '@/components/hero-section';
import { PdfPageSelectorDialog } from '@/components/pdf-page-selector-dialog';
import { TextEditor } from '@/components/text-editor';
import { FeatureGrid } from '@/components/feature-grid';
import { InstallPwaBanner } from '@/components/install-pwa-banner';
import { AppGrid } from '@/components/app-grid';
import { SeoContent } from '@/components/seo-content';
import { PasswordDialog } from '@/components/password-dialog';
import { applyPerspectiveTransform, autoDetectBorders } from '@/lib/perspective';
import { useRouter } from 'next/navigation';


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
    history: [[]],
    historyIndex: 0,
    brushColor: '#ff0000',
    brushSize: 10,
    isErasing: false,
    isMoving: false,
    x: 0,
    y: 0,
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
  maxLayersPerPage: 4,
};


export default function Home() {
  const [originalImage, setOriginalImage] = React.useState<OriginalImage | null>(null);
  const [settings, setSettings] = React.useState<ImageSettings>(initialSettings);
  const [collageSettings, setCollageSettings] = React.useState<CollageSettings>(initialCollageSettings);
  const [editorMode, setEditorMode] = React.useState<'single' | 'collage'>('single');
  const [activeTab, setActiveTab] = React.useState('resize');
  const [processedSize, setProcessedSize] = React.useState<number | null>(null);
  const [maxQualitySize, setMaxQualitySize] = React.useState<number | null>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const router = useRouter();

  const [pendingCrop, setPendingCrop] = React.useState<CropSettings | null>(null);
  const [imageElement, setImageElement] = React.useState<HTMLImageElement | null>(null);
  const INSET_PX = 12; // Approx 3mm

  // PDF Page Selection
  const [isPdfSelectorOpen, setIsPdfSelectorOpen] = React.useState(false);
  const [pdfDocs, setPdfDocs] = React.useState<PdfDocumentInfo[]>([]);
  const [isPageSelecting, setIsPageSelecting] = React.useState(false);

  // PDF Password
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = React.useState(false);
  const [passwordPdfFile, setPasswordPdfFile] = React.useState<File | null>(null);
  const passwordRetryFunction = React.useRef<((password: string) => void) | null>(null);


  // Text Editing
  const [selectedTextId, setSelectedTextId] = React.useState<string | null>(null);
  const [editingTextId, setEditingTextId] = React.useState<string | null>(null);

  // Signature Editing
  const [selectedSignatureId, setSelectedSignatureId] = React.useState<string | null>(null);

  // Collage State
  const [selectedLayerIds, setSelectedLayerIds] = React.useState<string[]>([]);
  const [showCompletionAnimation, setShowCompletionAnimation] = React.useState(false);
  
  const controlPanelTabListRef = useRef<HTMLDivElement>(null);

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

 const generateFinalCanvas = React.useCallback(async (pageToRender?: CollagePage, overrideSettings?: Partial<ImageSettings>, imageForCanvas?: HTMLImageElement): Promise<HTMLCanvasElement> => {
    return new Promise(async (resolve, reject) => {
        const currentQuality = overrideSettings?.quality ?? (editorMode === 'single' ? settings.quality : collageSettings.quality);
        
        const drawOverlays = (ctx: CanvasRenderingContext2D, overlays: { texts: TextOverlay[], signatures: SignatureOverlay[]}, canvasWidth: number, canvasHeight: number) => {
            overlays.signatures.forEach(sig => {
                if (sig.img) {
                    const sigWidth = (sig.width / 100) * canvasWidth;
                    const sigHeight = sigWidth / (sig.img.width / sig.img.height);
                    const sigX = (sig.x / 100) * canvasWidth;
                    const sigY = (sig.y / 100) * canvasHeight;

                    ctx.save();
                    ctx.translate(sigX, sigY);
                    ctx.rotate(sig.rotation * Math.PI / 180);
                    ctx.globalAlpha = sig.opacity;
                    ctx.drawImage(sig.img, -sigWidth / 2, -sigHeight / 2, sigWidth, sigHeight);
                    ctx.restore();
                }
            });

            overlays.texts.forEach(text => {
                const textX = (text.x / 100) * canvasWidth;
                const textY = (text.y / 100) * canvasHeight;
                ctx.font = `${text.size}px ${text.font}`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                const padding = text.padding || 0;
                if (text.backgroundColor && text.backgroundColor !== 'transparent' && padding >= 0) {
                    const metrics = ctx.measureText(text.text);
                    const rectWidth = metrics.width + padding * 2;
                    const rectHeight = text.size + padding * 2;
                    const rectX = textX - rectWidth / 2;
                    const rectY = textY - rectHeight / 2;
                    ctx.fillStyle = text.backgroundColor;
                    ctx.fillRect(rectX, rectY, rectWidth, rectHeight);
                }
                ctx.fillStyle = text.color;
                ctx.fillText(text.text, textX, textY);
            });
        };

        if (editorMode === 'collage' && !overrideSettings) {
          const finalCanvas = document.createElement('canvas');
          const finalCtx = finalCanvas.getContext('2d');
          if (!finalCtx) return reject(new Error("Could not create collage canvas context."));
          
          const page = pageToRender || collageSettings.pages[collageSettings.activePageIndex];
          if (!page) return reject(new Error("No active collage page to render."));

          const { width, height, backgroundColor, format } = collageSettings;
          const { layers, sheet, texts, signatures } = page;
          finalCanvas.width = width;
          finalCanvas.height = height;
          
          if (backgroundColor !== 'transparent' || format !== 'image/png') {
            finalCtx.fillStyle = backgroundColor === 'transparent' ? '#ffffff' : backgroundColor;
            finalCtx.fillRect(0, 0, width, height);
          }
          
          if (sheet && sheet.enabled) {
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

          for (const layer of layers) {
              const layerWidthPx = (layer.width / 100) * width;
              const layerHeightPx = layerWidthPx / (layer.originalWidth / layer.originalHeight);
              const layerX = (layer.x / 100) * width;
              const layerY = (layer.y / 100) * height;

              finalCtx.save();
              finalCtx.translate(layerX, layerY);
              finalCtx.rotate(layer.rotation * Math.PI / 180);
              finalCtx.globalAlpha = layer.opacity;

              const crop = layer.crop || { x: 0, y: 0, width: layer.originalWidth, height: layer.originalHeight };
              
              finalCtx.drawImage(
                layer.img,
                crop.x,
                crop.y,
                crop.width,
                crop.height,
                -layerWidthPx / 2,
                -layerHeightPx / 2,
                layerWidthPx,
                layerHeightPx
              );
              finalCtx.restore();
          }
          
          drawOverlays(finalCtx, { texts, signatures }, width, height);

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

            finalCtx.save();
            finalCtx.translate(drawing.x, drawing.y);
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
            finalCtx.globalCompositeOperation = 'source-over';
            finalCtx.restore();
            
            drawOverlays(finalCtx, { texts, signatures }, width, height);
            
            resolve(finalCanvas);
        } catch (error) {
            reject(error);
        }
    });
}, [originalImage, imageElement, settings, editorMode, collageSettings]);

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
      if (newSettings.drawing && newSettings.drawing.history) {
        const newHistory = newSettings.drawing.history;
        const newIndex = newSettings.drawing.historyIndex ?? (newHistory.length - 1);
        updated.drawing.paths = newHistory[newIndex];
        updated.drawing.historyIndex = newIndex;
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
    setMaxQualitySize(null);
  }, [selectedTextId, selectedSignatureId]);

  const updateCollageSettings = React.useCallback((newSettings: Partial<CollageSettings>) => {
    setCollageSettings(prev => {
      const updated = { ...prev, ...newSettings };
      const newActivePage = updated.pages[updated.activePageIndex];

      // Handle layer selection
      if (newActivePage) {
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
      }

      return updated;
    });
    setProcessedSize(null);
    setMaxQualitySize(null);
  }, [selectedLayerIds, selectedTextId, selectedSignatureId]);

  const handleTabChange = useCallback(async (tab: string) => {
    if (activeTab === 'crop' && tab !== 'crop' && pendingCrop && imageElement) {
        // Create a cropped version of the image
        const croppedCanvas = document.createElement('canvas');
        const ctx = croppedCanvas.getContext('2d');
        if (!ctx) return;

        croppedCanvas.width = pendingCrop.width;
        croppedCanvas.height = pendingCrop.height;
        ctx.drawImage(
            imageElement,
            pendingCrop.x,
            pendingCrop.y,
            pendingCrop.width,
            pendingCrop.height,
            0,
            0,
            pendingCrop.width,
            pendingCrop.height
        );
        
        const newDataUrl = croppedCanvas.toDataURL();
        const newImage = new Image();
        newImage.onload = () => {
             const newWidth = newImage.width;
            const newHeight = newImage.height;
            const inset = Math.min(INSET_PX, newWidth / 4, newHeight / 4);

            const head = `data:${originalImage?.src.split(';')[0].split(':')[1]};base64,`;
            const size = Math.round((newDataUrl.length - head.length) * 3 / 4);
            
            setOriginalImage({
                src: newDataUrl,
                width: newWidth,
                height: newHeight,
                size: size, 
            });

            updateSettings({
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
        };
        newImage.src = newDataUrl;
    }
    
    const newEditorMode = (tab === 'collage' || tab === 'passport') ? 'collage' : 'single';
    setEditorMode(newEditorMode);
    setActiveTab(tab);
    
    const activePage = collageSettings.pages[collageSettings.activePageIndex];

    if (newEditorMode === 'collage' && editorMode === 'single' && originalImage && imageElement && activePage?.layers.length === 0) {
      const editedCanvas = await generateFinalCanvas();
      const editedImageSrc = editedCanvas.toDataURL();
      const editedImage = new Image();
      editedImage.onload = () => {
          const MARGIN_PERCENT = 2;
          const gridCols = 2;
          const itemWidthPercent = (100 - (gridCols + 1) * MARGIN_PERCENT) / gridCols;
          const xPercent = MARGIN_PERCENT + 0 * (itemWidthPercent + MARGIN_PERCENT);
          const yPercent = MARGIN_PERCENT + 0 * (itemWidthPercent + MARGIN_PERCENT);

          const newLayer: ImageLayer = {
              id: Date.now().toString(),
              src: editedImageSrc,
              img: editedImage,
              x: xPercent + itemWidthPercent / 2,
              y: yPercent + itemWidthPercent / 2,
              width: itemWidthPercent,
              rotation: 0,
              opacity: 1,
              originalWidth: editedImage.width,
              originalHeight: editedImage.height,
              crop: null,
          };
          const newPages = [...collageSettings.pages];
          newPages[collageSettings.activePageIndex] = { ...activePage, layers: [newLayer] };
          setCollageSettings(prev => ({ ...prev, pages: newPages, layout: null }));
          setSelectedLayerIds([newLayer.id]);
          // Do not reset single editor state after transferring
      };
      editedImage.src = editedImageSrc;
    }
    
    if (tab === 'crop' && originalImage && !pendingCrop) {
        const insetX = Math.min(INSET_PX, originalImage.width / 4);
        const insetY = Math.min(INSET_PX, originalImage.height / 4);

        const insetCrop = {
          x: Math.round(insetX),
          y: Math.round(insetY),
          width: Math.round(originalImage.width - insetX * 2),
          height: Math.round(originalImage.height - insetY * 2),
        };
        setPendingCrop(insetCrop);
    }

    if (tab !== 'text' && tab !== 'collage') {
      setSelectedTextId(null);
      setEditingTextId(null);
      setSelectedSignatureId(null);
    }
    if (tab !== 'collage' && tab !== 'passport') {
      setSelectedLayerIds([]);
    }
    if (tab !== 'draw') {
        updateSettings({ drawing: { ...settings.drawing, isMoving: false }});
    }

    // Scroll to the selected tab
    setTimeout(() => {
        const tabList = controlPanelTabListRef.current;
        if (tabList) {
            const selectedTab = tabList.querySelector(`[data-radix-value="${tab}"]`) as HTMLElement;
            if (selectedTab) {
                selectedTab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            }
        }
    }, 100);
  }, [activeTab, collageSettings.activePageIndex, collageSettings.pages, editorMode, imageElement, originalImage, pendingCrop, settings.drawing, updateSettings, generateFinalCanvas, updateCollageSettings]);
  
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
    
    const activePage = collageSettings.pages[collageSettings.activePageIndex];

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
             
             if (numLayers < collageSettings.maxLayersPerPage) {
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
                    crop: null,
                };
                setCollageSettings(prev => {
                  const newPages = [...prev.pages];
                  const updatedPage = { ...newPages[prev.activePageIndex], layers: [...newPages[prev.activePageIndex].layers, newLayer] };
                  newPages[prev.activePageIndex] = updatedPage;
                  return { ...prev, pages: newPages };
                });
                setSelectedLayerIds([newLayer.id]);
             } else {
                 // Fallback for more than max layers
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
                    crop: null,
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
    }, [activePage, toast, collageSettings.width, collageSettings.height, collageSettings.activePageIndex, collageSettings.pages, collageSettings.maxLayersPerPage, updateCollageSettings]);


    const loadPageAsImage = React.useCallback(async (pdfDoc: pdfjsLib.PDFDocumentProxy | null, pageNum: number, originalFileSize: number, src?: string) => {
    setIsLoading(true);
    try {
      const dataUrl = src || (pdfDoc ? await renderPdfPageToDataURL(pdfDoc, pageNum) : '');
      if (!dataUrl) throw new Error("No data URL available for image.");

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
        setMaxQualitySize(null);
        setIsLoading(false);
      };
      img.onerror = () => {
        toast({ title: "Error", description: "Could not load page as image.", variant: "destructive" });
        setIsLoading(false);
      }
      img.src = dataUrl;
    } catch (error) {
        console.error("Error processing page:", error);
        toast({ title: "Error", description: "Could not process the selected page.", variant: "destructive" });
        setIsLoading(false);
    }
  }, [toast, renderPdfPageToDataURL]);

const handlePdfPageSelect = React.useCallback(async (docId: string, pageNum: number, src?: string) => {
    const sourceDoc = pdfDocs.find(d => d.id === docId);
    if (sourceDoc || src) {
      setIsPageSelecting(true);
      setIsPdfSelectorOpen(false);

      try {
          // Defer heavy operation to allow UI to update
          setTimeout(() => {
              loadPageAsImage(sourceDoc?.doc || null, pageNum, sourceDoc?.file.size || 0, src);
          }, 50);
      } catch (error) {
          console.error("Error handling page selection:", error);
          toast({ title: "Error", description: "Failed to process page.", variant: "destructive" });
      } finally {
          setIsPageSelecting(false);
      }
    }
}, [pdfDocs, loadPageAsImage, toast]);

  const processPdfFile = useCallback(async (file: File, password?: string, pagesToImport?: number[]): Promise<PdfDocumentInfo | null> => {
    return new Promise(async (resolve) => {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer, password });
        const doc = await loadingTask.promise;
        setIsPasswordDialogOpen(false);
        setPasswordPdfFile(null);
        
        const newDocInfo: PdfDocumentInfo = {
          id: file.name + '-' + Date.now(),
          file: file,
          doc: doc,
          numPages: doc.numPages,
          pagesToImport: pagesToImport,
        };

        if (pagesToImport) {
          // This path is for adding pages to the organizer
          setPdfDocs(prev => [...prev, newDocInfo]);
        }
        
        resolve(newDocInfo);

      } catch (error: any) {
        if (error.name === 'PasswordException') {
          setPasswordPdfFile(file);
          passwordRetryFunction.current = (pw) => {
            processPdfFile(file, pw, pagesToImport).then(resolve);
          };
          setIsPasswordDialogOpen(true);
        } else {
          console.error("Error processing PDF:", error);
          toast({
            title: "PDF Error",
            description: "Could not process the PDF file. It may be corrupted or in an unsupported format.",
            variant: "destructive",
          });
        }
        resolve(null);
      } finally {
        setIsLoading(false);
      }
    });
  }, [toast]);


  const handleImageUpload = async (file: File) => {
    setIsLoading(true);
    setPdfDocs([]);
    setIsPageSelecting(false);
    
    // Reset collage mode if a new single file is uploaded
    setEditorMode('single');
    setCollageSettings(initialCollageSettings);
    setSelectedLayerIds([]);
    if (activeTab === 'collage' || activeTab === 'passport') setActiveTab('resize');

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
                setMaxQualitySize(null);
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
        const newDoc = await processPdfFile(file, undefined);
        if (newDoc) {
            setPdfDocs([newDoc]);
            setIsPdfSelectorOpen(true);
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
       const newDoc = await processPdfFile(file, undefined);
       if (newDoc) {
           setPdfDocs(prev => [...prev, newDoc]);
           // You might want to open a selector here for the collage
           // For now, let's assume it's handled elsewhere or the user will be notified
           toast({ title: 'PDF Added', description: 'Go to the PDF Organizer to select pages to add.' });
           if (!isPdfSelectorOpen) {
               setIsPdfSelectorOpen(true);
           }
       }
    } else {
      toast({ title: "Invalid File", description: "Only image or PDF files can be added.", variant: "destructive" });
    }
  };

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


const updateProcessedSize = React.useCallback(async () => {
    try {
        const currentFormat = editorMode === 'single' ? settings.format : collageSettings.format;
        
        const getBlobSize = async (quality: number): Promise<number | null> => {
            if (currentFormat === 'image/svg+xml') return null;

            if (currentFormat === 'application/pdf') {
                const pagesToRender = editorMode === 'collage' ? collageSettings.pages : [activePage!];
                if (pagesToRender.length === 0 || !pagesToRender[0]) return 0;
                
                const firstPageCanvas = await generateFinalCanvas(pagesToRender[0], { quality });
                const pdfWidth = (firstPageCanvas.width / 300) * 72;
                const pdfHeight = (firstPageCanvas.height / 300) * 72;
                
                const orientation = pdfWidth > pdfHeight ? 'l' : 'p';
                const pdf = new jsPDF({ orientation, unit: 'pt', format: [pdfWidth, pdfHeight] });

                const imgData = firstPageCanvas.toDataURL('image/jpeg', quality);
                pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
                
                const blob = pdf.output('blob');
                return blob.size * pagesToRender.length;
            }

            const pageToRender = editorMode === 'collage' ? activePage : undefined;
            const canvas = await generateFinalCanvas(pageToRender, { quality });
            
            return new Promise((resolve) => {
                canvas.toBlob(blob => resolve(blob?.size ?? null), currentFormat, quality);
            });
        };
        
        if (maxQualitySize === null) {
            const sizeAtMax = await getBlobSize(1.0);
            setMaxQualitySize(sizeAtMax);
        }
        
        const sizeAtCurrentQuality = await getBlobSize(editorMode === 'single' ? settings.quality : collageSettings.quality);
        setProcessedSize(sizeAtCurrentQuality);

    } catch (error) {
        console.error("Error updating processed size:", error);
        setProcessedSize(null);
        setMaxQualitySize(null);
    }
}, [generateFinalCanvas, editorMode, settings.format, settings.quality, collageSettings, activePage, maxQualitySize]);


  const handleDownload = React.useCallback(async (filename: string) => {
    try {
        const downloadName = filename || 'imgresizer-export';
        const currentFormat = editorMode === 'single' ? settings.format : collageSettings.format;
        const currentQuality = editorMode === 'single' ? settings.quality : collageSettings.quality;

        if (currentFormat === 'application/pdf') {
            const pagesToRender = editorMode === 'collage' ? collageSettings.pages : [activePage!];
            if (pagesToRender.length === 0 || !activePage) {
              toast({ title: "Empty Project", description: "There are no pages to download.", variant: "destructive" });
              return;
            }
            
            toast({
              title: "Download Started",
              description: `Preparing your ${pagesToRender.length}-page PDF...`,
            });
            
            // Use setTimeout to allow the toast to render before blocking the main thread
            setTimeout(async () => {
              try {
                const firstPageCanvas = await generateFinalCanvas(pagesToRender[0]);
                const pdfWidth = (firstPageCanvas.width / 300) * 72;
                const pdfHeight = (firstPageCanvas.height / 300) * 72;
                
                const orientation = pdfWidth > pdfHeight ? 'l' : 'p';
                const pdf = new jsPDF({
                  orientation: orientation,
                  unit: 'pt',
                  format: [pdfWidth, pdfHeight]
                });
                pdf.deletePage(1); // Remove the default blank page

                for (const page of pagesToRender) {
                    const canvas = await generateFinalCanvas(page);
                    const imgData = canvas.toDataURL('image/jpeg', currentQuality);
                    const pagePdfWidth = (canvas.width / 300) * 72;
                    const pagePdfHeight = (canvas.height / 300) * 72;

                    pdf.addPage([pagePdfWidth, pagePdfHeight], pagePdfWidth > pagePdfHeight ? 'l' : 'p');
                    pdf.addImage(imgData, 'JPEG', 0, 0, pagePdfWidth, pagePdfHeight);
                }

                pdf.save(`${downloadName}.pdf`);
              } catch(e) {
                console.error("Error generating PDF:", e);
                toast({ title: "PDF Generation Error", description: "Could not create the PDF file.", variant: "destructive"});
              }
            }, 50);
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
        const url = 'https://imgresizer.xyz/';
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
            if (!blob) {
                await fallbackShare();
                return;
            }
            
            const extension = currentFormat.split('/')[1].split('+')[0] || 'png';
            const filename = `imgresizer-edited-image.${extension}`;
            const file = new File([blob], filename, { type: currentFormat });

            const shareData: ShareData = {
                title: 'ImgResizer: Free Online Image Editor',
                text: 'Check out this image I edited with the free and private ImgResizer web app!',
                url: 'https://imgresizer.xyz/',
                files: [file]
            };
            
            if (navigator.canShare && navigator.canShare(shareData)) {
                await navigator.share(shareData);
            } else if (navigator.canShare && navigator.canShare({ title: shareData.title, text: shareData.text, url: shareData.url })) {
                 // Fallback to sharing without the file if file sharing is not supported but basic sharing is
                await navigator.share({ title: shareData.title, text: shareData.text, url: shareData.url });
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

    const handlePrint = React.useCallback(async () => {
        try {
            toast({
                title: "Preparing for Print",
                description: "Generating a high-quality version for printing...",
            });

            const pagesToRender = editorMode === 'collage' ? collageSettings.pages : [activePage!];

            if (!activePage && editorMode !== 'collage') return;

            const printWindow = window.open('', '_blank');
            if (!printWindow) {
                toast({ title: "Error", description: "Could not open print window. Please check your browser's pop-up settings.", variant: "destructive" });
                return;
            }

            printWindow.document.write(`
                <html>
                    <head>
                        <title>Print Preview</title>
                        <style>
                            @page { size: auto; margin: 0; }
                            body { margin: 0; background-color: #eee; display: flex; align-items: center; justify-content: center; height: 100%; }
                            .print-container { display: flex; flex-direction: column; align-items: center; }
                            img { max-width: 100vw; max-height: 100vh; object-fit: contain; box-shadow: 0 0 10px rgba(0,0,0,0.2); background-color: white; page-break-after: always; }
                            img:last-child { page-break-after: auto; }
                            .loading-indicator { font-family: sans-serif; font-size: 20px; color: #555; }
                        </style>
                    </head>
                    <body>
                        <div class="print-container">
                            <div class="loading-indicator">Loading for print...</div>
                        </div>
                    </body>
                </html>
            `);
            printWindow.document.close();

            const imagePromises = pagesToRender.map(async (page) => {
                const canvas = await generateFinalCanvas(page);
                const dataUrl = canvas.toDataURL('image/png', 1.0);
                const img = new Image();
                return new Promise<HTMLImageElement>((resolve, reject) => {
                    img.onload = () => resolve(img);
                    img.onerror = reject;
                    img.src = dataUrl;
                });
            });

            const loadedImages = await Promise.all(imagePromises);

            const printContainer = printWindow.document.querySelector('.print-container');
            if (printContainer) {
              const loadingIndicator = printContainer.querySelector('.loading-indicator');
              if (loadingIndicator) loadingIndicator.remove();
              loadedImages.forEach(img => printContainer.appendChild(img));
            }
            
            printWindow.focus();

            // Use a short delay to ensure images are rendered before printing
            setTimeout(() => {
                printWindow.print();
                printWindow.close();
            }, 250);

        } catch (error) {
            console.error("Error preparing for print:", error);
            toast({
                title: "Print Error",
                description: "There was a problem preparing the image for printing.",
                variant: "destructive",
            });
        }
    }, [generateFinalCanvas, editorMode, collageSettings.pages, activePage, toast]);

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
    newPages[settings.activePageIndex] = { ...page, layers: finalLayers };
    updateCollageSettings({ pages: newPages, layout: count });
  }, [activePage, collageSettings.pages, updateCollageSettings]);

  const handleGeneratePassportPhotos = useCallback((file: File, count: number, backgroundColor: string) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // A4 at 300 DPI
        const a4Width = 2481;
        const a4Height = 3507;

        // Passport photo size: 3.5cm x 4.5cm at 300 DPI
        const photoWidthPx = Math.round(3.5 / 2.54 * 300); // 413
        const photoHeightPx = Math.round(4.5 / 2.54 * 300); // 531
        
        const photoAspectRatio = photoWidthPx / photoHeightPx;
        const originalAspectRatio = img.width / img.height;
        
        // Create a new canvas with the desired background color
        const bgCanvas = document.createElement('canvas');
        const bgCtx = bgCanvas.getContext('2d');
        if (!bgCtx) return;

        bgCanvas.width = photoWidthPx;
        bgCanvas.height = photoHeightPx;
        
        bgCtx.fillStyle = backgroundColor;
        bgCtx.fillRect(0, 0, photoWidthPx, photoHeightPx);
        
        // Crop and resize the source image to fit inside the passport photo dimensions
        let sWidth = img.width, sHeight = img.height;
        let sx = 0, sy = 0;

        if (originalAspectRatio > photoAspectRatio) { // Original is wider
          sWidth = img.height * photoAspectRatio;
          sx = (img.width - sWidth) / 2;
        } else { // Original is taller or same ratio
          sHeight = img.width / photoAspectRatio;
          sy = (img.height - sHeight) / 2;
        }

        // Draw the cropped image onto the background canvas
        bgCtx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, photoWidthPx, photoHeightPx);
        
        const composedImg = new Image();
        composedImg.onload = () => {
          const newLayers: ImageLayer[] = [];
          
          const margin = 30; // ~1cm margin on A4 paper
          const gap = 15;
          const availableWidth = a4Width - 2 * margin;

          const cols = Math.floor((availableWidth + gap) / (photoWidthPx + gap));
          
          const photoWidthPercent = (photoWidthPx / a4Width) * 100;

          for(let i=0; i<count; i++) {
            const row = Math.floor(i / cols);
            const col = i % cols;
            
            const xPx = margin + col * (photoWidthPx + gap);
            const yPx = margin + row * (photoHeightPx + gap);
            
            const xPercent = ((xPx + photoWidthPx/2) / a4Width) * 100;
            const yPercent = ((yPx + photoHeightPx/2) / a4Height) * 100;

            const newLayer: ImageLayer = {
                id: `${Date.now()}-${i}`,
                src: composedImg.src,
                img: composedImg,
                x: xPercent,
                y: yPercent,
                width: photoWidthPercent,
                rotation: 0,
                opacity: 1,
                originalWidth: composedImg.width,
                originalHeight: composedImg.height,
                crop: null,
            };
            newLayers.push(newLayer);
          }

          updateCollageSettings({
            width: a4Width,
            height: a4Height,
            backgroundColor: '#ffffff', // A4 sheet is always white
            pages: [{
              id: Date.now().toString(),
              layers: newLayers,
              texts: [],
              signatures: [],
              sheet: initialSheetSettings,
            }],
            activePageIndex: 0
          });
          setEditorMode('collage');
          setActiveTab('passport');
        };
        composedImg.src = bgCanvas.toDataURL();
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }, [updateCollageSettings]);

  const handleClearPassport = useCallback(() => {
    updateCollageSettings({
      pages: [{
        id: Date.now().toString(),
        layers: [],
        texts: [],
        signatures: [],
        sheet: initialSheetSettings,
      }],
      activePageIndex: 0,
    });
  }, [updateCollageSettings]);

  const getBlobFromCanvas = useCallback(async (quality: number): Promise<Blob | null> => {
    const format = editorMode === 'single' ? settings.format : collageSettings.format;

    if (format === 'application/pdf') {
        const pagesToRender = editorMode === 'collage' ? collageSettings.pages : [collageSettings.pages[collageSettings.activePageIndex]!];
        
        if (pagesToRender.length === 0) return new Blob();

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

        const singlePageBlob = pdf.output('blob');
        const estimatedSize = singlePageBlob.size * pagesToRender.length;
        
        return new Blob([new ArrayBuffer(estimatedSize)], { type: 'application/pdf' });
    }

    const pageToRender = editorMode === 'collage' ? collageSettings.pages[collageSettings.activePageIndex] : undefined;
    const canvas = await generateFinalCanvas(pageToRender, { quality });

    return new Promise((resolve) => {
        canvas.toBlob(resolve, format === 'application/pdf' ? 'image/jpeg' : format, quality);
    });
  }, [generateFinalCanvas, editorMode, settings, collageSettings]);

  const handleTargetSize = async (targetSize: number, targetUnit: 'KB' | 'MB') => {
    const numericSize = targetSize;
    if (!numericSize || numericSize <= 0 || !originalImage) return;

    const targetBytes = targetUnit === 'KB' ? numericSize * 1024 : numericSize * 1024 * 1024;
    
    let high = 1.0;
    let low = 0.0;
    let mid = 0.5;
    let bestQuality = 0.5;
    
    for(let i = 0; i < 25; i++) { 
      mid = (low + high) / 2;
      const blob = await getBlobFromCanvas(mid);
      if (!blob) {
        return;
      }
      
      if(blob.size > targetBytes) {
        high = mid;
      } else {
        low = mid;
      }
      bestQuality = (low + high) / 2;
    }
    
    const quality = parseFloat(bestQuality.toFixed(2));
    const finalSettings = { ...settings, quality };

    const finalCanvas = await generateFinalCanvas(undefined, finalSettings);
    const finalBlob = await new Promise<Blob|null>(res => finalCanvas.toBlob(res, finalSettings.format, finalSettings.quality));

    if (finalBlob) {
        const imageExtension = finalSettings.format.split('/')[1];

        const pdf = new jsPDF();
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = finalCanvas.width;
        const imgHeight = finalCanvas.height;
        const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
        const newImgWidth = imgWidth * ratio;
        const newImgHeight = imgHeight * ratio;
        const imgX = (pdfWidth - newImgWidth) / 2;
        const imgY = (pdfHeight - newImgHeight) / 2;

        pdf.addImage(finalCanvas.toDataURL(finalSettings.format, finalSettings.quality), finalSettings.format.split('/')[1].toUpperCase(), imgX, imgY, newImgWidth, newImgHeight);
        const pdfBlob = pdf.output('blob');


        const result = {
            image: {
                dataUrl: finalCanvas.toDataURL(finalSettings.format, finalSettings.quality),
                size: finalBlob.size,
                filename: `imgresizer-export.${imageExtension}`
            },
            pdf: {
                dataUrl: URL.createObjectURL(pdfBlob),
                size: pdfBlob.size,
                filename: `imgresizer-export.pdf`
            },
            originalSize: originalImage.size,
        };
        sessionStorage.setItem('optimizedResult', JSON.stringify(result));
        router.push('/result');
    }
  };

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
          onPrint={handlePrint}
          editorMode={editorMode}
          imageElement={imageElement}
          maxQualitySize={maxQualitySize}
          setProcessedSize={setProcessedSize}
          originalImage={originalImage}
        />
        <main className="flex-1 w-full overflow-y-auto">
          <HeroSection onUpload={handleImageUpload} onLearnMoreClick={() => handleTabChange('passport')} />
          <div className="w-full max-w-2xl mx-auto py-12 px-4">
            <UploadPlaceholder onUpload={handleImageUpload} isLoading={isLoading} />
          </div>
          <AppGrid />
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
        <PdfPageSelectorDialog
          isOpen={isPdfSelectorOpen}
          onOpenChange={setIsPdfSelectorOpen}
          pdfDocs={pdfDocs}
          onPageSelect={handlePdfPageSelect}
          isPageSelecting={isPageSelecting}
          onAddFile={processPdfFile}
        />
        <PasswordDialog
          isOpen={isPasswordDialogOpen}
          onOpenChange={(isOpen) => {
            if (!isOpen) {
              setPasswordPdfFile(null);
              passwordRetryFunction.current = null;
            }
            setIsPasswordDialogOpen(isOpen);
          }}
          onSubmit={(password) => {
            if (passwordRetryFunction.current) {
              passwordRetryFunction.current(password);
            }
          }}
          fileName={passwordPdfFile?.name}
        />
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
          onPrint={handlePrint}
          editorMode={editorMode}
          imageElement={imageElement}
          maxQualitySize={maxQualitySize}
          setProcessedSize={setProcessedSize}
          originalImage={originalImage}
        />
        <main className="flex-1 flex flex-col md:flex-row p-4 gap-4 bg-muted/40 overflow-y-auto md:overflow-hidden">
          <div className="w-full md:w-[380px] md:flex-shrink-0 bg-card rounded-lg border shadow-sm overflow-hidden">
            <ControlPanel 
              tabListRef={controlPanelTabListRef}
              settings={settings} 
              updateSettings={updateSettings} 
              originalImage={originalImage}
              activeTab={activeTab}
              onTabChange={handleTabChange}
              processedSize={processedSize}
              pendingCrop={pendingCrop}
              setPendingCrop={setPendingCrop}
              onApplyPerspectiveCrop={handleApplyPerspectiveCrop}
              isFromMultiPagePdf={pdfDocs.some(d => d.numPages > 1)}
              onViewPages={() => setIsPdfSelectorOpen(true)}
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
              onGeneratePassportPhotos={handleGeneratePassportPhotos}
              onClearPassport={handleClearPassport}
              onTargetSizeSubmit={handleTargetSize}
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
              showCompletionAnimation={showCompletionAnimation}
              setShowCompletionAnimation={setShowCompletionAnimation}
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
                      } else if (activePage){
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
        <PdfPageSelectorDialog
            isOpen={isPdfSelectorOpen}
            onOpenChange={setIsPdfSelectorOpen}
            pdfDocs={pdfDocs}
            onPageSelect={handlePdfPageSelect}
            isPageSelecting={isPageSelecting}
            onAddFile={processPdfFile}
        />
         <PasswordDialog
          isOpen={isPasswordDialogOpen}
          onOpenChange={(isOpen) => {
            if (!isOpen) {
              setPasswordPdfFile(null);
              passwordRetryFunction.current = null;
            }
            setIsPasswordDialogOpen(isOpen);
          }}
          onSubmit={(password) => {
            if (passwordRetryFunction.current) {
              passwordRetryFunction.current(password);
            }
          }}
          fileName={passwordPdfFile?.name}
        />
      </div>
      <AppGrid />
      <SeoContent />
      <SiteFooter />
    </div>
  );
}
