import { getFormBySlugAction } from '@/app/actions';
import { FormDisplay } from '@/components/form-display';
import { Header } from '@/components/header';
import { notFound } from 'next/navigation';

export default async function ViewFormPage({ params }: { params: { slug: string } }) {
  const result = await getFormBySlugAction(params.slug);

  if (!result || 'error' in result) {
    return notFound();
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl h-[85vh]">
          <FormDisplay formFlowData={result} />
        </div>
      </main>
    </div>
  );
}
