
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main className="flex-1 container mx-auto py-12 px-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold font-headline">Contact Us</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-lg text-muted-foreground">
            <p>
              We'd love to hear from you! Whether you have a question about our features, a suggestion for improvement, or need assistance, our team is ready to help.
            </p>
            <div>
              <h2 className="text-2xl font-semibold text-foreground flex items-center gap-2">
                <Mail size={24} />
                Email Support
              </h2>
              <p className="mt-2">
                For sales inquiries, support questions, and general feedback, please don't hesitate to reach out to us at:
              </p>
              <a href="mailto:contact@imgresizer.xyz" className="text-primary font-semibold text-xl hover:underline">
                contact@imgresizer.xyz
              </a>
              <p className="mt-2">
                We aim to respond to all inquiries within 24-48 business hours.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
      <SiteFooter />
    </div>
  );
}
