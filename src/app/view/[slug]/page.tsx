import { getFormBySlugAction } from '@/app/actions';
import { FormDisplay } from '@/components/form-display';
import { notFound } from 'next/navigation';

export default async function ViewFormPage({ params }: { params: { slug: string } }) {
  const result = await getFormBySlugAction(params.slug);

  if (!result || 'error' in result) {
    return notFound();
  }

  return (
    <div className="min-h-screen w-full bg-muted flex flex-col items-center justify-center p-4 gap-4">
       <h1 className="text-3xl font-bold font-headline text-center">{result.title}</h1>
       <main className="h-screen w-full md:h-[85vh] md:max-w-lg md:rounded-xl md:shadow-2xl overflow-hidden">
        <FormDisplay formFlowData={result} />
      </main>
    </div>
  );
}
