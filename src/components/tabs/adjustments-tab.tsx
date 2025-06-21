"use client";

import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SlidersHorizontal } from 'lucide-react';
import type { ImageSettings } from '@/lib/types';
import React from 'react';

interface AdjustmentsTabProps {
  settings: ImageSettings;
  updateSettings: (newSettings: Partial<ImageSettings>) => void;
}

const initialAdjustments = {
  brightness: 100,
  contrast: 100,
  saturate: 100,
  grayscale: 0,
  sepia: 0,
  hue: 0,
};

const presets = [
    { name: 'Vintage', values: { brightness: 110, contrast: 90, saturate: 70, sepia: 40 } },
    { name: 'Grayscale', values: { grayscale: 100, saturate: 0 } },
    { name: 'Vibrant', values: { saturate: 180, contrast: 110 } },
    { name: 'Cool', values: { hue: -20, brightness: 105 } }
]

export function AdjustmentsTab({ settings, updateSettings }: AdjustmentsTabProps) {
    
  const handleAdjustmentChange = (field: keyof typeof settings.adjustments, value: number) => {
    updateSettings({ adjustments: { ...settings.adjustments, [field]: value } });
  };
  
  const resetAdjustments = () => {
    updateSettings({ adjustments: initialAdjustments });
  };

  const applyPreset = (presetValues: Partial<typeof initialAdjustments>) => {
    updateSettings({ adjustments: { ...initialAdjustments, ...presetValues } });
  }

  const sliders = [
    { label: 'Brightness', field: 'brightness', min: 0, max: 200 },
    { label: 'Contrast', field: 'contrast', min: 0, max: 200 },
    { label: 'Saturation', field: 'saturate', min: 0, max: 200 },
    { label: 'Grayscale', field: 'grayscale', min: 0, max: 100 },
    { label: 'Sepia', field: 'sepia', min: 0, max: 100 },
    { label: 'Hue', field: 'hue', min: 0, max: 360 },
  ] as const;


  return (
    <div className="space-y-4 p-1">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base font-medium flex items-center gap-2"><SlidersHorizontal size={18}/> Adjustments</CardTitle>
          <Button variant="ghost" size="sm" onClick={resetAdjustments}>Reset</Button>
        </CardHeader>
        <CardContent className="space-y-4">
           <div>
            <Label className="text-xs text-muted-foreground">Presets</Label>
            <div className="grid grid-cols-2 gap-2 mt-1">
              {presets.map(p => (
                 <Button key={p.name} variant="outline" size="sm" onClick={() => applyPreset(p.values)}>{p.name}</Button>
              ))}
            </div>
          </div>
          {sliders.map(({ label, field, min, max }) => (
            <div key={field} className="grid gap-1.5">
              <div className="flex justify-between items-center">
                <Label htmlFor={`adj-${field}`}>{label}</Label>
                <span className="text-sm text-muted-foreground">{settings.adjustments[field]}</span>
              </div>
              <Slider
                id={`adj-${field}`}
                value={[settings.adjustments[field]]}
                onValueChange={([val]) => handleAdjustmentChange(field, val)}
                min={min}
                max={max}
                step={1}
              />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
