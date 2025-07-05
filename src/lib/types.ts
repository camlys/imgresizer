export type Unit = 'px' | 'cm' | 'mm' | 'inch';

export type TextOverlay = {
  id: string;
  text: string;
  font: string;
  size: number;
  color: string;
  backgroundColor: string;
  padding: number;
  x: number;
  y: number;
};

export type CropSettings = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type OriginalImage = {
    src: string;
    width: number;
    height: number;
    size: number;
}

export type ImageSettings = {
  width: number;
  height: number;
  unit: Unit;
  keepAspectRatio: boolean;
  rotation: number;
  flipHorizontal: boolean;
  flipVertical: boolean;
  crop: CropSettings | null;
  texts: TextOverlay[];
  adjustments: {
    brightness: number;
    contrast: number;
    saturate: number;
    grayscale: number;
    sepia: number;
    invert: number;
  };
  format: 'image/png' | 'image/jpeg' | 'image/webp' | 'image/gif' | 'image/bmp' | 'image/svg+xml' | 'application/pdf';
  quality: number;
};
