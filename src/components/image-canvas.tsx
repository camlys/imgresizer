"use client";

import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState, useCallback } from 'react';
import type { ImageSettings, OriginalImage } from '@/lib/types';

interface ImageCanvasProps {
  originalImage: OriginalImage;
  settings: ImageSettings;
  updateSettings: (settings: Partial<ImageSettings>) => void;
}

const ImageCanvas = forwardRef<HTMLCanvasElement, ImageCanvasProps>(({ originalImage, settings, updateSettings }, ref) => {
  const internalCanvasRef = useRef<HTMLCanvasElement>(null);
  const [imageElement, setImageElement] = useState<HTMLImageElement | null>(null);

  const [draggingTextId, setDraggingTextId] = useState<string | null>(null);
  const [dragStartPos, setDragStartPos] = useState<{ x: number; y: number } | null>(null);
  const [dragStartTextPos, setDragStartTextPos] = useState<{ x: number, y: number } | null>(null);

  useImperativeHandle(ref, () => internalCanvasRef.current!, []);

  useEffect(() => {
    const img = new Image();
    img.src = originalImage.src;
    img.onload = () => {
      setImageElement(img);
    };
  }, [originalImage.src]);

  const getMousePos = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = internalCanvasRef.current;
    if (!canvas) return { mouseX: 0, mouseY: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;
    return { mouseX, mouseY };
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = internalCanvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    
    const { mouseX, mouseY } = getMousePos(e);

    for (const text of [...settings.texts].reverse()) {
      ctx.font = `${text.size}px ${text.font}`;
      const metrics = ctx.measureText(text.text);
      const textWidth = metrics.width;
      const textHeight = text.size;
      
      const textCenterX = (text.x / 100) * canvas.width;
      const textCenterY = (text.y / 100) * canvas.height;
      
      const textRectX = textCenterX - textWidth / 2;
      const textRectY = textCenterY - textHeight / 2;

      if (mouseX >= textRectX && mouseX <= textRectX + textWidth && mouseY >= textRectY && mouseY <= textRectY + textHeight) {
        setDraggingTextId(text.id);
        setDragStartPos({ x: mouseX, y: mouseY });
        setDragStartTextPos({ x: text.x, y: text.y });
        canvas.style.cursor = 'grabbing';
        return;
      }
    }
  }, [getMousePos, settings.texts]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = internalCanvasRef.current;
    if (!canvas) return;
    
    const { mouseX, mouseY } = getMousePos(e);

    if (draggingTextId && dragStartPos && dragStartTextPos) {
      const deltaX = mouseX - dragStartPos.x;
      const deltaY = mouseY - dragStartPos.y;
      
      const deltaPercentX = (deltaX / canvas.width) * 100;
      const deltaPercentY = (deltaY / canvas.height) * 100;
      
      const newTexts = settings.texts.map(t => {
        if (t.id === draggingTextId) {
          return {
            ...t,
            x: Math.max(0, Math.min(100, dragStartTextPos.x + deltaPercentX)),
            y: Math.max(0, Math.min(100, dragStartTextPos.y + deltaPercentY)),
          };
        }
        return t;
      });
      
      updateSettings({ texts: newTexts });
    } else {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      let isOverText = false;
      for (const text of settings.texts) {
        ctx.font = `${text.size}px ${text.font}`;
        const metrics = ctx.measureText(text.text);
        const textWidth = metrics.width;
        const textHeight = text.size;
        
        const textCenterX = (text.x / 100) * canvas.width;
        const textCenterY = (text.y / 100) * canvas.height;
        
        const textRectX = textCenterX - textWidth / 2;
        const textRectY = textCenterY - textHeight / 2;
  
        if (mouseX >= textRectX && mouseX <= textRectX + textWidth && mouseY >= textRectY && mouseY <= textRectY + textHeight) {
          isOverText = true;
          break;
        }
      }
      canvas.style.cursor = isOverText ? 'grab' : 'default';
    }
  }, [draggingTextId, dragStartPos, dragStartTextPos, getMousePos, settings.texts, updateSettings]);
  
  const handleMouseUpOrLeave = useCallback(() => {
    if (draggingTextId && internalCanvasRef.current) {
      internalCanvasRef.current.style.cursor = 'grab';
    }
    setDraggingTextId(null);
    setDragStartPos(null);
    setDragStartTextPos(null);
  }, [draggingTextId]);

  useEffect(() => {
    if (!imageElement || !internalCanvasRef.current) return;

    const canvas = internalCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height, rotation, flipHorizontal, flipVertical, crop, texts, adjustments } = settings;

    canvas.width = width;
    canvas.height = height;

    const { brightness, contrast, saturate, grayscale, sepia, hue, invert, blur } = adjustments;
    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturate}%) grayscale(${grayscale}%) sepia(${sepia}%) hue-rotate(${hue}deg) invert(${invert}%) blur(${blur}px)`;

    ctx.save();

    ctx.translate(width / 2, height / 2);

    if (flipHorizontal) {
      ctx.scale(-1, 1);
    }
    if (flipVertical) {
      ctx.scale(1, -1);
    }
    
    ctx.rotate((rotation * Math.PI) / 180);

    ctx.translate(-width / 2, -height / 2);


    const cropData = crop || { x: 0, y: 0, width: originalImage.width, height: originalImage.height };
    ctx.drawImage(
      imageElement,
      cropData.x,
      cropData.y,
      cropData.width,
      cropData.height,
      0,
      0,
      width,
      height
    );

    ctx.restore();

    ctx.filter = 'none';

    texts.forEach(text => {
      ctx.fillStyle = text.color;
      ctx.font = `${text.size}px ${text.font}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text.text, text.x / 100 * width, text.y / 100 * height);
    });

  }, [settings, originalImage, imageElement]);

  return (
    <canvas 
      ref={internalCanvasRef} 
      className="max-w-full max-h-full object-contain rounded-lg shadow-md"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUpOrLeave}
      onMouseLeave={handleMouseUpOrLeave}
    />
  );
});

ImageCanvas.displayName = 'ImageCanvas';

export { ImageCanvas };
