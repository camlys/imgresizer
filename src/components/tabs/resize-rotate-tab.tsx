
"use client";

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { ImageSettings, OriginalImage, Unit } from '@/lib/types';
import { Lock, Unlock, Scan, Check } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface ResizeRotateTabProps {
  settings: ImageSettings;
  updateSettings: (newSettings: Partial<ImageSettings>) => void;
  originalImage: OriginalImage;
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

export function ResizeRotateTab({ settings, updateSettings, originalImage }: ResizeRotateTabProps) {
    const [localState, setLocalState] = useState({
        width: settings.width,
        height: settings.height,
        unit: settings.unit,
        keepAspectRatio: settings.keepAspectRatio,
    });
    
    const [displayValues, setDisplayValues] = useState({
        width: convertFromPx(settings.width, settings.unit).toFixed(2),
        height: convertFromPx(settings.height, settings.unit).toFixed(2),
    });

    const aspectRatio = originalImage.width / originalImage.height;

    useEffect(() => {
        setLocalState({
            width: settings.width,
            height: settings.height,
            unit: settings.unit,
            keepAspectRatio: settings.keepAspectRatio,
        });
        setDisplayValues({
            width: convertFromPx(settings.width, settings.unit).toFixed(2),
            height: convertFromPx(settings.height, settings.unit).toFixed(2),
        });
    }, [settings]);

    const handleUnitChange = (unit: Unit) => {
        setLocalState(prev => ({ ...prev, unit }));
        setDisplayValues({
            width: convertFromPx(localState.width, unit).toFixed(2),
            height: convertFromPx(localState.height, unit).toFixed(2),
        });
    };

    const handleDimensionChange = (valueStr: string, dimension: 'width' | 'height') => {
        const numericValue = parseFloat(valueStr) || 0;

        if (dimension === 'width') {
            const newPxWidth = convertToPx(numericValue, localState.unit);
            if (localState.keepAspectRatio) {
                const newPxHeight = newPxWidth / aspectRatio;
                setLocalState(prev => ({...prev, width: newPxWidth, height: newPxHeight}));
                setDisplayValues({ width: valueStr, height: convertFromPx(newPxHeight, localState.unit).toFixed(2) });
            } else {
                setLocalState(prev => ({...prev, width: newPxWidth}));
                setDisplayValues(prev => ({...prev, width: valueStr}));
            }
        } else { // dimension is height
            const newPxHeight = convertToPx(numericValue, localState.unit);
            if (localState.keepAspectRatio) {
                const newPxWidth = newPxHeight * aspectRatio;
                setLocalState(prev => ({...prev, width: newPxWidth, height: newPxHeight}));
                setDisplayValues({ height: valueStr, width: convertFromPx(newPxWidth, localState.unit).toFixed(2) });
            } else {
                setLocalState(prev => ({...prev, height: newPxHeight}));
                setDisplayValues(prev => ({...prev, height: valueStr}));
            }
        }
    };
    
    const handleAspectRatioToggle = (checked: boolean) => {
        setLocalState(prev => ({ ...prev, keepAspectRatio: checked }));
    }

    const resetDimensions = () => {
        setLocalState(prev => ({ ...prev, width: originalImage.width, height: originalImage.height }));
        setDisplayValues({
            width: convertFromPx(originalImage.width, localState.unit).toFixed(2),
            height: convertFromPx(originalImage.height, localState.unit).toFixed(2),
        });
    };
    
    const applyChanges = () => {
        updateSettings(localState);
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
                            <Input id="width" type="number" value={displayValues.width} onChange={e => handleDimensionChange(e.target.value, 'width')} />
                        </div>
                        <div className="grid w-full gap-1.5">
                            <Label htmlFor="height">Height</Label>
                            <Input id="height" type="number" value={displayValues.height} onChange={e => handleDimensionChange(e.target.value, 'height')} />
                        </div>
                        <div className="grid w-32 gap-1.5">
                            <Label>Unit</Label>
                            <Select value={localState.unit} onValueChange={(val: Unit) => handleUnitChange(val)}>
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
                        <Switch id="aspect-ratio" checked={localState.keepAspectRatio} onCheckedChange={handleAspectRatioToggle}/>
                        <Label htmlFor="aspect-ratio" className="flex items-center gap-2 cursor-pointer">
                            {localState.keepAspectRatio ? <Lock size={14}/> : <Unlock size={14}/>}
                            Keep aspect ratio
                        </Label>
                    </div>
                    <Button onClick={applyChanges} className="w-full mt-2">
                        <Check size={16} className="mr-2" />
                        Apply Changes
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
