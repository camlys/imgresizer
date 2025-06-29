
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

export function ResizeRotateTab({ settings, updateSettings, originalImage, processedSize }: ResizeRotateTabProps) {
    const [width, setWidth] = useState(convertFromPx(settings.width, settings.unit).toString());
    const [height, setHeight] = useState(convertFromPx(settings.height, settings.unit).toString());
    const [unit, setUnit] = useState(settings.unit);
    
    const aspectRatio = originalImage.width / originalImage.height;

    // This effect ensures that if the global settings change (e.g., via crop or reset),
    // the local inputs update accordingly.
    useEffect(() => {
        setWidth(convertFromPx(settings.width, settings.unit).toString());
        setHeight(convertFromPx(settings.height, settings.unit).toString());
        setUnit(settings.unit);
    }, [settings.width, settings.height, settings.unit, originalImage]);


    const handleUnitChange = (newUnit: Unit) => {
        const currentPxWidth = settings.width;
        const currentPxHeight = settings.height;
        
        setWidth(convertFromPx(currentPxWidth, newUnit).toString());
        setHeight(convertFromPx(currentPxHeight, newUnit).toString());
        setUnit(newUnit);
        updateSettings({ unit: newUnit });
    };

    const handleDimensionChange = (valueStr: string, dimension: 'width' | 'height') => {
        // Update local state immediately to provide a responsive typing experience.
        if (dimension === 'width') {
            setWidth(valueStr);
        } else {
            setHeight(valueStr);
        }

        const numericValue = parseFloat(valueStr);
        if (valueStr.trim() === '' || isNaN(numericValue) || numericValue < 0) {
            return; // Don't update global state if input is empty or invalid
        }

        if (dimension === 'width') {
            const newPxWidth = convertToPx(numericValue, unit);
            if (settings.keepAspectRatio) {
                const newPxHeight = newPxWidth / aspectRatio;
                setHeight(convertFromPx(newPxHeight, unit).toString());
                updateSettings({ width: newPxWidth, height: newPxHeight });
            } else {
                updateSettings({ width: newPxWidth });
            }
        } else { // dimension is height
            const newPxHeight = convertToPx(numericValue, unit);
            if (settings.keepAspectRatio) {
                const newPxWidth = newPxHeight * aspectRatio;
                setWidth(convertFromPx(newPxWidth, unit).toString());
                updateSettings({ width: newPxWidth, height: newPxHeight });
            } else {
                updateSettings({ height: newPxHeight });
            }
        }
    };
    
    const resetDimensions = () => {
        // Global state is source of truth, local state will update via useEffect
        updateSettings({ width: originalImage.width, height: originalImage.height, unit: 'px' });
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
                            <Input id="width" type="text" value={width} onChange={e => handleDimensionChange(e.target.value, 'width')} />
                        </div>
                        <div className="grid w-full gap-1.5">
                            <Label htmlFor="height">Height</Label>
                            <Input id="height" type="text" value={height} onChange={e => handleDimensionChange(e.target.value, 'height')} />
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
