
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DataRelatedPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main className="flex-1 container mx-auto py-12 px-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold font-headline">Data-Related Inquiries (GDPR)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-muted-foreground">
            <p>At ImgResizer, we prioritize your privacy and data security. Our application is designed to process all your images directly on your device (client-side), which means we do not store your images on our servers.</p>

            <h2 className="text-xl font-semibold text-foreground pt-4">Your Rights Under GDPR</h2>
            <p>Under the General Data Protection Regulation (GDPR), you have rights over your personal data. However, as our service operates without collecting personal data related to your image editing, the scope of data we hold is minimal.</p>
            
            <h2 className="text-xl font-semibold text-foreground pt-4">Data We Do Not Store</h2>
            <ul className="list-disc list-inside space-y-2">
                <li>The images you upload or edit.</li>
                <li>Personally identifiable information from your images.</li>
                <li>Your usage history or specific edits.</li>
            </ul>

            <h2 className="text-xl font-semibold text-foreground pt-4">Requesting Your Data</h2>
            <p>
              Given our client-side processing model, there is no personal data from your editing sessions for us to provide. Any data related to your use of ImgResizer is stored locally in your browser's storage and is under your control. You can clear this data at any time by clearing your browser's cache and site data.
            </p>
            <p>
              If you have contacted us via email, we will have a record of that communication. To request a copy or deletion of your email correspondence with us, please send a request to the same email address.
            </p>

            <h2 className="text-xl font-semibold text-foreground pt-4">Contact Our Data Protection Officer</h2>
            <p>For any specific questions or concerns regarding your data and our commitment to GDPR, please contact us at <a href="mailto:imgresizersales@gmail.com" className="text-primary hover:underline">imgresizersales@gmail.com</a> with the subject line "GDPR Inquiry".</p>
          </CardContent>
        </Card>
      </main>
      <SiteFooter />
    </div>
  );
}
