
"use client";

import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState, useCallback } from 'react';
import type { ImageSettings, OriginalImage, CropSettings, TextOverlay, CornerPoints, SignatureOverlay, CollageSettings, ImageLayer } from '@/lib/types';

interface ImageCanvasProps {
  originalImage: OriginalImage | null;
  imageElement: HTMLImageElement | null;
  settings: ImageSettings;
  updateSettings: (newSettings: Partial<ImageSettings>) => void;
  activeTab: string;
  pendingCrop: CropSettings | null;
  setPendingCrop: (crop: CropSettings | null) => void;
  selectedTextId: string | null;
  setSelectedTextId: (id: string | null) => void;
  setEditingTextId: (id: string | null) => void;
  selectedSignatureId: string | null;
  setSelectedSignatureId: (id: string | null) => void;
  editorMode: 'single' | 'collage';
  collageSettings: CollageSettings;
  updateCollageSettings: (newSettings: Partial<CollageSettings>) => void;
  selectedLayerId: string | null;
  setSelectedLayerId: (id: string | null) => void;
}

const CROP_HANDLE_SIZE = 12;
const CROP_HANDLE_HIT_AREA = 24;
const MIN_CROP_SIZE_PX = 20;

const PERSPECTIVE_HANDLE_RADIUS = 10;
const PERSPECTIVE_HANDLE_HIT_RADIUS = 25;

const TEXT_ROTATION_HANDLE_OFFSET = 25;
const TEXT_RESIZE_HANDLE_SIZE = 10;
const TEXT_HANDLE_HIT_AREA = 20;

const SIGNATURE_ROTATION_HANDLE_OFFSET = 30;
const SIGNATURE_RESIZE_HANDLE_SIZE = 14;
const SIGNATURE_HANDLE_HIT_AREA = 28;

const LAYER_ROTATION_HANDLE_OFFSET = 25;
const LAYER_RESIZE_HANDLE_SIZE = 10;
const LAYER_HANDLE_HIT_AREA = 20;


type InteractionType = 
  | 'crop-move' | 'crop-tl' | 'crop-t' | 'crop-tr' | 'crop-l' | 'crop-r' | 'crop-bl' | 'crop-b' | 'crop-br' | 'crop-new'
  | 'text-move' | 'text-rotate' | 'text-resize-tl' | 'text-resize-tr' | 'text-resize-bl' | 'text-resize-br'
  | 'signature-move' | 'signature-rotate' | 'signature-resize-tl' | 'signature-resize-tr' | 'signature-resize-bl' | 'signature-resize-br'
  | 'perspective-tl' | 'perspective-tr' | 'perspective-bl' | 'perspective-br'
  | 'layer-move' | 'layer-rotate' | 'layer-resize-tl' | 'layer-resize-tr' | 'layer-resize-bl' | 'layer-resize-br';

type InteractionState = {
  type: InteractionType;
  startPos: { x: number; y: number };
  
  // Crop-specific state
  startCrop?: CropSettings;

  // Text-specific state
  textId?: string;
  startText?: TextOverlay;
  textCenter?: { x: number; y: number };

  // Signature-specific state
  signatureId?: string;
  startSignature?: SignatureOverlay;
  signatureCenter?: { x: number; y: number; };

  // Layer-specific state
  layerId?: string;
  startLayer?: ImageLayer;
  layerCenter?: { x: number; y: number; };
};

