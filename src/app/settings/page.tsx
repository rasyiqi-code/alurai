import { getFormsAction } from '@/app/actions';
import { Header } from '@/components/header';
import { FormFlowData } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SlugEditor } from '@/components/slug-editor';

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
      <main className="flex-1 container mx-auto px-4 py-6 md:p-8">
        <h1 className="text-3xl font-bold font-headline mb-6">Custom URLs</h1>
        <Card>
          <CardHeader>
            <CardTitle>Custom URLs</CardTitle>
            <CardDescription>
              Set a custom, memorable URL (a "slug") for your forms.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {forms.length > 0 ? (
                forms.map(form => form.id ? <SlugEditor key={form.id} form={form} /> : null)
              ) : (
                <p className="text-muted-foreground text-center">
                  You haven't created any forms yet.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
