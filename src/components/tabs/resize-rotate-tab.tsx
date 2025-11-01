
"use client";

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { ImageSettings, OriginalImage, Unit, QuickActionPreset } from '@/lib/types';
import { Lock, Unlock, Scan, BookOpen, Zap, RefreshCw, Loader2, ChevronDown } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import { ImageInfoPanel } from '../image-info-panel';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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

const standardPresets = [
    { name: "UPSC Photo", width: 240, height: 320, sizeKB: 20 },
    { name: "UPSC Sign", width: 320, height: 120, sizeKB: 20 },
    { name: "SSC Photo", width: 276, height: 354, sizeKB: 50 },
    { name: "SSC Sign", width: 472, height: 236, sizeKB: 20 },
    { name: "GATE Photo", width: 480, height: 640, sizeKB: 60 },
    { name: "GATE Sign", width: 560, height: 190, sizeKB: 30 },
    { name: "NEET Photo", width: 240, height: 320, sizeKB: 200 },
    { name: "NEET Sign", width: 320, height: 120, sizeKB: 30 },
    { name: "JEE Main Photo", width: 360, height: 480, sizeKB: 100 },
    { name: "JEE Main Sign", width: 360, height: 120, sizeKB: 30 },
    { name: "Railway Photo", width: 240, height: 320, sizeKB: 70 },
    { name: "Passport (India)", width: 413, height: 531, dpi: 300 }, // 3.5x4.5cm
    { name: "Stamp Size", width: 236, height: 295, dpi: 300 }, // 2x2.5cm
];


interface ResizeRotateTabProps {
    settings: ImageSettings;
    updateSettings: (newSettings: Partial<ImageSettings>) => void;
    originalImage: OriginalImage;
    processedSize: number | null;
    isFromMultiPagePdf: boolean;
    onViewPages: () => void;
    onTargetSizeSubmit: (targetSize: number, targetUnit: 'KB' | 'MB') => Promise<void>;
}

