
"use client";

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Layers, Plus, Trash2, RotateCcw, RotateCw, ImageUp, GripVertical, Ruler, Rows, Columns, Copy, Book, FilePlus, BookOpen, Palmtree, LayoutGrid } from 'lucide-react';
import type { CollageSettings, ImageLayer, SheetSettings, CollagePage } from '@/lib/types';
import React, { useRef } from 'react';
import { Slider } from '../ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '../ui/tooltip';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

interface CollageTabProps {
  settings: CollageSettings;
  updateSettings: (newSettings: Partial<CollageSettings>) => void;
  onAddImage: (file: File) => void;
  selectedLayerIds: string[];
  setSelectedLayerIds: (ids: string[]) => void;
  isFromMultiPagePdf: boolean;
  onViewPages: () => void;
  onAutoLayout: (count: 2 | 3 | 4 | 5 | 6) => void;
}

const canvasSizes = [
    { name: 'A4 Portrait (300 DPI)', width: 2481, height: 3507 },
    { name: 'A4 Landscape (300 DPI)', width: 3507, height: 2481 },
    { name: 'A5 Portrait (300 DPI)', width: 1748, height: 2481 },
    { name: 'A5 Landscape (300 DPI)', width: 2481, height: 1748 },
    { name: 'US Letter Portrait (300 DPI)', width: 2550, height: 3300 },
    { name: 'US Letter Landscape (300 DPI)', width: 3300, height: 2550 },
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

export function CollageTab({ settings, updateSettings, onAddImage, selectedLayerIds, setSelectedLayerIds, isFromMultiPagePdf, onViewPages, onAutoLayout }: CollageTabProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragItem = useRef<string | null>(null);
  const dragOverItem = useRef<string | null>(null);
  const dragPageItem = useRef<string | null>(null);
  const dragOverPageItem = useRef<string | null>(null);

  const activePage = settings.pages[settings.activePageIndex];
  if (!activePage) return null; // Should not happen
  
  const lastSelectedId = selectedLayerIds.length > 0 ? selectedLayerIds[selectedLayerIds.length - 1] : null;
  const lastSelectedLayer = lastSelectedId ? activePage.layers.find(l => l.id === lastSelectedId) : null;

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
    const newLayers = activePage.layers.map(l => l.id === id ? { ...l, ...newProps } : l);
    const newPages = [...settings.pages];
    newPages[settings.activePageIndex] = { ...activePage, layers: newLayers };
    updateSettings({ pages: newPages });
  };
  
  const removeLayer = (id: string) => {
    const newLayers = activePage.layers.filter(l => l.id !== id);
    const newPages = [...settings.pages];
    newPages[settings.activePageIndex] = { ...activePage, layers: newLayers };
    updateSettings({ pages: newPages });
    setSelectedLayerIds(selectedLayerIds.filter(layerId => layerId !== id));
  };
  
  const handleQuickRotate = (id: string, currentRotation: number, angle: number) => {
    const newRotation = (currentRotation + angle + 360) % 360;
    handleLayerUpdate(id, { rotation: newRotation });
  };

  const handleDragSort = () => {
    if (!dragItem.current || !dragOverItem.current || dragItem.current === dragOverItem.current) return;

    const layersCopy = [...activePage.layers];
    const dragItemIndex = layersCopy.findIndex(l => l.id === dragItem.current);
    const dragOverItemIndex = layersCopy.findIndex(l => l.id === dragOverItem.current);

    const [removed] = layersCopy.splice(dragItemIndex, 1);
    layersCopy.splice(dragOverItemIndex, 0, removed);
    
    const newPages = [...settings.pages];
    newPages[settings.activePageIndex] = { ...activePage, layers: layersCopy };
    updateSettings({ pages: newPages });

    dragItem.current = null;
    dragOverItem.current = null;
  };
  
  const handlePageDragSort = () => {
    if (!dragPageItem.current || !dragOverPageItem.current || dragPageItem.current === dragOverPageItem.current) return;

    const pagesCopy = [...settings.pages];
    const dragItemIndex = pagesCopy.findIndex(p => p.id === dragPageItem.current);
    const dragOverItemIndex = pagesCopy.findIndex(p => p.id === dragOverPageItem.current);

    const [removed] = pagesCopy.splice(dragItemIndex, 1);
    pagesCopy.splice(dragOverItemIndex, 0, removed);

    const newActiveIndex = pagesCopy.findIndex(p => p.id === activePage.id);
    updateSettings({ pages: pagesCopy, activePageIndex: newActiveIndex });

    dragPageItem.current = null;
    dragOverPageItem.current = null;
  };

  const handleCanvasSizePreset = (preset: {width: number, height: number}) => {
    updateSettings({ width: preset.width, height: preset.height });
  };

  const handleSheetChange = (newSheetProps: Partial<SheetSettings>) => {
    const currentSheetSettings = { ...activePage.sheet, ...newSheetProps };
    if (settings.syncSheetSettings) {
        const newPages = settings.pages.map(page => ({ ...page, sheet: currentSheetSettings }));
        updateSettings({ pages: newPages });
    } else {
        const newPages = [...settings.pages];
        newPages[settings.activePageIndex] = { ...activePage, sheet: currentSheetSettings };
        updateSettings({ pages: newPages });
    }
  };

  const resetSheetSettings = () => {
    handleSheetChange(initialSheetSettings);
  };
  
  const addPage = () => {
    const newPage: CollagePage = {
      id: Date.now().toString(),
      layers: [],
      sheet: settings.syncSheetSettings ? activePage.sheet : initialSheetSettings
    };
    const newPages = [...settings.pages, newPage];
    updateSettings({ pages: newPages, activePageIndex: newPages.length - 1 });
  };

  const duplicatePage = (pageId: string) => {
    const pageToDuplicate = settings.pages.find(p => p.id === pageId);
    if (!pageToDuplicate) return;

    const newPage: CollagePage = {
      ...pageToDuplicate,
      id: Date.now().toString(),
      layers: pageToDuplicate.layers.map(l => ({ ...l, id: Date.now().toString() + l.id })),
    };
    const newPages = [...settings.pages, newPage];
    updateSettings({ pages: newPages, activePageIndex: newPages.length - 1 });
  };
  
  const deletePage = (pageId: string) => {
    if (settings.pages.length <= 1) return;
    const newPages = settings.pages.filter(p => p.id !== pageId);
    const newActiveIndex = Math.max(0, settings.activePageIndex - 1);
    updateSettings({ pages: newPages, activePageIndex: newActiveIndex });
  };

  const setActivePage = (pageId: string) => {
    const newIndex = settings.pages.findIndex(p => p.id === pageId);
    if (newIndex !== -1) {
      updateSettings({ activePageIndex: newIndex });
    }
  };
  
  const applySizeToSelected = () => {
    if (!lastSelectedLayer || selectedLayerIds.length <= 1) return;

    const targetWidth = lastSelectedLayer.width;

    const newLayers = activePage.layers.map(layer => {
      if (selectedLayerIds.includes(layer.id) && layer.id !== lastSelectedLayer.id) {
        return { ...layer, width: targetWidth };
      }
      return layer;
    });

    const newPages = [...settings.pages];
    newPages[settings.activePageIndex] = { ...activePage, layers: newLayers };
    updateSettings({ pages: newPages });
  };

  const applyPresetSizeToSelected = (widthPercent: number) => {
    if (selectedLayerIds.length === 0) return;

    const newLayers = activePage.layers.map(layer => {
      if (selectedLayerIds.includes(layer.id)) {
        return { ...layer, width: widthPercent };
      }
      return layer;
    });
    
    const newPages = [...settings.pages];
    newPages[settings.activePageIndex] = { ...activePage, layers: newLayers };
    updateSettings({ pages: newPages });
  };

  return (
    <div className="p-1 space-y-4">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*,application/pdf"
      />
      
      <Tabs defaultValue="layers" className="w-full">
        <div className="w-full overflow-x-auto whitespace-nowrap">
            <TabsList className="h-auto p-1 inline-flex">
                <TabsTrigger value="canvas" className="h-auto py-2 flex-col gap-1">
                  <Palmtree size={18} />
                  <span className="text-xs">Canvas</span>
                </TabsTrigger>
                <TabsTrigger value="layout" className="h-auto py-2 flex-col gap-1">
                  <LayoutGrid size={18} />
                  <span className="text-xs">Layout</span>
                </TabsTrigger>
                <TabsTrigger value="pages" className="h-auto py-2 flex-col gap-1">
                  <Book size={18} />
                  <span className="text-xs">Pages</span>
                </TabsTrigger>
                <TabsTrigger value="layers" className="h-auto py-2 flex-col gap-1">
                  <ImageUp size={18} />
                  <span className="text-xs">Layers</span>
                </TabsTrigger>
            </TabsList>
        </div>
        
        <TabsContent value="canvas" className="mt-4 space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">Canvas Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="layout" className="mt-4 space-y-4">
           <Card>
            <CardHeader className="pb-2 flex-row items-center justify-between">
              <CardTitle className="text-base font-medium">Auto-Layout</CardTitle>
               <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-primary">
                          <Ruler size={16} />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Show/Hide Smart Guides</p>
                    </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">Arrange the first N images into a grid. This will reset their position and rotation.</p>
              <div className="grid grid-cols-5 gap-2">
                  {[2, 3, 4, 5, 6].map(num => (
                      <Button
                          key={num}
                          variant={settings.layout === num ? 'default' : 'outline'}
                          onClick={() => onAutoLayout(num as 2 | 3 | 4 | 5 | 6)}
                          disabled={activePage.layers.length < num}
                      >
                          {num}
                      </Button>
                  ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium flex items-center justify-between">
                  <span>Sheet Overlay</span>
                   <Button variant="ghost" size="sm" onClick={resetSheetSettings}>Reset</Button>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                  <Label htmlFor="sheet-enabled">Enable Sheet</Label>
                  <p className="text-xs text-muted-foreground">For current page</p>
                  </div>
                  <Switch
                  id="sheet-enabled"
                  checked={activePage.sheet.enabled}
                  onCheckedChange={(checked) => handleSheetChange({ enabled: checked })}
                  />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                  <Label htmlFor="sheet-apply-all">Sync Across All Pages</Label>
                  <p className="text-xs text-muted-foreground">Apply changes to all pages</p>
                  </div>
                    <Switch
                      id="sheet-apply-all"
                      checked={settings.syncSheetSettings}
                      onCheckedChange={(checked) => updateSettings({ syncSheetSettings: checked })}
                  />
              </div>
              {activePage.sheet.enabled && (
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between">
                      <Label htmlFor="h-lines" className="flex items-center gap-2"><Rows size={16}/> Horizontal Lines</Label>
                      <Switch
                      id="h-lines"
                      checked={activePage.sheet.horizontalLines}
                      onCheckedChange={(checked) => handleSheetChange({ horizontalLines: checked })}
                      />
                  </div>
                  <div className="flex items-center justify-between">
                      <Label htmlFor="v-lines" className="flex items-center gap-2"><Columns size={16}/>Vertical Lines</Label>
                      <Switch
                      id="v-lines"
                      checked={activePage.sheet.verticalLines}
                      onCheckedChange={(checked) => handleSheetChange({ verticalLines: checked })}
                      />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-1.5">
                          <Label htmlFor="sheet-spacing">Spacing (px)</Label>
                          <Input id="sheet-spacing" type="number" value={activePage.sheet.spacing} onChange={e => handleSheetChange({ spacing: parseInt(e.target.value) || 0 })}/>
                      </div>
                      <div className="grid gap-1.5">
                          <Label htmlFor="sheet-color">Line Color</Label>
                          <div className="relative">
                              <Input id="sheet-color" value={activePage.sheet.lineColor} onChange={e => handleSheetChange({ lineColor: e.target.value })}/>
                              <Input type="color" className="absolute top-1/2 right-1 h-8 w-8 -translate-y-1/2 p-1 cursor-pointer bg-transparent border-none" value={activePage.sheet.lineColor} onChange={e => handleSheetChange({ lineColor: e.target.value })}/>
                          </div>
                      </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-1.5">
                          <Label htmlFor="sheet-margin-top">Top Margin (px)</Label>
                          <Input id="sheet-margin-top" type="number" value={activePage.sheet.marginTop} onChange={e => handleSheetChange({ marginTop: parseInt(e.target.value) || 0 })}/>
                      </div>
                      <div className="grid gap-1.5">
                          <Label htmlFor="sheet-margin-left">Left Margin (px)</Label>
                          <Input id="sheet-margin-left" type="number" value={activePage.sheet.marginLeft} onChange={e => handleSheetChange({ marginLeft: parseInt(e.target.value) || 0 })}/>
                      </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="pages" className="mt-4 space-y-4">
          <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">Page Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                <Button onClick={addPage} variant="outline" size="sm" className="w-full">
                  <FilePlus size={16} className="mr-2"/> Add New Page
                </Button>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {settings.pages.map((page, index) => (
                    <div 
                      key={page.id}
                      className={`flex items-center gap-2 p-2 rounded-md border transition-colors ${page.id === activePage.id ? 'bg-accent/50 border-primary' : 'hover:bg-muted'}`}
                      draggable
                      onDragStart={() => dragPageItem.current = page.id}
                      onDragEnter={() => dragOverPageItem.current = page.id}
                      onDragEnd={handlePageDragSort}
                      onDragOver={(e) => e.preventDefault()}
                    >
                      <div className="cursor-grab text-muted-foreground"><GripVertical size={18} /></div>
                      <div className="flex-1 cursor-pointer" onClick={() => setActivePage(page.id)}>
                        <p className="text-sm font-medium">Page {index + 1}</p>
                        <p className="text-xs text-muted-foreground">{page.layers.length} layers</p>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => duplicatePage(page.id)}>
                        <Copy size={14} />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deletePage(page.id)} disabled={settings.pages.length <= 1}>
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  ))}
                </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="layers" className="mt-4 space-y-4">
          <Card>
            <CardHeader className="pb-2 flex-row items-center justify-between">
                <CardTitle className="text-base font-medium">Image Layers</CardTitle>
                <div className='flex items-center'>
                    {isFromMultiPagePdf && (
                        <div className="ml-auto pr-2" onClick={(e) => e.stopPropagation()}>
                        <TooltipProvider>
                            <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" onClick={onViewPages} className="h-8 w-8 text-primary">
                                <BookOpen size={16} />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Add more pages from the PDF</p>
                            </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                        </div>
                    )}
                    <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} className="h-8">
                        <Plus size={16} className="mr-2"/> Add
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="layers-list">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="layers-list"><ImageUp size={16} className="mr-2"/>Layers</TabsTrigger>
                        <TabsTrigger value="size"><Ruler size={16} className="mr-2"/>Size</TabsTrigger>
                    </TabsList>
                    <TabsContent value="layers-list" className="mt-4">
                        {activePage.layers.length === 0 ? (
                            <p className="text-sm text-muted-foreground py-4 text-center">No images on this page. Click "Add" to start.</p>
                        ) : (
                            <Accordion 
                                type="multiple" 
                                className="w-full" 
                                value={selectedLayerIds}
                                onValueChange={setSelectedLayerIds}
                            >
                                {activePage.layers.map((layer, index) => (
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
                                            <AccordionTrigger>Layer {activePage.layers.length - index}</AccordionTrigger>
                                            <AccordionContent className="space-y-4">
                                                <div className="flex items-center gap-2">
                                                    <img src={layer.src} alt={`Layer ${index+1}`} className="w-16 h-auto bg-white p-1 rounded border"/>
                                                    <p className="text-xs text-muted-foreground">Drag on canvas to reposition. Use handles to resize and rotate.</p>
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
                                                    <Slider 
                                                        value={[layer.rotation]} 
                                                        onValueChange={([val]) => handleLayerUpdate(layer.id, { rotation: val })}
                                                        min={0} 
                                                        max={360} 
                                                        step={1}
                                                    />
                                                </div>
                                                <Button variant="destructive" size="sm" onClick={() => removeLayer(layer.id)} className="w-full"><Trash2 size={16} className="mr-2"/> Remove Image</Button>
                                            </AccordionContent>
                                        </AccordionItem>
                                    </div>
                                ))}
                            </Accordion>
                        )}
                    </TabsContent>
                    <TabsContent value="size" className="mt-4 space-y-4">
                        {selectedLayerIds.length > 0 && lastSelectedLayer ? (
                            <div className="space-y-4">
                               <div className="grid gap-2">
                                  <Label>Size Presets</Label>
                                    <div className="overflow-x-auto pb-2">
                                        <div className="flex gap-2 whitespace-nowrap">
                                            {[25, 33, 50, 66, 75, 100].map(p => (
                                                <Button key={p} variant="outline" onClick={() => applyPresetSizeToSelected(p)} className="shrink-0">
                                                    {p}%
                                                </Button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="grid gap-1.5">
                                        <Label htmlFor="layer-width">Width (px)</Label>
                                        <Input
                                            id="layer-width"
                                            type="number"
                                            value={Math.round(lastSelectedLayer.width / 100 * settings.width)}
                                            onChange={(e) => {
                                                const newPxWidth = parseInt(e.target.value) || 0;
                                                const newWidthPercent = (newPxWidth / settings.width) * 100;
                                                handleLayerUpdate(lastSelectedLayer.id, { width: newWidthPercent });
                                            }}
                                        />
                                    </div>
                                    <div className="grid gap-1.5">
                                        <Label htmlFor="layer-height">Height (px)</Label>
                                        <Input
                                            id="layer-height"
                                            type="number"
                                            value={Math.round((lastSelectedLayer.width / 100 * settings.width) / (lastSelectedLayer.originalWidth / lastSelectedLayer.originalHeight))}
                                            onChange={(e) => {
                                                const newPxHeight = parseInt(e.target.value) || 0;
                                                const newPxWidth = newPxHeight * (lastSelectedLayer.originalWidth / lastSelectedLayer.originalHeight);
                                                const newWidthPercent = (newPxWidth / settings.width) * 100;
                                                handleLayerUpdate(lastSelectedLayer.id, { width: newWidthPercent });
                                            }}
                                        />
                                    </div>
                                </div>
                                {selectedLayerIds.length > 1 && (
                                    <Button onClick={applySizeToSelected} className="w-full">
                                        Apply Size to All ({selectedLayerIds.length})
                                    </Button>
                                )}
                                <p className="text-xs text-muted-foreground">Editing size for the last selected layer. Use the button above to sync sizes.</p>
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground py-4 text-center">Select one or more layers to edit their size.</p>
                        )}
                    </TabsContent>
                </Tabs>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

    