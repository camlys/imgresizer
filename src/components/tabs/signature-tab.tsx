
"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Pencil, Plus, Trash2, RotateCcw, RotateCw } from 'lucide-react';
import type { ImageSettings, SignatureOverlay } from '@/lib/types';
import React, { useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Slider } from '../ui/slider';

interface SignatureTabProps {
  settings: ImageSettings;
  updateSettings: (newSettings: Partial<ImageSettings>) => void;
  selectedSignatureId: string | null;
  setSelectedSignatureId: (id: string | null) => void;
}

export function SignatureTab({ settings, updateSettings, selectedSignatureId, setSelectedSignatureId }: SignatureTabProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

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
        };
        img.src = imgSrc;
      };
      reader.readAsDataURL(file);
    }
    // Reset file input
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
  
  const handleQuickRotate = (id: string, currentRotation: number, angle: number) => {
    const newRotation = (currentRotation + angle + 360) % 360;
    updateSignature(id, { rotation: newRotation });
  };

  return (
    <div className="space-y-4 p-1">
       <input
        type="file"
        ref={fileInputRef}
        onChange={handleSignatureUpload}
        className="hidden"
        accept="image/*"
      />
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Pencil size={18} /> Add Signature
          </CardTitle>
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
              value={selectedSignatureId || ""}
              onValueChange={(value) => setSelectedSignatureId(value || null)}
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
                            <Button variant="outline" size="icon" onClick={() => handleQuickRotate(sig.id, sig.rotation, -90)}><RotateCcw size={16}/></Button>
                            <Button variant="outline" size="icon" onClick={() => handleQuickRotate(sig.id, sig.rotation, 90)}><RotateCw size={16}/></Button>
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
    </div>
  );
}
