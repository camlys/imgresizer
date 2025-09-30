
"use client";

import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Paintbrush, Eraser, Trash2, Undo2, Redo2 } from 'lucide-react';
import type { ImageSettings, DrawingPath } from '@/lib/types';
import React from 'react';
import { Input } from '../ui/input';

interface DrawTabProps {
  settings: ImageSettings;
  updateSettings: (newSettings: Partial<ImageSettings>) => void;
}

export function DrawTab({ settings, updateSettings }: DrawTabProps) {
  const { drawing } = settings;

  const handleDrawingChange = (newDrawingProps: Partial<typeof drawing>) => {
    updateSettings({ drawing: { ...drawing, ...newDrawingProps } });
  };
  
  const pushToHistory = (newPaths: DrawingPath[]) => {
    const newHistory = drawing.history.slice(0, drawing.historyIndex + 1);
    newHistory.push(newPaths);
    handleDrawingChange({ 
      paths: newPaths,
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
  };

  const clearDrawing = () => {
    pushToHistory([]);
  };

  const handleUndo = () => {
    if (drawing.historyIndex > 0) {
      const newIndex = drawing.historyIndex - 1;
      updateSettings({ 
        drawing: { 
          ...drawing, 
          historyIndex: newIndex,
          paths: drawing.history[newIndex],
        } 
      });
    }
  };

  const handleRedo = () => {
    if (drawing.historyIndex < drawing.history.length - 1) {
      const newIndex = drawing.historyIndex + 1;
      updateSettings({
        drawing: {
          ...drawing,
          historyIndex: newIndex,
          paths: drawing.history[newIndex],
        }
      });
    }
  };


  return (
    <div className="space-y-4 p-1">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base font-medium flex items-center gap-2"><Paintbrush size={18}/> Drawing Tools</CardTitle>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleUndo} disabled={drawing.historyIndex <= 0}>
                <Undo2 size={16} />
            </Button>
             <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleRedo} disabled={drawing.historyIndex >= drawing.history.length - 1}>
                <Redo2 size={16} />
            </Button>
            <Button variant="destructive" size="sm" onClick={clearDrawing} disabled={drawing.paths.length === 0}>
              <Trash2 size={16} className="mr-2"/> Clear
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <Button 
              variant={drawing.isErasing ? 'outline' : 'secondary'}
              onClick={() => handleDrawingChange({ isErasing: false })}
            >
              <Paintbrush size={16} className="mr-2"/> Brush
            </Button>
            <Button
              variant={drawing.isErasing ? 'secondary' : 'outline'}
              onClick={() => handleDrawingChange({ isErasing: true })}
            >
              <Eraser size={16} className="mr-2"/> Eraser
            </Button>
          </div>
          
          <div className="grid gap-1.5">
            <Label htmlFor="brush-color">Brush Color</Label>
            <div className="relative">
                <Input
                  id="brush-color"
                  value={drawing.brushColor}
                  onChange={(e) => handleDrawingChange({ brushColor: e.target.value })}
                  disabled={drawing.isErasing}
                  className="pr-10"
                />
                <Input
                  type="color"
                  className="absolute top-1/2 right-1 h-8 w-8 -translate-y-1/2 p-1 cursor-pointer bg-transparent border-none disabled:opacity-50 disabled:cursor-not-allowed"
                  value={drawing.brushColor}
                  onChange={(e) => handleDrawingChange({ brushColor: e.target.value })}
                  disabled={drawing.isErasing}
                />
            </div>
          </div>

          <div className="grid gap-1.5">
            <div className="flex justify-between items-center">
              <Label htmlFor="brush-size">Brush Size</Label>
              <span className="text-sm text-muted-foreground">{drawing.brushSize}px</span>
            </div>
            <Slider
              id="brush-size"
              value={[drawing.brushSize]}
              onValueChange={([val]) => handleDrawingChange({ brushSize: val })}
              min={1}
              max={100}
              step={1}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
