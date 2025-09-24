
"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ResizeRotateTab } from '@/components/tabs/resize-rotate-tab';
import { RotateFlipTab } from '@/components/tabs/rotate-flip-tab';
import { CropTab } from '@/components/tabs/crop-tab';
import { TextTab } from '@/components/tabs/text-tab';
import { AdjustmentsTab } from '@/components/tabs/adjustments-tab';
import { CollageTab } from '@/components/tabs/collage-tab';
import type { ImageSettings, OriginalImage, CropSettings, CollageSettings } from '@/lib/types';
import { SlidersHorizontal, Crop, Type, Scan, RotateCcw, Layers } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';

interface ControlPanelProps {
  settings: ImageSettings;
  updateSettings: (newSettings: Partial<ImageSettings>) => void;
  originalImage: OriginalImage | null;
  activeTab: string;
  onTabChange: (tab: string) => void;
  processedSize: number | null;
  pendingCrop: CropSettings | null;
  setPendingCrop: (crop: CropSettings | null) => void;
  onApplyPerspectiveCrop: () => void;
  isFromMultiPagePdf: boolean;
  onViewPages: () => void;
  selectedTextId: string | null;
  setSelectedTextId: (id: string | null) => void;
  selectedSignatureId: string | null;
  setSelectedSignatureId: (id: string | null) => void;
  editorMode: 'single' | 'collage';
  collageSettings: CollageSettings;
  updateCollageSettings: (newSettings: Partial<CollageSettings>) => void;
  onAddImageToCollage: (file: File) => void;
  selectedLayerId: string | null;
  setSelectedLayerId: (id: string | null) => void;
}

export function ControlPanel({ 
  settings, 
  updateSettings, 
  originalImage, 
  activeTab, 
  onTabChange, 
  processedSize,
  pendingCrop,
  setPendingCrop,
  onApplyPerspectiveCrop,
  isFromMultiPagePdf,
  onViewPages,
  selectedTextId,
  setSelectedTextId,
  selectedSignatureId,
  setSelectedSignatureId,
  editorMode,
  collageSettings,
  updateCollageSettings,
  onAddImageToCollage,
  selectedLayerId,
  setSelectedLayerId,
}: ControlPanelProps) {

  const singleModeTabs = [
    { value: 'resize', icon: Scan, label: 'Resize' },
    { value: 'crop', icon: Crop, label: 'Crop' },
    { value: 'rotate', icon: RotateCcw, label: 'Rotate' },
    { value: 'text', icon: Type, label: 'Overlays' },
    { value: 'adjustments', icon: SlidersHorizontal, label: 'Adjust' },
    { value: 'collage', icon: Layers, label: 'Collage' },
  ];

  const collageModeTabs = [
     { value: 'collage', icon: Layers, label: 'Collage' },
  ];

  const availableTabs = editorMode === 'single' ? singleModeTabs : collageModeTabs;

  return (
    <div className="flex flex-col h-full">
      <div className="flex-grow p-2 overflow-y-auto">
        <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
          <ScrollArea className="w-full whitespace-nowrap">
            <TabsList className="h-auto p-1 inline-flex">
              {availableTabs.map(tab => (
                <TabsTrigger key={tab.value} value={tab.value} className="h-auto gap-2 py-2">
                  <tab.icon size={16}/>
                  <span className="text-sm">{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </ScrollArea>
          <TabsContent value="resize">
            <ResizeRotateTab 
              settings={settings} 
              updateSettings={updateSettings} 
              originalImage={originalImage!} 
              processedSize={processedSize}
              isFromMultiPagePdf={isFromMultiPagePdf}
              onViewPages={onViewPages}
            />
          </TabsContent>
          <TabsContent value="crop">
            <CropTab 
              settings={settings} 
              updateSettings={updateSettings} 
              originalImage={originalImage!}
              pendingCrop={pendingCrop}
              setPendingCrop={setPendingCrop}
              onTabChange={onTabChange}
              onApplyPerspectiveCrop={onApplyPerspectiveCrop}
            />
          </TabsContent>
           <TabsContent value="rotate">
            <RotateFlipTab settings={settings} updateSettings={updateSettings} />
          </TabsContent>
          <TabsContent value="text">
            <TextTab 
              settings={settings} 
              updateSettings={updateSettings}
              selectedTextId={selectedTextId}
              setSelectedTextId={setSelectedTextId}
              selectedSignatureId={selectedSignatureId}
              setSelectedSignatureId={setSelectedSignatureId}
            />
          </TabsContent>
          <TabsContent value="adjustments">
            <AdjustmentsTab settings={settings} updateSettings={updateSettings} />
          </TabsContent>
          <TabsContent value="collage">
            <CollageTab
              settings={collageSettings}
              updateSettings={updateCollageSettings}
              onAddImage={onAddImageToCollage}
              selectedLayerId={selectedLayerId}
              setSelectedLayerId={setSelectedLayerId}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