export function ResizeRotateTab({ settings, updateSettings, originalImage, processedSize, isFromMultiPagePdf, onViewPages, onTargetSizeSubmit }: ResizeRotateTabProps) {
    const [width, setWidth] = useState(convertFromPx(settings.width, settings.unit, settings.dpi).toString());
    const [height, setHeight] = useState(convertFromPx(settings.height, settings.unit, settings.dpi).toString());
    const [unit, setUnit] = useState(settings.unit);
    const [aspectRatio, setAspectRatio] = useState(originalImage ? originalImage.width / originalImage.height : 1);
    const { toast } = useToast();
    const [showPresets, setShowPresets] = useState(false);
    const presetTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const [quickActionPreset, setQuickActionPreset] = useState<QuickActionPreset>({
        format: 'image/jpeg',
        targetUnit: 'KB',
        autoCrop: false,
    });
    
    // Target size state
    const [targetSize, setTargetSize] = useState('');
    const [targetUnit, setTargetUnit] = useState<'KB' | 'MB'>('KB');
    const [isOptimizing, setIsOptimizing] = useState(false);

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
            const currentWidthInUnit = parseFloat(width);
            if (!isNaN(currentWidthInUnit)) {
                const newPxWidth = convertToPx(currentWidthInUnit, unit, newDpi);
                const newPxHeight = newPxWidth / aspectRatio;
                updateSettings({ dpi: newDpi, width: newPxWidth, height: newPxHeight });
            } else {
                updateSettings({ dpi: newDpi });
            }
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
    
    const applyPreset = (preset: typeof standardPresets[0]) => {
      const { width, height, dpi } = preset;
      updateSettings({ width, height, dpi: dpi || 96, keepAspectRatio: false });
      toast({
        title: `${preset.name} Preset Applied`,
        description: `Dimensions set to ${width}x${height}px. Don't forget to check the file size requirements.`,
      })
    };
    
    const handleTargetSizeClick = async () => {
        const size = parseFloat(targetSize);
        if (!size || size <= 0) {
            toast({
                title: "Invalid Size",
                description: "Please enter a valid target size.",
                variant: "destructive"
            });
            return;
        }

        setIsOptimizing(true);
        await onTargetSizeSubmit(size, targetUnit);
        setIsOptimizing(false);
    };

    const handlePresetMouseEnter = () => {
        if (presetTimeoutRef.current) {
            clearTimeout(presetTimeoutRef.current);
        }
        setShowPresets(true);
    };

    const handlePresetMouseLeave = () => {
        presetTimeoutRef.current = setTimeout(() => {
            setShowPresets(false);
        }, 200);
    };


    return (
        <div className="space-y-4 p-1">
            <Tabs defaultValue="manual" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="manual">Manual</TabsTrigger>
                    <TabsTrigger value="preset"><Zap size={16} className="mr-2"/>Quick Action</TabsTrigger>
                </TabsList>
                <TabsContent value="manual" className="mt-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-base font-medium flex items-center gap-2">
                                <Scan size={18}/> Resize
                            </CardTitle>
                            <div className="flex items-center">
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
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button variant="ghost" size="icon" onClick={resetDimensions} className="h-8 w-8">
                                                <RefreshCw size={16}/>
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Reset to original dimensions</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div 
                                className="grid gap-1.5"
                                onMouseEnter={handlePresetMouseEnter}
                                onMouseLeave={handlePresetMouseLeave}
                            >
                                <div 
                                    className="flex items-center justify-between cursor-pointer"
                                    onClick={() => setShowPresets(!showPresets)}
                                >
                                    <Label className="text-xs text-muted-foreground cursor-pointer">Standard Presets</Label>
                                    <ChevronDown className={`h-4 w-4 text-primary transition-transform ${showPresets ? 'rotate-180' : ''}`} />
                                </div>

                                {showPresets && (
                                    <div className="overflow-x-auto pb-2 mt-2">
                                        <div className="flex gap-2 whitespace-nowrap">
                                            {standardPresets.map(p => (
                                                <Button key={p.name} variant="outline" size="sm" onClick={() => applyPreset(p)} className="h-auto py-2 flex-col">
                                                    <span>{p.name}</span>
                                                    <span className="text-xs text-muted-foreground">{p.width}x{p.height}</span>
                                                </Button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
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
                                        {settings.keepAspectRatio ? <Lock size={16} className="text-primary"/> : <Unlock size={16} className="text-muted-foreground"/>}
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
                             <div className="space-y-2 pt-2 border-t mt-4">
                                <Label className="text-xs text-muted-foreground">Target File Size (Optional)</Label>
                                <div className="flex items-center gap-2">
                                <Input 
                                    type="number"
                                    placeholder="e.g. 500"
                                    value={targetSize}
                                    onChange={(e) => setTargetSize(e.target.value)}
                                    disabled={isOptimizing}
                                />
                                <Select value={targetUnit} onValueChange={(val: 'KB' | 'MB') => setTargetUnit(val)} disabled={isOptimizing}>
                                    <SelectTrigger className="w-[80px]">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="KB">KB</SelectItem>
                                        <SelectItem value="MB">MB</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Button variant="outline" onClick={handleTargetSizeClick} disabled={isOptimizing || !targetSize} className="px-4">
                                    {isOptimizing ? <Loader2 className="animate-spin"/> : 'Set'}
                                </Button>
                                </div>
                                <p className="text-xs text-muted-foreground">Sets quality to meet size for JPEG/WEBP.</p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="preset" className="mt-4 space-y-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base font-medium">Quick Action Preset</CardTitle>
                            <p className="text-sm text-muted-foreground pt-1">
                            Configure a one-click process. Use the <Zap size={14} className="inline-block"/> button in the header to run.
                            </p>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
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
                                            <SelectItem value="application/pdf">PDF</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label>Auto Crop</Label>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button 
                                                    variant="outline"
                                                    size="icon"
                                                    className={quickActionPreset.autoCrop ? 'bg-primary/20' : ''}
                                                    onClick={() => setQuickActionPreset(p => ({...p, autoCrop: !p.autoCrop}))}
                                                >
                                                    <Scan size={16}/>
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Toggle automatic border detection and cropping.</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
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
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
            <ImageInfoPanel 
                originalImage={originalImage}
                settings={settings}
                processedSize={processedSize}
            />
        </div>
    );
}

    

    

