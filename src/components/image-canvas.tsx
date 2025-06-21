"use client";

import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import type { ImageSettings, OriginalImage } from '@/lib/types';

interface ImageCanvasProps {
  originalImage: OriginalImage;
  settings: ImageSettings;
}

const ImageCanvas = forwardRef<HTMLCanvasElement, ImageCanvasProps>(({ originalImage, settings }, ref) => {
  const internalCanvasRef = useRef<HTMLCanvasElement>(null);
  const [imageElement, setImageElement] = useState<HTMLImageElement | null>(null);

  useImperativeHandle(ref, () => internalCanvasRef.current!, []);

  useEffect(() => {
    const img = new Image();
    img.src = originalImage.src;
    img.onload = () => {
      setImageElement(img);
    };
  }, [originalImage.src]);

  useEffect(() => {
    if (!imageElement || !internalCanvasRef.current) return;

    const canvas = internalCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height, rotation, crop, texts, adjustments } = settings;

    // Set canvas dimensions
    canvas.width = width;
    canvas.height = height;

    // Apply adjustments
    const { brightness, contrast, saturate, grayscale, sepia, hue } = adjustments;
    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturate}%) grayscale(${grayscale}%) sepia(${sepia}%) hue-rotate(${hue}deg)`;

    // Save context state before rotation
    ctx.save();

    // Translate and rotate
    ctx.translate(width / 2, height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.translate(-width / 2, -height / 2);

    // Draw the image
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

    // Restore context to pre-rotated state
    ctx.restore();

    // Reset filter for text
    ctx.filter = 'none';

    // Draw text overlays
    texts.forEach(text => {
      ctx.fillStyle = text.color;
      ctx.font = `${text.size}px ${text.font}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text.text, text.x / 100 * width, text.y / 100 * height);
    });

  }, [settings, originalImage, imageElement]);

  return <canvas ref={internalCanvasRef} className="max-w-full max-h-full object-contain rounded-lg shadow-md" />;
});

ImageCanvas.displayName = 'ImageCanvas';

export { ImageCanvas };
