'use client';

import type { Dispatch, SetStateAction } from 'react';
import { FormEditor } from './form-editor';
import { ConversationalForm } from './conversational-form';
import type { FormFlowData } from '@/lib/types';
import { Separator } from './ui/separator';

interface Props {
  formFlowData: FormFlowData;
  setFormFlowData: Dispatch<SetStateAction<FormFlowData | null>>;
}

export function FormEditorView({ formFlowData, setFormFlowData }: Props) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 h-full">
      <div className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold font-headline">Form Editor</h2>
        <FormEditor formFlowData={formFlowData} setFormFlowData={setFormFlowData} />
      </div>
      <div className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold font-headline">Live Preview</h2>
        <div className="lg:h-[75vh] h-[80vh] w-full max-w-lg mx-auto lg:max-w-none">
          <ConversationalForm formFlowData={formFlowData} />
        </div>
      </div>
    </div>
  );
}
