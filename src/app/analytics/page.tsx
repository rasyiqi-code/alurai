import { getFormsAction } from '@/app/actions';
import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { FormFlowData } from '@/lib/types';
import { BarChart, MessageSquare, Eye } from 'lucide-react';
import Link from 'next/link';

export default async function AnalyticsDashboardPage() {
  const result = await getFormsAction();
  let forms: FormFlowData[] = [];
  if ('error' in result) {
    console.error(result.error);
    // Optionally render an error message to the user
  } else {
    forms = result;
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6 md:p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold font-headline">Analytics Dashboard</h1>
        </div>
        
        {forms.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {forms.map(form => (
              <Card key={form.id}>
                <CardHeader>
                  <CardTitle className="font-headline text-xl">{form.title}</CardTitle>
                  <CardDescription>
                    A summary of your form's performance.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4 text-lg">
                    <MessageSquare className="h-6 w-6 text-primary" />
                    <span className="font-bold">{form.submissionCount || 0}</span>
                    <span className="text-muted-foreground">Total Responses</span>
                  </div>
                  <Button asChild className="w-full">
                    <Link href={`/analytics/${form.id}`}>
                      <Eye className="mr-2" /> View Details
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center">
            <CardHeader>
                <div className="mx-auto bg-primary text-primary-foreground rounded-full h-16 w-16 flex items-center justify-center mb-4">
                 <BarChart className="h-8 w-8" />
                </div>
                <CardTitle className="font-headline">No Forms Found</CardTitle>
                 <CardDescription>
                    You haven't created any forms yet. Once you create and share forms, their analytics will appear here.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Button asChild>
                    <Link href="/">Create Your First Form</Link>
                </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
