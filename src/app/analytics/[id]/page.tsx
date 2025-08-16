import { getFormAction, getSubmissionsAction } from '@/app/actions';
import { Header } from '@/components/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MessageSquare, ArrowLeft, Construction } from 'lucide-react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default async function FormAnalyticsPage({ params }: { params: { id: string } }) {
  const formResult = await getFormAction(params.id);

  if (!formResult || 'error' in formResult) {
    return notFound();
  }

  const form = formResult;
  // Fetch submissions, but handle potential errors
  const submissionsResult = await getSubmissionsAction(params.id);
  const submissions = 'error' in submissionsResult ? [] : submissionsResult;

  const tableHeaders = form.flow.map(field => field.key).filter(Boolean);

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
              <div className='flex items-center gap-4'>
                <CardTitle>Submissions Data</CardTitle>
                <Badge variant="outline">Coming Soon</Badge>
              </div>
              <CardDescription>
                Viewing individual submission data is currently in development.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Submitted At</TableHead>
                      {tableHeaders.map(key => <TableHead key={key}>{form.flow.find(f => f.key === key)?.question || key}</TableHead>)}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell colSpan={tableHeaders.length + 1}>
                        <div className="flex flex-col items-center justify-center text-center p-8 gap-4">
                            <div className="mx-auto bg-primary text-primary-foreground rounded-full h-16 w-16 flex items-center justify-center">
                                <Construction className="h-8 w-8" />
                            </div>
                            <h3 className="text-lg font-semibold font-headline">Feature in Progress</h3>
                            <p className="text-muted-foreground max-w-md">
                                We are working hard to bring you detailed submission analytics. Check back soon!
                            </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
