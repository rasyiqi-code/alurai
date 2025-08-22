import { Header } from '@/components/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Paintbrush, Type, LayoutTemplate, Upload } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { generateMetadata as generateSEOMetadata, metaDescriptions, metaKeywords } from '@/lib/seo-utils';
import type { Metadata } from 'next';

export const metadata: Metadata = generateSEOMetadata({
  title: 'Form Templates & Branding',
  description: metaDescriptions.templates,
  keywords: metaKeywords.templates,
  path: '/templates',
  ogImage: '/og-templates.png',
  twitterImage: '/twitter-templates.png',
});

export default function TemplatesPage() {

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6 md:p-8 space-y-8">
        <div>
            <h1 className="text-3xl font-bold font-headline mb-2">Template & Branding</h1>
            <p className="text-muted-foreground">
                Customize the look and feel of your forms to match your brand.
            </p>
        </div>
        
        <Card>
          <CardHeader>
            <div className='flex items-center gap-2'>
                <Paintbrush className="h-5 w-5 text-primary" />
                <CardTitle>Color Scheme</CardTitle>
            </div>
            <CardDescription>
              Adjust the colors to fit your brand identity. These changes will apply globally.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="space-y-2">
                <Label htmlFor="primary-color">Primary Color</Label>
                <Input id="primary-color" type="color" defaultValue="#1E3A8A" className="p-1 h-10" />
                <p className="text-xs text-muted-foreground">Used for buttons, icons, and highlights.</p>
             </div>
             <div className="space-y-2">
                <Label htmlFor="background-color">Background Color</Label>
                <Input id="background-color" type="color" defaultValue="#F9FAFB" className="p-1 h-10" />
                 <p className="text-xs text-muted-foreground">The main background for the application.</p>
             </div>
             <div className="space-y-2">
                <Label htmlFor="accent-color">Accent Color</Label>
                <Input id="accent-color" type="color" defaultValue="#14B8A6" className="p-1 h-10" />
                 <p className="text-xs text-muted-foreground">Used for secondary elements and highlights.</p>
             </div>
             <div className="md:col-span-3">
                <Button disabled>Save Colors (Coming Soon)</Button>
             </div>
          </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
                 <div className='flex items-center gap-2'>
                    <LayoutTemplate className="h-5 w-5 text-primary" />
                    <CardTitle>Layout & Branding</CardTitle>
                </div>
                <CardDescription>
                    Add your company's branding to the sides of the form.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="left-image">Left Side Image</Label>
                        <Input id="left-image" type="file" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="right-image">Right Side Image</Label>
                        <Input id="right-image" type="file" />
                    </div>
                </div>
                 <Button disabled>Upload Images (Coming Soon)</Button>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                 <div className='flex items-center gap-2'>
                    <Type className="h-5 w-5 text-primary" />
                    <CardTitle>Fonts</CardTitle>
                      <Badge variant="outline">Coming Soon</Badge>
                </div>
                <CardDescription>
                    Choose fonts that match your brand's style. This feature is not yet available.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Button disabled>Change Fonts</Button>
            </CardContent>
        </Card>

      </main>
    </div>
  );
}
