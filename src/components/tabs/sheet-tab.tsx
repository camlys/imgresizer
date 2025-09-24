
"use client";

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Notebook, Rows, Columns, RefreshCw } from 'lucide-react';
import type { ImageSettings, SheetSettings } from '@/lib/types';
import React from 'react';

interface SheetTabProps {
  settings: ImageSettings;
  updateSettings: (newSettings: Partial<ImageSettings>) => void;
}

const initialSheetSettings: SheetSettings = {
  enabled: false,
  horizontalLines: true,
  verticalLines: false,
  lineColor: '#d1d5db',
  spacing: 20,
  marginTop: 20,
  marginLeft: 20,
};

export function SheetTab({ settings, updateSettings }: SheetTabProps) {
  const sheet = settings.sheet || initialSheetSettings;

  const handleSheetChange = (newSheetProps: Partial<SheetSettings>) => {
    updateSettings({ sheet: { ...sheet, ...newSheetProps } });
  };

  const resetSheetSettings = () => {
    updateSettings({ sheet: initialSheetSettings });
  };
  
  const handleEnableToggle = (enabled: boolean) => {
    if(enabled) {
      // When enabling, set a default A4 size if not already large
      // A4 at 96 DPI is 794x1123
      const isLikelyA4 = settings.width > 700 && settings.height > 1000;
       if (!isLikelyA4) {
         updateSettings({
            sheet: { ...sheet, enabled },
            width: 794,
            height: 1123,
            unit: 'px',
            backgroundColor: '#ffffff'
         });
       } else {
         updateSettings({
            sheet: { ...sheet, enabled },
            backgroundColor: '#ffffff'
         });
       }
    } else {
      handleSheetChange({ enabled });
    }
  }

  return (
    <div className="space-y-4 p-1">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Notebook size={18} />
            Sheet Generator
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={resetSheetSettings}>
            <RefreshCw size={14} className="mr-2"/>
            Reset
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
            <div className="space-y-0.5">
              <Label htmlFor="sheet-enabled">Enable Sheet Overlay</Label>
              <p className="text-xs text-muted-foreground">
                Draw lines or grids on the canvas. Best used with A4 size presets.
              </p>
            </div>
            <Switch
              id="sheet-enabled"
              checked={sheet.enabled}
              onCheckedChange={handleEnableToggle}
            />
          </div>

          {sheet.enabled && (
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5">
                  <Label htmlFor="h-lines" className="flex items-center gap-2"><Rows size={16}/> Horizontal Lines (Rows)</Label>
                </div>
                <Switch
                  id="h-lines"
                  checked={sheet.horizontalLines}
                  onCheckedChange={(checked) => handleSheetChange({ horizontalLines: checked })}
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5">
                  <Label htmlFor="v-lines" className="flex items-center gap-2"><Columns size={16}/>Vertical Lines (Columns)</Label>
                </div>
                <Switch
                  id="v-lines"
                  checked={sheet.verticalLines}
                  onCheckedChange={(checked) => handleSheetChange({ verticalLines: checked })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="grid gap-1.5">
                    <Label htmlFor="sheet-spacing">Spacing (px)</Label>
                    <Input id="sheet-spacing" type="number" value={sheet.spacing} onChange={e => handleSheetChange({ spacing: parseInt(e.target.value) || 0 })}/>
                </div>
                 <div className="grid gap-1.5">
                    <Label htmlFor="sheet-color">Line Color</Label>
                    <div className="relative">
                        <Input id="sheet-color" value={sheet.lineColor} onChange={e => handleSheetChange({ lineColor: e.target.value })}/>
                        <Input type="color" className="absolute top-1/2 right-1 h-8 w-8 -translate-y-1/2 p-1 cursor-pointer bg-transparent border-none" value={sheet.lineColor} onChange={e => handleSheetChange({ lineColor: e.target.value })}/>
                    </div>
                </div>
              </div>
               <div className="grid grid-cols-2 gap-4">
                 <div className="grid gap-1.5">
                    <Label htmlFor="sheet-margin-top">Top Margin (px)</Label>
                    <Input id="sheet-margin-top" type="number" value={sheet.marginTop} onChange={e => handleSheetChange({ marginTop: parseInt(e.target.value) || 0 })}/>
                </div>
                 <div className="grid gap-1.5">
                    <Label htmlFor="sheet-margin-left">Left Margin (px)</Label>
                    <Input id="sheet-margin-left" type="number" value={sheet.marginLeft} onChange={e => handleSheetChange({ marginLeft: parseInt(e.target.value) || 0 })}/>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
