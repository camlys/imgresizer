
"use client";

import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState, useCallback } from 'react';
import type { ImageSettings, OriginalImage, CropSettings, TextOverlay } from '@/lib/types';

interface ImageCanvasProps {
  originalImage: OriginalImage;
  settings: ImageSettings;
  updateSettings: (newSettings: Partial<ImageSettings>) => void;
  activeTab: string;
  pendingCrop: CropSettings | null;
  setPendingCrop: (crop: CropSettings | null) => void;
}

const CROP_HANDLE_SIZE = 10;
const MIN_CROP_SIZE_PX = 20;
const TEXT_ROTATION_HANDLE_RADIUS = 6;
const TEXT_ROTATION_HANDLE_OFFSET = 20;

type InteractionType = 
  | 'crop-move' | 'crop-tl' | 'crop-t' | 'crop-tr' | 'crop-l' | 'crop-r' | 'crop-bl' | 'crop-b' | 'crop-br' | 'crop-new'
  | 'text-move' | 'text-rotate';

type InteractionState = {
  type: InteractionType;
  startPos: { x: number; y: number };
  
  // Crop-specific state
  startCrop?: CropSettings;

  // Text-specific state
  textId?: string;
  startTextCoords?: { x: number; y: number };
  startTextRotation?: number;
  textCenter?: { x: number; y: number };
};

