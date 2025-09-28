
"use client";

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { ImageSettings, OriginalImage, Unit, QuickActionPreset } from '@/lib/types';
import { Lock, Unlock, Scan, BookOpen, Zap } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { ImageInfoPanel } from '../image-info-panel';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Separator } from '../ui/separator';
import { useToast } from '@/hooks/use-toast';

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
    const { toast } = useToast();

    const [quickActionPreset, setQuickActionPreset] = useState<QuickActionPreset | null>(null);

    useEffect(() => {
        try {
            const savedPreset = localStorage.getItem('quickActionPreset');
            if (savedPreset) {
                setQuickActionPreset(JSON.parse(savedPreset));
            }
        } catch (e) {
            console.error("Failed to load quick action preset from local storage", e);
        }
    }, []);

    const handleSaveQuickActionPreset = () => {
        try {
            localStorage.setItem('quickActionPreset', JSON.stringify(quickActionPreset));
            toast({ title: 'Success', description: 'Quick Action preset saved.' });
        } catch (e) {
            console.error("Failed to save quick action preset to local storage", e);
            toast({ title: 'Error', description: 'Could not save the preset.', variant: 'destructive'});
        }
    };


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
                    <CardTitle className="text-base font-medium flex items-center gap-2">
                        <Scan size={18}/> Resize
                         <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-primary">
                                    <Zap size={16}/>
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[calc(100vw-2rem)] sm:w-80" align="end">
                                  <div className="grid gap-4">
                                      <div className="space-y-2">
                                          <h4 className="font-medium leading-none">Quick Action Preset</h4>
                                          <p className="text-sm text-muted-foreground">
                                          Configure a one-click resize and download.
                                          </p>
                                      </div>
                                      <Separator />
                                      <div className="grid gap-2">
                                          <Label>Target Dimensions (Optional)</Label>
                                          <div className="flex items-center gap-2">
                                              <Input 
                                                  type="number" 
                                                  placeholder="Width" 
                                                  value={quickActionPreset?.width || ''} 
                                                  onChange={(e) => setQuickActionPreset(p => ({...p!, width: parseInt(e.target.value) || undefined}))}
                                              />
                                              <Input 
                                                  type="number" 
                                                  placeholder="Height"
                                                  value={quickActionPreset?.height || ''} 
                                                  onChange={(e) => setQuickActionPreset(p => ({...p!, height: parseInt(e.target.value) || undefined}))}
                                              />
                                          </div>
                                      </div>
                                      <div className="grid gap-2">
                                        <Label>Format</Label>
                                        <Select
                                            value={quickActionPreset?.format || 'image/jpeg'}
                                            onValueChange={(value) => setQuickActionPreset(p => ({...p!, format: value as any}))}
                                        >
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="image/png">PNG</SelectItem>
                                                <SelectItem value="image/jpeg">JPEG</SelectItem>
                                                <SelectItem value="image/webp">WEBP</SelectItem>
                                            </SelectContent>
                                        </Select>
                                      </div>
                                      <div className="grid gap-2">
                                            <Label>Target File Size (Optional)</Label>
                                            <div className="flex items-center gap-2">
                                            <Input 
                                                type="number"
                                                placeholder="e.g. 500"
                                                value={quickActionPreset?.targetSize || ''}
                                                onChange={(e) => setQuickActionPreset(p => ({...p!, targetSize: parseInt(e.target.value) || undefined}))}
                                            />
                                            <Select 
                                                value={quickActionPreset?.targetUnit || 'KB'} 
                                                onValueChange={(val: 'KB' | 'MB') => setQuickActionPreset(p => ({...p!, targetUnit: val}))}
                                            >
                                                <SelectTrigger className="w-[80px]"><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="KB">KB</SelectItem>
                                                    <SelectItem value="MB">MB</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            </div>
                                        </div>
                                        <Button onClick={handleSaveQuickActionPreset} variant="secondary" className="w-full">Save Preset</Button>
                                  </div>
                              </PopoverContent>
                        </Popover>
                    </CardTitle>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" onClick={resetDimensions}>Reset</Button>
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

    

    
