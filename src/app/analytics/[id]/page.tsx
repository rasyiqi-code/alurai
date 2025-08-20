import { getFormAction, getSubmissionsAction } from '@/app/actions';
import { Header } from '@/components/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MessageSquare, ArrowLeft, Inbox } from 'lucide-react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ExportToExcel } from '@/components/export-to-excel';
import { S3UploadedFile } from '@/components/s3-upload';
import { FileDownloadLink } from '@/components/file-download-link';
import React from 'react';



export default async function FormAnalyticsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const formResult = await getFormAction(id);

  if (!formResult || 'error' in formResult) {
    return notFound();
  }

  const form = formResult;
  // Fetch submissions, but handle potential errors
  const submissionsResult = await getSubmissionsAction(id);
  const submissions = 'error' in submissionsResult ? [] : submissionsResult;

  const tableHeaders = form.flow.map(field => field.key).filter(Boolean);

  const formatValue = (value: any): React.ReactNode => {
    if (value === null || value === undefined) {
      return 'N/A';
    }
    
    if (value && typeof value === 'object' && value.toDate) {
      // Firestore Timestamp
      return format(value.toDate(), 'PPpp');
    }
    
    if (typeof value === 'string' && value.startsWith('placeholder/for/')) {
      return value.replace('placeholder/for/', '');
    }
    
    // Check if value is S3 file data (JSON string)
    if (typeof value === 'string' && value.startsWith('[{') && value.includes('"key"')) {
      try {
        const files = JSON.parse(value) as S3UploadedFile[];
        return (
          <div className="space-y-1">
            {files.map((file, index) => (
              <FileDownloadLink key={index} file={file} />
            ))}
          </div>
        );
      } catch (error) {
        console.error('Error parsing S3 file data:', error);
        return String(value);
      }
    }
    
    return String(value);
  };

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
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Submissions Data</CardTitle>
                  <CardDescription>
                    View all the entries submitted to your form.
                  </CardDescription>
                </div>
                {submissions.length > 0 && (
                  <div className="flex gap-2">
                    <ExportToExcel 
                      data={submissions}
                      headers={tableHeaders}
                      formTitle={form.title}
                      formFlow={form.flow}
                    />

                  </div>
                )}
              </div>
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
                    {submissions.length > 0 ? (
                        submissions.map(submission => (
                            <TableRow key={submission.id}>
                                <TableCell>{format(new Date(submission.submittedAt), 'PPpp')}</TableCell>
                                {tableHeaders.map(header => (
                                    <TableCell key={`${submission.id}-${header}`}>
                                        {formatValue(submission[header])}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={tableHeaders.length + 1}>
                                <div className="flex flex-col items-center justify-center text-center p-8 gap-4">
                                    <div className="mx-auto bg-muted text-muted-foreground rounded-full h-16 w-16 flex items-center justify-center">
                                        <Inbox className="h-8 w-8" />
                                    </div>
                                    <h3 className="text-lg font-semibold font-headline">No Submissions Yet</h3>
                                    <p className="text-muted-foreground max-w-md">
                                        Share your form to start collecting responses. They will appear here as soon as they come in.
                                    </p>
                                </div>
                            </TableCell>
                        </TableRow>
                    )}
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
