import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Eye, FileText, Calendar, Users } from 'lucide-react';
import Link from 'next/link';
import type { FormFlowData } from '@/lib/types';
import { format } from 'date-fns';

interface SubmissionsMenuProps {
  forms: FormFlowData[];
}

export function SubmissionsMenu({ forms }: SubmissionsMenuProps) {
  const formsWithSubmissions = forms.filter(form => (form.submissionCount ?? 0) > 0);
  const formsWithoutSubmissions = forms.filter(form => (form.submissionCount ?? 0) === 0);

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold font-headline flex items-center gap-2">
          <FileText className="h-6 w-6 text-primary" />
          Data Submission
        </h2>
        <p className="text-muted-foreground">
          Kelola dan lihat semua data submission dari form yang telah dibuat.
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full">
              <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{forms.length}</p>
              <p className="text-sm text-muted-foreground">Total Form</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full">
              <MessageSquare className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {forms.reduce((total, form) => total + (form.submissionCount ?? 0), 0)}
              </p>
              <p className="text-sm text-muted-foreground">Total Submission</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-full">
              <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{formsWithSubmissions.length}</p>
              <p className="text-sm text-muted-foreground">Form Aktif</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Forms with Submissions */}
      {formsWithSubmissions.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-semibold font-headline">Form dengan Data Submission</h3>
            <Badge variant="secondary">{formsWithSubmissions.length}</Badge>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {formsWithSubmissions.map(form => (
              <Card key={form.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <CardTitle className="font-headline text-lg line-clamp-2">
                        {form.title}
                      </CardTitle>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {form.createdAt ? format(new Date(form.createdAt), 'dd MMM yyyy') : 'N/A'}
                        </span>
                      </div>
                    </div>
                    <Badge variant="default" className="ml-2">
                      {form.submissionCount} data
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MessageSquare className="h-4 w-4" />
                    <span>{form.submissionCount} submission terkumpul</span>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button asChild className="flex-1">
                      <Link href={`/analytics/${form.id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        Lihat Data
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Forms without Submissions */}
      {formsWithoutSubmissions.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-semibold font-headline text-muted-foreground">
              Form Tanpa Submission
            </h3>
            <Badge variant="outline">{formsWithoutSubmissions.length}</Badge>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {formsWithoutSubmissions.map(form => (
              <Card key={form.id} className="opacity-75 hover:opacity-100 transition-opacity">
                <CardHeader className="pb-3">
                  <CardTitle className="font-headline text-base line-clamp-2">
                    {form.title}
                  </CardTitle>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>
                      {form.createdAt ? format(new Date(form.createdAt), 'dd MMM yyyy') : 'N/A'}
                    </span>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                    <MessageSquare className="h-4 w-4" />
                    <span>Belum ada submission</span>
                  </div>
                  
                  <Button asChild variant="outline" size="sm" className="w-full">
                    <Link href={`/analytics/${form.id}`}>
                      <Eye className="mr-2 h-3 w-3" />
                      Lihat Form
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {forms.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <div className="mx-auto bg-muted text-muted-foreground rounded-full h-16 w-16 flex items-center justify-center mb-4">
              <FileText className="h-8 w-8" />
            </div>
            <CardTitle className="font-headline mb-2">Belum Ada Form</CardTitle>
            <CardDescription className="mb-4">
              Anda belum membuat form apapun. Buat form pertama Anda untuk mulai mengumpulkan data submission.
            </CardDescription>
            <Button asChild>
              <Link href="/">Buat Form Pertama</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}