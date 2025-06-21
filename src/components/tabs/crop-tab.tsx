"use client";

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crop } from 'lucide-react';
import type { ImageSettings, OriginalImage } from '@/lib/types';
import React from 'react';

interface CropTabProps {
  settings: ImageSettings;
  updateSettings: (newSettings: Partial<ImageSettings>) => void;
  originalImage: OriginalImage;
}

const aspectRatios = [
  { name: 'Original', value: 0 },
  { name: '1:1', value: 1 },
  { name: '4:3', value: 4/3 },
  { name: '16:9', value: 16/9 },
];

export function CropTab({ settings, updateSettings, originalImage }: CropTabProps) {
  const crop = settings.crop || { x: 0, y: 0, width: originalImage.width, height: originalImage.height };

  const handleCropChange = (field: keyof typeof crop, value: string) => {
    const numericValue = parseInt(value, 10) || 0;
    updateSettings({ crop: { ...crop, [field]: numericValue } });
  };
  
  const resetCrop = () => {
    updateSettings({ crop: { x: 0, y: 0, width: originalImage.width, height: originalImage.height } });
  };
  
  const applyAspectRatio = (ratioValue: number) => {
    if (ratioValue === 0) {
      resetCrop();
      return;
    }
    
    const { width: originalWidth, height: originalHeight } = originalImage;
    let newWidth = originalWidth;
    let newHeight = originalHeight;
    
    if (originalWidth / originalHeight > ratioValue) {
      // Image is wider than aspect ratio, so height is the constraint
      newWidth = originalHeight * ratioValue;
    } else {
      // Image is taller than or same as aspect ratio, so width is the constraint
      newHeight = originalWidth / ratioValue;
    }

    const newX = (originalWidth - newWidth) / 2;
    const newY = (originalHeight - newHeight) / 2;
    
    updateSettings({
      crop: {
        x: Math.round(newX),
        y: Math.round(newY),
        width: Math.round(newWidth),
        height: Math.round(newHeight),
      },
    });
  };

  return (
    <div className="space-y-4 p-1">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base font-medium flex items-center gap-2"><Crop size={18}/> Crop Image</CardTitle>
          <Button variant="ghost" size="sm" onClick={resetCrop}>Reset</Button>
        </CardHeader>
        <CardContent className="space-y-4">
           <p className="text-sm text-muted-foreground">
            Click and drag on the main image to define a crop area, or use the controls below.
          </p>
          <div>
            <Label className="text-xs text-muted-foreground">Aspect Ratio Presets</Label>
            <div className="grid grid-cols-4 gap-2 mt-1">
              {aspectRatios.map(r => (
                 <Button key={r.name} variant="outline" size="sm" onClick={() => applyAspectRatio(r.value)}>{r.name}</Button>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="crop-x">X</Label>
              <Input id="crop-x" type="number" value={Math.round(crop.x)} onChange={e => handleCropChange('x', e.target.value)} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="crop-y">Y</Label>
              <Input id="crop-y" type="number" value={Math.round(crop.y)} onChange={e => handleCropChange('y', e.target.value)} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="crop-width">Width</Label>
              <Input id="crop-width" type="number" value={Math.round(crop.width)} onChange={e => handleCropChange('width', e.target.value)} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="crop-height">Height</Label>
              <Input id="crop-height" type="number" value={Math.round(crop.height)} onChange={e => handleCropChange('height', e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
