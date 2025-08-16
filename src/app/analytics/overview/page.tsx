import { getAnalyticsOverviewAction } from '@/app/actions';
import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, MessageSquare, Star, BarChart } from 'lucide-react';
import Link from 'next/link';

export default async function AnalyticsOverviewPage() {
  const result = await getAnalyticsOverviewAction();

  if ('error' in result) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-6 md:p-8">
            <Card className="text-center">
                <CardHeader>
                    <CardTitle>Error</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-destructive">{result.error}</p>
                </CardContent>
            </Card>
        </main>
      </div>
    )
  }

  const { totalForms, totalSubmissions, mostSubmittedForm } = result;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6 md:p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold font-headline">Analytics Overview</h1>
        </div>
        
        {totalForms > 0 ? (
          <div className="space-y-6">
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
                        <Button asChild>
                            <Link href={`/analytics/${mostSubmittedForm.id}`}>View Details</Link>
                        </Button>
                    </CardContent>
                </Card>
            )}
          </div>
        ) : (
          <Card className="text-center">
            <CardHeader>
                <div className="mx-auto bg-primary text-primary-foreground rounded-full h-16 w-16 flex items-center justify-center mb-4">
                 <BarChart className="h-8 w-8" />
                </div>
                <CardTitle className="font-headline">No Data Yet</CardTitle>
                 <CardDescription>
                    Create and share some forms to see analytics insights here.
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
