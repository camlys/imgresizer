
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, ShieldCheck, Zap, LockKeyhole } from 'lucide-react';

const features = [
  {
    icon: <ShieldCheck className="w-8 h-8 text-primary" />,
    title: 'Absolute Privacy',
    description: 'Your images are your business. Camly processes everything in your browser, so your files never touch our servers.',
  },
  {
    icon: <Zap className="w-8 h-8 text-primary" />,
    title: 'Blazing-Fast Speed',
    description: 'Experience a seamless, real-time editing workflow with instant previews and no lag.',
  },
  {
    icon: <LockKeyhole className="w-8 h-8 text-primary" />,
    title: 'Zero Barriers',
    description: 'No sign-ups, no subscriptions. Get straight to creating with our powerful tools, completely free.',
  },
  {
    icon: <CheckCircle className="w-8 h-8 text-primary" />,
    title: 'Full-Featured',
    description: 'From resizing and cropping to advanced color correction and text overlays, we have you covered.',
  },
];


export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main className="flex-1">
        <section className="relative bg-muted/40 text-foreground py-20 md:py-32">
          <div className="container mx-auto px-6 text-center">
            <h1 className="text-4xl md:text-6xl font-extrabold font-headline tracking-tighter mb-4">
              Empowering Creativity, Simply.
            </h1>
            <p className="max-w-3xl mx-auto text-lg md:text-xl text-muted-foreground">
              Camly was born from a simple idea: professional-grade image editing should be accessible to everyone, everywhere. We're dedicated to providing a tool that is not only powerful and versatile but also respects your privacy.
            </p>
          </div>
        </section>

        <section className="py-16 bg-background">
          <div className="container mx-auto px-6">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold font-headline mb-4">Our Story</h2>
                <p className="text-muted-foreground text-lg mb-4">
                  In a world of complex software and privacy concerns, we saw the need for a straightforward, secure, and free image editor. We set out to build Camly—a browser-based tool that puts the user first. Our journey has been driven by a passion for design and a commitment to privacy, culminating in the editor you see today.
                </p>
                <p className="text-muted-foreground text-lg">
                  We believe that creativity shouldn't be locked behind expensive subscriptions or complicated installations. Camly is our contribution to a more open, creative web.
                </p>
              </div>
              <div className="bg-primary/10 rounded-lg p-8">
                <img src="/camly.png" alt="Camly Mission" className="w-full h-auto rounded-lg shadow-xl" />
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-muted/40">
            <div className="container mx-auto px-6 text-center">
                <h2 className="text-3xl font-bold font-headline mb-4">Why Choose Camly?</h2>
                <p className="max-w-3xl mx-auto text-lg text-muted-foreground mb-12">
                    We've built Camly with a core set of values to ensure you have the best editing experience possible.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature, index) => (
                        <Card key={index} className="text-center group hover:border-primary transition-all">
                            <CardHeader className="items-center">
                                <div className="p-4 bg-primary/10 rounded-full mb-2">
                                    {feature.icon}
                                </div>
                                <CardTitle className="text-xl">{feature.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">{feature.description}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>

        <section className="py-16 bg-background">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold font-headline mb-4">Our Vision for the Future</h2>
            <p className="max-w-3xl mx-auto text-lg text-muted-foreground">
              We're just getting started. Our roadmap is filled with exciting new features, from AI-powered enhancements to more advanced creative tools. We are constantly listening to our community to build the future of online image editing, together.
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
