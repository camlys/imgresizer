
import React, { useState, useEffect, useRef } from 'react';
import { Textarea } from '@/components/ui/textarea';
import type { TextOverlay } from '@/lib/types';
import { Button } from './ui/button';
import { Check, X } from 'lucide-react';

interface TextEditorProps {
    text: TextOverlay;
    canvas: HTMLCanvasElement;
    onSave: (newContent: string) => void;
    onCancel: () => void;
}

export function TextEditor({ text, canvas, onSave, onCancel }: TextEditorProps) {
    const [value, setValue] = useState(text.text);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Calculate position and style for the textarea
    const canvasRect = canvas.getBoundingClientRect();
    const canvasStyle = window.getComputedStyle(canvas);
    const canvasPadding = parseFloat(canvasStyle.paddingLeft);
    const editorTop = canvasRect.top + canvasPadding;
    const editorLeft = canvasRect.left + canvasPadding;

    const editorStyle: React.CSSProperties = {
        position: 'absolute',
        top: `${editorTop}px`,
        left: `${editorLeft}px`,
        width: `${canvasRect.width - canvasPadding * 2}px`,
        height: `${canvasRect.height - canvasPadding * 2}px`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    };

    const textareaStyle: React.CSSProperties = {
        position: 'absolute',
        fontFamily: text.font,
        fontSize: `${text.size * (canvas.getBoundingClientRect().width / canvas.width)}px`,
        color: text.color,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        border: '2px dashed hsl(var(--primary))',
        outline: 'none',
        padding: `${text.padding * (canvas.getBoundingClientRect().width / canvas.width)}px`,
        transform: `rotate(${text.rotation}deg)`,
        textAlign: 'center',
        resize: 'none',
        lineHeight: 1.2,
        whiteSpace: 'pre-wrap',
        overflowWrap: 'break-word',
        minWidth: '50px',
        minHeight: '30px',
    };

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.focus();
            textareaRef.current.select();
        }
    }, []);

    const handleSave = () => {
        onSave(value);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSave();
        }
        if (e.key === 'Escape') {
            onCancel();
        }
    };

    return (
        <div style={editorStyle}>
            <Textarea
                ref={textareaRef}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={handleKeyDown}
                style={textareaStyle}
                onBlur={handleSave}
            />
            <div
                style={{
                    position: 'absolute',
                    top: `calc(${text.y}% - 20px)`,
                    left: `calc(${text.x}% + 100px)`,
                    transform: `translate(-50%, -100%) rotate(${text.rotation}deg)`,
                    display: 'flex',
                    gap: '8px',
                    zIndex: 10,
                }}
            >
                 <Button size="icon" onClick={handleSave} className="h-8 w-8"><Check size={16} /></Button>
                 <Button size="icon" variant="destructive" onClick={onCancel} className="h-8 w-8"><X size={16} /></Button>
            </div>
        </div>
    );
}
