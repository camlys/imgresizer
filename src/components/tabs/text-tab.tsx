
"use client";

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Type, Plus, Trash2 } from 'lucide-react';
import type { ImageSettings, TextOverlay } from '@/lib/types';
import React from 'react';

interface TextTabProps {
  settings: ImageSettings;
  updateSettings: (newSettings: Partial<ImageSettings>) => void;
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

export function TextTab({ settings, updateSettings }: TextTabProps) {
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
    updateSettings({ texts: [...settings.texts, newText] });
  };
  
  const removeText = (id: string) => {
    updateSettings({ texts: settings.texts.filter(t => t.id !== id) });
  };

  const updateText = (id: string, newProps: Partial<TextOverlay>) => {
    updateSettings({
      texts: settings.texts.map(t => (t.id === id ? { ...t, ...newProps } : t)),
    });
  };

  return (
    <div className="space-y-4 p-1">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base font-medium flex items-center gap-2"><Type size={18}/> Add Text</CardTitle>
          <Button variant="outline" size="sm" onClick={addText}><Plus size={16} className="mr-2"/> Add</Button>
        </CardHeader>
        <CardContent>
          {settings.texts.length === 0 ? (
             <p className="text-sm text-muted-foreground py-4 text-center">No text layers added.</p>
          ) : (
            <Accordion type="single" collapsible className="w-full" defaultValue={settings.texts[settings.texts.length - 1]?.id}>
              {settings.texts.map((text, index) => (
                <AccordionItem value={text.id} key={text.id}>
                  <AccordionTrigger>Text Layer {index + 1}</AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    <div className="grid gap-1.5">
                      <Label htmlFor={`text-content-${text.id}`}>Content</Label>
                      <Input id={`text-content-${text.id}`} value={text.text} onChange={e => updateText(text.id, { text: e.target.value })}/>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
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
                        <Input id={`text-size-${text.id}`} type="number" value={text.size} onChange={e => updateText(text.id, { size: parseInt(e.target.value, 10) || 0 })}/>
                      </div>
                    </div>
                     <div className="grid grid-cols-2 gap-4">
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
                          <Button variant="link" size="sm" className="p-0 h-auto" onClick={() => updateText(text.id, { backgroundColor: 'transparent' })}>Transparent</Button>
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
                     <div className="grid gap-1.5">
                        <Label htmlFor={`text-rotation-${text.id}`}>Rotation</Label>
                        <div className="relative">
                            <Input
                            id={`text-rotation-${text.id}`}
                            type="number"
                            value={Math.round(text.rotation)}
                            onChange={(e) => {
                                const numericValue = parseInt(e.target.value, 10) || 0;
                                const clampedValue = Math.max(0, Math.min(numericValue, 360));
                                updateText(text.id, { rotation: clampedValue });
                            }}
                            min={0}
                            max={360}
                            className="pr-6 text-right"
                            />
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">°</span>
                        </div>
                    </div>
                    <div>
                      <Label>Position (X: {Math.round(text.x)}%, Y: {Math.round(text.y)}%)</Label>
                      <p className="text-xs text-muted-foreground">Drag text on canvas to reposition.</p>
                    </div>
                    <Button variant="destructive" size="sm" onClick={() => removeText(text.id)} className="w-full"><Trash2 size={16} className="mr-2"/> Remove</Button>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
