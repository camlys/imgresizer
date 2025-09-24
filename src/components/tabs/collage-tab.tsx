
"use client";

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Layers, Plus, Trash2, RotateCcw, RotateCw, ImageUp, GripVertical, Notebook, Rows, Columns, RefreshCw } from 'lucide-react';
import type { CollageSettings, ImageLayer, SheetSettings } from '@/lib/types';
import React, { useRef } from 'react';
import { Slider } from '../ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';

interface CollageTabProps {
  settings: CollageSettings;
  updateSettings: (newSettings: Partial<CollageSettings>) => void;
  onAddImage: (file: File) => void;
  selectedLayerId: string | null;
  setSelectedLayerId: (id: string | null) => void;
}

const canvasSizes = [
    { name: 'A4 Portrait', width: 595, height: 842 },
    { name: 'A4 Landscape', width: 842, height: 595 },
    { name: 'A5 Portrait', width: 420, height: 595 },
    { name: 'A5 Landscape', width: 595, height: 420 },
    { name: 'US Letter Portrait', width: 612, height: 792 },
    { name: 'US Letter Landscape', width: 792, height: 612 },
    { name: 'Instagram Story', width: 1080, height: 1920 },
    { name: 'Instagram Post (Square)', width: 1080, height: 1080 },
    { name: 'Instagram Post (Portrait)', width: 1080, height: 1350 },
    { name: 'Facebook Post', width: 1200, height: 630 },
    { name: 'Twitter Post', width: 1600, height: 900 },
    { name: 'Pinterest Pin', width: 1000, height: 1500 },
    { name: 'YouTube Thumbnail', width: 1280, height: 720 },
];

const initialSheetSettings: SheetSettings = {
  enabled: false,
  horizontalLines: true,
  verticalLines: false,
  lineColor: '#d1d5db',
  spacing: 20,
  marginTop: 20,
  marginLeft: 20,
};

