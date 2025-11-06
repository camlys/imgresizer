// src/lib/compression-cache.ts

interface CompressionResult {
  jpeg: { dataUrl: string; size: number };
  pdf: { dataUrl: string; size: number };
  originalSize: number;
  quality: 'less' | 'medium' | 'extreme';
}

let cachedResult: CompressionResult | null = null;

export const compressionCache = {
  set: (result: CompressionResult): void => {
    cachedResult = result;
  },
  get: (): CompressionResult | null => {
    const result = cachedResult;
    // Clear the cache after reading to free up memory
    cachedResult = null; 
    return result;
  },
};
