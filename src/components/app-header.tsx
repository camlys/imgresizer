"use client"

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, Download, Image as ImageIcon, Settings, Loader2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import type { ImageSettings } from '@/lib/types';
import { formatBytes } from '@/lib/utils';


interface AppHeaderProps {
  onUpload: (file: File) => void;
  onDownload: () => void;
  isImageLoaded: boolean;
  settings: ImageSettings;
  updateSettings: (newSettings: Partial<ImageSettings>) => void;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  processedSize: number | null;
  onUpdateProcessedSize: () => void;
}

export function AppHeader({ 
  onUpload, 
  onDownload, 
  isImageLoaded,
  settings,
  updateSettings,
  canvasRef,
  processedSize,
  onUpdateProcessedSize,
}: AppHeaderProps) {
  const uploadInputRef = React.useRef<HTMLInputElement>(null);
  const [targetSize, setTargetSize] = useState('');
  const [targetUnit, setTargetUnit] = useState<'KB' | 'MB'>('KB');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  useEffect(() => {
    if (isPopoverOpen && isImageLoaded) {
      onUpdateProcessedSize();
    }
  }, [isPopoverOpen, isImageLoaded, onUpdateProcessedSize, settings]);


  const handleUploadClick = () => {
    uploadInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onUpload(file);
    }
  };

  const getBlobFromCanvas = (quality: number): Promise<Blob | null> => {
      return new Promise((resolve) => {
          if (!canvasRef.current) {
              resolve(null);
              return;
          }
          canvasRef.current.toBlob((blob) => resolve(blob), settings.format, quality);
      });
  };

  const handleTargetSize = async () => {
    const numericSize = parseFloat(targetSize);
    if (!numericSize || numericSize <= 0 || !canvasRef.current) return;

    setIsOptimizing(true);
    const targetBytes = targetUnit === 'KB' ? numericSize * 1024 : numericSize * 1024 * 1024;
    
    let high = 1, low = 0, mid = 0.5, bestQuality = 0.5;
    
    for(let i = 0; i < 10; i++) {
      mid = (low + high) / 2;
      const blob = await getBlobFromCanvas(mid);
      if (!blob) break;
      
      if(blob.size > targetBytes) {
        high = mid;
      } else {
        low = mid;
      }
      bestQuality = mid;
    }
    
    updateSettings({ quality: parseFloat(bestQuality.toFixed(2)) });
    
    setTimeout(onUpdateProcessedSize, 100);
    setIsOptimizing(false);
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
          <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
            <PopoverTrigger asChild>
              <Button variant="default">
                <Download className="mr-2" />
                Download
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium leading-none flex items-center gap-2"><Settings size={18}/> Export Settings</h4>
                  <p className="text-sm text-muted-foreground">
                    Adjust format and quality before downloading.
                  </p>
                </div>
                <Separator />
                <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="format">Format</Label>
                      <Select
                        value={settings.format}
                        onValueChange={(value) => {
                          const newSettings: Partial<ImageSettings> = { format: value as ImageSettings['format'] };
                          if (value === 'image/png') {
                            newSettings.quality = 0.92;
                          }
                          updateSettings(newSettings);
                          setTimeout(onUpdateProcessedSize, 100);
                        }}
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
                    {(settings.format === 'image/jpeg' || settings.format === 'image/webp') && (
                      <>
                        <div className="grid gap-2">
                          <div className="flex justify-between items-center">
                            <Label htmlFor="quality">Quality</Label>
                            <span className="text-sm text-muted-foreground">{Math.round(settings.quality * 100)}%</span>
                          </div>
                          <Slider
                            id="quality"
                            min={0} max={1} step={0.01}
                            value={[settings.quality]}
                            onValueChange={(value) => updateSettings({ quality: value[0] })}
                            onValueChangeCommit={() => onUpdateProcessedSize()}
                          />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground">Target File Size (Optional)</Label>
                            <div className="flex items-center gap-2">
                            <Input 
                                type="number"
                                placeholder="e.g. 500"
                                value={targetSize}
                                onChange={(e) => setTargetSize(e.target.value)}
                                disabled={isOptimizing}
                            />
                            <Select value={targetUnit} onValueChange={(val: 'KB' | 'MB') => setTargetUnit(val)} disabled={isOptimizing}>
                                <SelectTrigger className="w-[80px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="KB">KB</SelectItem>
                                    <SelectItem value="MB">MB</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button size="icon" variant="outline" onClick={handleTargetSize} disabled={isOptimizing || !targetSize}>
                                {isOptimizing ? <Loader2 className="animate-spin"/> : 'Set'}
                            </Button>
                            </div>
                        </div>
                      </>
                    )}
                    <div className="text-sm text-muted-foreground">
                        Est. size: <span className="font-medium text-foreground">{processedSize !== null ? formatBytes(processedSize) : 'Calculating...'}</span>
                    </div>
                    <Button onClick={onDownload} className="w-full">
                        <Download className="mr-2"/>
                        Download Image
                    </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>
    </header>
  );
}
