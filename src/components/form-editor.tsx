'use client';
import type { Dispatch, SetStateAction } from 'react';
import {
  GripVertical,
  Plus,
  Trash2,
  Sparkles,
  Clipboard,
  ClipboardCheck,
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
import { Label } from '@/components/ui/label';
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
import React from 'react';
import { optimizeFormAction } from '@/app/actions';
import { Spinner } from './spinner';
import { useToast } from '@/hooks/use-toast';

interface Props {
  formFlowData: FormFlowData;
  setFormFlowData: Dispatch<SetStateAction<FormFlowData | null>>;
}

export function FormEditor({ formFlowData, setFormFlowData }: Props) {
  const { title, flow: formFlow } = formFlowData;
  const [optimizing, setOptimizing] = React.useState(false);
  const [suggestions, setSuggestions] = React.useState('');
  const [copied, setCopied] = React.useState(false);
  const { toast } = useToast();

  const updateField = (id: string, newField: Partial<FormField>) => {
    setFormFlowData(
      (prevData) => {
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
          )
        }
      }
    );
  };

  const addField = () => {
    const newField: FormField = {
      id: crypto.randomUUID(),
      question: 'Pertanyaan Baru',
      inputType: 'text',
      validationRules: [],
      key: 'newQuestion',
    };
    setFormFlowData((prev) => prev ? { ...prev, flow: [...prev.flow, newField] } : null);
  };

  const removeField = (id: string) => {
    setFormFlowData((prev) => prev ? { ...prev, flow: prev.flow.filter((field) => field.id !== id)} : null);
  };

  const addOption = (fieldId: string) => {
    setFormFlowData(
      (prev) => {
        if (!prev) return null;
        return {
          ...prev,
          flow: prev.flow.map((field) =>
          field.id === fieldId
            ? { ...field, options: [...(field.options || []), 'Opsi Baru'] }
            : field
        )}
      }
    );
  };

  const updateOption = (fieldId: string, optionIndex: number, value: string) => {
    setFormFlowData(
      (prev) => {
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
        })}
      }
    );
  };

  const removeOption = (fieldId: string, optionIndex: number) => {
    setFormFlowData(
      (prev) => {
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
        })}
      }
    );
  };

  const handleOptimize = async () => {
    setOptimizing(true);
    const result = await optimizeFormAction(JSON.stringify(formFlow));
    if (typeof result === 'string') {
      setSuggestions(result);
    } else {
      toast({ variant: 'destructive', title: 'Error', description: result.error });
    }
    setOptimizing(false);
  };

  const getShareableLink = () => {
    if (typeof window !== 'undefined') {
      // In a real app, this would point to a unique URL for the saved form.
      // For this demo, we'll encode the form flow in the URL hash.
      return `${window.location.origin}${window.location.pathname}#form=${btoa(JSON.stringify(formFlowData))}`;
    }
    return '';
  };

  const copyLink = () => {
    navigator.clipboard.writeText(getShareableLink());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const updateTitle = (newTitle: string) => {
    setFormFlowData(prev => prev ? {...prev, title: newTitle} : null);
  }

  return (
    <Card className="h-full overflow-hidden flex flex-col">
      <CardHeader className="p-4 border-b flex-row justify-between items-center gap-4">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" onClick={handleOptimize}>
              <Sparkles className="mr-2 h-4 w-4" /> Optimalkan Alur
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Saran Pengoptimalan</AlertDialogTitle>
              <AlertDialogDescription>
                Berikut adalah beberapa saran berbasis AI untuk meningkatkan tingkat konversi dan pengalaman pengguna formulir Anda.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="max-h-80 overflow-y-auto p-1">
              {optimizing ? (
                <div className="flex items-center justify-center h-20">
                  <Spinner />
                  <span className="ml-2">Membuat saran...</span>
                </div>
              ) : (
                <p className="whitespace-pre-wrap">{suggestions}</p>
              )}
            </div>
            <AlertDialogFooter>
              <AlertDialogAction>Mengerti, terima kasih!</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <div className="flex items-center gap-2">
          <Input value={getShareableLink()} readOnly className="h-9 text-xs" />
          <Button size="sm" onClick={copyLink}>
            {copied ? <ClipboardCheck className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-4 overflow-y-auto flex-1">
        <div className="p-4 border rounded-lg bg-card shadow-sm">
          <Label htmlFor="form-title">Judul Formulir</Label>
          <Input
            id="form-title"
            value={title}
            onChange={(e) => updateTitle(e.target.value)}
            className="text-lg font-semibold"
          />
        </div>
        {formFlow.map((field) => (
          <div key={field.id} className="p-4 border rounded-lg bg-card shadow-sm">
            <div className="flex items-start gap-2">
              <GripVertical className="mt-2.5 h-5 w-5 text-muted-foreground cursor-grab" />
              <div className="flex-1 space-y-4">
                <div className="flex justify-between items-start">
                  <div className='w-full'>
                    <Label htmlFor={`question-${field.id}`}>Pertanyaan</Label>
                    <Input
                      id={`question-${field.id}`}
                      value={field.question}
                      onChange={(e) =>
                        updateField(field.id, { question: e.target.value })
                      }
                      className="text-base"
                    />
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="ml-2 shrink-0">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tindakan ini tidak dapat dibatalkan. Ini akan menghapus bidang formulir ini secara permanen.
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
                <div>
                  <Label htmlFor={`inputType-${field.id}`}>Tipe Input</Label>
                  <Select
                    value={field.inputType}
                    onValueChange={(value) =>
                      updateField(field.id, {
                        inputType: value as FormField['inputType'],
                      })
                    }
                  >
                    <SelectTrigger id={`inputType-${field.id}`}>
                      <SelectValue placeholder="Pilih tipe input" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Teks</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="number">Angka</SelectItem>
                      <SelectItem value="date">Tanggal</SelectItem>
                      <SelectItem value="textarea">Textarea</SelectItem>
                      <SelectItem value="select">Pilihan</SelectItem>
                      <SelectItem value="file">Unggah File</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {field.inputType === 'select' && (
                  <div className="space-y-2 pl-4 border-l-2 ml-2">
                    <Label>Opsi</Label>
                    {field.options?.map((option, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <Input
                          value={option}
                          onChange={(e) => updateOption(field.id, i, e.target.value)}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeOption(field.id, i)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button variant="outline" size="sm" onClick={() => addOption(field.id)}>
                      <Plus className="mr-2 h-4 w-4" /> Tambah Opsi
                    </Button>
                  </div>
                )}
              </div>
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
