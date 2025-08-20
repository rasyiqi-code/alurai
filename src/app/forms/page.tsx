'use client';

import { getFormsAction } from '@/app/actions';
import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { FormFlowData } from '@/lib/types';
import { format } from 'date-fns';
import { Plus, Pencil, Share2, Eye } from 'lucide-react';
import Link from 'next/link';
import { ShareButton } from '@/components/share-button';
import { AuthGuard } from '@/components/auth-guard';
import { useEffect, useState } from 'react';
import { useUser } from '@stackframe/stack';


export default function FormsPage() {
  const [forms, setForms] = useState<FormFlowData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadForms() {
      try {
        const result = await getFormsAction();
        if ('error' in result) {
          console.error(result.error);
        } else {
          setForms(result);
        }
      } catch (error) {
        console.error('Error loading forms:', error);
      } finally {
        setLoading(false);
      }
    }

    loadForms();
  }, []);

  if (loading) {
    return (
      <AuthGuard>
        <div className="flex items-center justify-center h-screen">
          <div className="text-lg">Loading forms...</div>
        </div>
      </AuthGuard>
    );
  }
  
  const getFormViewLink = (form: FormFlowData) => {
    if (form.slug) {
        return `/view/${form.slug}`;
    }
    return `/form/${form.id}`;
  }

  return (
    <AuthGuard>
      <div className="flex flex-col min-h-screen bg-background">
        <Header />
      <main className="flex-1 container mx-auto px-4 py-6 md:p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold font-headline">Your Forms</h1>
          <Button asChild>
            <Link href="/create">
              <Plus className="mr-2 h-4 w-4" /> Create New Form
            </Link>
          </Button>
        </div>

        {/* Desktop View: Table */}
        <Card className="hidden md:block">
          <CardHeader>
            <CardTitle>Saved Forms</CardTitle>
            <CardDescription>
              Here is a list of the forms you have created and saved.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Date Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {forms.length > 0 ? (
                  forms.map((form) => (
                    <TableRow key={form.id}>
                      <TableCell className="font-medium">{form.title}</TableCell>
                      <TableCell>
                        {form.createdAt ? format(new Date(form.createdAt), 'PPpp') : 'N/A'}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button asChild variant="outline" size="sm">
                          <Link href={getFormViewLink(form)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </Link>
                        </Button>
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/create?formId=${form.id}`}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </Link>
                        </Button>
                         {form.id && <ShareButton form={form} />}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center">
                      You haven't saved any forms yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Mobile View: Cards */}
        <div className="md:hidden space-y-4">
          {forms.length > 0 ? (
            forms.map((form) => (
              <Card key={form.id} className="w-full">
                <CardHeader>
                  <CardTitle className="text-lg">{form.title}</CardTitle>
                  <CardDescription>
                    {form.createdAt ? format(new Date(form.createdAt), 'PPpp') : 'N/A'}
                  </CardDescription>
                </CardHeader>
                <CardFooter className="grid grid-cols-3 gap-2">
                  <Button asChild variant="outline" size="sm">
                    <Link href={getFormViewLink(form)}>
                      <Eye className="mr-2 h-4 w-4" />
                      View
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/create?formId=${form.id}`}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </Link>
                  </Button>
                  {form.id && <ShareButton form={form} />}
                </CardFooter>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">
                  You haven't saved any forms yet.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      </div>
    </AuthGuard>
  );
}
