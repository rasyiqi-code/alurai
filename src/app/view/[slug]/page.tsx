import { getFormBySlugAction } from '@/app/actions';
import { FormDisplay } from '@/components/form-display';
import { notFound } from 'next/navigation';

export default async function ViewFormPage({ params }: { params: { slug: string } }) {
  const result = await getFormBySlugAction(params.slug);

  if (!result || 'error' in result) {
    return notFound();
  }

  return (
    <div className="min-h-screen w-full bg-muted flex items-center justify-center">
       <main className="h-screen w-full md:h-[85vh] md:max-w-lg md:rounded-xl md:shadow-2xl overflow-hidden">
        <FormDisplay formFlowData={result} />
      </main>
    </div>
  );
}