export function CollageTab({ settings, updateSettings, onAddImage, selectedLayerId, setSelectedLayerId }: CollageTabProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragItem = useRef<string | null>(null);
  const dragOverItem = useRef<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onAddImage(file);
    }
    if (event.target) {
        event.target.value = '';
    }
  };

  const handleLayerUpdate = (id: string, newProps: Partial<ImageLayer>) => {
    const newLayers = settings.layers.map(l => l.id === id ? { ...l, ...newProps } : l);
    updateSettings({ layers: newLayers });
  };
  
  const removeLayer = (id: string) => {
    const newLayers = settings.layers.filter(l => l.id !== id);
    updateSettings({ layers: newLayers });
    if (selectedLayerId === id) {
        setSelectedLayerId(null);
    }
  };
  
  const handleQuickRotate = (id: string, currentRotation: number, angle: number) => {
    const newRotation = (currentRotation + angle + 360) % 360;
    handleLayerUpdate(id, { rotation: newRotation });
  };

  const handleDragSort = () => {
    if (!dragItem.current || !dragOverItem.current || dragItem.current === dragOverItem.current) return;

    const layersCopy = [...settings.layers];
    const dragItemIndex = layersCopy.findIndex(l => l.id === dragItem.current);
    const dragOverItemIndex = layersCopy.findIndex(l => l.id === dragOverItem.current);

    const [removed] = layersCopy.splice(dragItemIndex, 1);
    layersCopy.splice(dragOverItemIndex, 0, removed);

    updateSettings({ layers: layersCopy });

    dragItem.current = null;
    dragOverItem.current = null;
  };

  const handleCanvasSizePreset = (preset: {width: number, height: number}) => {
    updateSettings({ width: preset.width, height: preset.height });
  };

  const handleSheetChange = (newSheetProps: Partial<SheetSettings>) => {
    updateSettings({ sheet: { ...settings.sheet, ...newSheetProps } });
  };

  const resetSheetSettings = () => {
    updateSettings({ sheet: initialSheetSettings });
  };

  return (
    <div className="p-1 space-y-4">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
      />
      <Accordion type="multiple" defaultValue={['canvas-settings', 'image-layers']}>
        <AccordionItem value="canvas-settings">
           <AccordionTrigger>
              <h3 className="text-base font-medium flex items-center gap-2"><Layers size={18} /> Canvas Settings</h3>
           </AccordionTrigger>
           <AccordionContent className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-1.5">
                      <Label htmlFor="canvas-width">Width (px)</Label>
                      <Input id="canvas-width" type="number" value={settings.width} onChange={e => updateSettings({ width: parseInt(e.target.value) || 0 })}/>
                  </div>
                  <div className="grid gap-1.5">
                      <Label htmlFor="canvas-height">Height (px)</Label>
                      <Input id="canvas-height" type="number" value={settings.height} onChange={e => updateSettings({ height: parseInt(e.target.value) || 0 })}/>
                  </div>
              </div>
              <div className="grid gap-1.5">
                  <Label>Size Presets</Label>
                  <Select onValueChange={(value) => {
                      const preset = canvasSizes.find(s => s.name === value);
                      if (preset) handleCanvasSizePreset(preset);
                  }}>
                      <SelectTrigger><SelectValue placeholder="Choose a preset..."/></SelectTrigger>
                      <SelectContent>
                          {canvasSizes.map(size => <SelectItem key={size.name} value={size.name}>{size.name}</SelectItem>)}
                      </SelectContent>
                  </Select>
              </div>
              <div className="grid gap-1.5">
                  <Label htmlFor="canvas-bg">Background Color</Label>
                  <div className="relative">
                      <Input id="canvas-bg" value={settings.backgroundColor} onChange={e => updateSettings({ backgroundColor: e.target.value })}/>
                      <Input type="color" className="absolute top-1/2 right-1 h-8 w-8 -translate-y-1/2 p-1 cursor-pointer bg-transparent border-none" value={settings.backgroundColor} onChange={e => updateSettings({ backgroundColor: e.target.value })}/>
                  </div>
              </div>
           </AccordionContent>
        </AccordionItem>

        <AccordionItem value="sheet-generator">
          <AccordionTrigger>
              <h3 className="text-base font-medium flex items-center gap-2"><Notebook size={18} /> Sheet Generator</h3>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-4">
            <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5">
                <Label htmlFor="sheet-enabled">Enable Sheet Overlay</Label>
                </div>
                <Switch
                id="sheet-enabled"
                checked={settings.sheet.enabled}
                onCheckedChange={(checked) => handleSheetChange({ enabled: checked })}
                />
            </div>

            {settings.sheet.enabled && (
                <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                    <Label htmlFor="h-lines" className="flex items-center gap-2"><Rows size={16}/> Horizontal Lines</Label>
                    </div>
                    <Switch
                    id="h-lines"
                    checked={settings.sheet.horizontalLines}
                    onCheckedChange={(checked) => handleSheetChange({ horizontalLines: checked })}
                    />
                </div>
                <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                    <Label htmlFor="v-lines" className="flex items-center gap-2"><Columns size={16}/>Vertical Lines</Label>
                    </div>
                    <Switch
                    id="v-lines"
                    checked={settings.sheet.verticalLines}
                    onCheckedChange={(checked) => handleSheetChange({ verticalLines: checked })}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-1.5">
                        <Label htmlFor="sheet-spacing">Spacing (px)</Label>
                        <Input id="sheet-spacing" type="number" value={settings.sheet.spacing} onChange={e => handleSheetChange({ spacing: parseInt(e.target.value) || 0 })}/>
                    </div>
                    <div className="grid gap-1.5">
                        <Label htmlFor="sheet-color">Line Color</Label>
                        <div className="relative">
                            <Input id="sheet-color" value={settings.sheet.lineColor} onChange={e => handleSheetChange({ lineColor: e.target.value })}/>
                            <Input type="color" className="absolute top-1/2 right-1 h-8 w-8 -translate-y-1/2 p-1 cursor-pointer bg-transparent border-none" value={settings.sheet.lineColor} onChange={e => handleSheetChange({ lineColor: e.target.value })}/>
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-1.5">
                        <Label htmlFor="sheet-margin-top">Top Margin (px)</Label>
                        <Input id="sheet-margin-top" type="number" value={settings.sheet.marginTop} onChange={e => handleSheetChange({ marginTop: parseInt(e.target.value) || 0 })}/>
                    </div>
                    <div className="grid gap-1.5">
                        <Label htmlFor="sheet-margin-left">Left Margin (px)</Label>
                        <Input id="sheet-margin-left" type="number" value={settings.sheet.marginLeft} onChange={e => handleSheetChange({ marginLeft: parseInt(e.target.value) || 0 })}/>
                    </div>
                </div>
                 <Button variant="outline" size="sm" onClick={resetSheetSettings}>
                    <RefreshCw size={14} className="mr-2"/>
                    Reset Sheet Settings
                </Button>
                </div>
            )}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="image-layers">
            <AccordionTrigger>
              <h3 className="text-base font-medium flex items-center gap-2"><ImageUp size={18} /> Image Layers</h3>
            </AccordionTrigger>
            <AccordionContent className="pt-4">
                <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} className="w-full mb-4">
                    <Plus size={16} className="mr-2"/> Add Image
                </Button>

                {settings.layers.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4 text-center">No images added. Click "Add Image" to start.</p>
                ) : (
                    <Accordion 
                        type="single" 
                        collapsible 
                        className="w-full"
                        value={selectedLayerId || ""}
                        onValueChange={(value) => setSelectedLayerId(value || null)}
                    >
                        {settings.layers.map((layer, index) => (
                            <div 
                                key={layer.id}
                                className="flex items-start gap-1"
                                draggable
                                onDragStart={() => dragItem.current = layer.id}
                                onDragEnter={() => dragOverItem.current = layer.id}
                                onDragEnd={handleDragSort}
                                onDragOver={(e) => e.preventDefault()}
                            >
                                <div className="py-4 cursor-grab text-muted-foreground"><GripVertical size={18} /></div>
                                <AccordionItem value={layer.id} className="flex-1 border-b">
                                    <AccordionTrigger>Layer {settings.layers.length - index}</AccordionTrigger>
                                    <AccordionContent className="space-y-4">
                                        <div className="flex items-center gap-2">
                                            <img src={layer.src} alt={`Layer ${index+1}`} className="w-16 h-auto bg-white p-1 rounded border"/>
                                            <p className="text-xs text-muted-foreground">Drag on canvas to reposition. Use handles to resize and rotate.</p>
                                        </div>
                                        <div className="grid gap-1.5">
                                            <Label htmlFor={`layer-width-${layer.id}`}>Size (%)</Label>
                                            <Slider id={`layer-width-${layer.id}`} value={[layer.width]} onValueChange={([val]) => handleLayerUpdate(layer.id, { width: val })} min={1} max={200} step={1} />
                                        </div>
                                        <div className="grid gap-1.5">
                                            <Label htmlFor={`layer-opacity-${layer.id}`}>Opacity</Label>
                                            <Slider id={`layer-opacity-${layer.id}`} value={[layer.opacity]} onValueChange={([val]) => handleLayerUpdate(layer.id, { opacity: val })} min={0} max={1} step={0.05} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Rotation</Label>
                                            <div className="flex items-center gap-2">
                                                <div className="relative flex-1">
                                                    <Input type="number" value={Math.round(layer.rotation)} onChange={(e) => handleLayerUpdate(layer.id, { rotation: parseInt(e.target.value) || 0})} min={0} max={360} className="w-full pr-6 text-right" />
                                                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">°</span>
                                                </div>
                                                <Button variant="outline" size="icon" onClick={() => handleQuickRotate(layer.id, layer.rotation, -90)}><RotateCcw size={16}/></Button>
                                                <Button variant="outline" size="icon" onClick={() => handleQuickRotate(layer.id, layer.rotation, 90)}><RotateCw size={16}/></Button>
                                            </div>
                                        </div>
                                        <Button variant="destructive" size="sm" onClick={() => removeLayer(layer.id)} className="w-full"><Trash2 size={16} className="mr-2"/> Remove Image</Button>
                                    </AccordionContent>
                                </AccordionItem>
                            </div>
                        ))}
                    </Accordion>
                )}
            </AccordionContent>
        </AccordionItem>
      </Accordion>

    </div>
  );
}
