
"use client";

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { ImageSettings, OriginalImage, Unit } from '@/lib/types';
import { Lock, Unlock, Scan } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { ImageInfoPanel } from '../image-info-panel';

const DPI = 96;
const CM_TO_INCH = 0.393701;

const convertToPx = (value: number, unit: Unit): number => {
  if (unit === 'px') return value;
  if (unit === 'inch') return value * DPI;
  if (unit === 'cm') return value * CM_TO_INCH * DPI;
  if (unit === 'mm') return (value / 10) * CM_TO_INCH * DPI;
  return value;
};

const convertFromPx = (value: number, unit: Unit): number => {
  if (unit === 'px') return value;
  if (unit === 'inch') return value / DPI;
  if (unit === 'cm') return (value / DPI) / CM_TO_INCH;
  if (unit === 'mm') return ((value / DPI) / CM_TO_INCH) * 10;
  return value;
};

interface ResizeRotateTabProps {
    settings: ImageSettings;
    updateSettings: (newSettings: Partial<ImageSettings>) => void;
    originalImage: OriginalImage;
    processedSize: number | null;
}

export function ResizeRotateTab({ settings, updateSettings, originalImage, processedSize }: ResizeRotateTabProps) {
    const [width, setWidth] = useState(convertFromPx(settings.width, settings.unit).toString());
    const [height, setHeight] = useState(convertFromPx(settings.height, settings.unit).toString());
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
        if (parseFloat(width) !== convertFromPx(settings.width, unit)) {
            setWidth(convertFromPx(settings.width, unit).toFixed(2).replace(/\.00$/, ''));
        }
        if (parseFloat(height) !== convertFromPx(settings.height, unit)) {
            setHeight(convertFromPx(settings.height, unit).toFixed(2).replace(/\.00$/, ''));
        }
        if (unit !== settings.unit) {
            setUnit(settings.unit);
        }
    }, [settings.width, settings.height, settings.unit]);


    const handleUnitChange = (newUnit: Unit) => {
        const currentPxWidth = settings.width;
        
        setWidth(convertFromPx(currentPxWidth, newUnit).toFixed(2).replace(/\.00$/, ''));
        setHeight(convertFromPx(settings.height, newUnit).toFixed(2).replace(/\.00$/, ''));
        setUnit(newUnit);
        updateSettings({ unit: newUnit });
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

        if (dimension === 'width') {
            const newPxWidth = convertToPx(numericValue, unit);
            if (settings.keepAspectRatio) {
                const newPxHeight = newPxWidth / aspectRatio;
                setHeight(convertFromPx(newPxHeight, unit).toFixed(2).replace(/\.00$/, ''));
                updateSettings({ width: newPxWidth, height: newPxHeight });
            } else {
                updateSettings({ width: newPxWidth });
            }
        } else {
            const newPxHeight = convertToPx(numericValue, unit);
            if (settings.keepAspectRatio) {
                const newPxWidth = newPxHeight * aspectRatio;
                setWidth(convertFromPx(newPxWidth, unit).toFixed(2).replace(/\.00$/, ''));
                updateSettings({ width: newPxWidth, height: newPxHeight });
            } else {
                updateSettings({ height: newPxHeight });
            }
        }
    };
    
    const resetDimensions = () => {
        const resetWidth = settings.crop ? settings.crop.width : originalImage.width;
        const resetHeight = settings.crop ? settings.crop.height : originalImage.height;
        updateSettings({ width: resetWidth, height: resetHeight, unit: 'px' });
    };

    return (
        <div className="space-y-4 p-1">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-base font-medium flex items-center gap-2"><Scan size={18}/> Resize</CardTitle>
                    <Button variant="ghost" size="sm" onClick={resetDimensions}>Reset</Button>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap items-end gap-x-4 gap-y-4">
                        <div className="grid flex-grow gap-1.5 min-w-[80px]">
                            <Label htmlFor="width">Width</Label>
                            <Input id="width" type="text" value={width} onChange={e => handleDimensionChange(e.target.value, 'width')} />
                        </div>
                        <div className="grid flex-grow gap-1.5 min-w-[80px]">
                            <Label htmlFor="height">Height</Label>
                            <Input id="height" type="text" value={height} onChange={e => handleDimensionChange(e.target.value, 'height')} />
                        </div>
                        <div className="grid w-24 gap-1.5">
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
                        <div className="flex items-center space-x-2 pb-1">
                            <Switch id="aspect-ratio" checked={settings.keepAspectRatio} onCheckedChange={(checked) => updateSettings({ keepAspectRatio: checked })}/>
                            <Label htmlFor="aspect-ratio" className="flex items-center gap-2 cursor-pointer">
                                {settings.keepAspectRatio ? <Lock size={14}/> : <Unlock size={14}/>}
                            </Label>
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
