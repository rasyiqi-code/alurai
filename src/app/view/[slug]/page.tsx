import { getFormBySlugAction } from '@/app/actions';
import { FormDisplay } from '@/components/form-display';
import { notFound } from 'next/navigation';

export default async function ViewFormPage({ params }: { params: { slug: string } }) {
  const result = await getFormBySlugAction(params.slug);

  if (!result || 'error' in result) {
    return notFound();
  }

  return (
    <div className="h-screen w-screen bg-background">
       <main className="h-full w-full">
        <FormDisplay formFlowData={result} />
      </main>
    </div>
  );
}
