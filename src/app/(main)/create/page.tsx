'use client';

import { useState, useEffect } from 'react';
import type { FormFlowData } from '@/lib/types';
import { FormGeneratorView } from '@/components/form-generator-view';
import { FormEditorView } from '@/components/form-editor-view';
import { Toaster } from '@/components/ui/toaster';
import { useSearchParams } from 'next/navigation';
import { getFormAction } from '../../actions';
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
        if (result && 'error' in result) {
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
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 md:p-8">
      {!formFlowData ? (
        <FormGeneratorView setFormFlowData={setFormFlowData} setIsLoading={setIsLoading} isLoading={isLoading} />
      ) : (
        <FormEditorView formFlowData={formFlowData} setFormFlowData={setFormFlowData} />
      )}
      <Toaster />
    </div>
  );
}
