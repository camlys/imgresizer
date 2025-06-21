"use client";

import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { ImageSettings } from '@/lib/types';
import { RotateCcw, ArrowLeftRight, ArrowUpDown } from 'lucide-react';
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

  return (
    <div className="space-y-4 p-1">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-medium flex items-center gap-2"><RotateCcw size={18}/> Rotate</CardTitle>
            <span className="text-sm text-muted-foreground w-16 text-right">{settings.rotation}°</span>
        </CardHeader>
        <CardContent>
             <Slider 
                value={[settings.rotation]} 
                onValueChange={(val) => updateSettings({ rotation: val[0] })} 
                min={0} 
                max={360} 
                step={1} 
              />
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
