
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { Mail, Phone, MapPin } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main className="flex-1 container mx-auto py-16 px-6">
        <div className="grid md:grid-cols-2 gap-16 items-center">
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
                  <a href="tel:+1234567890" className="text-primary font-semibold text-lg hover:underline mt-2 inline-block">
                    +1 (234) 567-890
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
          
          <div className="relative h-64 md:h-full rounded-2xl overflow-hidden shadow-2xl">
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
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
