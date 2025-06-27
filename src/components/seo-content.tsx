import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';

export function SeoContent() {
  return (
    <div className="container mx-auto py-12 px-6 space-y-16">
      <section>
        <Card className="border-none shadow-none">
          <CardHeader>
            <CardTitle className="text-3xl lg:text-4xl font-bold font-headline text-center">Your Ultimate Free Online Image Editor</CardTitle>
          </CardHeader>
          <CardContent className="text-base md:text-lg text-muted-foreground text-center max-w-3xl mx-auto">
            <p>
              Welcome to Camly, the all-in-one solution for your image editing needs. Whether you're a professional photographer, a social media enthusiast, or just someone looking to enhance your photos, our powerful and intuitive online editor provides all the tools you need to make your images stand out. No downloads, no subscriptions—just pure, seamless editing right in your browser.
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
        <div>
          <h2 className="text-2xl font-semibold text-foreground mb-4">Effortless Resizing and Cropping</h2>
          <p className="text-muted-foreground mb-4">
            Easily resize your images to any dimension in pixels, centimeters, or inches. Our aspect ratio lock ensures your photos maintain their proportions without distortion. Use our intuitive crop tool to frame your subject perfectly for any platform, from Instagram posts to website banners.
          </p>
        </div>
        <div>
           <Image
              src="https://placehold.co/600x400.png"
              alt="Resizing tool interface showing width and height adjustments"
              width={600}
              height={400}
              className="rounded-lg shadow-lg"
              data-ai-hint="user interface design"
            />
        </div>
      </section>
      
      <section className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
         <div className="order-last md:order-first">
           <Image
              src="https://placehold.co/600x400.png"
              alt="Image editor showing color adjustment sliders for brightness and contrast"
              width={600}
              height={400}
              className="rounded-lg shadow-lg"
              data-ai-hint="photo editing software"
            />
        </div>
        <div className="md:order-last">
          <h2 className="text-2xl font-semibold text-foreground mb-4">Advanced Color Adjustments & Filters</h2>
          <p className="text-muted-foreground mb-4">
            Take full control of your image's look and feel. Adjust brightness, contrast, and saturation to make your colors pop. Apply artistic filters like vintage, grayscale, or technicolor with a single click to instantly transform your photo's mood. Our live preview lets you see the results in real-time.
          </p>
        </div>
      </section>

      <section className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
        <div>
          <h2 className="text-2xl font-semibold text-foreground mb-4">Add Text and Overlays with Ease</h2>
          <p className="text-muted-foreground mb-4">
            Personalize your images by adding text overlays. Choose from a variety of fonts, sizes, and colors to create stunning graphics. Add backgrounds to your text for better readability and style. Perfect for creating memes, quotes, or promotional materials.
          </p>
        </div>
        <div>
           <Image
              src="https://placehold.co/600x400.png"
              alt="A user adding text to an image using the Camly text tool"
              width={600}
              height={400}
              className="rounded-lg shadow-lg"
              data-ai-hint="graphic design typography"
            />
        </div>
      </section>

    </div>
  );
}
