'use client';

import type { Dispatch, SetStateAction } from 'react';
import { FormEditor } from './form-editor';
import { ConversationalForm } from './conversational-form';
import type { FormFlowData } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

interface Props {
  formFlowData: FormFlowData;
  setFormFlowData: Dispatch<SetStateAction<FormFlowData | null>>;
}

export function FormEditorView({ formFlowData, setFormFlowData }: Props) {
  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 lg:gap-8 h-full">
        <div className="flex flex-col gap-4">
          <h2 className="text-2xl font-bold font-headline">Form Editor</h2>
          <FormEditor
            formFlowData={formFlowData}
            setFormFlowData={setFormFlowData}
          />
        </div>
        <div className="hidden lg:flex flex-col gap-4">
          <h2 className="text-2xl font-bold font-headline">Live Preview</h2>
          <div className="lg:h-[75vh] h-[80vh] w-full max-w-lg mx-auto lg:max-w-none">
            <ConversationalForm formFlowData={formFlowData} />
          </div>
        </div>
      </div>

      {/* Mobile-only Floating Action Button and Sheet */}
      <div className="lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button
              className="fixed bottom-4 right-4 h-14 w-14 rounded-full shadow-lg z-50"
              size="icon"
            >
              <Eye className="h-6 w-6" />
              <span className="sr-only">Live Preview</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[90vh] flex flex-col p-0">
            <SheetHeader className='p-4 border-b'>
              <SheetTitle className='font-headline'>Live Preview</SheetTitle>
            </SheetHeader>
            <div className="flex-1 p-4">
               <ConversationalForm formFlowData={formFlowData} />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
