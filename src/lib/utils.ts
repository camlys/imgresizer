import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { CornerPoints } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatBytes(bytes: number, decimals = 2) {
  if (!+bytes) return '0 Bytes'
  
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}


// --- Perspective Transform Logic ---

function getPerspectiveTransform(src: CornerPoints, dst: CornerPoints) {
    const a = [];
    const b = [];

    for (let i = 0; i < 4; i++) {
        const src_i = src[Object.keys(src)[i] as keyof CornerPoints];
        const dst_i = dst[Object.keys(dst)[i] as keyof CornerPoints];
        a.push([src_i.x, src_i.y, 1, 0, 0, 0, -src_i.x * dst_i.x, -src_i.y * dst_i.x]);
        b.push(dst_i.x);
        a.push([0, 0, 0, src_i.x, src_i.y, 1, -src_i.x * dst_i.y, -src_i.y * dst_i.y]);
        b.push(dst_i.y);
    }

    // Solve for h using Gaussian elimination
    const h = gaussianElimination(a, b);
    
    return [
        h[0], h[1], h[2],
        h[3], h[4], h[5],
        h[6], h[7], 1
    ];
}


function gaussianElimination(a: number[][], b: number[]): number[] {
    const n = a.length;
    for (let i = 0; i < n; i++) {
        let max_row = i;
        for (let k = i + 1; k < n; k++) {
            if (Math.abs(a[k][i]) > Math.abs(a[max_row][i])) {
                max_row = k;
            }
        }

        [a[i], a[max_row]] = [a[max_row], a[i]];
        [b[i], b[max_row]] = [b[max_row], b[i]];

        for (let k = i + 1; k < n; k++) {
            const factor = a[k][i] / a[i][i];
            b[k] -= factor * b[i];
            for (let j = i; j < n; j++) {
                a[k][j] -= factor * a[i][j];
            }
        }
    }

    const x = new Array(n).fill(0);
    for (let i = n - 1; i >= 0; i--) {
        let sum = 0;
        for (let j = i + 1; j < n; j++) {
            sum += a[i][j] * x[j];
        }
        x[i] = (b[i] - sum) / a[i][i];
    }
    return x;
}

export async function applyPerspectiveTransform(
    imageElement: HTMLImageElement,
    corners: CornerPoints
): Promise<HTMLCanvasElement> {
    const { tl, tr, bl, br } = corners;

    const widthA = Math.sqrt(Math.pow(br.x - bl.x, 2) + Math.pow(br.y - bl.y, 2));
    const widthB = Math.sqrt(Math.pow(tr.x - tl.x, 2) + Math.pow(tr.y - tl.y, 2));
    const destWidth = Math.max(widthA, widthB);

    const heightA = Math.sqrt(Math.pow(tr.x - br.x, 2) + Math.pow(tr.y - br.y, 2));
    const heightB = Math.sqrt(Math.pow(tl.x - bl.x, 2) + Math.pow(tl.y - bl.y, 2));
    const destHeight = Math.max(heightA, heightB);

    const destCanvas = document.createElement('canvas');
    destCanvas.width = Math.round(destWidth);
    destCanvas.height = Math.round(destHeight);
    const destCtx = destCanvas.getContext('2d');
    if (!destCtx) throw new Error("Could not get canvas context for perspective transform");

    const srcCanvas = document.createElement('canvas');
    srcCanvas.width = imageElement.naturalWidth;
    srcCanvas.height = imageElement.naturalHeight;
    const srcCtx = srcCanvas.getContext('2d', { willReadFrequently: true });
    if (!srcCtx) throw new Error("Could not get source canvas context");
    srcCtx.drawImage(imageElement, 0, 0);
    const srcData = srcCtx.getImageData(0, 0, srcCanvas.width, srcCanvas.height).data;

    const destPoints = {
        tl: { x: 0, y: 0 },
        tr: { x: destWidth, y: 0 },
        bl: { x: 0, y: destHeight },
        br: { x: destWidth, y: destHeight }
    };
    
    // We need the inverse transform (destination to source)
    const transform = getPerspectiveTransform(destPoints, corners);
    
    const destImageData = destCtx.createImageData(destCanvas.width, destCanvas.height);
    const destData = destImageData.data;

    for (let y = 0; y < destCanvas.height; y++) {
        for (let x = 0; x < destCanvas.width; x++) {
            const px = transform[0] * x + transform[1] * y + transform[2];
            const py = transform[3] * x + transform[4] * y + transform[5];
            const pz = transform[6] * x + transform[7] * y + 1;

            const srcX = px / pz;
            const srcY = py / pz;
            
            if (srcX >= 0 && srcX < srcCanvas.width && srcY >= 0 && srcY < srcCanvas.height) {
                // Bilinear interpolation for smoother results
                const x0 = Math.floor(srcX);
                const x1 = x0 + 1;
                const y0 = Math.floor(srcY);
                const y1 = y0 + 1;

                const dx = srcX - x0;
                const dy = srcY - y0;

                const idx = (y * destCanvas.width + x) * 4;

                for (let c = 0; c < 4; c++) { // For R, G, B, A
                    const p00 = srcData[(y0 * srcCanvas.width + x0) * 4 + c] || 0;
                    const p10 = srcData[(y0 * srcCanvas.width + x1) * 4 + c] || 0;
                    const p01 = srcData[(y1 * srcCanvas.width + x0) * 4 + c] || 0;
                    const p11 = srcData[(y1 * srcCanvas.width + x1) * 4 + c] || 0;

                    const val = p00 * (1 - dx) * (1 - dy) + p10 * dx * (1 - dy) + p01 * (1 - dx) * dy + p11 * dx * dy;
                    destData[idx + c] = val;
                }
            }
        }
    }

    destCtx.putImageData(destImageData, 0, 0);
    return destCanvas;
}
