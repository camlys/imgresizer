
"use client";

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Type, Plus, Trash2, Ban, RotateCcw, RotateCw, Pencil } from 'lucide-react';
import type { ImageSettings, TextOverlay, SignatureOverlay } from '@/lib/types';
import React, { useRef } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { Slider } from '../ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

interface TextTabProps {
  settings: ImageSettings;
  updateSettings: (newSettings: Partial<ImageSettings>) => void;
  selectedTextId: string | null;
  setSelectedTextId: (id: string | null) => void;
  selectedSignatureId: string | null;
  setSelectedSignatureId: (id: string | null) => void;
}

const fonts = [
  'Arial',
  'Comic Sans MS',
  'Courier New',
  'Georgia',
  'Impact',
  '"Space Grotesk"',
  'Times New Roman',
  'Verdana',
];

export function TextTab({ 
  settings, 
  updateSettings, 
  selectedTextId, 
  setSelectedTextId,
  selectedSignatureId,
  setSelectedSignatureId,
}: TextTabProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const addText = () => {
    const newText: TextOverlay = {
      id: Date.now().toString(),
      text: 'Hello World',
      font: '"Space Grotesk"',
      size: 50,
      color: '#000000',
      backgroundColor: '#ffffff',
      padding: 10,
      x: 50,
      y: 50,
      rotation: 0,
    };
    const newTexts = [...settings.texts, newText];
    updateSettings({ texts: newTexts });
    setSelectedTextId(newText.id);
    setSelectedSignatureId(null);
  };
  
  const removeText = (id: string) => {
    updateSettings({ texts: settings.texts.filter(t => t.id !== id) });
    if (selectedTextId === id) {
        setSelectedTextId(null);
    }
  };

  const updateText = (id: string, newProps: Partial<TextOverlay>) => {
    updateSettings({
      texts: settings.texts.map(t => (t.id === id ? { ...t, ...newProps } : t)),
    });
  };

  const handleQuickRotateText = (id: string, currentRotation: number, angle: number) => {
    const newRotation = (currentRotation + angle + 360) % 360;
    updateText(id, { rotation: newRotation });
  };
  
  const handleRotationInputChange = (id: string, value: string) => {
    let numericValue = parseInt(value, 10);
    if (isNaN(numericValue)) {
        numericValue = 0;
    }
    const clampedValue = Math.max(0, Math.min(numericValue, 360));
    updateText(id, { rotation: clampedValue });
  };

  const toggleBackgroundTransparency = (text: TextOverlay) => {
    const newColor = text.backgroundColor === 'transparent' ? '#ffffff' : 'transparent';
    updateText(text.id, { backgroundColor: newColor });
  };

  // --- Signature Methods ---

  const handleSignatureUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({ title: 'Invalid File', description: 'Please upload an image file for the signature.', variant: 'destructive' });
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const imgSrc = e.target?.result as string;
        const img = new Image();
        img.onload = () => {
          const newSignature: SignatureOverlay = {
            id: Date.now().toString(),
            src: imgSrc,
            img: img,
            x: 50,
            y: 50,
            width: 25, // Default width as 25% of canvas
            rotation: 0,
            opacity: 1,
          };
          const newSignatures = [...settings.signatures, newSignature];
          updateSettings({ signatures: newSignatures });
          setSelectedSignatureId(newSignature.id);
          setSelectedTextId(null);
        };
        img.src = imgSrc;
      };
      reader.readAsDataURL(file);
    }
    if (event.target) {
        event.target.value = '';
    }
  };

  const removeSignature = (id: string) => {
    const newSignatures = settings.signatures.filter(s => s.id !== id);
    updateSettings({ signatures: newSignatures });
    if (selectedSignatureId === id) {
      setSelectedSignatureId(null);
    }
  };

  const updateSignature = (id: string, newProps: Partial<SignatureOverlay>) => {
    const newSignatures = settings.signatures.map(s => (s.id === id ? { ...s, ...newProps } : s));
    updateSettings({ signatures: newSignatures });
  };
  
  const handleQuickRotateSignature = (id: string, currentRotation: number, angle: number) => {
    const newRotation = (currentRotation + angle + 360) % 360;
    updateSignature(id, { rotation: newRotation });
  };

  return (
    <div className="p-1">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleSignatureUpload}
        className="hidden"
        accept="image/*,image/heic,image/heif"
      />
      
      <Tabs defaultValue="text" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="text">
            <Type size={16} className="mr-2" /> Text
          </TabsTrigger>
          <TabsTrigger value="signature">
            <Pencil size={16} className="mr-2" /> Signature
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="text" className="mt-0">
          <Card className="border-t-0 rounded-t-none">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-medium flex items-center gap-2">Text Overlays</CardTitle>
              <Button variant="outline" size="sm" onClick={addText}><Plus size={16} className="mr-2"/> Add</Button>
            </CardHeader>
            <CardContent>
              {settings.texts.length === 0 ? (
                 <p className="text-sm text-muted-foreground py-4 text-center">No text layers added.</p>
              ) : (
                <Accordion 
                    type="single" 
                    collapsible 
                    className="w-full" 
                    value={selectedTextId ?? ""}
                    onValueChange={(value) => {
                      setSelectedTextId(value || null);
                      if (value) setSelectedSignatureId(null);
                    }}
                >
                  {settings.texts.map((text, index) => (
                    <AccordionItem value={text.id} key={text.id}>
                      <AccordionTrigger>Text Layer {index + 1}</AccordionTrigger>
                      <AccordionContent className="space-y-4">
                        <div className="grid gap-1.5">
                          <Label htmlFor={`text-content-${text.id}`}>Content</Label>
                          <Input id={`text-content-${text.id}`} value={text.text} onChange={e => updateText(text.id, { text: e.target.value })}/>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                           <div className="grid gap-1.5">
                            <Label htmlFor={`text-font-${text.id}`}>Font</Label>
                            <Select value={text.font} onValueChange={font => updateText(text.id, { font })}>
                              <SelectTrigger><SelectValue/></SelectTrigger>
                              <SelectContent>
                                {fonts.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          </div>
                           <div className="grid gap-1.5">
                            <Label htmlFor={`text-size-${text.id}`}>Size</Label>
                            <Input id={`text-size-${text.id}`} type="number" value={Math.round(text.size)} onChange={e => updateText(text.id, { size: parseInt(e.target.value, 10) || 0 })}/>
                          </div>
                        </div>
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                           <div className="grid gap-1.5">
                            <Label htmlFor={`text-color-${text.id}`}>Color</Label>
                            <div className="relative">
                              <Input id={`text-color-${text.id}`} type="text" value={text.color} onChange={e => updateText(text.id, { color: e.target.value })} className="pr-10"/>
                              <Input type="color" className="absolute top-1/2 right-1 h-8 w-8 -translate-y-1/2 p-1 cursor-pointer bg-transparent border-none" value={text.color.startsWith('#') ? text.color : '#000000'} onChange={e => updateText(text.id, { color: e.target.value })}/>
                            </div>
                          </div>
                          <div className="grid gap-1.5">
                            <div className="flex justify-between items-center">
                              <Label htmlFor={`text-bgcolor-${text.id}`}>Background</Label>
                               <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toggleBackgroundTransparency(text)}>
                                      <Ban size={16}/>
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Toggle transparent background</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                            <div className="relative">
                              <Input
                                id={`text-bgcolor-${text.id}`}
                                value={text.backgroundColor}
                                onChange={(e) => updateText(text.id, { backgroundColor: e.target.value })}
                                placeholder="e.g. #FFF, transparent"
                                className="pr-10"
                              />
                              <Input
                                type="color"
                                className="absolute top-1/2 right-1 h-8 w-8 -translate-y-1/2 p-1 cursor-pointer bg-transparent border-none disabled:opacity-50 disabled:cursor-not-allowed"
                                value={text.backgroundColor.startsWith('#') ? text.backgroundColor : '#ffffff'}
                                onChange={(e) => updateText(text.id, { backgroundColor: e.target.value })}
                                disabled={text.backgroundColor === 'transparent'}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="grid gap-1.5">
                            <Label htmlFor={`text-padding-${text.id}`}>Padding</Label>
                            <Input
                                id={`text-padding-${text.id}`}
                                type="number"
                                min="0"
                                value={text.padding}
                                onChange={(e) => updateText(text.id, { padding: Math.max(0, parseInt(e.target.value, 10) || 0) })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Rotation</Label>
                            <div className="flex items-center gap-2">
                                <div className="relative flex-1">
                                    <Input
                                    type="number"
                                    value={Math.round(text.rotation)}
                                    onChange={e => handleRotationInputChange(text.id, e.target.value)}
                                    min={0}
                                    max={360}
                                    className="w-full pr-6 text-right"
                                    />
                                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">°</span>
                                </div>
                                <Button variant="outline" size="icon" onClick={() => handleQuickRotateText(text.id, text.rotation, -90)}><RotateCcw size={16}/></Button>
                                <Button variant="outline" size="icon" onClick={() => handleQuickRotateText(text.id, text.rotation, 90)}><RotateCw size={16}/></Button>
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground">Drag on canvas to reposition, or double-click to edit content.</p>
                        <Button variant="destructive" size="sm" onClick={() => removeText(text.id)} className="w-full"><Trash2 size={16} className="mr-2"/> Remove</Button>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="signature" className="mt-0">
          <Card className="border-t-0 rounded-t-none">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-medium flex items-center gap-2">Signature Overlays</CardTitle>
              <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                <Plus size={16} className="mr-2" /> Upload
              </Button>
            </CardHeader>
            <CardContent>
              {settings.signatures.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">No signatures added.</p>
              ) : (
                 <Accordion
                  type="single"
                  collapsible
                  className="w-full"
                  value={selectedSignatureId ?? ""}
                  onValueChange={(value) => {
                    setSelectedSignatureId(value || null);
                    if (value) setSelectedTextId(null);
                  }}
                >
                  {settings.signatures.map((sig, index) => (
                    <AccordionItem value={sig.id} key={sig.id}>
                      <AccordionTrigger>Signature {index + 1}</AccordionTrigger>
                      <AccordionContent className="space-y-4">
                        <div className="flex items-center gap-2">
                            <img src={sig.src} alt={`Signature ${index + 1}`} className="w-16 h-auto bg-white p-1 rounded border"/>
                            <p className="text-xs text-muted-foreground">Drag on canvas to reposition. Use handles to resize and rotate.</p>
                        </div>

                        <div className="grid gap-1.5">
                          <Label htmlFor={`sig-width-${sig.id}`}>Size</Label>
                          <Slider
                            id={`sig-width-${sig.id}`}
                            value={[sig.width]}
                            onValueChange={([val]) => updateSignature(sig.id, { width: val })}
                            min={1} max={100} step={1}
                          />
                        </div>
                         <div className="grid gap-1.5">
                          <Label htmlFor={`sig-opacity-${sig.id}`}>Opacity</Label>
                          <Slider
                            id={`sig-opacity-${sig.id}`}
                            value={[sig.opacity]}
                            onValueChange={([val]) => updateSignature(sig.id, { opacity: val })}
                            min={0} max={1} step={0.05}
                          />
                        </div>
                        <div className="space-y-2">
                            <Label>Rotation</Label>
                            <div className="flex items-center gap-2">
                                <div className="relative flex-1">
                                    <Input
                                    type="number"
                                    value={Math.round(sig.rotation)}
                                    onChange={e => updateSignature(sig.id, { rotation: parseInt(e.target.value, 10) || 0 })}
                                    min={0}
                                    max={360}
                                    className="w-full pr-6 text-right"
                                    />
                                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">°</span>
                                </div>
                                <Button variant="outline" size="icon" onClick={() => handleQuickRotateSignature(sig.id, sig.rotation, -90)}><RotateCcw size={16}/></Button>
                                <Button variant="outline" size="icon" onClick={() => handleQuickRotateSignature(sig.id, sig.rotation, 90)}><RotateCw size={16}/></Button>
                            </div>
                        </div>
                        <Button variant="destructive" size="sm" onClick={() => removeSignature(sig.id)} className="w-full">
                            <Trash2 size={16} className="mr-2"/> Remove Signature
                        </Button>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

    

    