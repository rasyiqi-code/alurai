'use client';

import type { Dispatch, SetStateAction } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Wand2 } from 'lucide-react';

import type { FormFlowData } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { generateFormAction } from '@/app/actions';
import { Spinner } from '@/components/spinner';

const formSchema = z.object({
  description: z.string().min(10, {
    message: 'Please describe your form in at least 10 characters.',
  }),
});

interface Props {
  setFormFlowData: Dispatch<SetStateAction<FormFlowData | null>>;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
  isLoading: boolean;
}

export function FormGeneratorView({ setFormFlowData, setIsLoading, isLoading }: Props) {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    const result = await generateFormAction(values.description);

    if (typeof result === 'object' && result.error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.error,
      });
    } else if (typeof result === 'string') {
      try {
        const parsedFlow = JSON.parse(result);
        setFormFlowData(parsedFlow);
      } catch (e) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to parse the generated form. Please try again.',
        });
      }
    }
    setIsLoading(false);
  }
  
  const setExample = () => {
    form.setValue('description', 'A short story submission form. I need the author\'s pen name, the story title, genre (as a select with options: fantasy, sci-fi, horror, romance), and the manuscript as a file upload.');
  };


  return (
    <div className="flex flex-col items-center justify-center w-full h-full pt-10 md:pt-20">
      <Card className="w-full max-w-2xl shadow-lg bg-primary text-primary-foreground">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">Buat Formulir Percakapan</CardTitle>
          <CardDescription className="text-center pt-2 text-primary-foreground/80">
            Jelaskan formulir yang ingin Anda buat, dan biarkan AI yang mengerjakan sisanya.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="sr-only">Deskripsi Formulir</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="misalnya, 'Formulir kontak dengan kolom nama, email, dan pesan.'"
                        className="min-h-[150px] text-base bg-primary-foreground/10 text-primary-foreground placeholder:text-primary-foreground/60 border-primary-foreground/30 focus-visible:ring-primary-foreground"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-background" />
                  </FormItem>
                )}
              />
              <div className="flex flex-col-reverse sm:flex-row sm:justify-between sm:items-center gap-4">
                <Button type="button" variant="link" onClick={setExample} className="p-0 h-auto self-start text-primary-foreground/80 hover:text-primary-foreground">
                  Gunakan contoh
                </Button>
                <Button type="submit" disabled={isLoading} size="lg" className="w-full sm:w-auto bg-primary-foreground text-primary hover:bg-primary-foreground/90">
                  {isLoading ? (
                    <>
                      <Spinner className="mr-2 h-4 w-4" /> Membuat...
                    </>
                  ) : (
                    <>
                      <Wand2 className="mr-2 h-4 w-4" /> Buat Formulir
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
