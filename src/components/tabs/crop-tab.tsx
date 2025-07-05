
"use client";

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Crop, Check, Info, RefreshCw, Move, Square, RectangleHorizontal, RectangleVertical, GitCommitVertical } from 'lucide-react';
import type { ImageSettings, OriginalImage, CropSettings } from '@/lib/types';
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface CropTabProps {
  settings: ImageSettings;
  updateSettings: (newSettings: Partial<ImageSettings>) => void;
  originalImage: OriginalImage;
  pendingCrop: CropSettings | null;
  setPendingCrop: (crop: CropSettings | null) => void;
  onTabChange: (tab: string) => void;
  onApplyPerspectiveCrop: () => void;
}

const aspectRatios = [
  { name: 'Original', value: 0, icon: RefreshCw },
  { name: '1:1 Square', value: 1, icon: Square },
  { name: '4:3 Standard', value: 4/3, icon: RectangleHorizontal },
  { name: '16:9 Wide', value: 16/9, icon: RectangleHorizontal },
  { name: '3:2 Photo', value: 3/2, icon: RectangleHorizontal },
  { name: '9:16 Story', value: 9/16, icon: RectangleVertical },
  { name: '4:5 Portrait', value: 4/5, icon: RectangleVertical },
];

export function CropTab({ settings, updateSettings, originalImage, pendingCrop, setPendingCrop, onTabChange, onApplyPerspectiveCrop }: CropTabProps) {
  const crop = pendingCrop || settings.crop || { x: 0, y: 0, width: originalImage.width, height: originalImage.height };
  const hasTransforms = settings.rotation !== 0 || settings.flipHorizontal || settings.flipVertical;

  const handleCropChange = (field: keyof typeof crop, value: string) => {
    const numericValue = parseInt(value, 10) || 0;
    const newCrop = { ...crop };

    switch (field) {
      case 'x':
        newCrop.x = Math.max(0, Math.min(numericValue, originalImage.width - newCrop.width));
        break;
      case 'y':
        newCrop.y = Math.max(0, Math.min(numericValue, originalImage.height - newCrop.height));
        break;
      case 'width':
        newCrop.width = Math.max(1, Math.min(numericValue, originalImage.width - newCrop.x));
        break;
      case 'height':
        newCrop.height = Math.max(1, Math.min(numericValue, originalImage.height - newCrop.y));
        break;
    }

    setPendingCrop({
      x: Math.round(newCrop.x),
      y: Math.round(newCrop.y),
      width: Math.round(newCrop.width),
      height: Math.round(newCrop.height),
    });
  };
  
  const resetCrop = () => {
    if (settings.cropMode === 'rect') {
      const newCrop = { x: 0, y: 0, width: originalImage.width, height: originalImage.height };
      setPendingCrop(newCrop);
      updateSettings({ 
        crop: newCrop,
        width: originalImage.width,
        height: originalImage.height
      });
    } else {
       updateSettings({
        perspectivePoints: {
          tl: { x: 0, y: 0 },
          tr: { x: originalImage.width, y: 0 },
          bl: { x: 0, y: originalImage.height },
          br: { x: originalImage.width, y: originalImage.height },
        },
      });
    }
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
      newWidth = originalHeight * ratioValue;
    } else {
      newHeight = originalWidth / ratioValue;
    }

    const newX = (originalWidth - newWidth) / 2;
    const newY = (originalHeight - newHeight) / 2;
    
    const newCrop = {
      x: Math.round(newX),
      y: Math.round(newY),
      width: Math.round(newWidth),
      height: Math.round(newHeight),
    };

    setPendingCrop(newCrop);
    updateSettings({ 
      crop: newCrop,
      width: newCrop.width,
      height: newCrop.height
    });
  };
  
  const centerCrop = () => {
    if (!pendingCrop) return;

    const newX = (originalImage.width - pendingCrop.width) / 2;
    const newY = (originalImage.height - pendingCrop.height) / 2;
    
    setPendingCrop({
      ...pendingCrop,
      x: Math.round(newX),
      y: Math.round(newY),
    });
  };

  const applyChanges = () => {
      if (settings.cropMode === 'rect' && pendingCrop) {
        updateSettings({ 
          crop: pendingCrop,
          width: pendingCrop.width,
          height: pendingCrop.height
        });
        onTabChange('resize');
      } else if (settings.cropMode === 'perspective') {
        onApplyPerspectiveCrop();
      }
  }

  return (
    <div className="space-y-4 p-1">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base font-medium flex items-center gap-2"><Crop size={18}/> Crop Image</CardTitle>
           <div className="flex items-center gap-1">
            <TooltipProvider>
              {settings.cropMode === 'rect' && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={centerCrop} className="h-8 w-8">
                      <Move size={16}/>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Center Crop</p>
                  </TooltipContent>
                </Tooltip>
              )}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={resetCrop} className="h-8 w-8">
                    <RefreshCw size={16}/>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Reset</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
           
          <div className="grid gap-2">
            <Label className="text-xs text-muted-foreground">Mode</Label>
            <RadioGroup defaultValue="rect" value={settings.cropMode} onValueChange={(value) => updateSettings({ cropMode: value as 'rect' | 'perspective' })}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="rect" id="r-rect" />
                <Label htmlFor="r-rect">Rectangle</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="perspective" id="r-perspective" />
                <Label htmlFor="r-perspective">Perspective</Label>
              </div>
            </RadioGroup>
          </div>

          {hasTransforms && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Note</AlertTitle>
              <AlertDescription>
                Rotation and flips are hidden during crop mode for precise selection. They will be applied to the final result.
              </AlertDescription>
            </Alert>
          )}

          {settings.cropMode === 'rect' ? (
            <>
              <p className="text-sm text-muted-foreground">
                Click and drag on the main image to define a crop area, or use the controls below.
              </p>
              <div>
                <Label className="text-xs text-muted-foreground">Aspect Ratio Presets</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {aspectRatios.map(r => (
                    <Button key={r.name} variant="outline" size="sm" onClick={() => applyAspectRatio(r.value)} className="justify-start gap-2">
                        <r.icon size={16} />
                        <span>{r.name}</span>
                    </Button>
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
                <Button onClick={applyChanges} className="w-full mt-2">
                    <Check size={16} className="mr-2" />
                    Apply Crop
                </Button>
            </>
          ) : (
             <>
                <p className="text-sm text-muted-foreground">
                  Click and drag the corners on the main image to define the perspective.
                </p>
                 <Alert variant="destructive">
                  <GitCommitVertical className="h-4 w-4" />
                  <AlertTitle>Destructive Action</AlertTitle>
                  <AlertDescription>
                    Applying a perspective crop will permanently alter the image for subsequent edits.
                  </AlertDescription>
                </Alert>
                 <Button onClick={applyChanges} className="w-full mt-2">
                    <Check size={16} className="mr-2" />
                    Apply Perspective Crop
                </Button>
             </>
          )}

        </CardContent>
      </Card>
    </div>
  );
}
