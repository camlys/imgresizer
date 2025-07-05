
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

const HANDLE_SIZE = 10;
const MIN_CROP_SIZE_PX = 20;

type Interaction = 
  | 'move' | 'tl' | 't' | 'tr' | 'l' | 'r' | 'bl' | 'b' | 'br' 
  | 'text' | null;

const getFilterString = (adjustments: ImageSettings['adjustments']) => {
  const { brightness, contrast, saturate, grayscale, sepia, hue, invert, blur } = adjustments;
  const filters = [];
  if (brightness !== 100) filters.push(`brightness(${brightness}%)`);
  if (contrast !== 100) filters.push(`contrast(${contrast}%)`);
  if (saturate !== 100) filters.push(`saturate(${saturate}%)`);
  if (grayscale !== 0) filters.push(`grayscale(${grayscale}%)`);
  if (sepia !== 0) filters.push(`sepia(${sepia}%)`);
  if (hue !== 0) filters.push(`hue-rotate(${hue}deg)`);
  if (invert !== 0) filters.push(`invert(${invert}%)`);
  if (blur !== 0) filters.push(`blur(${blur}px)`);
  return filters.length > 0 ? filters.join(' ') : '';
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

  const [interaction, setInteraction] = useState<Interaction>(null);
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);
  const [startCrop, setStartCrop] = useState<CropSettings | null>(null);
  const [draggingTextId, setDraggingTextId] = useState<string | null>(null);
  const [dragStartTextPos, setDragStartTextPos] = useState<{ x: number, y: number } | null>(null);

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
    const ctx = canvas?.getContext('2d');
    return { canvas, ctx };
  }, []);

  const getInteractionPos = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const { canvas } = getCanvasAndContext();
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  }, [getCanvasAndContext]);

  useEffect(() => {
    const { canvas, ctx } = getCanvasAndContext();
    const img = imageElement;
    if (!canvas || !ctx || !img) return;
    
    // Always render with original orientation for cropping
    if (activeTab === 'crop') {
        const container = containerRef.current;
        if (!container) return;

        const scale = Math.min(container.clientWidth / img.width, container.clientHeight / img.height);
        const canvasWidth = img.width * scale;
        const canvasHeight = img.height * scale;
        
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        
        // Use a temporary canvas to apply filters for better browser support
        const tempFilteredCanvas = document.createElement('canvas');
        const tempFilteredCtx = tempFilteredCanvas.getContext('2d');
        if (!tempFilteredCtx) return;

        tempFilteredCanvas.width = canvas.width;
        tempFilteredCanvas.height = canvas.height;

        const filterString = getFilterString(settings.adjustments);
        if (filterString) {
            tempFilteredCtx.filter = filterString;
        }

        tempFilteredCtx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Draw the filtered result to the main canvas
        ctx.drawImage(tempFilteredCanvas, 0, 0);

        // Now draw crop overlay on top
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
        const handles = getHandleRects(sx, sy, sWidth, sHeight);
        Object.values(handles).forEach(rect => {
            ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
            ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
        });
        ctx.restore();
    } else {
        const { width, height, rotation, flipHorizontal, flipVertical, crop, texts, adjustments } = settings;
        canvas.width = width;
        canvas.height = height;

        // Create a temporary canvas to bake in filters for better browser compatibility
        const filterCanvas = document.createElement('canvas');
        const filterCtx = filterCanvas.getContext('2d');
        if (!filterCtx) return;

        const cropData = crop || { x: 0, y: 0, width: img.width, height: img.height };
        filterCanvas.width = cropData.width;
        filterCanvas.height = cropData.height;
        
        const filterString = getFilterString(adjustments);
        if (filterString) {
            filterCtx.filter = filterString;
        }

        filterCtx.drawImage(img,
            cropData.x, cropData.y, cropData.width, cropData.height,
            0, 0,
            cropData.width, cropData.height
        );
        
        ctx.save();
        
        const rad = (rotation * Math.PI) / 180;
        const sin = Math.abs(Math.sin(rad));
        const cos = Math.abs(Math.cos(rad));
        
        const boundingBoxWidth = filterCanvas.width * cos + filterCanvas.height * sin;
        const boundingBoxHeight = filterCanvas.width * sin + filterCanvas.height * cos;

        const scale = Math.min(width / boundingBoxWidth, height / boundingBoxHeight);
        
        const drawWidth = filterCanvas.width * scale;
        const drawHeight = filterCanvas.height * scale;
        
        ctx.translate(width / 2, height / 2);
        if (flipHorizontal) ctx.scale(-1, 1);
        if (flipVertical) ctx.scale(1, -1);
        ctx.rotate(rad);
        
        ctx.drawImage(filterCanvas, 
            -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight
        );

        ctx.restore();

        texts.forEach(text => {
            const textX = (text.x / 100) * width;
            const textY = (text.y / 100) * height;

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
    }

  }, [settings, originalImage, imageElement, activeTab, getCanvasAndContext, pendingCrop]);

  const getHandleRects = (x: number, y: number, w: number, h: number) => {
    const hs = HANDLE_SIZE;
    return {
      tl: { x: x - hs/2, y: y - hs/2, w: hs, h: hs }, t:  { x: x + w/2 - hs/2, y: y - hs/2, w: hs, h: hs }, tr: { x: x + w - hs/2, y: y - hs/2, w: hs, h: hs },
      l:  { x: x - hs/2, y: y + h/2 - hs/2, w: hs, h: hs }, r:  { x: x + w - hs/2, y: y + h/2 - hs/2, w: hs, h: hs },
      bl: { x: x - hs/2, y: y + h - hs/2, w: hs, h: hs }, b:  { x: x + w/2 - hs/2, y: y + h - hs/2, w: hs, h: hs }, br: { x: x + w - hs/2, y: y + h - hs/2, w: hs, h: hs },
    };
  };

  const getCropInteractionType = (mouseX: number, mouseY: number): Interaction => {
      const { canvas } = getCanvasAndContext();
      const img = imageElement;
      if (!canvas || !img || !pendingCrop) return null;

      const scale = canvas.width / img.width;
      const sx = pendingCrop.x * scale;
      const sy = pendingCrop.y * scale;
      const sWidth = pendingCrop.width * scale;
      const sHeight = pendingCrop.height * scale;
      
      const handles = getHandleRects(sx, sy, sWidth, sHeight);
      for (const [key, rect] of Object.entries(handles)) {
          if (mouseX >= rect.x && mouseX <= rect.x + rect.w && mouseY >= rect.y && mouseY <= rect.y + rect.h) {
              return key as Interaction;
          }
      }
      if (mouseX >= sx && mouseX <= sx + sWidth && mouseY >= sy && mouseY <= sy + sHeight) return 'move';
      return null;
  };
  
  const getTextBoundingBox = useCallback((text: TextOverlay, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
    ctx.font = `${text.size}px ${text.font}`;
    const metrics = ctx.measureText(text.text);
    const padding = text.padding || 0;
    
    const rectWidth = metrics.width + padding * 2;
    const rectHeight = text.size + padding * 2;
    
    const canvasX = (text.x / 100) * canvas.width;
    const canvasY = (text.y / 100) * canvas.height;
    
    const x = canvasX - rectWidth / 2;
    const y = canvasY - rectHeight / 2;

    return { x, y, width: rectWidth, height: rectHeight };
  }, []);

  const handleInteractionStart = useCallback((e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const pos = getInteractionPos(e);
    const { canvas, ctx } = getCanvasAndContext();
    if (!canvas || !ctx || !imageElement) return;

    if (activeTab === 'crop') {
        const cropInteraction = getCropInteractionType(pos.x, pos.y);
        e.preventDefault();

        if (cropInteraction) {
            setInteraction(cropInteraction);
            setStartPos(pos);
            setStartCrop(pendingCrop);
        } else {
            const scale = canvas.width / imageElement.width;
            setInteraction('br');
            setStartPos(pos);
            const newCrop = {
                x: pos.x / scale,
                y: pos.y / scale,
                width: 0,
                height: 0,
            };
            setStartCrop(newCrop);
            setPendingCrop(newCrop);
        }
    } else {
        const reversedTexts = [...settings.texts].reverse();
        let textToDrag: TextOverlay | null = null;
        for (const text of reversedTexts) {
            const bbox = getTextBoundingBox(text, canvas, ctx);
            if (pos.x >= bbox.x && pos.x <= bbox.x + bbox.width &&
                pos.y >= bbox.y && pos.y <= bbox.y + bbox.height) {
                textToDrag = text;
                break;
            }
        }

        if (textToDrag) {
            e.preventDefault();
            setInteraction('text');
            setDraggingTextId(textToDrag.id);
            setStartPos(pos);
            const textPosInPixels = {
                x: (textToDrag.x / 100) * canvas.width,
                y: (textToDrag.y / 100) * canvas.height,
            };
            setDragStartTextPos(textPosInPixels);
        }
    }
  }, [getInteractionPos, activeTab, pendingCrop, settings, imageElement, getCanvasAndContext, getTextBoundingBox, setInteraction, setStartPos, setStartCrop, getCropInteractionType, setPendingCrop]);

  const handleInteractionMove = useCallback((e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if ('touches' in e && !interaction) {
      return;
    }
    
    const pos = getInteractionPos(e);
    const { canvas, ctx } = getCanvasAndContext();
    const img = imageElement;
    if (!canvas || !img || !ctx) return;

    if (interaction && startPos) {
        if (e.cancelable) e.preventDefault();
        
        if (interaction === 'text' && draggingTextId && dragStartTextPos) {
            canvas.style.cursor = 'grabbing';
            const dx = pos.x - startPos.x;
            const dy = pos.y - startPos.y;

            const newTextX_px = dragStartTextPos.x + dx;
            const newTextY_px = dragStartTextPos.y + dy;

            const newTextX_percent = (newTextX_px / canvas.width) * 100;
            const newTextY_percent = (newTextY_px / canvas.height) * 100;
            
            const newTexts = settings.texts.map(t => {
                if (t.id === draggingTextId) {
                    return { 
                        ...t, 
                        x: Math.max(0, Math.min(100, newTextX_percent)), 
                        y: Math.max(0, Math.min(100, newTextY_percent)) 
                    };
                }
                return t;
            });
            
            updateSettings({ texts: newTexts });
            return;
        }

        if (activeTab === 'crop' && startCrop) {
            const scale = canvas.width / img.width;
            
            if (interaction === 'move') {
                 const dx = (pos.x - startPos.x) / scale;
                 const dy = (pos.y - startPos.y) / scale;
                 let newCrop = { ...startCrop };
                 newCrop.x += dx;
                 newCrop.y += dy;
                 
                 newCrop.x = Math.max(0, Math.min(newCrop.x, img.width - newCrop.width));
                 newCrop.y = Math.max(0, Math.min(newCrop.y, img.height - newCrop.height));

                 setPendingCrop({x: Math.round(newCrop.x), y: Math.round(newCrop.y), width: Math.round(newCrop.width), height: Math.round(newCrop.height)} );
                 return;
            }

            let newCrop = { ...startCrop };
            const mouseX = pos.x / scale;
            const mouseY = pos.y / scale;
            const minW = MIN_CROP_SIZE_PX / scale;
            const minH = MIN_CROP_SIZE_PX / scale;
            
            const anchorX = interaction.includes('l') ? startCrop.x + startCrop.width : startCrop.x;
            const anchorY = interaction.includes('t') ? startCrop.y + startCrop.height : startCrop.y;

            let newX1 = interaction.includes('l') ? mouseX : anchorX;
            let newY1 = interaction.includes('t') ? mouseY : anchorY;
            let newX2 = interaction.includes('r') ? mouseX : anchorX;
            let newY2 = interaction.includes('b') ? mouseY : anchorY;
            
            if (!interaction.includes('l') && !interaction.includes('r')) {
                newX1 = startCrop.x;
                newX2 = startCrop.x + startCrop.width;
            }
             if (!interaction.includes('t') && !interaction.includes('b')) {
                newY1 = startCrop.y;
                newY2 = startCrop.y + startCrop.height;
            }

            newCrop.x = Math.min(newX1, newX2);
            newCrop.y = Math.min(newY1, newY2);
            newCrop.width = Math.abs(newX1 - newX2);
            newCrop.height = Math.abs(newY1 - newY2);

            if (newCrop.width < minW) {
              newCrop.width = minW;
              if (newCrop.x === Math.min(newX1, newX2)) { // dragging right
                newCrop.x = newX2 - minW;
              }
            }
            if (newCrop.height < minH) {
              newCrop.height = minH;
               if (newCrop.y === Math.min(newY1, newY2)) { // dragging down
                newCrop.y = newY2 - minH;
              }
            }

            if (newCrop.x < 0) { newCrop.width += newCrop.x; newCrop.x = 0; }
            if (newCrop.y < 0) { newCrop.height += newCrop.y; newCrop.y = 0; }
            if (newCrop.x + newCrop.width > img.width) { newCrop.width = img.width - newCrop.x; }
            if (newCrop.y + newCrop.height > img.height) { newCrop.height = img.height - newCrop.y; }

            setPendingCrop({x: Math.round(newCrop.x), y: Math.round(newCrop.y), width: Math.round(newCrop.width), height: Math.round(newCrop.height)} );
        }
    } else {
        if ('touches' in e) return;

        if (activeTab === 'crop') {
            const cropInteraction = getCropInteractionType(pos.x, pos.y);
            const cursorMap: { [key: string]: string } = {
              'move': 'move', 'tl': 'nwse-resize', 't': 'ns-resize', 'tr': 'nesw-resize',
              'l': 'ew-resize', 'r': 'ew-resize', 'bl': 'nesw-resize', 'b': 'ns-resize', 'br': 'nwse-resize',
            };
            canvas.style.cursor = cropInteraction ? cursorMap[cropInteraction] : 'crosshair';
        } else {
            let isOverText = false;
            const reversedTexts = [...settings.texts].reverse();
            for (const text of reversedTexts) {
                const bbox = getTextBoundingBox(text, canvas, ctx);
                 if (pos.x >= bbox.x && pos.x <= bbox.x + bbox.width &&
                    pos.y >= bbox.y && pos.y <= bbox.y + bbox.height) {
                    isOverText = true;
                    break;
                }
            }
            canvas.style.cursor = isOverText ? 'grab' : 'default';
        }
    }
  }, [interaction, startPos, getInteractionPos, activeTab, startCrop, imageElement, setPendingCrop, getCanvasAndContext, settings, draggingTextId, dragStartTextPos, updateSettings, getTextBoundingBox, getCropInteractionType]);

  const handleInteractionEnd = useCallback(() => {
    if(interaction === 'text' && internalCanvasRef.current) internalCanvasRef.current.style.cursor = 'grab';
    setInteraction(null);
    setStartPos(null);
    setStartCrop(null);
    setDraggingTextId(null);
    setDragStartTextPos(null);
  }, [interaction]);

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