const ImageCanvas = forwardRef<HTMLCanvasElement, ImageCanvasProps>(({ 
  originalImage, 
  imageElement,
  settings, 
  updateSettings,
  activeTab, 
  pendingCrop, 
  setPendingCrop,
  selectedTextId,
  setSelectedTextId,
  setEditingTextId,
  selectedSignatureId,
  setSelectedSignatureId,
  editorMode,
  collageSettings,
  updateCollageSettings,
  selectedLayerId,
  setSelectedLayerId,
}, ref) => {
  const internalCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [processedImageCache, setProcessedImageCache] = useState<HTMLCanvasElement | null>(null);
  const [interactionState, setInteractionState] = useState<InteractionState | null>(null);
  const [cursor, setCursor] = useState('auto');
  const lastClickTime = useRef(0);
  const lastClickTarget = useRef<string | null>(null);


  useImperativeHandle(ref, () => internalCanvasRef.current!, []);

  const getCanvasAndContext = useCallback(() => {
    const canvas = internalCanvasRef.current;
    const ctx = canvas?.getContext('2d', { willReadFrequently: true });
    return { canvas, ctx };
  }, []);

  const getTextHandlePositions = useCallback((text: TextOverlay, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
    ctx.save();
    ctx.font = `${text.size}px ${text.font}`;
    const metrics = ctx.measureText(text.text);
    const padding = text.padding || 0;
    
    // Approximate height better
    const fontHeight = metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent;
    const rectWidth = metrics.width + padding * 2;
    const rectHeight = fontHeight + padding * 2;
    
    const center = { x: (text.x / 100) * canvas.width, y: (text.y / 100) * canvas.height };

    const getRotatedPoint = (x: number, y: number, angleDeg: number) => {
        const angleRad = angleDeg * Math.PI / 180;
        const cos = Math.cos(angleRad);
        const sin = Math.sin(angleRad);
        return {
            x: center.x + x * cos - y * sin,
            y: center.y + x * sin + y * cos,
        };
    };

    const halfW = rectWidth / 2;
    const halfH = rectHeight / 2;

    const corners = {
        tl: getRotatedPoint(-halfW, -halfH, text.rotation),
        tr: getRotatedPoint(halfW, -halfH, text.rotation),
        bl: getRotatedPoint(-halfW, halfH, text.rotation),
        br: getRotatedPoint(halfW, halfH, text.rotation),
    };

    const rotationHandleAngle = (text.rotation - 90) * Math.PI / 180;
    const rotationHandleDistance = halfH + TEXT_ROTATION_HANDLE_OFFSET;

    const rotationHandle = {
        x: center.x + rotationHandleDistance * Math.cos(rotationHandleAngle),
        y: center.y + rotationHandleDistance * Math.sin(rotationHandleAngle),
    };

    const unrotatedBoundingBox = {
      x: center.x - halfW,
      y: center.y - halfH,
      width: rectWidth,
      height: rectHeight,
    };
    
    ctx.restore();
    return { corners, rotationHandle, center, unrotatedBoundingBox };
}, []);

 const getSignatureHandlePositions = useCallback((signature: SignatureOverlay, canvas: HTMLCanvasElement) => {
    const sigWidth = (signature.width / 100) * canvas.width;
    const sigHeight = sigWidth / (signature.img.width / signature.img.height);
    const center = { x: (signature.x / 100) * canvas.width, y: (signature.y / 100) * canvas.height };

    const getRotatedPoint = (x: number, y: number, angleDeg: number) => {
      const angleRad = angleDeg * Math.PI / 180;
      const cos = Math.cos(angleRad);
      const sin = Math.sin(angleRad);
      return {
        x: center.x + x * cos - y * sin,
        y: center.y + x * sin + y * cos,
      };
    };

    const halfW = sigWidth / 2;
    const halfH = sigHeight / 2;

    const corners = {
      tl: getRotatedPoint(-halfW, -halfH, signature.rotation),
      tr: getRotatedPoint(halfW, -halfH, signature.rotation),
      bl: getRotatedPoint(-halfW, halfH, signature.rotation),
      br: getRotatedPoint(halfW, halfH, signature.rotation),
    };

    const rotationHandleAngle = (signature.rotation - 90) * Math.PI / 180;
    const rotationHandleDistance = halfH + SIGNATURE_ROTATION_HANDLE_OFFSET;

    const rotationHandle = {
      x: center.x + rotationHandleDistance * Math.cos(rotationHandleAngle),
      y: center.y + rotationHandleDistance * Math.sin(rotationHandleAngle),
    };

    const unrotatedBoundingBox = {
      width: sigWidth,
      height: sigHeight,
    };

    return { corners, rotationHandle, center, unrotatedBoundingBox };
  }, []);

  const getLayerHandlePositions = useCallback((layer: ImageLayer, canvas: HTMLCanvasElement) => {
    const layerWidthPx = (layer.width / 100) * canvas.width;
    const layerHeightPx = layerWidthPx / (layer.originalWidth / layer.originalHeight);
    const center = { x: (layer.x / 100) * canvas.width, y: (layer.y / 100) * canvas.height };

    const getRotatedPoint = (x: number, y: number, angleDeg: number) => {
      const angleRad = angleDeg * Math.PI / 180;
      const cos = Math.cos(angleRad);
      const sin = Math.sin(angleRad);
      return {
        x: center.x + x * cos - y * sin,
        y: center.y + x * sin + y * cos,
      };
    };

    const halfW = layerWidthPx / 2;
    const halfH = layerHeightPx / 2;

    const corners = {
      tl: getRotatedPoint(-halfW, -halfH, layer.rotation),
      tr: getRotatedPoint(halfW, -halfH, layer.rotation),
      bl: getRotatedPoint(-halfW, halfH, layer.rotation),
      br: getRotatedPoint(halfW, halfH, layer.rotation),
    };

    const rotationHandleAngle = (layer.rotation - 90) * Math.PI / 180;
    const rotationHandleDistance = halfH + LAYER_ROTATION_HANDLE_OFFSET;

    const rotationHandle = {
      x: center.x + rotationHandleDistance * Math.cos(rotationHandleAngle),
      y: center.y + rotationHandleDistance * Math.sin(rotationHandleAngle),
    };

    const unrotatedBoundingBox = {
      width: layerWidthPx,
      height: layerHeightPx,
    };

    return { corners, rotationHandle, center, unrotatedBoundingBox };
  }, []);

  useEffect(() => {
    if (!imageElement) return;

    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true });
    if (!tempCtx) return;

    const cropData = settings.crop || { x: 0, y: 0, width: imageElement.width, height: imageElement.height };
    tempCanvas.width = cropData.width;
    tempCanvas.height = cropData.height;

    tempCtx.drawImage(imageElement, cropData.x, cropData.y, cropData.width, cropData.height, 0, 0, cropData.width, cropData.height);
    
    let imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
    const data = imageData.data;
    const { brightness, contrast, saturate, grayscale, sepia, invert } = settings.adjustments;

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
    tempCtx.putImageData(imageData, 0, 0);
    setProcessedImageCache(tempCanvas);

  }, [settings.adjustments, settings.crop, imageElement]);

  useEffect(() => {
    const { canvas, ctx } = getCanvasAndContext();
    if (!canvas || !ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (editorMode === 'collage') {
        const { width, height, backgroundColor, pages, activePageIndex } = collageSettings;
        const activePage = pages[activePageIndex];
        if (!activePage) return;

        const { layers, sheet } = activePage;
        canvas.width = width;
        canvas.height = height;

        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, width, height);

        if (sheet.enabled) {
          ctx.strokeStyle = sheet.lineColor;
          ctx.lineWidth = 1;
          if (sheet.horizontalLines) {
            for (let y = sheet.marginTop; y < height; y += sheet.spacing) {
              ctx.beginPath();
              ctx.moveTo(sheet.marginLeft, y);
              ctx.lineTo(width, y);
              ctx.stroke();
            }
          }
          if (sheet.verticalLines) {
            for (let x = sheet.marginLeft; x < width; x += sheet.spacing) {
              ctx.beginPath();
              ctx.moveTo(x, sheet.marginTop);
              ctx.lineTo(x, height);
              ctx.stroke();
            }
          }
        }

        for (const layer of layers) {
            const layerWidthPx = (layer.width / 100) * width;
            const layerHeightPx = layerWidthPx / (layer.originalWidth / layer.originalHeight);
            const layerX = (layer.x / 100) * width;
            const layerY = (layer.y / 100) * height;

            ctx.save();
            ctx.translate(layerX, layerY);
            ctx.rotate(layer.rotation * Math.PI / 180);
            ctx.globalAlpha = layer.opacity;
            ctx.drawImage(layer.img, -layerWidthPx / 2, -layerHeightPx / 2, layerWidthPx, layerHeightPx);
            ctx.restore();
        }
        
        if (selectedLayerId) {
            const selectedLayer = layers.find(l => l.id === selectedLayerId);
            if (selectedLayer) {
                const { corners, rotationHandle } = getLayerHandlePositions(selectedLayer, canvas);
                
                ctx.save();
                ctx.strokeStyle = 'rgba(75, 0, 130, 0.9)'; // Muted Indigo
                ctx.lineWidth = 1;

                // Draw bounding box
                ctx.beginPath();
                ctx.moveTo(corners.tl.x, corners.tl.y);
                ctx.lineTo(corners.tr.x, corners.tr.y);
                ctx.lineTo(corners.br.x, corners.br.y);
                ctx.lineTo(corners.bl.x, corners.bl.y);
                ctx.closePath();
                ctx.stroke();

                // Draw rotation line and handle
                ctx.beginPath();
                ctx.moveTo((corners.tr.x + corners.tl.x) / 2, (corners.tr.y + corners.tl.y) / 2);
                ctx.lineTo(rotationHandle.x, rotationHandle.y);
                ctx.stroke();
                
                ctx.beginPath();
                ctx.arc(rotationHandle.x, rotationHandle.y, LAYER_RESIZE_HANDLE_SIZE / 1.5, 0, 2 * Math.PI);
                ctx.fillStyle = 'white';
                ctx.fill();
                ctx.stroke();
                
                // Draw resize handles
                Object.values(corners).forEach(corner => {
                    ctx.beginPath();
                    ctx.rect(corner.x - LAYER_RESIZE_HANDLE_SIZE / 2, corner.y - LAYER_RESIZE_HANDLE_SIZE / 2, LAYER_RESIZE_HANDLE_SIZE, LAYER_RESIZE_HANDLE_SIZE);
                    ctx.fillStyle = 'white';
                    ctx.fill();
                    ctx.stroke();
                });
                
                ctx.restore();
            }
        }
        return;
    }
    
    const img = imageElement;
    if (!img) return;

    if (activeTab === 'crop') {
        const container = containerRef.current;
        if (!container) return;

        const scale = Math.min(container.clientWidth / img.width, container.clientHeight / img.height);
        const canvasWidth = img.width * scale;
        const canvasHeight = img.height * scale;
        
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        if (settings.cropMode === 'rect') {
          const crop = pendingCrop || settings.crop || { x: 0, y: 0, width: img.width, height: img.height };
          const sx = crop.x * scale;
          const sy = crop.y * scale;
          const sWidth = crop.width * scale;
          const sHeight = crop.height * scale;
          
          ctx.save();
          ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
          ctx.beginPath();
          ctx.rect(0, 0, canvas.width, canvas.height);
          ctx.rect(sx, sy, sWidth, sHeight);
          ctx.fill('evenodd');
          ctx.restore();

          ctx.save();
          ctx.lineWidth = 1;
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
          ctx.strokeRect(sx + 0.5, sy + 0.5, sWidth, sHeight);
          
          if (sWidth > 30 && sHeight > 30) {
              ctx.beginPath();
              ctx.lineWidth = 0.5;
              ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
              ctx.moveTo(sx + sWidth / 3 + 0.5, sy); ctx.lineTo(sx + sWidth / 3 + 0.5, sy + sHeight);
              ctx.moveTo(sx + 2 * sWidth / 3 + 0.5, sy); ctx.lineTo(sx + 2 * sWidth / 3 + 0.5, sy + sHeight);
              ctx.moveTo(sx, sy + sHeight / 3 + 0.5); ctx.lineTo(sx + sWidth, sy + sHeight / 3 + 0.5);
              ctx.moveTo(sx, sy + 2 * sHeight / 3 + 0.5); ctx.lineTo(sx + sWidth, sy + 2 * sHeight / 3 + 0.5);
              ctx.stroke();
          }
          ctx.restore();

          ctx.save();
          ctx.fillStyle = 'white';
          ctx.strokeStyle = 'black';
          ctx.lineWidth = 1;
          const handles = getCropHandleRects(sx, sy, sWidth, sHeight);
          Object.values(handles).forEach(rect => {
              ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
              ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
          });
          ctx.restore();
        } else if (settings.cropMode === 'perspective' && settings.perspectivePoints) {
            const { tl, tr, bl, br } = settings.perspectivePoints;
            const points = {
              tl: { x: tl.x * scale, y: tl.y * scale },
              tr: { x: tr.x * scale, y: tr.y * scale },
              bl: { x: bl.x * scale, y: bl.y * scale },
              br: { x: br.x * scale, y: br.y * scale },
            };
            
            ctx.save();
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.beginPath();
            ctx.rect(0, 0, canvas.width, canvas.height); // Outer rectangle
            ctx.moveTo(points.tl.x, points.tl.y); // Inner path
            ctx.lineTo(points.tr.x, points.tr.y);
            ctx.lineTo(points.br.x, points.br.y);
            ctx.lineTo(points.bl.x, points.bl.y);
            ctx.closePath();
            ctx.fill('evenodd');
            ctx.restore();
  
            ctx.save();
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(points.tl.x, points.tl.y);
            ctx.lineTo(points.tr.x, points.tr.y);
            ctx.lineTo(points.br.x, points.br.y);
            ctx.lineTo(points.bl.x, points.bl.y);
            ctx.closePath();
            ctx.stroke();

            // Add perspective grid
            ctx.lineWidth = 0.5;
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';

            const lerp = (p1: {x:number, y:number}, p2: {x:number, y:number}, t: number) => ({ x: p1.x + (p2.x - p1.x) * t, y: p1.y + (p2.y - p1.y) * t });

            for (let i = 1; i < 3; i++) {
                const t = i / 3;
                // Horizontal grid lines
                const p1 = lerp(points.tl, points.bl, t);
                const p2 = lerp(points.tr, points.br, t);
                ctx.beginPath();
                ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.stroke();

                // Vertical grid lines
                const p3 = lerp(points.tl, points.tr, t);
                const p4 = lerp(points.bl, points.br, t);
                ctx.beginPath();
                ctx.moveTo(p3.x, p3.y);
                ctx.lineTo(p4.x, p4.y);
                ctx.stroke();
            }
            ctx.restore();
  
            ctx.save();
            ctx.fillStyle = 'white';
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 1.5;
            Object.values(points).forEach(p => {
              ctx.beginPath();
              ctx.arc(p.x, p.y, PERSPECTIVE_HANDLE_RADIUS, 0, 2 * Math.PI);
              ctx.fill();
              ctx.stroke();
            });
            ctx.restore();
        }

    } else {
        const { width, height, rotation, flipHorizontal, flipVertical, texts, signatures, backgroundColor } = settings;
        canvas.width = width;
        canvas.height = height;

        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, width, height);

        if (processedImageCache) {
          ctx.save();
          const rad = (rotation * Math.PI) / 180;
          const sin = Math.abs(Math.sin(rad));
          const cos = Math.abs(Math.cos(rad));
          const boundingBoxWidth = processedImageCache.width * cos + processedImageCache.height * sin;
          const boundingBoxHeight = processedImageCache.width * sin + processedImageCache.height * cos;
          const scale = Math.min(width / boundingBoxWidth, height / boundingBoxHeight);
          const drawWidth = processedImageCache.width * scale;
          const drawHeight = processedImageCache.height * scale;
          
          ctx.translate(width / 2, height / 2);
          if (flipHorizontal) ctx.scale(-1, 1);
          if (flipVertical) ctx.scale(1, -1);
          ctx.rotate(rad);
          
          ctx.drawImage(processedImageCache, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
          ctx.restore();
        }

        signatures.forEach(sig => {
          if (sig.img) {
            const sigWidth = (sig.width / 100) * width;
            const sigHeight = sigWidth / (sig.img.width / sig.img.height);
            const sigX = (sig.x / 100) * width;
            const sigY = (sig.y / 100) * height;

            ctx.save();
            ctx.translate(sigX, sigY);
            ctx.rotate(sig.rotation * Math.PI / 180);
            ctx.globalAlpha = sig.opacity;
            ctx.drawImage(sig.img, -sigWidth / 2, -sigHeight / 2, sigWidth, sigHeight);
            ctx.restore();
          }
        });

        texts.forEach(text => {
            const textX = (text.x / 100) * width;
            const textY = (text.y / 100) * height;

            ctx.save();
            ctx.translate(textX, textY);
            ctx.rotate(text.rotation * Math.PI / 180);

            ctx.font = `${text.size}px ${text.font}`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            const padding = text.padding || 0;
            if (text.backgroundColor && text.backgroundColor !== 'transparent' && padding >= 0) {
                const metrics = ctx.measureText(text.text);
                 const fontHeight = metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent;
                const rectWidth = metrics.width + padding * 2;
                const rectHeight = fontHeight + padding * 2;
                ctx.fillStyle = text.backgroundColor;
                ctx.fillRect(-rectWidth / 2, -rectHeight / 2, rectWidth, rectHeight);
            }

            ctx.fillStyle = text.color;
            ctx.fillText(text.text, 0, 0);
            ctx.restore();
        });
        
        if (activeTab === 'text') {
            if (selectedTextId) {
                const selectedText = texts.find(t => t.id === selectedTextId);
                if (selectedText) {
                    const { corners, rotationHandle } = getTextHandlePositions(selectedText, canvas, ctx);
                    
                    ctx.save();
                    ctx.strokeStyle = 'rgba(75, 0, 130, 0.9)'; // Muted Indigo
                    ctx.lineWidth = 1;

                    // Draw bounding box
                    ctx.beginPath();
                    ctx.moveTo(corners.tl.x, corners.tl.y);
                    ctx.lineTo(corners.tr.x, corners.tr.y);
                    ctx.lineTo(corners.br.x, corners.br.y);
                    ctx.lineTo(corners.bl.x, corners.bl.y);
                    ctx.closePath();
                    ctx.stroke();

                    // Draw rotation line and handle
                    ctx.beginPath();
                    ctx.moveTo((corners.tr.x + corners.tl.x) / 2, (corners.tr.y + corners.tl.y) / 2);
                    ctx.lineTo(rotationHandle.x, rotationHandle.y);
                    ctx.stroke();
                    
                    ctx.beginPath();
                    ctx.arc(rotationHandle.x, rotationHandle.y, TEXT_RESIZE_HANDLE_SIZE / 1.5, 0, 2 * Math.PI);
                    ctx.fillStyle = 'white';
                    ctx.fill();
                    ctx.stroke();
                    
                    // Draw resize handles
                    Object.values(corners).forEach(corner => {
                        ctx.beginPath();
                        ctx.rect(corner.x - TEXT_RESIZE_HANDLE_SIZE / 2, corner.y - TEXT_RESIZE_HANDLE_SIZE / 2, TEXT_RESIZE_HANDLE_SIZE, TEXT_RESIZE_HANDLE_SIZE);
                        ctx.fillStyle = 'white';
                        ctx.fill();
                        ctx.stroke();
                    });
                    
                    ctx.restore();
                }
            }
            if (selectedSignatureId) {
              const selectedSignature = signatures.find(s => s.id === selectedSignatureId);
              if (selectedSignature) {
                const { corners, rotationHandle } = getSignatureHandlePositions(selectedSignature, canvas);
                
                ctx.save();
                ctx.strokeStyle = 'rgba(75, 0, 130, 0.9)'; // Muted Indigo
                ctx.lineWidth = 1;

                ctx.beginPath();
                ctx.moveTo(corners.tl.x, corners.tl.y);
                ctx.lineTo(corners.tr.x, corners.tr.y);
                ctx.lineTo(corners.br.x, corners.br.y);
                ctx.lineTo(corners.bl.x, corners.bl.y);
                ctx.closePath();
                ctx.stroke();

                ctx.beginPath();
                ctx.moveTo((corners.tr.x + corners.tl.x) / 2, (corners.tr.y + corners.tl.y) / 2);
                ctx.lineTo(rotationHandle.x, rotationHandle.y);
                ctx.stroke();
                
                ctx.beginPath();
                ctx.arc(rotationHandle.x, rotationHandle.y, SIGNATURE_RESIZE_HANDLE_SIZE / 1.5, 0, 2 * Math.PI);
                ctx.fillStyle = 'white';
                ctx.fill();
                ctx.stroke();
                
                Object.values(corners).forEach(corner => {
                    ctx.beginPath();
                    ctx.rect(corner.x - SIGNATURE_RESIZE_HANDLE_SIZE / 2, corner.y - SIGNATURE_RESIZE_HANDLE_SIZE / 2, SIGNATURE_RESIZE_HANDLE_SIZE, SIGNATURE_RESIZE_HANDLE_SIZE);
                    ctx.fillStyle = 'white';
                    ctx.fill();
                    ctx.stroke();
                });
                
                ctx.restore();
              }
            }
        }
    }
  }, [settings, imageElement, activeTab, getCanvasAndContext, pendingCrop, processedImageCache, getTextHandlePositions, selectedTextId, getSignatureHandlePositions, selectedSignatureId, editorMode, collageSettings, selectedLayerId, getLayerHandlePositions]);

  const getInteractionPos = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const { canvas } = getCanvasAndContext();
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
  }, [getCanvasAndContext]);

  const getCropHandleRects = (x: number, y: number, w: number, h: number, hitArea: boolean = false) => {
    const size = hitArea ? CROP_HANDLE_HIT_AREA : CROP_HANDLE_SIZE;
    const offset = (size / 2);
    return {
      tl: { x: x - offset, y: y - offset, w: size, h: size, cursor: 'nwse-resize' },
      t:  { x: x + w/2 - offset, y: y - offset, w: size, h: size, cursor: 'ns-resize' },
      tr: { x: x + w - offset, y: y - offset, w: size, h: size, cursor: 'nesw-resize' },
      l:  { x: x - offset, y: y + h/2 - offset, w: size, h: size, cursor: 'ew-resize' },
      r:  { x: x + w - offset, y: y + h/2 - offset, w: size, h: size, cursor: 'ew-resize' },
      bl: { x: x - offset, y: y + h - offset, w: size, h: size, cursor: 'nesw-resize' },
      b:  { x: x + w/2 - offset, y: y + h - offset, w: size, h: size, cursor: 'ns-resize' },
      br: { x: x + w - offset, y: y + h - offset, w: size, h: size, cursor: 'nwse-resize' },
    };
  };

  const getInteractionType = useCallback((pos: { x: number, y: number }): { type: InteractionType; cursor: string, textId?: string, signatureId?: string, layerId?: string } | null => {
      const { canvas, ctx } = getCanvasAndContext();
      const img = imageElement;
      if (!canvas || !ctx) return null;
      
      if (editorMode === 'collage') {
          const activePage = collageSettings.pages[collageSettings.activePageIndex];
          if (!activePage) return null;

          const reversedLayers = [...activePage.layers].reverse();
          for (const layer of reversedLayers) {
            const { corners, rotationHandle, center, unrotatedBoundingBox } = getLayerHandlePositions(layer, canvas);
            const isSelected = layer.id === selectedLayerId;

            if (isSelected) {
              for (const [key, corner] of Object.entries(corners)) {
                if (Math.abs(pos.x - corner.x) < LAYER_HANDLE_HIT_AREA / 2 && Math.abs(pos.y - corner.y) < LAYER_HANDLE_HIT_AREA / 2) {
                  const cursorMap = { tl: 'nwse-resize', tr: 'nesw-resize', bl: 'nesw-resize', br: 'nwse-resize' };
                  return { type: `layer-resize-${key}` as InteractionType, layerId: layer.id, cursor: cursorMap[key as keyof typeof cursorMap]};
                }
              }
              if (Math.sqrt(Math.pow(pos.x - rotationHandle.x, 2) + Math.pow(pos.y - rotationHandle.y, 2)) < LAYER_HANDLE_HIT_AREA / 2) {
                return { type: 'layer-rotate', layerId: layer.id, cursor: 'crosshair' };
              }
            }

            const translatedX = pos.x - center.x;
            const translatedY = pos.y - center.y;
            const angleRad = -layer.rotation * Math.PI / 180;
            const cosVal = Math.cos(angleRad);
            const sinVal = Math.sin(angleRad);
            const rotatedX = translatedX * cosVal - translatedY * sinVal;
            const rotatedY = translatedX * sinVal + translatedY * cosVal;

            if (Math.abs(rotatedX) <= unrotatedBoundingBox.width / 2 && Math.abs(rotatedY) <= unrotatedBoundingBox.height / 2) {
              return { type: 'layer-move', layerId: layer.id, cursor: 'move' };
            }
          }
          return null;
      }

      if (!img) return null;

      if (activeTab === 'crop') {
         if (settings.cropMode === 'perspective' && settings.perspectivePoints) {
            const scale = canvas.width / img.width;
            const corners = Object.entries(settings.perspectivePoints);
            for (const [key, point] of corners) {
                const dist = Math.sqrt(Math.pow(pos.x - point.x * scale, 2) + Math.pow(pos.y - point.y * scale, 2));
                if (dist <= PERSPECTIVE_HANDLE_HIT_RADIUS) {
                    return { type: `perspective-${key}` as InteractionType, cursor: 'pointer' };
                }
            }
          } else if (settings.cropMode === 'rect' && pendingCrop) {
            const scale = canvas.width / img.width;
            const sx = pendingCrop.x * scale;
            const sy = pendingCrop.y * scale;
            const sWidth = pendingCrop.width * scale;
            const sHeight = pendingCrop.height * scale;
            const handles = getCropHandleRects(sx, sy, sWidth, sHeight, true);
            
            for (const [key, rect] of Object.entries(handles)) {
                if (pos.x >= rect.x && pos.x <= rect.x + rect.w && pos.y >= rect.y && pos.y <= rect.y + rect.h) {
                    return { type: `crop-${key}` as InteractionType, cursor: rect.cursor };
                }
            }
            if (pos.x >= sx && pos.x <= sx + sWidth && pos.y >= sy && pos.y <= sy + sHeight) {
              return { type: 'crop-move', cursor: 'move' };
            }
          }
      } else if (activeTab === 'text') {
          // Check signatures first, as they might be on top
          const reversedSignatures = [...settings.signatures].reverse();
          for (const sig of reversedSignatures) {
            const { corners, rotationHandle, center, unrotatedBoundingBox } = getSignatureHandlePositions(sig, canvas);
            const isSelected = sig.id === selectedSignatureId;

            if (isSelected) {
              for (const [key, corner] of Object.entries(corners)) {
                if (Math.abs(pos.x - corner.x) < SIGNATURE_HANDLE_HIT_AREA / 2 && Math.abs(pos.y - corner.y) < SIGNATURE_HANDLE_HIT_AREA / 2) {
                  const cursorMap = { tl: 'nwse-resize', tr: 'nesw-resize', bl: 'nesw-resize', br: 'nwse-resize' };
                  return { type: `signature-resize-${key}` as InteractionType, signatureId: sig.id, cursor: cursorMap[key as keyof typeof cursorMap]};
                }
              }
              if (Math.sqrt(Math.pow(pos.x - rotationHandle.x, 2) + Math.pow(pos.y - rotationHandle.y, 2)) < SIGNATURE_HANDLE_HIT_AREA / 2) {
                return { type: 'signature-rotate', signatureId: sig.id, cursor: 'crosshair' };
              }
            }

            const translatedX = pos.x - center.x;
            const translatedY = pos.y - center.y;
            const angleRad = -sig.rotation * Math.PI / 180;
            const cosVal = Math.cos(angleRad);
            const sinVal = Math.sin(angleRad);
            const rotatedX = translatedX * cosVal - translatedY * sinVal;
            const rotatedY = translatedX * sinVal + translatedY * cosVal;

            if (Math.abs(rotatedX) <= unrotatedBoundingBox.width / 2 && Math.abs(rotatedY) <= unrotatedBoundingBox.height / 2) {
              return { type: 'signature-move', signatureId: sig.id, cursor: 'move' };
            }
          }

          const reversedTexts = [...settings.texts].reverse();
          for (const text of reversedTexts) {
              const { corners, rotationHandle, center, unrotatedBoundingBox } = getTextHandlePositions(text, canvas, ctx);
              
              const isSelected = text.id === selectedTextId;

              if (isSelected) {
                  // Check resize handles first
                  for (const [key, corner] of Object.entries(corners)) {
                      if (Math.abs(pos.x - corner.x) < TEXT_HANDLE_HIT_AREA / 2 && Math.abs(pos.y - corner.y) < TEXT_HANDLE_HIT_AREA / 2) {
                           const cursorMap = { tl: 'nwse-resize', tr: 'nesw-resize', bl: 'nesw-resize', br: 'nwse-resize' };
                           return { type: `text-resize-${key}` as InteractionType, textId: text.id, cursor: cursorMap[key as keyof typeof cursorMap]};
                      }
                  }
                  // Check rotation handle
                  if (Math.sqrt(Math.pow(pos.x - rotationHandle.x, 2) + Math.pow(pos.y - rotationHandle.y, 2)) < TEXT_HANDLE_HIT_AREA / 2) {
                      return { type: 'text-rotate', textId: text.id, cursor: 'crosshair' };
                  }
              }

              // Check for move
              const translatedX = pos.x - center.x;
              const translatedY = pos.y - center.y;
              const angleRad = -text.rotation * Math.PI / 180;
              const cosVal = Math.cos(angleRad);
              const sinVal = Math.sin(angleRad);
              const rotatedX = translatedX * cosVal - translatedY * sinVal;
              const rotatedY = translatedX * sinVal + translatedY * cosVal;

              if (Math.abs(rotatedX) <= unrotatedBoundingBox.width / 2 && Math.abs(rotatedY) <= unrotatedBoundingBox.height / 2) {
                  return { type: 'text-move', textId: text.id, cursor: 'move' };
              }
          }
      }

      return null;
  }, [getCanvasAndContext, imageElement, settings, activeTab, pendingCrop, selectedTextId, getTextHandlePositions, selectedSignatureId, getSignatureHandlePositions, editorMode, collageSettings, selectedLayerId, getLayerHandlePositions]);

  const handleInteractionStart = useCallback((e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if ('touches' in e) e.preventDefault();
    if (e.button === 2) return; // Ignore right-clicks

    const pos = getInteractionPos(e);
    const { canvas, ctx } = getCanvasAndContext();
    if (!canvas || !ctx) return;

    const interaction = getInteractionType(pos);
    const currentTime = new Date().getTime();
    const activePage = collageSettings.pages[collageSettings.activePageIndex];

    if (interaction?.type.startsWith('layer-') && activePage) {
        const layerId = interaction.layerId!;
        const clickedLayer = activePage.layers.find(l => l.id === layerId);

        if (clickedLayer) {
            if (selectedLayerId !== layerId) {
                setSelectedLayerId(layerId);
            }
            setInteractionState({ 
              type: interaction.type,
              startPos: pos,
              layerId: layerId,
              startLayer: clickedLayer,
              layerCenter: getLayerHandlePositions(clickedLayer, canvas).center,
            });
        }
        lastClickTime.current = currentTime;
        lastClickTarget.current = layerId;

    } else if (interaction?.type.startsWith('text-')) {
        const textId = interaction.textId!;
        const clickedText = settings.texts.find(t => t.id === textId);

        if (clickedText) {
          if (selectedTextId !== textId) {
            setSelectedTextId(textId);
            setSelectedSignatureId(null);
          }
          
          if (currentTime - lastClickTime.current < 300 && lastClickTarget.current === textId) {
             // Double click
             setEditingTextId(textId);
             setInteractionState(null); // Explicitly stop any interaction
             lastClickTime.current = 0;
             lastClickTarget.current = null;
             return; // Stop further processing
          }

          setInteractionState({ 
            type: interaction.type,
            startPos: pos,
            textId: textId,
            startText: clickedText,
            textCenter: getTextHandlePositions(clickedText, canvas, ctx).center,
          });
        }
        lastClickTime.current = currentTime;
        lastClickTarget.current = textId;

    } else if (interaction?.type.startsWith('signature-')) {
        const signatureId = interaction.signatureId!;
        const clickedSignature = settings.signatures.find(s => s.id === signatureId);

        if (clickedSignature) {
            if (selectedSignatureId !== signatureId) {
                setSelectedSignatureId(signatureId);
                setSelectedTextId(null);
            }

            setInteractionState({
                type: interaction.type,
                startPos: pos,
                signatureId: signatureId,
                startSignature: clickedSignature,
                signatureCenter: getSignatureHandlePositions(clickedSignature, canvas).center
            });
        }
        lastClickTime.current = currentTime;
        lastClickTarget.current = signatureId;
    } else if (interaction?.type.startsWith('crop-') || interaction?.type.startsWith('perspective-')) {
        setSelectedTextId(null);
        setSelectedSignatureId(null);
        setInteractionState({ 
          type: interaction.type,
          startPos: pos,
          startCrop: interaction.type.startsWith('crop-') ? pendingCrop! : undefined
        });
    } else if (activeTab === 'crop' && settings.cropMode === 'rect' && imageElement) {
        setSelectedTextId(null);
        setSelectedSignatureId(null);
        const scale = canvas.width / imageElement.width;
        const newCrop = { x: pos.x / scale, y: pos.y / scale, width: 0, height: 0 };
        setPendingCrop(newCrop);
        setInteractionState({ type: 'crop-br', startPos: pos, startCrop: newCrop });
    } else {
        setSelectedTextId(null);
        setSelectedSignatureId(null);
        setSelectedLayerId(null);
        lastClickTarget.current = null;
    }
  }, [getInteractionPos, getCanvasAndContext, imageElement, activeTab, pendingCrop, setPendingCrop, settings.texts, selectedTextId, setSelectedTextId, setEditingTextId, getTextHandlePositions, getInteractionType, settings.signatures, selectedSignatureId, setSelectedSignatureId, getSignatureHandlePositions, collageSettings, selectedLayerId, setSelectedLayerId, getLayerHandlePositions]);

  const handleInteractionMove = useCallback((e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const pos = getInteractionPos(e);
    
    if (interactionState) {
        if ('touches' in e) e.preventDefault();
        
        const { canvas, ctx } = getCanvasAndContext();
        if (!canvas || !ctx) return;

        const { type, startPos, startText, startSignature, startLayer } = interactionState;

        if (type.startsWith('layer-') && startLayer) {
            const activePage = collageSettings.pages[collageSettings.activePageIndex];
            if (!activePage) return;

            const updateLayer = (newProps: Partial<ImageLayer>) => {
                const newLayers = activePage.layers.map(l => l.id === startLayer.id ? { ...l, ...newProps } : l);
                const newPages = [...collageSettings.pages];
                newPages[collageSettings.activePageIndex] = { ...activePage, layers: newLayers };
                updateCollageSettings({ pages: newPages });
            };

            if (type === 'layer-move') {
                const dx_percent = ((pos.x - startPos.x) / canvas.width) * 100;
                const dy_percent = ((pos.y - startPos.y) / canvas.height) * 100;
                updateLayer({
                    x: Math.max(0, Math.min(100, startLayer.x + dx_percent)),
                    y: Math.max(0, Math.min(100, startLayer.y + dy_percent)),
                });
            } else if (type === 'layer-rotate' && interactionState.layerCenter) {
                const startAngle = Math.atan2(startPos.y - interactionState.layerCenter.y, startPos.x - interactionState.layerCenter.x);
                const currentAngle = Math.atan2(pos.y - interactionState.layerCenter.y, pos.x - interactionState.layerCenter.x);
                const angleDiff = (currentAngle - startAngle) * (180 / Math.PI);
                const newRotation = startLayer.rotation + angleDiff;
                updateLayer({ rotation: newRotation });
            } else if (type.startsWith('layer-resize-') && interactionState.layerCenter) {
                const center = interactionState.layerCenter;
                const startDist = Math.sqrt(Math.pow(startPos.x - center.x, 2) + Math.pow(startPos.y - center.y, 2));
                const currentDist = Math.sqrt(Math.pow(pos.x - center.x, 2) + Math.pow(pos.y - center.y, 2));

                if (startDist > 0) {
                    const scaleFactor = currentDist / startDist;
                    const newWidthPercent = startLayer.width * scaleFactor;
                    const newWidth = Math.max(1, Math.min(200, newWidthPercent));
                    updateLayer({ width: newWidth });
                }
            }
        } else if (type.startsWith('text-') && startText) {
            if (type === 'text-move') {
                const dx_percent = ((pos.x - startPos.x) / canvas.width) * 100;
                const dy_percent = ((pos.y - startPos.y) / canvas.height) * 100;
                const newTexts = settings.texts.map(t => t.id === startText.id ? { ...t, 
                    x: Math.max(0, Math.min(100, startText.x + dx_percent)),
                    y: Math.max(0, Math.min(100, startText.y + dy_percent)),
                } : t);
                updateSettings({ texts: newTexts });
            } else if (type === 'text-rotate' && interactionState.textCenter) {
                const startAngle = Math.atan2(startPos.y - interactionState.textCenter.y, startPos.x - interactionState.textCenter.x);
                const currentAngle = Math.atan2(pos.y - interactionState.textCenter.y, pos.x - interactionState.textCenter.x);
                const angleDiff = (currentAngle - startAngle) * (180 / Math.PI);
                let newRotation = startText.rotation + angleDiff;
                const newTexts = settings.texts.map(t => t.id === startText.id ? { ...t, rotation: newRotation } : t);
                updateSettings({ texts: newTexts });
            } else if (type.startsWith('text-resize-') && interactionState.textCenter) {
                const center = interactionState.textCenter;
                const startDist = Math.sqrt(Math.pow(startPos.x - center.x, 2) + Math.pow(startPos.y - center.y, 2));
                const currentDist = Math.sqrt(Math.pow(pos.x - center.x, 2) + Math.pow(pos.y - center.y, 2));

                if (startDist > 0) {
                    const scaleFactor = currentDist / startDist;
                    const newSize = Math.max(8, startText.size * scaleFactor); // Min font size of 8
                    
                    const newTexts = settings.texts.map(t => t.id === startText.id ? { ...t, size: newSize } : t);
                    updateSettings({ texts: newTexts });
                }
            }
        } else if (type.startsWith('signature-') && startSignature) {
             if (type === 'signature-move') {
                const dx_percent = ((pos.x - startPos.x) / canvas.width) * 100;
                const dy_percent = ((pos.y - startPos.y) / canvas.height) * 100;
                const newSignatures = settings.signatures.map(s => s.id === startSignature.id ? { ...s,
                    x: Math.max(0, Math.min(100, startSignature.x + dx_percent)),
                    y: Math.max(0, Math.min(100, startSignature.y + dy_percent)),
                } : s);
                updateSettings({ signatures: newSignatures });
            } else if (type === 'signature-rotate' && interactionState.signatureCenter) {
                const startAngle = Math.atan2(startPos.y - interactionState.signatureCenter.y, startPos.x - interactionState.signatureCenter.x);
                const currentAngle = Math.atan2(pos.y - interactionState.signatureCenter.y, pos.x - interactionState.signatureCenter.x);
                const angleDiff = (currentAngle - startAngle) * (180 / Math.PI);
                const newRotation = startSignature.rotation + angleDiff;
                const newSignatures = settings.signatures.map(s => s.id === startSignature.id ? { ...s, rotation: newRotation } : s);
                updateSettings({ signatures: newSignatures });
            } else if (type.startsWith('signature-resize-') && interactionState.signatureCenter) {
                const center = interactionState.signatureCenter;
                const startDist = Math.sqrt(Math.pow(startPos.x - center.x, 2) + Math.pow(startPos.y - center.y, 2));
                const currentDist = Math.sqrt(Math.pow(pos.x - center.x, 2) + Math.pow(pos.y - center.y, 2));

                if (startDist > 0) {
                    const scaleFactor = currentDist / startDist;
                    const sigWidthPx = (startSignature.width / 100) * canvas.width;
                    const newSigWidthPx = sigWidthPx * scaleFactor;
                    const newWidthPercent = (newSigWidthPx / canvas.width) * 100;
                    const newWidth = Math.max(1, newWidthPercent); // Min width 1%
                    
                    const newSignatures = settings.signatures.map(s => s.id === startSignature.id ? { ...s, width: newWidth } : s);
                    updateSettings({ signatures: newSignatures });
                }
            }
        } else if (type.startsWith('crop-') && imageElement) {
            const { startCrop } = interactionState;
            if (!startCrop) return;
            const scale = canvas.width / imageElement.width;
            
            if (type === 'crop-move') {
                 const dx = (pos.x - startPos.x) / scale;
                 const dy = (pos.y - startPos.y) / scale;
                 let newCrop = { ...startCrop, x: startCrop.x + dx, y: startCrop.y + dy };
                 newCrop.x = Math.max(0, Math.min(newCrop.x, imageElement.width - newCrop.width));
                 newCrop.y = Math.max(0, Math.min(newCrop.y, imageElement.height - newCrop.height));
                 setPendingCrop({x: Math.round(newCrop.x), y: Math.round(newCrop.y), width: Math.round(newCrop.width), height: Math.round(newCrop.height)} );
            } else {
                 let newCrop = { ...startCrop };
                 const mouseX = pos.x / scale;
                 const mouseY = pos.y / scale;
                 const minW = MIN_CROP_SIZE_PX / scale;
                 const minH = MIN_CROP_SIZE_PX / scale;
                 
                 const anchorX = type.includes('l') ? startCrop.x + startCrop.width : startCrop.x;
                 const anchorY = type.includes('t') ? startCrop.y + startCrop.height : startCrop.y;
                 let newX1 = type.includes('l') ? mouseX : anchorX;
                 let newY1 = type.includes('t') ? mouseY : anchorY;
                 let newX2 = type.includes('r') ? mouseX : anchorX;
                 let newY2 = type.includes('b') ? mouseY : anchorY;
                 
                 if (!type.includes('l') && !type.includes('r')) { newX1 = startCrop.x; newX2 = startCrop.x + startCrop.width; }
                 if (!type.includes('t') && !type.includes('b')) { newY1 = startCrop.y; newY2 = startCrop.y + startCrop.height; }

                 newCrop.x = Math.min(newX1, newX2);
                 newCrop.y = Math.min(newY1, newY2);
                 newCrop.width = Math.abs(newX1 - newX2);
                 newCrop.height = Math.abs(newY1 - newY2);

                 if (newCrop.width < minW) { newCrop.width = minW; if (newCrop.x === Math.min(newX1, newX2)) { newCrop.x = newX2 - minW; } }
                 if (newCrop.height < minH) { newCrop.height = minH; if (newCrop.y === Math.min(newY1, newY2)) { newCrop.y = newY2 - minH; } }
                 if (newCrop.x < 0) { newCrop.width += newCrop.x; newCrop.x = 0; }
                 if (newCrop.y < 0) { newCrop.height += newCrop.y; newCrop.y = 0; }
                 if (newCrop.x + newCrop.width > imageElement.width) { newCrop.width = imageElement.width - newCrop.x; }
                 if (newCrop.y + newCrop.height > imageElement.height) { newCrop.height = imageElement.height - newCrop.y; }
                 setPendingCrop({x: Math.round(newCrop.x), y: Math.round(newCrop.y), width: Math.round(newCrop.width), height: Math.round(newCrop.height)} );
            }
        } else if (type.startsWith('perspective-') && imageElement) {
            const scale = canvas.width / imageElement.width;
            let newX = pos.x / scale;
            let newY = pos.y / scale;

            newX = Math.max(0, Math.min(newX, imageElement.width));
            newY = Math.max(0, Math.min(newY, imageElement.height));
            
            const corner = type.split('-')[1] as keyof CornerPoints;
            const newPoints = { ...settings.perspectivePoints!, [corner]: { x: newX, y: newY } };
            updateSettings({ perspectivePoints: newPoints });
        }
    } else {
        const interaction = getInteractionType(pos);
        if (activeTab === 'crop' && settings.cropMode === 'rect') {
          setCursor(interaction ? interaction.cursor : 'crosshair');
        } else {
          setCursor(interaction ? interaction.cursor : 'default');
        }
    }
  }, [interactionState, getInteractionPos, getCanvasAndContext, imageElement, setPendingCrop, settings, updateSettings, activeTab, getInteractionType, collageSettings, updateCollageSettings]);

  const handleInteractionEnd = useCallback(() => {
    if (interactionState) {
      if (interactionState.type.startsWith('text-resize-') && interactionState.startText) {
          const newTexts = settings.texts.map(t =>
              t.id === interactionState.startText!.id
                  ? { ...t, size: Math.round(t.size) }
                  : t
          );
          updateSettings({ texts: newTexts });
      } else if (interactionState.type.startsWith('layer-resize-') && interactionState.startLayer) {
          const activePage = collageSettings.pages[collageSettings.activePageIndex];
          if (!activePage) return;
          const newLayers = activePage.layers.map(l =>
              l.id === interactionState.startLayer!.id
                  ? { ...l, width: Math.round(l.width) }
                  : l
          );
          const newPages = [...collageSettings.pages];
          newPages[collageSettings.activePageIndex] = { ...activePage, layers: newLayers };
          updateCollageSettings({ pages: newPages });
      }
      setInteractionState(null);
    }
  }, [interactionState, settings.texts, updateSettings, collageSettings, updateCollageSettings]);
  
  const handleMouseLeave = useCallback(() => {
    if (interactionState) {
      handleInteractionEnd();
    }
    setCursor('auto');
  }, [interactionState, handleInteractionEnd]);

  return (
    <div ref={containerRef} className="w-full h-full flex items-center justify-center touch-none">
        <canvas 
          ref={internalCanvasRef} 
          className="max-w-full max-h-full object-contain rounded-lg shadow-md"
          style={{ cursor: cursor, background: editorMode === 'collage' ? 'hsl(var(--muted))' : '' }}
          onMouseDown={handleInteractionStart}
          onMouseMove={handleInteractionMove}
          onMouseUp={handleInteractionEnd}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleInteractionStart}
          onTouchMove={handleInteractionMove}
          onTouchEnd={handleInteractionEnd}
          onTouchCancel={handleInteractionEnd}
          onContextMenu={(e) => e.preventDefault()}
        />
    </div>
  );
});

ImageCanvas.displayName = 'ImageCanvas';

export { ImageCanvas };
