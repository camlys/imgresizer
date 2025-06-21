"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ResizeRotateTab } from '@/components/tabs/resize-rotate-tab';
import { RotateFlipTab } from '@/components/tabs/rotate-flip-tab';
import { CropTab } from '@/components/tabs/crop-tab';
import { TextTab } from '@/components/tabs/text-tab';
import { AdjustmentsTab } from '@/components/tabs/adjustments-tab';
import type { ImageSettings, OriginalImage } from '@/lib/types';
import { SlidersHorizontal, Crop, Type, Scan, RotateCcw } from 'lucide-react';

interface ControlPanelProps {
  settings: ImageSettings;
  updateSettings: (newSettings: Partial<ImageSettings>) => void;
  originalImage: OriginalImage;
}

export function ControlPanel({ settings, updateSettings, originalImage }: ControlPanelProps) {
  return (
    <Tabs defaultValue="resize" className="w-full p-2">
      <TabsList className="grid w-full grid-cols-5 h-auto p-1">
        <TabsTrigger value="resize" className="flex-col h-auto gap-1 py-2">
          <Scan size={16}/>
          <span className="text-xs">Resize</span>
        </TabsTrigger>
         <TabsTrigger value="rotate" className="flex-col h-auto gap-1 py-2">
          <RotateCcw size={16}/>
          <span className="text-xs">Rotate &amp; Flip</span>
        </TabsTrigger>
        <TabsTrigger value="crop" className="flex-col h-auto gap-1 py-2">
            <Crop size={16}/>
            <span className="text-xs">Crop</span>
        </TabsTrigger>
        <TabsTrigger value="text" className="flex-col h-auto gap-1 py-2">
            <Type size={16}/>
            <span className="text-xs">Text</span>
        </TabsTrigger>
        <TabsTrigger value="adjustments" className="flex-col h-auto gap-1 py-2">
            <SlidersHorizontal size={16}/>
            <span className="text-xs">Adjust</span>
        </TabsTrigger>
      </TabsList>
      <TabsContent value="resize">
        <ResizeRotateTab settings={settings} updateSettings={updateSettings} originalImage={originalImage} />
      </TabsContent>
       <TabsContent value="rotate">
        <RotateFlipTab settings={settings} updateSettings={updateSettings} />
      </TabsContent>
      <TabsContent value="crop">
        <CropTab settings={settings} updateSettings={updateSettings} originalImage={originalImage} />
      </TabsContent>
      <TabsContent value="text">
        <TextTab settings={settings} updateSettings={updateSettings} />
      </TabsContent>
      <TabsContent value="adjustments">
        <AdjustmentsTab settings={settings} updateSettings={updateSettings} />
      </TabsContent>
    </Tabs>
  );
}
