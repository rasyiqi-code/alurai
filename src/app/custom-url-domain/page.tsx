import { getFormsAction } from '@/app/actions';
import { Header } from '@/components/header';
import { FormFlowData } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SlugEditor } from '@/components/slug-editor';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default async function SettingsPage() {
  const result = await getFormsAction();
  let forms: FormFlowData[] = [];
  if ('error' in result) {
    console.error(result.error);
  } else {
    forms = result;
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6 md:p-8 space-y-8">
        <div>
            <h1 className="text-3xl font-bold font-headline mb-2">Custom URLs</h1>
            <p className="text-muted-foreground">
                Manage your form URLs and connect a custom domain.
            </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>URL Slugs</CardTitle>
            <CardDescription>
              Set a custom, memorable URL path for each of your forms.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {forms.length > 0 ? (
                forms.map(form => form.id ? <SlugEditor key={form.id} form={form} /> : null)
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  You haven't created any forms yet.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
                <div className='flex items-center gap-4'>
                    <CardTitle>Custom Domains</CardTitle>
                    <Badge variant="outline">Coming Soon</Badge>
                </div>
                <CardDescription>
                    Connect your own domain to serve forms from your brand's URL. This feature is not yet available.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-muted-foreground" />
                    <Input placeholder="e.g., forms.yourcompany.com" disabled />
                    <Button disabled>Add Domain</Button>
                </div>
                <div className="text-sm text-muted-foreground p-4 bg-muted rounded-lg">
                    <p className="font-semibold">How to connect your domain:</p>
                    <ol className="list-decimal list-inside mt-2 space-y-1">
                        <li>Add your domain or subdomain above.</li>
                        <li>Go to your DNS provider (e.g., GoDaddy, Namecheap, Cloudflare).</li>
                        <li>Create a CNAME record pointing your domain to our servers.</li>
                    </ol>
                </div>
            </CardContent>
        </Card>

      </main>
    </div>
  );
}
