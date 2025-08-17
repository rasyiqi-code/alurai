import { getFormAction } from '@/app/actions';
import { FormDisplay } from '@/components/form-display';
import { notFound } from 'next/navigation';
import Image from 'next/image';


export default async function FormPage({ params }: { params: { id: string } }) {
  const formId = params.id;
  const result = await getFormAction(formId);

  if (!result || 'error' in result) {
    // In a real app, you might want to show a more specific error page
    return notFound();
  }

  return (
     <div className="min-h-screen w-full bg-muted flex items-center justify-center p-4">
      <div className="grid grid-cols-1 lg:grid-cols-5 w-full max-w-7xl mx-auto gap-8">
        
        {/* Left Branding Panel */}
        <div className="hidden lg:flex col-span-1 items-center justify-center">
            <div className="w-full h-96 relative">
                 <Image src="https://placehold.co/400x600.png" alt="Branding asset" layout="fill" objectFit="cover" className="rounded-lg" data-ai-hint="abstract texture" />
            </div>
        </div>

        {/* Form Display Area */}
        <div className="w-full col-span-1 lg:col-span-3 flex flex-col items-center justify-center gap-4">
          <h1 className="text-xl md:text-2xl font-bold font-headline text-center">{result.title}</h1>
          <main className="h-screen w-full md:h-[85vh] md:max-w-lg md:rounded-xl md:shadow-2xl overflow-hidden">
            <FormDisplay formFlowData={result} />
          </main>
        </div>

         {/* Right Branding Panel */}
        <div className="hidden lg:flex col-span-1 items-center justify-center">
             <div className="w-full h-96 relative">
                 <Image src="https://placehold.co/400x600.png" alt="Branding asset" layout="fill" objectFit="cover" className="rounded-lg" data-ai-hint="geometric pattern" />
            </div>
        </div>

      </div>
    </div>
  );
}
