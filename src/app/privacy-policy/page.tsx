
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PrivacyPolicyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main className="flex-1 container mx-auto py-12 px-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold font-headline">Privacy Policy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-muted-foreground">
            <p className="text-sm">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            
            <p>Camly ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we handle information in connection with the Camly web application (the "Service").</p>

            <h2 className="text-xl font-semibold text-foreground pt-4">1. Information We Collect</h2>
            <p>Camly is designed to be a client-side application. This means that all image processing occurs directly in your web browser. We do not upload, store, or collect the images you edit on our servers.</p>

            <h2 className="text-xl font-semibold text-foreground pt-4">2. How We Use Information</h2>
            <p>Since we do not collect your images or personal data associated with them, we do not use them for any purpose. Any information, such as image data, remains on your local device and is processed by your browser.</p>

            <h2 className="text-xl font-semibold text-foreground pt-4">3. Cookies and Tracking Technologies</h2>
            <p>We may use cookies or similar technologies to enhance your user experience, such as remembering your preferences or settings within the application. These are functional and not used for tracking you across other websites.</p>

            <h2 className="text-xl font-semibold text-foreground pt-4">4. Third-Party Services</h2>
            <p>The Service does not integrate with third-party services that would collect your personal information. All functionalities are self-contained within the application.</p>

            <h2 className="text-xl font-semibold text-foreground pt-4">5. Data Security</h2>
            <p>Your data security is a primary feature of our design. By processing images on the client-side, we eliminate the risk of server-side data breaches involving your creative work.</p>

            <h2 className="text-xl font-semibold text-foreground pt-4">6. Changes to This Privacy Policy</h2>
            <p>We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes.</p>

            <h2 className="text-xl font-semibold text-foreground pt-4">7. Contact Us</h2>
            <p>If you have any questions about this Privacy Policy, please contact us at <a href="mailto:camlysales@gmail.com" className="text-primary hover:underline">camlysales@gmail.com</a>.</p>
          </CardContent>
        </Card>
      </main>
      <SiteFooter />
    </div>
  );
}
