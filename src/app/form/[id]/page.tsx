import { getFormAction } from '@/app/actions';
import { ConversationalForm } from '@/components/conversational-form';
import { Header } from '@/components/header';
import { notFound } from 'next/navigation';

export default async function FormPage({ params }: { params: { id: string } }) {
  const result = await getFormAction(params.id);

  if (!result || 'error' in result) {
    // In a real app, you might want to show a more specific error page
    return notFound();
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl h-[85vh]">
          <ConversationalForm formFlowData={result} />
        </div>
      </main>
    </div>
  );
}