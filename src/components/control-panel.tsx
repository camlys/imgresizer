
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
  onViewPages: (source: 'single' | 'collage') => void;
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
  onAutoLayout: (count: 2 | 3 | 4 | 5 | 6) => void;
  onAutoDetectBorder: () => void;
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
  onAutoLayout,
  onAutoDetectBorder,
}: ControlPanelProps) {

  const allTabs = [
    { value: 'resize', icon: Scan, label: 'Resize' },
    { value: 'crop', icon: Crop, label: 'Crop' },
    { value: 'rotate', icon: RotateCcw, label: 'Rotate' },
    { value: 'text', icon: Type, label: 'Overlays' },
    { value: 'adjustments', icon: SlidersHorizontal, label: 'Adjust' },
    { value: 'collage', icon: Layers, label: 'Collage' },
  ];

  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full flex flex-col h-full overflow-hidden">
      <div className="w-full overflow-x-auto whitespace-nowrap p-2 border-b">
        <TabsList className="h-auto p-1 inline-flex">
          {allTabs.map(tab => (
            <TabsTrigger key={tab.value} value={tab.value} className="h-auto gap-2 py-2">
              <tab.icon size={16}/>
              <span className="text-sm">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
      <ScrollArea className="flex-1 p-2">
        <TabsContent value="resize" className="mt-0">
          <ResizeRotateTab 
            settings={settings} 
            updateSettings={updateSettings} 
            originalImage={originalImage!} 
            processedSize={processedSize}
            isFromMultiPagePdf={isFromMultiPagePdf}
            onViewPages={() => onViewPages('single')}
          />
        </TabsContent>
        <TabsContent value="crop" className="mt-0">
          <CropTab 
            settings={settings} 
            updateSettings={updateSettings} 
            originalImage={originalImage!}
            pendingCrop={pendingCrop}
            setPendingCrop={setPendingCrop}
            onTabChange={onTabChange}
            onApplyPerspectiveCrop={onApplyPerspectiveCrop}
            onAutoDetectBorder={onAutoDetectBorder}
          />
        </TabsContent>
        <TabsContent value="rotate" className="mt-0">
          <RotateFlipTab settings={settings} updateSettings={updateSettings} />
        </TabsContent>
        <TabsContent value="text" className="mt-0">
          <TextTab 
            settings={settings} 
            updateSettings={updateSettings}
            selectedTextId={selectedTextId}
            setSelectedTextId={setSelectedTextId}
            selectedSignatureId={selectedSignatureId}
            setSelectedSignatureId={setSelectedSignatureId}
          />
        </TabsContent>
        <TabsContent value="adjustments" className="mt-0">
          <AdjustmentsTab settings={settings} updateSettings={updateSettings} />
        </TabsContent>
        <TabsContent value="collage" className="mt-0">
          <CollageTab
            settings={collageSettings}
            updateSettings={updateCollageSettings}
            onAddImage={onAddImageToCollage}
            selectedLayerId={selectedLayerId}
            setSelectedLayerId={setSelectedLayerId}
            isFromMultiPagePdf={isFromMultiPagePdf}
            onViewPages={() => onViewPages('collage')}
            onAutoLayout={onAutoLayout}
          />
        </TabsContent>
      </ScrollArea>
    </Tabs>
  );
}

    
