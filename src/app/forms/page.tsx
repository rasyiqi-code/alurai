import { getFormsAction } from '@/app/actions';
import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { FormFlowData } from '@/lib/types';
import { format } from 'date-fns';
import { Plus, Pencil, Share2 } from 'lucide-react';
import Link from 'next/link';
import { ShareButton } from '@/components/share-button';


export default async function FormsPage() {
  const result = await getFormsAction();

  let forms: FormFlowData[] = [];
  if ('error' in result) {
    // Handle error case, maybe show a message
    console.error(result.error);
  } else {
    forms = result;
  }
  
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6 md:p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold font-headline">Formulir Anda</h1>
          <Button asChild>
            <Link href="/">
              <Plus className="mr-2 h-4 w-4" /> Buat Formulir Baru
            </Link>
          </Button>
        </div>

        {/* Desktop View: Table */}
        <Card className="hidden md:block">
          <CardHeader>
            <CardTitle>Formulir Tersimpan</CardTitle>
            <CardDescription>
              Berikut adalah daftar formulir yang telah Anda buat dan simpan.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Judul</TableHead>
                  <TableHead>Tanggal Dibuat</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
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
                      <TableCell className="text-right">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/?formId=${form.id}`}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </Link>
                        </Button>
                         {form.id && <ShareButton formId={form.id} />}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center">
                      Anda belum memiliki formulir tersimpan.
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
                <CardFooter className="grid grid-cols-2 gap-2">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/?formId=${form.id}`}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </Link>
                  </Button>
                  {form.id && <ShareButton formId={form.id} />}
                </CardFooter>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">
                  Anda belum memiliki formulir tersimpan.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
