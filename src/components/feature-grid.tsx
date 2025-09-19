
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileType, Scan, Crop, Palette, Type } from 'lucide-react';

const features = [
  {
    icon: <Scan size={28} className="text-primary" />,
    title: 'Resize & Scale',
    description: 'Adjust dimensions in pixels, CM, or inches with aspect ratio lock.',
  },
  {
    icon: <Crop size={28} className="text-primary" />,
    title: 'Crop & Rotate',
    description: 'Frame your image perfectly and correct its orientation.',
  },
  {
    icon: <Palette size={28} className="text-primary" />,
    title: 'Adjust Colors',
    description: 'Fine-tune brightness, contrast, saturation, and apply filters.',
  },
  {
    icon: <Type size={28} className="text-primary" />,
    title: 'Add Text',
    description: 'Overlay text with various fonts, colors, and backgrounds.',
  },
  {
    icon: <FileType size={28} className="text-primary" />,
    title: 'Convert Format',
    description: 'Change image format to PNG, JPEG, WEBP, and more.',
  },
];

export function FeatureGrid() {
  return (
    <section className="container mx-auto py-16 px-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {features.map((feature, index) => (
          <Card key={index} className="text-center group hover:bg-primary/5 transition-all flex flex-col">
            <CardHeader className="flex-col items-center gap-3 pt-6 pb-3">
                <div className="p-3 bg-primary/10 rounded-full group-hover:scale-110 transition-transform">
                    {feature.icon}
                </div>
                <CardTitle className="text-base font-semibold">{feature.title}</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-5">
              <p className="text-xs text-muted-foreground">{feature.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
