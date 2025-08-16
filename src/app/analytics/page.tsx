import { getFormsAction, getAnalyticsOverviewAction } from '@/app/actions';
import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { FormFlowData } from '@/lib/types';
import { BarChart, Eye, MessageSquare, FileText, Star } from 'lucide-react';
import Link from 'next/link';

export default async function AnalyticsDashboardPage() {
  const formsResult = await getFormsAction();
  const overviewResult = await getAnalyticsOverviewAction();

  if ('error' in formsResult || 'error' in overviewResult) {
    return (
        <div className="flex flex-col min-h-screen bg-background">
            <Header />
            <main className="flex-1 container mx-auto px-4 py-6 md:p-8">
                <Card className="text-center">
                    <CardHeader>
                        <CardTitle>Error</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-destructive">{'error' in formsResult ? formsResult.error : 'error' in overviewResult ? overviewResult.error : 'An unknown error occurred'}</p>
                    </CardContent>
                </Card>
            </main>
        </div>
    )
  }

  const forms: FormFlowData[] = formsResult;
  const { totalForms, totalSubmissions, mostSubmittedForm } = overviewResult;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6 md:p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold font-headline">Analytics Dashboard</h1>
        </div>
        
        {forms.length > 0 ? (
          <div className="space-y-6">
            {/* Overview Section */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Total Forms</CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center gap-4">
                        <FileText className="h-8 w-8 text-primary" />
                        <p className="text-4xl font-bold">{totalForms}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Total Submissions</CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center gap-4">
                        <MessageSquare className="h-8 w-8 text-primary" />
                        <p className="text-4xl font-bold">{totalSubmissions}</p>
                    </CardContent>
                </Card>
            </div>
            {mostSubmittedForm && (
                <Card>
                    <CardHeader>
                        <CardTitle>Most Popular Form</CardTitle>
                        <CardDescription>
                            This form has received the most submissions.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-4">
                            <Star className="h-8 w-8 text-yellow-400" />
                            <div>
                                <p className="text-xl font-semibold font-headline">{mostSubmittedForm.title}</p>
                                <p className="text-muted-foreground">{mostSubmittedForm.count} submissions</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Forms List Section */}
            <h2 className="text-2xl font-bold font-headline pt-4">Submissions by Form</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {forms.map(form => (
                <Card key={form.id}>
                    <CardHeader>
                    <CardTitle className="font-headline text-xl">{form.title}</CardTitle>
                    <CardDescription>
                        Select a form to view its submissions.
                    </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                    <div className="flex items-center text-sm text-muted-foreground">
                        <MessageSquare className="mr-2 h-4 w-4" />
                        <span>{form.submissionCount ?? 0} Submissions</span>
                    </div>
                    <Button asChild className="w-full">
                        <Link href={`/analytics/${form.id}`}>
                        <Eye className="mr-2" /> View Submissions
                        </Link>
                    </Button>
                    </CardContent>
                </Card>
                ))}
            </div>
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
