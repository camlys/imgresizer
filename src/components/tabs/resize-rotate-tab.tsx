"use client";

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { ImageSettings, OriginalImage, Unit } from '@/lib/types';
import { Lock, Unlock, Scan } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { ImageInfoPanel } from '../image-info-panel';

interface ResizeRotateTabProps {
  settings: ImageSettings;
  updateSettings: (newSettings: Partial<ImageSettings>) => void;
  originalImage: OriginalImage;
  processedSize: number | null;
}

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

export function ResizeRotateTab({ settings, updateSettings, originalImage, processedSize }: ResizeRotateTabProps) {
    const [width, setWidth] = useState(convertFromPx(settings.width, settings.unit).toFixed(2));
    const [height, setHeight] = useState(convertFromPx(settings.height, settings.unit).toFixed(2));
    const [unit, setUnit] = useState(settings.unit);
    
    const aspectRatio = originalImage.width / originalImage.height;

    useEffect(() => {
        const newWidth = convertFromPx(settings.width, unit);
        const newHeight = convertFromPx(settings.height, unit);
        setWidth(newWidth.toFixed(2));
        setHeight(newHeight.toFixed(2));
    }, [settings.width, settings.height, unit]);
    
    useEffect(() => {
        setUnit(settings.unit);
    }, [settings.unit]);

    const handleUnitChange = (newUnit: Unit) => {
        setUnit(newUnit);
        updateSettings({ unit: newUnit });
    };

    const handleDimensionChange = (valueStr: string, dimension: 'width' | 'height') => {
        const numericValue = parseFloat(valueStr) || 0;

        if (dimension === 'width') {
            setWidth(valueStr);
            const newPxWidth = convertToPx(numericValue, unit);
            if (settings.keepAspectRatio) {
                const newPxHeight = newPxWidth / aspectRatio;
                setHeight(convertFromPx(newPxHeight, unit).toFixed(2));
                updateSettings({ width: newPxWidth, height: newPxHeight });
            } else {
                updateSettings({ width: newPxWidth });
            }
        } else { // dimension is height
            setHeight(valueStr);
            const newPxHeight = convertToPx(numericValue, unit);
            if (settings.keepAspectRatio) {
                const newPxWidth = newPxHeight * aspectRatio;
                setWidth(convertFromPx(newPxWidth, unit).toFixed(2));
                updateSettings({ width: newPxWidth, height: newPxHeight });
            } else {
                updateSettings({ height: newPxHeight });
            }
        }
    };
    
    const resetDimensions = () => {
        updateSettings({ width: originalImage.width, height: originalImage.height, unit: 'px' });
        setUnit('px');
    };

    return (
        <div className="space-y-4 p-1">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-base font-medium flex items-center gap-2"><Scan size={18}/> Resize</CardTitle>
                    <Button variant="ghost" size="sm" onClick={resetDimensions}>Reset</Button>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-end gap-2">
                        <div className="grid w-full gap-1.5">
                            <Label htmlFor="width">Width</Label>
                            <Input id="width" type="number" value={width} onChange={e => handleDimensionChange(e.target.value, 'width')} />
                        </div>
                        <div className="grid w-full gap-1.5">
                            <Label htmlFor="height">Height</Label>
                            <Input id="height" type="number" value={height} onChange={e => handleDimensionChange(e.target.value, 'height')} />
                        </div>
                        <div className="grid w-32 gap-1.5">
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
                    </div>
                    <div className="flex items-center space-x-2">
                        <Switch id="aspect-ratio" checked={settings.keepAspectRatio} onCheckedChange={(checked) => updateSettings({ keepAspectRatio: checked })}/>
                        <Label htmlFor="aspect-ratio" className="flex items-center gap-2 cursor-pointer">
                            {settings.keepAspectRatio ? <Lock size={14}/> : <Unlock size={14}/>}
                            Keep aspect ratio
                        </Label>
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