const ImageCanvas = forwardRef<HTMLCanvasElement, ImageCanvasProps>(({ 
  originalImage, 
  settings, 
  updateSettings,
  activeTab, 
  pendingCrop, 
  setPendingCrop 
}, ref) => {
  const internalCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [imageElement, setImageElement] = useState<HTMLImageElement | null>(null);
  const [interactionState, setInteractionState] = useState<InteractionState | null>(null);

  useImperativeHandle(ref, () => internalCanvasRef.current!, []);

  useEffect(() => {
    const img = new Image();
    if (!originalImage.src.startsWith('data:')) {
      img.crossOrigin = 'anonymous';
    }
    img.src = originalImage.src;
    img.onload = () => setImageElement(img);
  }, [originalImage.src]);

  const getCanvasAndContext = useCallback(() => {
    const canvas = internalCanvasRef.current;
    const ctx = canvas?.getContext('2d', { willReadFrequently: true });
    return { canvas, ctx };
  }, []);

  useEffect(() => {
    const { canvas, ctx } = getCanvasAndContext();
    const img = imageElement;
    if (!canvas || !ctx || !img) return;
    
    // Clear canvas before drawing
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (activeTab === 'crop') {
        const container = containerRef.current;
        if (!container) return;

        const scale = Math.min(container.clientWidth / img.width, container.clientHeight / img.height);
        const canvasWidth = img.width * scale;
        const canvasHeight = img.height * scale;
        
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

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
    } else {
        const { width, height, rotation, flipHorizontal, flipVertical, texts, adjustments, crop } = settings;
        canvas.width = width;
        canvas.height = height;

        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true });
        if (!tempCtx) return;

        const cropData = crop || { x: 0, y: 0, width: img.width, height: img.height };
        tempCanvas.width = cropData.width;
        tempCanvas.height = cropData.height;

        tempCtx.drawImage(img, cropData.x, cropData.y, cropData.width, cropData.height, 0, 0, cropData.width, cropData.height);

        const initialAdjustments = { brightness: 100, contrast: 100, saturate: 100, grayscale: 0, sepia: 0, invert: 0 };
        if (Object.values(adjustments).some((v, i) => v !== Object.values(initialAdjustments)[i])) {
            let imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
            const data = imageData.data;
            const { brightness, contrast, saturate, grayscale, sepia, invert } = adjustments;

            for (let i = 0; i < data.length; i += 4) {
                let r = data[i], g = data[i + 1], b = data[i + 2];
                if (brightness !== 100) { const bVal = (255 * (brightness - 100)) / 100; r += bVal; g += bVal; b += bVal; }
                if (contrast !== 100) { const cVal = contrast / 100; r = cVal * (r - 128) + 128; g = cVal * (g - 128) + 128; b = cVal * (b - 128) + 128; }
                if (saturate !== 100) { const sVal = saturate / 100; const gray = 0.299 * r + 0.587 * g + 0.114 * b; r = gray + (r - gray) * sVal; g = gray + (g - gray) * sVal; b = gray + (b - gray) * sVal; }
                const tempR = r, tempG = g, tempB = b;
                if (sepia > 0) { const sVal = sepia / 100; const sepiaR = tempR * 0.393 + tempG * 0.769 + tempB * 0.189; const sepiaG = tempR * 0.349 + tempG * 0.686 + tempB * 0.168; const sepiaB = tempR * 0.272 + tempG * 0.534 + tempB * 0.131; r = r * (1 - sVal) + sepiaR * sVal; g = g * (1 - sVal) + sepiaG * sVal; b = b * (1 - sVal) + sepiaB * sVal; }
                if (grayscale > 0) { const gVal = grayscale / 100; const gray = r * 0.299 + g * 0.587 + b * 0.114; r = r * (1 - gVal) + gray * gVal; g = g * (1 - gVal) + gray * gVal; b = b * (1 - gVal) + gray * gVal; }
                if (invert > 0) { const iVal = invert / 100; r = r * (1 - iVal) + (255 - r) * iVal; g = g * (1 - iVal) + (255 - g) * iVal; b = b * (1 - iVal) + (255 - b) * iVal; }
                data[i] = Math.max(0, Math.min(255, r)); data[i+1] = Math.max(0, Math.min(255, g)); data[i+2] = Math.max(0, Math.min(255, b));
            }
            tempCtx.putImageData(imageData, 0, 0);
        }
        
        ctx.save();
        const rad = (rotation * Math.PI) / 180;
        const sin = Math.abs(Math.sin(rad));
        const cos = Math.abs(Math.cos(rad));
        const boundingBoxWidth = tempCanvas.width * cos + tempCanvas.height * sin;
        const boundingBoxHeight = tempCanvas.width * sin + tempCanvas.height * cos;
        const scale = Math.min(width / boundingBoxWidth, height / boundingBoxHeight);
        const drawWidth = tempCanvas.width * scale;
        const drawHeight = tempCanvas.height * scale;
        
        ctx.translate(width / 2, height / 2);
        if (flipHorizontal) ctx.scale(-1, 1);
        if (flipVertical) ctx.scale(1, -1);
        ctx.rotate(rad);
        
        ctx.drawImage(tempCanvas, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
        ctx.restore();

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
                const rectWidth = metrics.width + padding * 2;
                const rectHeight = text.size + padding * 2;
                ctx.fillStyle = text.backgroundColor;
                ctx.fillRect(-rectWidth / 2, -rectHeight / 2, rectWidth, rectHeight);
            }

            ctx.fillStyle = text.color;
            ctx.fillText(text.text, 0, 0);
            ctx.restore();
        });
        
        if (activeTab === 'text') {
            texts.forEach(text => {
                const { boundingBox, rotationHandle } = getTextHandlePositions(text, canvas, ctx);
                ctx.save();
                ctx.strokeStyle = 'rgba(75, 0, 130, 0.9)'; // Muted Indigo
                ctx.lineWidth = 1;
                ctx.strokeRect(boundingBox.x, boundingBox.y, boundingBox.width, boundingBox.height);
                ctx.beginPath();
                ctx.moveTo(boundingBox.x + boundingBox.width / 2, boundingBox.y);
                ctx.lineTo(rotationHandle.x, rotationHandle.y);
                ctx.stroke();
                ctx.beginPath();
                ctx.arc(rotationHandle.x, rotationHandle.y, rotationHandle.radius, 0, 2 * Math.PI);
                ctx.fillStyle = 'white';
                ctx.fill();
                ctx.stroke();
                ctx.restore();
            });
        }
    }
  }, [settings, imageElement, activeTab, getCanvasAndContext, pendingCrop]);

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

  const getCropHandleRects = (x: number, y: number, w: number, h: number) => {
    const hs = CROP_HANDLE_SIZE;
    return {
      tl: { x: x - hs/2, y: y - hs/2, w: hs, h: hs }, t:  { x: x + w/2 - hs/2, y: y - hs/2, w: hs, h: hs }, tr: { x: x + w - hs/2, y: y - hs/2, w: hs, h: hs },
      l:  { x: x - hs/2, y: y + h/2 - hs/2, w: hs, h: hs }, r:  { x: x + w - hs/2, y: y + h/2 - hs/2, w: hs, h: hs },
      bl: { x: x - hs/2, y: y + h - hs/2, w: hs, h: hs }, b:  { x: x + w/2 - hs/2, y: y + h - hs/2, w: hs, h: hs }, br: { x: x + w - hs/2, y: y + h - hs/2, w: hs, h: hs },
    };
  };

  const getTextHandlePositions = useCallback((text: TextOverlay, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
    ctx.font = `${text.size}px ${text.font}`;
    const metrics = ctx.measureText(text.text);
    const padding = text.padding || 0;
    const rectWidth = metrics.width + padding * 2;
    const rectHeight = text.size + padding * 2;
    const canvasX = (text.x / 100) * canvas.width;
    const canvasY = (text.y / 100) * canvas.height;
    
    // Non-rotated bounding box for interaction detection
    const boundingBox = { x: canvasX - rectWidth / 2, y: canvasY - rectHeight / 2, width: rectWidth, height: rectHeight };
    
    // Position of rotation handle, rotated with the text
    const handleAngle = (text.rotation - 90) * Math.PI / 180;
    const handleDistance = (rectHeight / 2) + TEXT_ROTATION_HANDLE_OFFSET;
    const rotationHandle = {
      x: canvasX + handleDistance * Math.cos(handleAngle),
      y: canvasY + handleDistance * Math.sin(handleAngle),
      radius: TEXT_ROTATION_HANDLE_RADIUS,
    };

    return { boundingBox, rotationHandle };
  }, []);

  const getCropInteractionType = (mouseX: number, mouseY: number): InteractionType | 'crop-move' | null => {
      const { canvas } = getCanvasAndContext();
      const img = imageElement;
      if (!canvas || !img || !pendingCrop) return null;
      const scale = canvas.width / img.width;
      const sx = pendingCrop.x * scale;
      const sy = pendingCrop.y * scale;
      const sWidth = pendingCrop.width * scale;
      const sHeight = pendingCrop.height * scale;
      const handles = getCropHandleRects(sx, sy, sWidth, sHeight);
      for (const [key, rect] of Object.entries(handles)) {
          if (mouseX >= rect.x && mouseX <= rect.x + rect.w && mouseY >= rect.y && mouseY <= rect.y + rect.h) {
              return `crop-${key}` as InteractionType;
          }
      }
      if (mouseX >= sx && mouseX <= sx + sWidth && mouseY >= sy && mouseY <= sy + sHeight) return 'crop-move';
      return null;
  };

  const handleInteractionStart = useCallback((e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const pos = getInteractionPos(e);
    const { canvas, ctx } = getCanvasAndContext();
    if (!canvas || !ctx || !imageElement) return;

    if (e.cancelable) e.preventDefault();

    if (activeTab === 'crop') {
        const cropInteractionType = getCropInteractionType(pos.x, pos.y);
        if (cropInteractionType) {
            setInteractionState({ type: cropInteractionType, startPos: pos, startCrop: pendingCrop! });
        } else {
            const scale = canvas.width / imageElement.width;
            const newCrop = { x: pos.x / scale, y: pos.y / scale, width: 0, height: 0 };
            setPendingCrop(newCrop);
            setInteractionState({ type: 'crop-br', startPos: pos, startCrop: newCrop });
        }
    } else if (activeTab === 'text') {
        const reversedTexts = [...settings.texts].reverse();
        for (const text of reversedTexts) {
            const { boundingBox, rotationHandle } = getTextHandlePositions(text, canvas, ctx);
            const distToHandle = Math.sqrt(Math.pow(pos.x - rotationHandle.x, 2) + Math.pow(pos.y - rotationHandle.y, 2));

            if (distToHandle <= rotationHandle.radius + 5) { // 5px buffer
                setInteractionState({
                    type: 'text-rotate', textId: text.id, startPos: pos, startTextRotation: text.rotation,
                    textCenter: { x: (text.x / 100) * canvas.width, y: (text.y / 100) * canvas.height },
                });
                return;
            }
            if (pos.x >= boundingBox.x && pos.x <= bbox.x + bbox.width && pos.y >= bbox.y && pos.y <= bbox.y + bbox.height) {
                setInteractionState({
                    type: 'text-move', textId: text.id, startPos: pos, startTextCoords: { x: text.x, y: text.y },
                });
                return;
            }
        }
    }
  }, [getInteractionPos, getCanvasAndContext, imageElement, activeTab, pendingCrop, settings.texts, setPendingCrop, getTextHandlePositions]);

  const handleInteractionMove = useCallback((e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!interactionState) {
       // Handle hover cursor changes
       return;
    }
    
    if (e.cancelable) e.preventDefault();
    const pos = getInteractionPos(e);
    const { canvas } = getCanvasAndContext();
    const img = imageElement;
    if (!canvas || !img) return;

    const { type, startPos } = interactionState;
    
    if (type.startsWith('text-')) {
        if (type === 'text-move' && interactionState.textId && interactionState.startTextCoords) {
            const dx_percent = ((pos.x - startPos.x) / canvas.width) * 100;
            const dy_percent = ((pos.y - startPos.y) / canvas.height) * 100;
            const newTexts = settings.texts.map(t => t.id === interactionState.textId ? { ...t, 
                x: Math.max(0, Math.min(100, interactionState.startTextCoords!.x + dx_percent)),
                y: Math.max(0, Math.min(100, interactionState.startTextCoords!.y + dy_percent)),
            } : t);
            updateSettings({ texts: newTexts });
        } else if (type === 'text-rotate' && interactionState.textId && interactionState.textCenter) {
            const currentAngle = Math.atan2(pos.y - interactionState.textCenter.y, pos.x - interactionState.textCenter.x) * (180 / Math.PI);
            const startAngle = Math.atan2(startPos.y - interactionState.textCenter.y, startPos.x - interactionState.textCenter.x) * (180 / Math.PI);
            let newRotation = interactionState.startTextRotation! + (currentAngle - startAngle);
            newRotation = (newRotation % 360 + 360) % 360;
            const newTexts = settings.texts.map(t => t.id === interactionState.textId ? { ...t, rotation: Math.round(newRotation) } : t);
            updateSettings({ texts: newTexts });
        }
    } else if (type.startsWith('crop-')) {
        const { startCrop } = interactionState;
        if (!startCrop) return;
        const scale = canvas.width / img.width;
        
        if (type === 'crop-move') {
             const dx = (pos.x - startPos.x) / scale;
             const dy = (pos.y - startPos.y) / scale;
             let newCrop = { ...startCrop, x: startCrop.x + dx, y: startCrop.y + dy };
             newCrop.x = Math.max(0, Math.min(newCrop.x, img.width - newCrop.width));
             newCrop.y = Math.max(0, Math.min(newCrop.y, img.height - newCrop.height));
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
             if (newCrop.x + newCrop.width > img.width) { newCrop.width = img.width - newCrop.x; }
             if (newCrop.y + newCrop.height > img.height) { newCrop.height = img.height - newCrop.y; }
             setPendingCrop({x: Math.round(newCrop.x), y: Math.round(newCrop.y), width: Math.round(newCrop.width), height: Math.round(newCrop.height)} );
        }
    }
  }, [interactionState, getInteractionPos, getCanvasAndContext, imageElement, setPendingCrop, settings.texts, updateSettings]);

  const handleInteractionEnd = useCallback(() => {
    setInteractionState(null);
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full flex items-center justify-center touch-none">
        <canvas 
          ref={internalCanvasRef} 
          className="max-w-full max-h-full object-contain rounded-lg shadow-md"
          onMouseDown={handleInteractionStart}
          onMouseMove={handleInteractionMove}
          onMouseUp={handleInteractionEnd}
          onMouseLeave={handleInteractionEnd}
          onTouchStart={handleInteractionStart}
          onTouchMove={handleInteractionMove}
          onTouchEnd={handleInteractionEnd}
          onTouchCancel={handleInteractionEnd}
        />
    </div>
  );
});

ImageCanvas.displayName = 'ImageCanvas';

export { ImageCanvas };
