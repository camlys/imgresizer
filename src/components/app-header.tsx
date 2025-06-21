"use client"

import React from 'react';
import { Button } from '@/components/ui/button';
import { Upload, Download, Image as ImageIcon } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import type { ImageSettings } from '@/lib/types';

interface AppHeaderProps {
  onUpload: (file: File) => void;
  onDownload: () => void;
  isImageLoaded: boolean;
  settings: ImageSettings;
  updateSettings: (settings: Partial<ImageSettings>) => void;
}

export function AppHeader({ onUpload, onDownload, isImageLoaded, settings, updateSettings }: AppHeaderProps) {
  const uploadInputRef = React.useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    uploadInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onUpload(file);
    }
  };

  return (
    <header className="flex items-center justify-between p-4 border-b bg-card">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10 text-primary">
          <ImageIcon className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-foreground font-headline tracking-tight">ImageForge</h1>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="file"
          ref={uploadInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/*"
        />
        <Button variant="outline" onClick={handleUploadClick}>
          <Upload className="mr-2" />
          Upload New
        </Button>
        {isImageLoaded && (
          <Popover>
            <PopoverTrigger asChild>
              <Button>
                <Download className="mr-2" />
                Download
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64" align="end">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium leading-none">Export</h4>
                  <p className="text-sm text-muted-foreground">
                    Choose your desired format and quality.
                  </p>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="format">Format</Label>
                  <Select
                    value={settings.format}
                    onValueChange={(value) => updateSettings({ format: value as ImageSettings['format'] })}
                  >
                    <SelectTrigger id="format">
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="image/png">PNG</SelectItem>
                      <SelectItem value="image/jpeg">JPEG</SelectItem>
                      <SelectItem value="image/webp">WEBP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {settings.format === 'image/jpeg' && (
                  <div className="grid gap-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="quality">Quality</Label>
                      <span className="text-sm text-muted-foreground">{Math.round(settings.quality * 100)}%</span>
                    </div>
                    <Slider
                      id="quality"
                      min={0}
                      max={1}
                      step={0.01}
                      value={[settings.quality]}
                      onValueChange={(value) => updateSettings({ quality: value[0] })}
                    />
                  </div>
                )}
                <Button onClick={onDownload} className="w-full">Export Image</Button>
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>
    </header>
  );
}
