'use client';

import { useState, useEffect } from 'react';
import type { FormFlowData } from '@/lib/types';
import { Header } from '@/components/header';
import { FormGeneratorView } from '@/components/form-generator-view';
import { FormEditorView } from '@/components/form-editor-view';
import { Toaster } from '@/components/ui/toaster';
import { useSearchParams } from 'next/navigation';
import { getFormAction } from '../actions';
import { Spinner } from '@/components/spinner';

export default function CreatePage() {
  const [formFlowData, setFormFlowData] = useState<FormFlowData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingForm, setIsLoadingForm] = useState(true);
  const searchParams = useSearchParams();

  useEffect(() => {
    const formId = searchParams.get('formId');
    if (formId) {
      setIsLoadingForm(true);
      const loadForm = async () => {
        const result = await getFormAction(formId);
        if ('error' in result) {
          console.error(result.error);
        } else if (result) {
          setFormFlowData(result);
        }
        setIsLoadingForm(false);
      };
      loadForm();
    } else {
      setIsLoadingForm(false);
    }
  }, [searchParams]);

  if (isLoadingForm) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Spinner className="h-8 w-8" />
        </main>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6 md:p-8">
        {!formFlowData ? (
          <FormGeneratorView setFormFlowData={setFormFlowData} setIsLoading={setIsLoading} isLoading={isLoading} />
        ) : (
          <FormEditorView formFlowData={formFlowData} setFormFlowData={setFormFlowData} />
        )}
      </main>
      <Toaster />
    </div>
  );
}
