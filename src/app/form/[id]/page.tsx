import { getFormAction } from '@/app/actions';
import { FormDisplay } from '@/components/form-display';
import { notFound } from 'next/navigation';

export default async function FormPage({ params }: { params: { id: string } }) {
  const result = await getFormAction(params.id);

  if (!result || 'error' in result) {
    // In a real app, you might want to show a more specific error page
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
