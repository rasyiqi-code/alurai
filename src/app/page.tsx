'use client';

import { useState } from 'react';
import type { FormFlow } from '@/lib/types';
import { Header } from '@/components/header';
import { FormGeneratorView } from '@/components/form-generator-view';
import { FormEditorView } from '@/components/form-editor-view';
import { Toaster } from '@/components/ui/toaster';


export default function Home() {
  const [formFlow, setFormFlow] = useState<FormFlow | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 container mx-auto p-4 md:p-8">
        {!formFlow ? (
          <FormGeneratorView setFormFlow={setFormFlow} setIsLoading={setIsLoading} isLoading={isLoading} />
        ) : (
          <FormEditorView formFlow={formFlow} setFormFlow={setFormFlow} />
        )}
      </main>
      <Toaster />
    </div>
  );
}
