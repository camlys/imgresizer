
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { Mail, Phone, MapPin, Tag, ShoppingCart } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';


export default function ContactPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main className="flex-1 container mx-auto py-16 px-6">
        <div className="grid md:grid-cols-2 gap-16 items-start">
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold font-headline tracking-tighter mb-4 text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                Get in Touch
              </h1>
              <p className="text-lg text-muted-foreground">
                We're here to help and answer any question you might have. We look forward to hearing from you.
              </p>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 text-primary rounded-full">
                  <Mail size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-foreground">Email Support</h2>
                  <p className="text-muted-foreground mt-1">
                    For sales, support, and general feedback, please email us.
                  </p>
                  <a href="mailto:camlysales@gmail.com" className="text-primary font-semibold text-lg hover:underline mt-2 inline-block">
                    camlysales@gmail.com
                  </a>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 text-primary rounded-full">
                  <Phone size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-foreground">Phone</h2>
                  <p className="text-muted-foreground mt-1">
                    For urgent inquiries, you can call us during business hours.
                  </p>
                  <a href="tel:+918434828368" className="text-primary font-semibold text-lg hover:underline mt-2 inline-block">
                    +91 84348 28368
                  </a>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 text-primary rounded-full">
                  <MapPin size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-foreground">Our Office</h2>
                  <p className="text-muted-foreground mt-1">
                    Camly pvt. Chandi chowk, Bishnupur<br/>
                    Begusarai 851101
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-8">
            <div className="relative h-64 md:h-80 rounded-2xl overflow-hidden shadow-2xl">
                <div 
                className="absolute inset-0 z-0 bg-white"
                style={{
                    backgroundImage: 'radial-gradient(circle at 70% 30%, hsl(var(--primary) / 0.1), transparent 40%), radial-gradient(circle at 20% 80%, hsl(var(--accent) / 0.1), transparent 30%)',
                }}
                ></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <Mail size={128} className="text-primary/20 -rotate-12" />
                </div>
            </div>

            <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20 shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-2xl font-bold">
                        <Tag className="text-primary"/>
                        <span>This Project is For Sale</span>
                    </CardTitle>
                    <CardDescription>
                        Own a fully-functional, privacy-focused image editing SaaS.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="text-center">
                        <p className="text-muted-foreground text-sm">Asking Price</p>
                        <p className="text-4xl font-bold text-foreground">$9999 USD</p>
                    </div>
                    <p className="text-xs text-muted-foreground text-center">
                        Includes domain, full source code, and assets. Serious inquiries only.
                    </p>
                    <Button className="w-full" asChild>
                        <a href="mailto:camlysales@gmail.com?subject=Inquiry%20to%20Purchase%20ImgResizer.xyz">
                            <ShoppingCart className="mr-2"/> Make an Offer
                        </a>
                    </Button>
                </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
