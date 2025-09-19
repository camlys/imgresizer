
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileType, Scan, Crop, Palette, Type } from 'lucide-react';

const features = [
  {
    icon: <Scan size={32} className="text-primary" />,
    title: 'Resize & Scale',
    description: 'Adjust dimensions in pixels, CM, or inches with aspect ratio lock.',
  },
  {
    icon: <Crop size={32} className="text-primary" />,
    title: 'Crop & Rotate',
    description: 'Frame your image perfectly and correct its orientation.',
  },
  {
    icon: <Palette size={32} className="text-primary" />,
    title: 'Adjust Colors',
    description: 'Fine-tune brightness, contrast, saturation, and apply filters.',
  },
  {
    icon: <Type size={32} className="text-primary" />,
    title: 'Add Text',
    description: 'Overlay text with various fonts, colors, and backgrounds.',
  },
  {
    icon: <FileType size={32} className="text-primary" />,
    title: 'Convert Format',
    description: 'Change image format to PNG, JPEG, WEBP, and more.',
  },
];

export function FeatureGrid() {
  return (
    <section className="container mx-auto py-16 px-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {features.map((feature, index) => (
          <Card key={index} className="text-center group hover:bg-primary/5 transition-all">
            <CardHeader className="flex-col items-center gap-4">
                <div className="p-4 bg-primary/10 rounded-full group-hover:scale-110 transition-transform">
                    {feature.icon}
                </div>
                <CardTitle className="text-lg font-semibold">{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
