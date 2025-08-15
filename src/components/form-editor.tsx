'use client';
import type { Dispatch, SetStateAction } from 'react';
import {
  Plus,
  Trash2,
  Sparkles,
  Clipboard,
  ClipboardCheck,
  MoreVertical,
  Copy,
} from 'lucide-react';
import type { FormFlowData, FormField } from '@/lib/types';
import { toCamelCase } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import React, { useState } from 'react';
import { optimizeFormAction } from '@/app/actions';
import { Spinner } from './spinner';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface Props {
  formFlowData: FormFlowData;
  setFormFlowData: Dispatch<SetStateAction<FormFlowData | null>>;
}

const inputTypePlaceholders: Record<FormField['inputType'], string> = {
  text: 'Jawaban singkat',
  email: 'Alamat email',
  number: 'Angka',
  date: 'Tanggal',
  textarea: 'Jawaban panjang',
  select: 'Pilihan',
  file: 'Unggah file',
};

export function FormEditor({ formFlowData, setFormFlowData }: Props) {
  const { title, flow: formFlow } = formFlowData;
  const [optimizing, setOptimizing] = React.useState(false);
  const [suggestions, setSuggestions] = React.useState('');
  const [copied, setCopied] = React.useState(false);
  const [activeFieldId, setActiveFieldId] = useState<string | null>(
    formFlow[0]?.id || null
  );
  const { toast } = useToast();

  const updateField = (id: string, newField: Partial<FormField>) => {
    setFormFlowData((prevData) => {
      if (!prevData) return null;
      return {
        ...prevData,
        flow: prevData.flow.map((field) =>
          field.id === id
            ? {
                ...field,
                ...newField,
                ...(newField.question
                  ? { key: toCamelCase(newField.question) }
                  : {}),
              }
            : field
        ),
      };
    });
  };

  const addField = () => {
    const newField: FormField = {
      id: crypto.randomUUID(),
      question: 'Tanpa judul',
      inputType: 'text',
      validationRules: [],
      key: 'newQuestion',
    };
    setFormFlowData((prev) =>
      prev ? { ...prev, flow: [...prev.flow, newField] } : null
    );
    setActiveFieldId(newField.id);
  };

  const removeField = (id: string) => {
    setFormFlowData((prev) => {
      if (!prev) return null;
      const newFlow = prev.flow.filter((field) => field.id !== id);
      // Set active to the previous field or null if no fields left
      const currentIndex = prev.flow.findIndex((f) => f.id === id);
      const nextActiveId =
        newFlow[currentIndex - 1]?.id || newFlow[0]?.id || null;
      setActiveFieldId(nextActiveId);
      return { ...prev, flow: newFlow };
    });
  };

  const duplicateField = (id: string) => {
    const fieldToDuplicate = formFlow.find((f) => f.id === id);
    if (!fieldToDuplicate) return;

    const duplicatedField = {
      ...fieldToDuplicate,
      id: crypto.randomUUID(),
      question: `${fieldToDuplicate.question} (copy)`,
      key: `${fieldToDuplicate.key}Copy`,
    };

    const currentIndex = formFlow.findIndex((f) => f.id === id);
    const newFlow = [...formFlow];
    newFlow.splice(currentIndex + 1, 0, duplicatedField);
    setFormFlowData((prev) => (prev ? { ...prev, flow: newFlow } : null));
    setActiveFieldId(duplicatedField.id);
  };

  const addOption = (fieldId: string) => {
    setFormFlowData((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        flow: prev.flow.map((field) =>
          field.id === fieldId
            ? { ...field, options: [...(field.options || []), 'Opsi baru'] }
            : field
        ),
      };
    });
  };

  const updateOption = (
    fieldId: string,
    optionIndex: number,
    value: string
  ) => {
    setFormFlowData((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        flow: prev.flow.map((field) => {
          if (field.id === fieldId) {
            const newOptions = [...(field.options || [])];
            newOptions[optionIndex] = value;
            return { ...field, options: newOptions };
          }
          return field;
        }),
      };
    });
  };

  const removeOption = (fieldId: string, optionIndex: number) => {
    setFormFlowData((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        flow: prev.flow.map((field) => {
          if (field.id === fieldId) {
            const newOptions = [...(field.options || [])];
            newOptions.splice(optionIndex, 1);
            return { ...field, options: newOptions };
          }
          return field;
        }),
      };
    });
  };

  const handleOptimize = async () => {
    setOptimizing(true);
    const result = await optimizeFormAction(JSON.stringify(formFlow));
    if (typeof result === 'string') {
      setSuggestions(result);
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.error,
      });
    }
    setOptimizing(false);
  };

  const getShareableLink = () => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}${window.location.pathname}#form=${btoa(
        JSON.stringify(formFlowData)
      )}`;
    }
    return '';
  };

  const copyLink = () => {
    navigator.clipboard.writeText(getShareableLink());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const updateTitle = (newTitle: string) => {
    setFormFlowData((prev) => (prev ? { ...prev, title: newTitle } : null));
  };

  return (
    <Card className="h-full overflow-hidden flex flex-col bg-card">
      <CardHeader className="p-4 border-b flex-row justify-between items-center gap-4">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" onClick={handleOptimize}>
              <Sparkles className="mr-2 h-4 w-4" /> Optimize Flow
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="font-headline">
                Optimization Suggestions
              </AlertDialogTitle>
              <AlertDialogDescription>
                Here are some AI-based suggestions to improve your form's
                conversion rate and user experience.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="max-h-80 overflow-y-auto p-1">
              {optimizing ? (
                <div className="flex items-center justify-center h-20">
                  <Spinner />
                  <span className="ml-2">Generating suggestions...</span>
                </div>
              ) : (
                <p className="whitespace-pre-wrap">{suggestions}</p>
              )}
            </div>
            <AlertDialogFooter>
              <AlertDialogAction>Got it, thanks!</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <div className="flex items-center gap-2">
          <Input value={getShareableLink()} readOnly className="h-9 text-xs" />
          <Button size="sm" onClick={copyLink}>
            {copied ? (
              <ClipboardCheck className="h-4 w-4" />
            ) : (
              <Clipboard className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-2 md:p-3 space-y-3 overflow-y-auto flex-1">
        <div
          className={cn(
            'p-3 md:p-4 border rounded-lg bg-background shadow-sm transition-all relative',
            activeFieldId === 'title' && 'border-primary'
          )}
          onClick={() => setActiveFieldId('title')}
        >
          {activeFieldId === 'title' && (
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-l-lg"></div>
          )}
          <Input
            id="form-title"
            placeholder="Judul Formulir"
            value={title}
            onChange={(e) => updateTitle(e.target.value)}
            className="text-lg font-semibold font-headline border-0 shadow-none focus-visible:ring-0 pl-2"
          />
        </div>

        {formFlow.map((field) => (
          <div
            key={field.id}
            className={cn(
              'rounded-lg bg-background border transition-all relative',
              activeFieldId === field.id && 'border-primary shadow-md'
            )}
            onClick={() => setActiveFieldId(field.id)}
          >
            {activeFieldId === field.id && (
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-l-lg"></div>
            )}
            <div className="p-3 md:p-4">
              {activeFieldId === field.id ? (
                <div className="flex-1 space-y-4">
                  <div className="flex justify-between items-start gap-2">
                    <Input
                      id={`question-${field.id}`}
                      value={field.question}
                      onChange={(e) =>
                        updateField(field.id, { question: e.target.value })
                      }
                      className="text-base font-medium flex-grow border-0 shadow-none focus-visible:ring-0 p-0"
                      placeholder="Pertanyaan"
                    />
                    <div className='flex items-center gap-2'>
                    <Select
                      value={field.inputType}
                      onValueChange={(value) =>
                        updateField(field.id, {
                          inputType: value as FormField['inputType'],
                        })
                      }
                    >
                      <SelectTrigger className="w-[150px] h-9">
                        <SelectValue placeholder="Select input type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Text</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="number">Number</SelectItem>
                        <SelectItem value="date">Date</SelectItem>
                        <SelectItem value="textarea">Textarea</SelectItem>
                        <SelectItem value="select">Select</SelectItem>
                        <SelectItem value="file">File Upload</SelectItem>
                      </SelectContent>
                    </Select>
                     <AlertDialog>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => duplicateField(field.id)}>
                              <Copy className="mr-2 h-4 w-4" />
                              <span>Gandakan</span>
                            </DropdownMenuItem>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem className="text-destructive focus:text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" />
                                <span>Hapus</span>
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                          </DropdownMenuContent>
                        </DropdownMenu>

                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle className="font-headline">
                              Apakah anda yakin?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Tindakan ini tidak bisa dibatalkan. Ini akan
                              menghapus bidang formulir ini secara permanen.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Batal</AlertDialogCancel>
                            <AlertDialogAction onClick={() => removeField(field.id)}>
                              Hapus
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                  {field.inputType === 'select' && (
                    <div className="space-y-2 pl-2">
                      {field.options?.map((option, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <Input
                            value={option}
                            onChange={(e) =>
                              updateOption(field.id, i, e.target.value)
                            }
                            placeholder={`Opsi ${i + 1}`}
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 shrink-0"
                            onClick={() => removeOption(field.id, i)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addOption(field.id)}
                      >
                        <Plus className="mr-2 h-4 w-4" /> Tambah Opsi
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <p className="font-medium">{field.question}</p>
                  <p className="text-sm text-muted-foreground mt-2 border-b border-dashed">
                    {inputTypePlaceholders[field.inputType]}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
        <Button onClick={addField} variant="secondary" className="w-full">
          <Plus className="mr-2 h-4 w-4" /> Tambah Pertanyaan
        </Button>
      </CardContent>
    </Card>
  );
}
