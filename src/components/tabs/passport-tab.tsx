
"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Contact, Eraser } from 'lucide-react';
import React, { useState, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

interface PassportTabProps {
  onGenerate: (image: File, count: number, backgroundColor: string) => void;
  onClear: () => void;
}

export function PassportTab({ onGenerate, onClear }: PassportTabProps) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [copyCount, setCopyCount] = useState<number>(8);
  const [backgroundColor, setBackgroundColor] = useState<string>('#ffffff');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
    } else {
      toast({
        title: "Invalid File Type",
        description: "Please select an image file.",
        variant: "destructive",
      });
    }
    if (event.target) {
        event.target.value = '';
    }
  };

  const handleGenerateClick = () => {
    if (!imageFile) {
      toast({
        title: "No Image Selected",
        description: "Please upload an image first.",
        variant: "destructive",
      });
      return;
    }
    if (copyCount <= 0) {
      toast({
        title: "Invalid Copy Count",
        description: "Please enter a number greater than zero.",
        variant: "destructive",
      });
      return;
    }
    onGenerate(imageFile, copyCount, backgroundColor);
  };
  
  const handleClear = () => {
    setImageFile(null);
    onClear();
  }

  return (
    <div className="p-1 space-y-4">
       <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
      />
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Contact size={18} /> Passport Photo Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            variant="outline"
            className="w-full h-24 border-dashed"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="flex flex-col items-center gap-2">
              <Upload size={24} />
              {imageFile ? (
                <span className="text-sm text-primary truncate max-w-[200px]">{imageFile.name}</span>
              ) : (
                <span className="text-sm">Click to Upload Image</span>
              )}
            </div>
          </Button>
          <div className="grid gap-1.5">
            <Label htmlFor="copy-count">Number of Copies</Label>
            <Input
              id="copy-count"
              type="number"
              value={copyCount}
              onChange={(e) => setCopyCount(parseInt(e.target.value) || 1)}
              min="1"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="bg-color">Background Color</Label>
             <div className="relative">
                <Input
                  id="bg-color"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  placeholder="#ffffff"
                  className="pr-10"
                />
                <Input
                  type="color"
                  className="absolute top-1/2 right-1 h-8 w-8 -translate-y-1/2 p-1 cursor-pointer bg-transparent border-none"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                />
              </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button onClick={handleGenerateClick} disabled={!imageFile}>
              Generate
            </Button>
            <Button variant="destructive-outline" onClick={handleClear}>
              <Eraser size={16} className="mr-2"/>
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
