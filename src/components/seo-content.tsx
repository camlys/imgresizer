import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { CheckCircle, Zap, ShieldCheck, LockKeyhole } from 'lucide-react';

export function SeoContent() {
  return (
    <div className="container mx-auto py-16 px-6 space-y-20 bg-background">
      {/* Hero Section */}
      <section className="text-center">
        <Card className="border-none shadow-none bg-transparent">
          <CardHeader>
            <CardTitle className="text-3xl lg:text-4xl font-bold font-headline">Your Ultimate Free Online Image Editor</CardTitle>
          </CardHeader>
          <CardContent className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto">
            <p>
              Welcome to Camly, the all-in-one solution for your image editing needs. Whether you're a professional photographer, a social media enthusiast, or just someone looking to enhance your photos, our powerful and intuitive online editor provides all the tools you need to make your images stand out. No downloads, no subscriptions—just pure, seamless editing right in your browser.
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Features Grid */}
      <section>
          <h2 className="text-3xl font-bold text-center font-headline mb-12">Why Camly is Your Best Choice</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
              <div className="flex flex-col items-center">
                  <ShieldCheck className="w-12 h-12 text-primary mb-4"/>
                  <h3 className="text-xl font-semibold mb-2">Privacy First</h3>
                  <p className="text-muted-foreground">All editing is done in your browser. Your images are never uploaded to our servers, ensuring 100% privacy.</p>
              </div>
              <div className="flex flex-col items-center">
                  <Zap className="w-12 h-12 text-primary mb-4"/>
                  <h3 className="text-xl font-semibold mb-2">Blazing Fast</h3>
                  <p className="text-muted-foreground">Experience a smooth, responsive editor that works instantly without any lag or waiting time.</p>
              </div>
              <div className="flex flex-col items-center">
                  <LockKeyhole className="w-12 h-12 text-primary mb-4"/>
                  <h3 className="text-xl font-semibold mb-2">No Registration Required</h3>
                  <p className="text-muted-foreground">Jump right into editing. No sign-ups, no accounts, no hassle. Just upload and start creating.</p>
              </div>
              <div className="flex flex-col items-center">
                  <CheckCircle className="w-12 h-12 text-primary mb-4"/>
                  <h3 className="text-xl font-semibold mb-2">Completely Free</h3>
                  <p className="text-muted-foreground">Access all our powerful editing tools for free. No hidden costs or premium feature walls.</p>
              </div>
          </div>
      </section>
      
      {/* Detailed Feature Sections */}
      <section className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
        <div>
          <h3 className="text-2xl font-bold text-foreground mb-4">Effortless Resizing and Cropping</h3>
          <p className="text-muted-foreground mb-4">
            Need to resize an image for your blog, social media, or printing? Our free image resizer makes it simple. Enter your desired dimensions in pixels, centimeters, or inches. Lock the aspect ratio to prevent distortion or unlock it for custom sizing. The intuitive crop tool lets you frame your subject perfectly for any platform, from Instagram posts to website banners.
          </p>
        </div>
        <div>
           <Image
              src="https://placehold.co/600x400.png"
              alt="A demonstration of the online image resizer and crop tool."
              width={600}
              height={400}
              className="rounded-lg shadow-lg"
              data-ai-hint="ui crop"
            />
        </div>
      </section>
      
      <section className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
         <div className="md:order-last">
          <h3 className="text-2xl font-bold text-foreground mb-4">Advanced Color Adjustments & Filters</h3>
          <p className="text-muted-foreground mb-4">
            Take full creative control of your image's look and feel with our photo color editor. Fine-tune brightness for a lighter feel, boost contrast for more punch, and increase saturation to make your colors pop. Experiment with one-click artistic filters like Vintage, Grayscale, or Polaroid to instantly transform your photo's mood. Our live preview lets you see the results in real-time.
          </p>
        </div>
        <div className="order-first md:order-first">
           <Image
              src="https://placehold.co/700x450.png"
              alt="Image editor showing advanced color adjustment sliders for brightness, contrast, and saturation."
              width={700}
              height={450}
              className="rounded-lg shadow-lg"
              data-ai-hint="color filters"
            />
        </div>
      </section>

      <section className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
        <div>
          <h3 className="text-2xl font-bold text-foreground mb-4">Add Text and Watermarks with Ease</h3>
          <p className="text-muted-foreground mb-4">
            Personalize your images or protect your work by adding text and watermarks. Choose from a wide variety of fonts, sizes, and colors to create stunning graphics. Add a colored background to your text for better readability and style. Our text tool is perfect for creating memes, quotes, promotional materials, or adding your signature to your photos.
          </p>
        </div>
        <div>
           <Image
              src="https://placehold.co/650x420.png"
              alt="A user adding custom text with font and color options to an image using the online editor."
              width={650}
              height={420}
              className="rounded-lg shadow-lg"
              data-ai-hint="text overlay"
            />
        </div>
      </section>
      
      {/* How it works section */}
      <section className="text-center">
          <h2 className="text-3xl font-bold font-headline mb-12">Get Started in 3 Simple Steps</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mb-4">1</div>
                  <h3 className="text-xl font-semibold mb-2">Upload Your Image</h3>
                  <p className="text-muted-foreground">Click the upload button or drag and drop your image or PDF file into the editor.</p>
              </div>
              <div className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mb-4">2</div>
                  <h3 className="text-xl font-semibold mb-2">Edit with Power</h3>
                  <p className="text-muted-foreground">Use our comprehensive toolset to resize, crop, adjust colors, add text, and more.</p>
              </div>
              <div className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mb-4">3</div>
                  <h3 className="text-xl font-semibold mb-2">Download and Share</h3>
                  <p className="text-muted-foreground">Export your finished creation in your desired format (PNG, JPEG, PDF) and quality.</p>
              </div>
          </div>
      </section>

    </div>
  );
}
