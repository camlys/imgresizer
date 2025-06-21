"use client";

import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState, useCallback } from 'react';
import type { ImageSettings, OriginalImage, CropSettings } from '@/lib/types';

interface ImageCanvasProps {
  originalImage: OriginalImage;
  settings: ImageSettings;
  updateSettings: (settings: Partial<ImageSettings>) => void;
  activeTab: string;
}

const HANDLE_SIZE = 10;
const MIN_CROP_SIZE_PX = 20;

type Interaction = 
  | 'move' | 'tl' | 't' | 'tr' | 'l' | 'r' | 'bl' | 'b' | 'br' 
  | 'text' | null;

const ImageCanvas = forwardRef<HTMLCanvasElement, ImageCanvasProps>(({ originalImage, settings, updateSettings, activeTab }, ref) => {
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
    img.crossOrigin = "anonymous";
    img.src = originalImage.src;
    img.onload = () => setImageElement(img);
  }, [originalImage.src]);

  const getCanvasAndContext = useCallback(() => {
    const canvas = internalCanvasRef.current;
    const ctx = canvas?.getContext('2d');
    return { canvas, ctx };
  }, []);

  const getMousePos = useCallback((e: MouseEvent | React.MouseEvent) => {
    const { canvas } = getCanvasAndContext();
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }, [getCanvasAndContext]);

  useEffect(() => {
    const { canvas, ctx } = getCanvasAndContext();
    const img = imageElement;
    if (!canvas || !ctx || !img) return;
    
    const isCropMode = activeTab === 'crop';

    if (isCropMode) {
        const container = containerRef.current;
        if (!container) return;
        
        const scale = Math.min(container.clientWidth / img.width, container.clientHeight / img.height);
        const canvasWidth = img.width * scale;
        const canvasHeight = img.height * scale;
        
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        
        ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);
        
        const crop = settings.crop || { x: 0, y: 0, width: img.width, height: img.height };
        const sx = crop.x * scale;
        const sy = crop.y * scale;
        const sWidth = crop.width * scale;
        const sHeight = crop.height * scale;
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        ctx.clearRect(sx, sy, sWidth, sHeight);
        
        // Draw main crop border
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.lineWidth = 2;
        ctx.strokeRect(sx, sy, sWidth, sHeight);

        // Draw rule-of-thirds grid
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
        
        // Vertical lines
        ctx.beginPath();
        ctx.moveTo(sx + sWidth / 3, sy);
        ctx.lineTo(sx + sWidth / 3, sy + sHeight);
        ctx.moveTo(sx + (sWidth / 3) * 2, sy);
        ctx.lineTo(sx + (sWidth / 3) * 2, sy + sHeight);
        ctx.stroke();
        
        // Horizontal lines
        ctx.beginPath();
        ctx.moveTo(sx, sy + sHeight / 3);
        ctx.lineTo(sx + sWidth, sy + sHeight / 3);
        ctx.moveTo(sx, sy + (sHeight / 3) * 2);
        ctx.lineTo(sx + sWidth, sy + (sHeight / 3) * 2);
        ctx.stroke();

        ctx.fillStyle = '#fff';
        const handles = getHandleRects(sx, sy, sWidth, sHeight);
        Object.values(handles).forEach(handle => ctx.fillRect(handle.x, handle.y, handle.w, handle.h));

    } else {
        const { width, height, rotation, flipHorizontal, flipVertical, crop, texts, adjustments } = settings;
        canvas.width = width;
        canvas.height = height;

        const { brightness, contrast, saturate, grayscale, sepia, hue, invert, blur } = adjustments;
        ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturate}%) grayscale(${grayscale}%) sepia(${sepia}%) hue-rotate(${hue}deg) invert(${invert}%) blur(${blur}px)`;

        ctx.save();
        ctx.translate(width / 2, height / 2);
        if (flipHorizontal) ctx.scale(-1, 1);
        if (flipVertical) ctx.scale(1, -1);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.translate(-width / 2, -height / 2);

        const cropData = crop || { x: 0, y: 0, width: originalImage.width, height: originalImage.height };
        ctx.drawImage(img, cropData.x, cropData.y, cropData.width, cropData.height, 0, 0, width, height);

        ctx.restore();
        ctx.filter = 'none';

        texts.forEach(text => {
            ctx.fillStyle = text.color;
            ctx.font = `${text.size}px ${text.font}`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(text.text, text.x / 100 * width, text.y / 100 * height);
        });
    }

  }, [settings, originalImage, imageElement, activeTab, getCanvasAndContext]);

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
      if (!canvas || !img || !settings.crop) return null;

      const scale = canvas.width / img.width;
      const sx = settings.crop.x * scale;
      const sy = settings.crop.y * scale;
      const sWidth = settings.crop.width * scale;
      const sHeight = settings.crop.height * scale;
      
      const handles = getHandleRects(sx, sy, sWidth, sHeight);
      for (const [key, rect] of Object.entries(handles)) {
          if (mouseX >= rect.x && mouseX <= rect.x + rect.w && mouseY >= rect.y && mouseY <= rect.y + rect.h) {
              return key as Interaction;
          }
      }
      if (mouseX >= sx && mouseX <= sx + sWidth && mouseY >= sy && mouseY <= sy + sHeight) return 'move';
      return null;
  };

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getMousePos(e);
    const { canvas, ctx } = getCanvasAndContext();
    if (!canvas || !ctx) return;

    if (activeTab === 'crop') {
        const cropInteraction = getCropInteractionType(pos.x, pos.y);
        if (cropInteraction) {
            e.preventDefault();
            setInteraction(cropInteraction);
            setStartPos(pos);
            setStartCrop(settings.crop);
        }
    } else {
        for (const text of [...settings.texts].reverse()) {
            ctx.font = `${text.size}px ${text.font}`;
            const metrics = ctx.measureText(text.text);
            const textRect = { x: (text.x / 100 * canvas.width) - metrics.width / 2, y: (text.y / 100 * canvas.height) - text.size / 2, width: metrics.width, height: text.size };
            if (pos.x >= textRect.x && pos.x <= textRect.x + textRect.width && pos.y >= textRect.y && pos.y <= textRect.y + textRect.height) {
                setInteraction('text');
                setDraggingTextId(text.id);
                setStartPos(pos);
                setDragStartTextPos({ x: text.x, y: text.y });
                return;
            }
        }
    }
  }, [getMousePos, activeTab, settings.crop, settings.texts, getCanvasAndContext]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getMousePos(e);
    const { canvas } = getCanvasAndContext();
    const img = imageElement;
    if (!canvas || !img) return;

    if (interaction && startPos) {
        if (interaction === 'text' && draggingTextId && dragStartTextPos) {
            const deltaX = (pos.x - startPos.x) / canvas.width * 100;
            const deltaY = (pos.y - startPos.y) / canvas.height * 100;
            const newTexts = settings.texts.map(t => {
                if (t.id === draggingTextId) {
                    return { ...t, x: Math.max(0, Math.min(100, dragStartTextPos.x + deltaX)), y: Math.max(0, Math.min(100, dragStartTextPos.y + deltaY)) };
                }
                return t;
            });
            updateSettings({ texts: newTexts });
        } else if (activeTab === 'crop' && startCrop) {
            const scale = canvas.width / img.width;
            
            if (interaction === 'move') {
                 const dx = (pos.x - startPos.x) / scale;
                 const dy = (pos.y - startPos.y) / scale;
                 let newCrop = { ...startCrop };
                 newCrop.x += dx;
                 newCrop.y += dy;
                 
                 newCrop.x = Math.max(0, Math.min(newCrop.x, img.width - newCrop.width));
                 newCrop.y = Math.max(0, Math.min(newCrop.y, img.height - newCrop.height));

                 updateSettings({ crop: {x: Math.round(newCrop.x), y: Math.round(newCrop.y), width: Math.round(newCrop.width), height: Math.round(newCrop.height)} });
                 return;
            }

            let fixedAnchorX, fixedAnchorY;
            if (interaction.includes('l')) fixedAnchorX = startCrop.x + startCrop.width; else fixedAnchorX = startCrop.x;
            if (interaction.includes('t')) fixedAnchorY = startCrop.y + startCrop.height; else fixedAnchorY = startCrop.y;
            
            const movingAnchorX = pos.x / scale;
            const movingAnchorY = pos.y / scale;

            let newX, newY, newWidth, newHeight;
            
            if (interaction === 't' || interaction === 'b') {
                newX = startCrop.x;
                newWidth = startCrop.width;
            } else {
                newX = Math.min(fixedAnchorX, movingAnchorX);
                newWidth = Math.abs(fixedAnchorX - movingAnchorX);
            }
            
            if (interaction === 'l' || interaction === 'r') {
                newY = startCrop.y;
                newHeight = startCrop.height;
            } else {
                newY = Math.min(fixedAnchorY, movingAnchorY);
                newHeight = Math.abs(fixedAnchorY - movingAnchorY);
            }
            
            let newCrop = { x: newX, y: newY, width: newWidth, height: newHeight };

            const minW = MIN_CROP_SIZE_PX / scale;
            const minH = MIN_CROP_SIZE_PX / scale;
            if (newCrop.width < minW) newCrop.width = minW;
            if (newCrop.height < minH) newCrop.height = minH;

            newCrop.x = Math.max(0, newCrop.x);
            newCrop.y = Math.max(0, newCrop.y);
            if (newCrop.x + newCrop.width > img.width) newCrop.width = img.width - newCrop.x;
            if (newCrop.y + newCrop.height > img.height) newCrop.height = img.height - newCrop.y;

            updateSettings({ crop: {x: Math.round(newCrop.x), y: Math.round(newCrop.y), width: Math.round(newCrop.width), height: Math.round(newCrop.height)} });
        }
    } else {
        if (activeTab === 'crop') {
            const cropInteraction = getCropInteractionType(pos.x, pos.y);
            const cursorMap: { [key in Interaction]?: string } = {
              'move': 'move', 'tl': 'nwse-resize', 't': 'ns-resize', 'tr': 'nesw-resize',
              'l': 'ew-resize', 'r': 'ew-resize', 'bl': 'nesw-resize', 'b': 'ns-resize', 'br': 'nwse-resize',
            };
            canvas.style.cursor = cursorMap[cropInteraction] || 'default';
        } else {
            const ctx = canvas.getContext('2d');
            if (!ctx) return;
            let isOverText = false;
            for (const text of settings.texts) {
                ctx.font = `${text.size}px ${text.font}`;
                const metrics = ctx.measureText(text.text);
                const textRect = { x: (text.x / 100 * canvas.width) - metrics.width / 2, y: (text.y / 100 * canvas.height) - text.size / 2, width: metrics.width, height: text.size };
                if (pos.x >= textRect.x && pos.x <= textRect.x + textRect.width && pos.y >= textRect.y && pos.y <= textRect.y + textRect.height) {
                    isOverText = true;
                    break;
                }
            }
            canvas.style.cursor = isOverText ? 'grab' : 'default';
        }
    }
  }, [interaction, startPos, getMousePos, activeTab, draggingTextId, dragStartTextPos, startCrop, imageElement, settings.texts, updateSettings, getCanvasAndContext]);

  const handleMouseUpOrLeave = useCallback(() => {
    if(interaction === 'text' && internalCanvasRef.current) internalCanvasRef.current.style.cursor = 'grab';
    setInteraction(null);
    setStartPos(null);
    setStartCrop(null);
    setDraggingTextId(null);
    setDragStartTextPos(null);
  }, [interaction]);

  return (
    <div ref={containerRef} className="w-full h-full flex items-center justify-center">
        <canvas 
          ref={internalCanvasRef} 
          className="max-w-full max-h-full object-contain rounded-lg shadow-md"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
        />
    </div>
  );
});

ImageCanvas.displayName = 'ImageCanvas';

export { ImageCanvas };
