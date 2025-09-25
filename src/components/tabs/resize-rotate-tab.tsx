
"use client";

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { ImageSettings, OriginalImage, Unit } from '@/lib/types';
import { Lock, Unlock, Scan, BookOpen } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { ImageInfoPanel } from '../image-info-panel';

const CM_TO_INCH = 0.393701;

const convertToPx = (value: number, unit: Unit, dpi: number): number => {
  if (unit === 'px') return value;
  if (unit === 'inch') return value * dpi;
  if (unit === 'cm') return value * CM_TO_INCH * dpi;
  if (unit === 'mm') return (value / 10) * CM_TO_INCH * dpi;
  return value;
};

const convertFromPx = (value: number, unit: Unit, dpi: number): number => {
  if (unit === 'px') return Math.round(value);
  if (unit === 'inch') return value / dpi;
  if (unit === 'cm') return (value / dpi) / CM_TO_INCH;
  if (unit === 'mm') return ((value / dpi) / CM_TO_INCH) * 10;
  return value;
};

interface ResizeRotateTabProps {
    settings: ImageSettings;
    updateSettings: (newSettings: Partial<ImageSettings>) => void;
    originalImage: OriginalImage;
    processedSize: number | null;
    isFromMultiPagePdf: boolean;
    onViewPages: () => void;
}

export function ResizeRotateTab({ settings, updateSettings, originalImage, processedSize, isFromMultiPagePdf, onViewPages }: ResizeRotateTabProps) {
    const [width, setWidth] = useState(convertFromPx(settings.width, settings.unit, settings.dpi).toString());
    const [height, setHeight] = useState(convertFromPx(settings.height, settings.unit, settings.dpi).toString());
    const [unit, setUnit] = useState(settings.unit);
    
    const [aspectRatio, setAspectRatio] = useState(originalImage.width / originalImage.height);

    useEffect(() => {
        if (settings.crop) {
            setAspectRatio(settings.crop.width / settings.crop.height);
        } else {
            setAspectRatio(originalImage.width / originalImage.height);
        }
    }, [settings.crop, originalImage]);

    useEffect(() => {
        const newWidth = convertFromPx(settings.width, settings.unit, settings.dpi);
        const newHeight = convertFromPx(settings.height, settings.unit, settings.dpi);
        setWidth(settings.unit === 'px' ? newWidth.toString() : newWidth.toFixed(2).replace(/\.00$/, ''));
        setHeight(settings.unit === 'px' ? newHeight.toString() : newHeight.toFixed(2).replace(/\.00$/, ''));
        setUnit(settings.unit);
    }, [settings.width, settings.height, settings.unit, settings.dpi]);


    const handleUnitChange = (newUnit: Unit) => {
        updateSettings({ unit: newUnit });
    };

    const handleDpiChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newDpi = parseInt(e.target.value, 10);
        if (!isNaN(newDpi) && newDpi > 0) {
            updateSettings({ dpi: newDpi });
        }
    };

    const handleDimensionChange = (valueStr: string, dimension: 'width' | 'height') => {
        if (dimension === 'width') {
            setWidth(valueStr);
        } else {
            setHeight(valueStr);
        }

        const numericValue = parseFloat(valueStr);
        if (valueStr.trim() === '' || isNaN(numericValue) || numericValue <= 0) {
            return;
        }
        
        const currentDpi = settings.dpi;

        if (dimension === 'width') {
            const newPxWidth = convertToPx(numericValue, unit, currentDpi);
            if (settings.keepAspectRatio) {
                const newPxHeight = newPxWidth / aspectRatio;
                setHeight(convertFromPx(newPxHeight, unit, currentDpi).toFixed(2).replace(/\.00$/, ''));
                updateSettings({ width: newPxWidth, height: newPxHeight });
            } else {
                updateSettings({ width: newPxWidth });
            }
        } else {
            const newPxHeight = convertToPx(numericValue, unit, currentDpi);
            if (settings.keepAspectRatio) {
                const newPxWidth = newPxHeight * aspectRatio;
                setWidth(convertFromPx(newPxWidth, unit, currentDpi).toFixed(2).replace(/\.00$/, ''));
                updateSettings({ width: newPxWidth, height: newPxHeight });
            } else {
                updateSettings({ height: newPxHeight });
            }
        }
    };
    
    const resetDimensions = () => {
        const resetWidth = settings.crop ? settings.crop.width : originalImage.width;
        const resetHeight = settings.crop ? settings.crop.height : originalImage.height;
        updateSettings({ width: resetWidth, height: resetHeight, unit: 'px', dpi: 96 });
    };

    return (
        <div className="space-y-4 p-1">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-base font-medium flex items-center gap-2"><Scan size={18}/> Resize</CardTitle>
                    <div className="flex items-center gap-1">
                      {isFromMultiPagePdf && (
                          <TooltipProvider>
                              <Tooltip>
                                  <TooltipTrigger asChild>
                                      <Button variant="ghost" size="icon" onClick={onViewPages} className="h-8 w-8 text-primary">
                                          <BookOpen size={16}/>
                                      </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                      <p>View PDF Pages</p>
                                  </TooltipContent>
                              </Tooltip>
                          </TooltipProvider>
                      )}
                      <Button variant="ghost" size="sm" onClick={resetDimensions}>Reset</Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex items-end gap-2">
                            <div className="grid gap-1.5 flex-1">
                                <Label htmlFor="width">Width</Label>
                                <Input id="width" type="text" value={width} onChange={e => handleDimensionChange(e.target.value, 'width')} />
                            </div>
                            
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                      variant="outline"
                                      size="icon"
                                      className="shrink-0"
                                      onClick={() => updateSettings({ keepAspectRatio: !settings.keepAspectRatio })}
                                      aria-label="Toggle aspect ratio lock"
                                  >
                                      {settings.keepAspectRatio ? <Lock size={16}/> : <Unlock size={16}/>}
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Keep aspect ratio</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>

                            <div className="grid gap-1.5 flex-1">
                                <Label htmlFor="height">Height</Label>
                                <Input id="height" type="text" value={height} onChange={e => handleDimensionChange(e.target.value, 'height')} />
                            </div>
                        </div>
                        <div className="flex flex-wrap items-end gap-4">
                            <div className="grid gap-1.5 flex-1 min-w-[80px]">
                                <Label>Unit</Label>
                                <Select value={unit} onValueChange={(val: Unit) => handleUnitChange(val)}>
                                    <SelectTrigger><SelectValue/></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="px">px</SelectItem>
                                        <SelectItem value="cm">cm</SelectItem>
                                        <SelectItem value="mm">mm</SelectItem>
                                        <SelectItem value="inch">inch</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                             <div className="grid gap-1.5 flex-1 min-w-[80px]">
                                <Label htmlFor="dpi">DPI</Label>
                                <Input id="dpi" type="number" value={settings.dpi} onChange={handleDpiChange} min="1" />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
            <ImageInfoPanel 
                originalImage={originalImage}
                settings={settings}
                processedSize={processedSize}
            />
        </div>
    );
}

    
