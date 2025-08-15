'use client';

import type { Dispatch, SetStateAction } from 'react';
import { FormEditor } from './form-editor';
import { ConversationalForm } from './conversational-form';
import type { FormFlowData } from '@/lib/types';

interface Props {
  formFlowData: FormFlowData;
  setFormFlowData: Dispatch<SetStateAction<FormFlowData | null>>;
}

export function FormEditorView({ formFlowData, setFormFlowData }: Props) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
      <div className="h-full">
        <h2 className="text-2xl font-bold mb-4">Editor Formulir</h2>
        <FormEditor formFlowData={formFlowData} setFormFlowData={setFormFlowData} />
      </div>
      <div className="h-full">
        <h2 className="text-2xl font-bold mb-4">Pratinjau Langsung</h2>
        <div className="h-[75vh] w-full max-w-lg mx-auto">
          <ConversationalForm formFlowData={formFlowData} />
        </div>
      </div>
    </div>
  );
}
