
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main className="flex-1 container mx-auto py-12 px-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold font-headline">About Camly</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-lg text-muted-foreground">
            <p>
              Welcome to Camly, your go-to online image editor designed for simplicity and power. Our mission is to provide creators, marketers, and everyday users with a fast, intuitive, and feature-rich tool to bring their visual ideas to life—right from their web browser.
            </p>
            <p>
              Born from the idea that professional-grade image editing shouldn't be complicated or require expensive software, Camly offers a comprehensive suite of tools. From basic resizing and cropping to advanced color adjustments and text overlays, everything you need is just a few clicks away.
            </p>
            <h2 className="text-2xl font-semibold text-foreground pt-4">Our Vision</h2>
            <p>
              We believe in empowering creativity. We're committed to continuously improving Camly by adding new features, enhancing performance, and listening to our community. Whether you're touching up a photo for social media, designing graphics for a project, or just having fun with images, Camly is here to make the process seamless and enjoyable.
            </p>
          </CardContent>
        </Card>
      </main>
      <SiteFooter />
    </div>
  );
}
