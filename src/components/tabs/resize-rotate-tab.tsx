
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
import { Separator } from '../ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '../ui/switch';

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
    const [aspectRatio, setAspectRatio] = useState(originalImage ? originalImage.width / originalImage.height : 1);
    const { toast } = useToast();

    const [quickActionPreset, setQuickActionPreset] = useState<QuickActionPreset>({
        format: 'image/jpeg',
        targetUnit: 'KB',
        autoCrop: false,
    });

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
        if (originalImage) {
            if (settings.crop) {
                setAspectRatio(settings.crop.width / settings.crop.height);
            } else {
                setAspectRatio(originalImage.width / originalImage.height);
            }
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
        if (!originalImage) return;
        const resetWidth = settings.crop ? settings.crop.width : originalImage.width;
        const resetHeight = settings.crop ? settings.crop.height : originalImage.height;
        updateSettings({ width: resetWidth, height: resetHeight, unit: 'px', dpi: 96 });
    };
    
    if (!originalImage) {
        return null;
    }

    return (
        <div className="space-y-4 p-1">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-base font-medium flex items-center gap-2">
                        <Scan size={18}/> Resize
                    </CardTitle>
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
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="manual">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="manual">Manual</TabsTrigger>
                        <TabsTrigger value="preset"><Zap size={16} className="mr-2"/>Quick Action</TabsTrigger>
                      </TabsList>
                      <TabsContent value="manual" className="mt-4 space-y-4">
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
                        <Button variant="outline" size="sm" onClick={resetDimensions}>Reset Dimensions</Button>
                      </TabsContent>
                       <TabsContent value="preset" className="mt-4 space-y-4">
                          <div className="space-y-1">
                            <h4 className="font-medium text-sm">Quick Action Preset</h4>
                            <p className="text-sm text-muted-foreground">
                            Configure a one-click process. Use the <Zap size={14} className="inline-block"/> button in the header to run.
                            </p>
                          </div>
                          <Separator />
                          <div className="grid gap-4">
                              <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                                  <div className="space-y-0.5">
                                  <Label htmlFor="auto-crop">Auto Crop</Label>
                                  <p className="text-xs text-muted-foreground">
                                      Detect and crop borders automatically.
                                  </p>
                                  </div>
                                  <Switch
                                    id="auto-crop"
                                    checked={quickActionPreset.autoCrop}
                                    onCheckedChange={(checked) => setQuickActionPreset(p => ({...p, autoCrop: checked}))}
                                  />
                              </div>
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
                                    value={quickActionPreset?.format}
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
                                        value={quickActionPreset?.targetUnit} 
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
                      </TabsContent>
                  </Tabs>
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
