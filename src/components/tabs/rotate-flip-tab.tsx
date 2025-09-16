
"use client";

import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { ImageSettings } from '@/lib/types';
import { RotateCcw, ArrowLeftRight, ArrowUpDown, RotateCw, RefreshCcw } from 'lucide-react';
import React from 'react';

interface RotateFlipTabProps {
  settings: ImageSettings;
  updateSettings: (newSettings: Partial<ImageSettings>) => void;
}

export function RotateFlipTab({ settings, updateSettings }: RotateFlipTabProps) {
  const handleFlip = (direction: 'horizontal' | 'vertical') => {
    if (direction === 'horizontal') {
      updateSettings({ flipHorizontal: !settings.flipHorizontal });
    } else {
      updateSettings({ flipVertical: !settings.flipVertical });
    }
  };

  const handleRotationInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    let numericValue = parseInt(value, 10);
    if (value === '') {
        numericValue = 0;
    }

    if (!isNaN(numericValue)) {
        const clampedValue = Math.max(0, Math.min(numericValue, 360));
        updateSettings({ rotation: clampedValue });
    }
  };
  
  const handleRotationSliderChange = (val: number[]) => {
    updateSettings({ rotation: val[0] });
  };
  
  const resetRotation = () => {
    updateSettings({ rotation: 0 });
  };

  const handleQuickRotate = (angle: number) => {
    const newRotation = (settings.rotation + angle + 360) % 360;
    updateSettings({ rotation: newRotation });
  };

  return (
    <div className="space-y-4 p-1">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-medium flex items-center gap-2"><RotateCcw size={18}/> Rotate</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={resetRotation}>Reset</Button>
              <div className="relative w-24">
                <Input
                  type="number"
                  value={Math.round(settings.rotation)}
                  onChange={handleRotationInputChange}
                  min={0}
                  max={360}
                  className="w-full pr-6 text-right"
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">°</span>
              </div>
            </div>
        </CardHeader>
        <CardContent className="space-y-4">
             <Slider 
                value={[settings.rotation]} 
                onValueChange={handleRotationSliderChange}
                min={0} 
                max={360} 
                step={1} 
              />
              <div className="grid grid-cols-4 gap-2">
                <Button variant="outline" onClick={() => handleQuickRotate(-90)}>
                  <RotateCcw size={16} className="mr-2"/> -90°
                </Button>
                 <Button variant="outline" onClick={() => handleQuickRotate(-45)}>
                  -45°
                </Button>
                <Button variant="outline" onClick={() => handleQuickRotate(45)}>
                  +45°
                </Button>
                <Button variant="outline" onClick={() => handleQuickRotate(90)}>
                  <RotateCw size={16} className="mr-2"/> +90°
                </Button>
              </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-medium flex items-center gap-2"><ArrowLeftRight size={18}/> Flip</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-2">
             <Button variant="outline" onClick={() => handleFlip('horizontal')}>
                <ArrowLeftRight size={16} className="mr-2"/>
                Horizontal
             </Button>
             <Button variant="outline" onClick={() => handleFlip('vertical')}>
                <ArrowUpDown size={16} className="mr-2"/>
                Vertical
             </Button>
        </CardContent>
      </Card>
    </div>
  );
}

