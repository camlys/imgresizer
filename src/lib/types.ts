
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
  rotation: number;
};

export type SignatureOverlay = {
  id: string;
  src: string;
  img: HTMLImageElement; // Keep the image element for rendering
  x: number; // percentage
  y: number; // percentage
  width: number; // percentage of canvas width
  rotation: number;
  opacity: number;
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

export type CornerPoints = {
  tl: { x: number; y: number };
  tr: { x: number; y: number };
  bl: { x: number; y: number };
  br: { x: number; y: number };
};

export type SheetSettings = {
  enabled: boolean;
  horizontalLines: boolean;
  verticalLines: boolean;
  lineColor: string;
  spacing: number;
  marginTop: number;
  marginLeft: number;
};

export type ImageSettings = {
  width: number;
  height: number;
  unit: Unit;
  dpi: number;
  keepAspectRatio: boolean;
  rotation: number;
  flipHorizontal: boolean;
  flipVertical: boolean;
  crop: CropSettings | null;
  texts: TextOverlay[];
  signatures: SignatureOverlay[];
  adjustments: {
    brightness: number;
    contrast: number;
    saturate: number;
    grayscale: number;
    sepia: number;
    invert: number;
  };
  backgroundColor: string;
  format: 'image/png' | 'image/jpeg' | 'image/webp' | 'image/gif' | 'image/bmp' | 'image/svg+xml' | 'application/pdf';
  quality: number;
  cropMode: 'rect' | 'perspective';
  perspectivePoints: CornerPoints | null;
};

export type ImageLayer = {
  id: string;
  src: string;
  img: HTMLImageElement;
  x: number; // percentage
  y: number; // percentage
  width: number; // percentage of canvas width
  rotation: number;
  opacity: number;
  originalWidth: number;
  originalHeight: number;
};

export type CollagePage = {
  id: string;
  layers: ImageLayer[];
  sheet: SheetSettings;
};

export type CollageSettings = {
  width: number;
  height: number;
axxxcha
  backgroundColor: string;
  pages: CollagePage[];
  activePageIndex: number;
  format: 'image/png' | 'image/jpeg' | 'image/webp' | 'image/svg+xml' | 'application/pdf';
  quality: number;
  layout: 2 | 3 | 4 | 5 | 6 | null;
  syncSheetSettings: boolean;
};
