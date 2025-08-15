import { getFormAction, getSubmissionsAction } from '@/app/actions';
import { Header } from '@/components/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { MessageSquare, ArrowLeft } from 'lucide-react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function FormAnalyticsPage({ params }: { params: { id: string } }) {
  const formResult = await getFormAction(params.id);
  const submissionsResult = await getSubmissionsAction(params.id);

  if (!formResult || 'error' in formResult) {
    return notFound();
  }

  const form = formResult;
  const submissions = 'error' in submissionsResult ? [] : submissionsResult;

  const tableHeaders = form.flow.map(field => field.key).filter(key => key !== 'submittedAt');

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6 md:p-8">
        <div className="mb-6">
          <Button asChild variant="outline" size="sm">
            <Link href="/analytics">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold font-headline">{form.title}</h1>
            <p className="text-muted-foreground">Detailed analytics and submissions.</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Total Submissions</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-4">
              <MessageSquare className="h-8 w-8 text-primary" />
              <p className="text-4xl font-bold">{submissions.length}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Submissions Data</CardTitle>
              <CardDescription>
                A log of all the responses your form has received.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Submitted At</TableHead>
                    {tableHeaders.map(key => <TableHead key={key}>{form.flow.find(f => f.key === key)?.question || key}</TableHead>)}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissions.length > 0 ? (
                    submissions.map(submission => (
                      <TableRow key={submission.id}>
                        <TableCell className="font-medium">
                          {submission.submittedAt ? format(new Date(submission.submittedAt), 'PPpp') : 'N/A'}
                        </TableCell>
                        {tableHeaders.map(key => <TableCell key={key}>{submission[key] || '–'}</TableCell>)}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={tableHeaders.length + 1} className="text-center">
                        No submissions yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
