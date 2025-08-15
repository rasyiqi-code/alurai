'use client';

import { useState } from 'react';
import type { FormFlowData } from '@/lib/types';
import { Header } from '@/components/header';
import { FormGeneratorView } from '@/components/form-generator-view';
import { FormEditorView } from '@/components/form-editor-view';
import { Toaster } from '@/components/ui/toaster';


export default function Home() {
  const [formFlowData, setFormFlowData] = useState<FormFlowData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 container mx-auto p-4 md:p-8">
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
