'use client';

import type { Dispatch, SetStateAction } from 'react';
import { FormEditor } from './form-editor';
import { ConversationalForm } from './conversational-form';
import type { FormFlow } from '@/lib/types';

interface Props {
  formFlow: FormFlow;
  setFormFlow: Dispatch<SetStateAction<FormFlow | null>>;
}

export function FormEditorView({ formFlow, setFormFlow }: Props) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
      <div className="h-full">
        <h2 className="text-2xl font-bold mb-4">Form Editor</h2>
        <FormEditor formFlow={formFlow} setFormFlow={setFormFlow} />
      </div>
      <div className="h-full">
        <h2 className="text-2xl font-bold mb-4">Live Preview</h2>
        <div className="h-[75vh] w-full max-w-lg mx-auto">
          <ConversationalForm formFlow={formFlow} />
        </div>
      </div>
    </div>
  );
}
