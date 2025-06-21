"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { ImageSettings, OriginalImage } from '@/lib/types';
import { formatBytes } from '@/lib/utils';
import { Info } from 'lucide-react';

interface ImageInfoPanelProps {
  originalImage: OriginalImage;
  settings: ImageSettings;
  processedSize: number | null;
}

export function ImageInfoPanel({ originalImage, settings, processedSize }: ImageInfoPanelProps) {
  return (
    <div className="p-1 pt-0">
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                    <Info size={18} />
                    Image Properties
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
                <div>
                    <h4 className="font-semibold text-muted-foreground">Original</h4>
                    <div className="flex justify-between mt-1">
                        <span>Dimensions:</span>
                        <span>{originalImage.width} x {originalImage.height} px</span>
                    </div>
                    <div className="flex justify-between">
                        <span>File Size:</span>
                        <span>{formatBytes(originalImage.size)}</span>
                    </div>
                </div>
                <Separator />
                <div>
                    <h4 className="font-semibold text-muted-foreground">Processed</h4>
                    <div className="flex justify-between mt-1">
                        <span>Dimensions:</span>
                        <span>{Math.round(settings.width)} x {Math.round(settings.height)} px</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Est. File Size:</span>
                        <span className="font-semibold text-primary">
                            {processedSize !== null ? formatBytes(processedSize) : 'N/A'}
                        </span>
                    </div>
                </div>
            </CardContent>
        </Card>
    </div>
  );
}
