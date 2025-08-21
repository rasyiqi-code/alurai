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
  Type,
  Mail,
  Baseline,
  Calendar as CalendarIcon,
  FileText,
  ChevronDown,
  Upload,
  Hash,
  Save,
  Send,
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
import React from 'react';
import { optimizeFormAction, saveFormAction } from '@/app/actions';
import { Spinner } from './spinner';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar } from './ui/calendar';
import { Label } from './ui/label';
import { format } from 'date-fns';

interface Props {
  formFlowData: FormFlowData;
  setFormFlowData: Dispatch<SetStateAction<FormFlowData | null>>;
}

const inputTypePlaceholders: Record<FormField['inputType'], string> = {
  text: 'Short answer',
  email: 'Email address',
  number: 'Number',
  date: 'Date',
  textarea: 'Long answer',
  select: 'Choice',
  file: 'File upload',
};

const inputTypeIcons: Record<FormField['inputType'], React.ElementType> = {
  text: Type,
  email: Mail,
  number: Hash,
  date: CalendarIcon,
  textarea: FileText,
  select: ChevronDown,
  file: Upload,
};

export function FormEditor({ formFlowData, setFormFlowData }: Props) {
  const { title, flow: formFlow } = formFlowData;
  const [optimizing, setOptimizing] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [suggestions, setSuggestions] = React.useState('');
  const [copied, setCopied] = React.useState(false);
  const [activeFieldId, setActiveFieldId] = React.useState<string | null>(
    null
  );
  const { toast } = useToast();
  
  React.useEffect(() => {
    if (formFlow.length > 0 && !activeFieldId) {
      setActiveFieldId(formFlow[0].id);
    }
  }, [formFlow, activeFieldId]);

  React.useEffect(() => {
    // This effect ensures that if the active field is deleted,
    // we select another one to avoid a UI dead state.
    if (formFlow.length > 0 && !formFlow.some(f => f.id === activeFieldId)) {
        setActiveFieldId(formFlow[0].id);
    } else if (formFlow.length === 0) {
        setActiveFieldId(null);
    }
  }, [formFlow, activeFieldId]);


  const updateField = (id: string, newField: Partial<FormField>) => {
    setFormFlowData((prevData) => {
      if (!prevData) return null;
      return {
        ...prevData,
        flow: prevData.flow.map((field) => {
          if (field.id === id) {
            const updatedField = {
              ...field,
              ...newField,
              ...(newField.question
                ? { key: toCamelCase(newField.question) }
                : {}),
            };
            
            // Auto-update validationRules when inputType changes
            if (newField.inputType && newField.inputType !== field.inputType) {
              const currentRules = field.validationRules || [];
              let newRules = [...currentRules];
              
              // Remove old type-specific validation rules
              const typeSpecificRules = ['email', 'number', 'date', 'file'];
              newRules = newRules.filter(rule => !typeSpecificRules.includes(rule));
              
              // Add new type-specific validation rules based on inputType
              switch (newField.inputType) {
                case 'email':
                  if (!newRules.includes('email')) {
                    newRules.push('email');
                  }
                  break;
                case 'number':
                  if (!newRules.includes('number')) {
                    newRules.push('number');
                  }
                  break;
                case 'date':
                  if (!newRules.includes('date')) {
                    newRules.push('date');
                  }
                  break;
                case 'file':
                  if (!newRules.includes('file')) {
                    newRules.push('file');
                  }
                  break;
                // text, textarea, select don't need specific validation rules by default
                default:
                  break;
              }
              
              updatedField.validationRules = newRules;
            }
            
            return updatedField;
          }
          return field;
        }),
      };
    });
  };

  const addField = () => {
    const newField: FormField = {
      id: crypto.randomUUID(),
      question: 'Untitled Question',
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
    const fieldToRemove = formFlow.find((f) => f.id === id);
    if (!fieldToRemove) return;

    setFormFlowData((prev) => {
      if (!prev) return null;
      const newFlow = prev.flow.filter((field) => field.id !== id);
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
            ? { ...field, options: [...(field.options || []), 'New Option'] }
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

  const handleSave = async (publish = false) => {
    setSaving(true);
    
    const dataToSave = {
        ...formFlowData,
        status: publish ? 'published' : formFlowData.status || 'draft',
    };

    const result = await saveFormAction(dataToSave);

    if ('id' in result) {
      setFormFlowData(prev => prev ? {...dataToSave, id: result.id} : null);
      toast({
        title: 'Success',
        description: `Your form has been ${publish ? 'published' : 'saved'}.`,
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.error,
      });
    }
    setSaving(false);
    return 'id' in result;
  };

  const handlePublish = async () => {
    const success = await handleSave(true);
    if(success) {
        // Potentially close the popover here if needed
    }
  }

  const getShareableLink = () => {
    if (typeof window !== 'undefined' && formFlowData.id) {
      if (formFlowData.slug) {
        return `${window.location.origin}/view/${formFlowData.slug}`;
      }
      return `${window.location.origin}/form/${formFlowData.id}`;
    }
    return 'Save the form to get a shareable link';
  };

  const copyLink = () => {
    if (!formFlowData.id) {
       toast({
        variant: 'destructive',
        title: 'Cannot Copy Link',
        description: 'Please save the form first to generate a shareable link.',
      });
      return;
    }
    navigator.clipboard.writeText(getShareableLink());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const updateTitle = (newTitle: string) => {
    setFormFlowData((prev) => (prev ? { ...prev, title: newTitle } : null));
  };
  
  const setDate = (field: 'publishStartTime' | 'publishEndTime', date?: Date) => {
    setFormFlowData(prev => {
        if (!prev) return null;
        return { ...prev, [field]: date?.toISOString() };
    });
  }

  return (
    <Card className="h-full overflow-hidden flex flex-col bg-card border-0 shadow-none">
      <CardHeader className="p-4 border-b">
         <div className="overflow-x-auto whitespace-nowrap">
          <div className="flex justify-between items-center gap-4 min-w-[500px]">
            <div className='flex items-center gap-2'>
              <Button variant="outline" onClick={() => handleSave()} disabled={saving}>
                {saving ? <Spinner className='mr-2 h-4 w-4' /> : <Save className="mr-2 h-4 w-4" />}
                {saving ? 'Saving...' : 'Save Draft'}
              </Button>
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
               <Popover>
                <PopoverTrigger asChild>
                  <Button>
                    <Send className="mr-2 h-4 w-4" />
                    Publish
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <h4 className="font-medium leading-none font-headline">Publish Settings</h4>
                      <p className="text-sm text-muted-foreground">
                        Set a window for when your form will be available.
                      </p>
                    </div>
                    <div className="grid gap-2">
                      <div className="grid grid-cols-3 items-center gap-4">
                        <Label htmlFor="start-date">Start</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                variant={"outline"}
                                className={cn(
                                    "w-[160px] justify-start text-left font-normal col-span-2",
                                    !formFlowData.publishStartTime && "text-muted-foreground"
                                )}
                                >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {formFlowData.publishStartTime ? format(new Date(formFlowData.publishStartTime), "PPP") : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                mode="single"
                                selected={formFlowData.publishStartTime ? new Date(formFlowData.publishStartTime) : undefined}
                                onSelect={(date) => setDate('publishStartTime', date)}
                                initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                      </div>
                      <div className="grid grid-cols-3 items-center gap-4">
                        <Label htmlFor="end-date">End</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                variant={"outline"}
                                className={cn(
                                    "w-[160px] justify-start text-left font-normal col-span-2",
                                    !formFlowData.publishEndTime && "text-muted-foreground"
                                )}
                                >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {formFlowData.publishEndTime ? format(new Date(formFlowData.publishEndTime), "PPP") : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                mode="single"
                                selected={formFlowData.publishEndTime ? new Date(formFlowData.publishEndTime) : undefined}
                                onSelect={(date) => setDate('publishEndTime', date)}
                                initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                    <Button onClick={handlePublish} disabled={saving}>
                        {saving ? <Spinner className="mr-2 h-4 w-4" /> : null}
                        Save & Publish
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex items-center gap-2">
              <Input value={getShareableLink()} readOnly className="h-9 text-xs" />
              <Button size="icon" className="h-9 w-9" onClick={copyLink}>
                {copied ? (
                  <ClipboardCheck className="h-4 w-4" />
                ) : (
                  <Clipboard className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-0 pt-2 md:pt-3 space-y-2 overflow-y-auto flex-1">
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
            placeholder="Form Title"
            value={title}
            onChange={(e) => updateTitle(e.target.value)}
            className="text-lg font-semibold font-headline border-0 shadow-none focus-visible:ring-0 pl-2"
          />
        </div>

        {formFlow.map((field) => {
          const Icon = inputTypeIcons[field.inputType];
          return (
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
                    <div className="flex justify-between items-start gap-1">
                      <Input
                        id={`question-${field.id}`}
                        value={field.question}
                        onChange={(e) =>
                          updateField(field.id, { question: e.target.value })
                        }
                        className="text-base font-medium flex-grow border-0 shadow-none focus-visible:ring-0 p-0"
                        placeholder="Question"
                      />
                      <div className="flex items-center gap-1">
                        <Select
                          value={field.inputType}
                          onValueChange={(value) =>
                            updateField(field.id, {
                              inputType: value as FormField['inputType'],
                            })
                          }
                        >
                          <SelectTrigger className="w-9 h-9 p-0 justify-center border-0 shadow-none focus-visible:ring-0">
                            <SelectValue asChild>
                              <Icon className="h-4 w-4" />
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(inputTypeIcons).map(
                              ([key, IconComponent]) => (
                                <SelectItem key={key} value={key}>
                                  <div className="flex items-center gap-2">
                                    <IconComponent className="h-4 w-4" />
                                    <span>
                                      {key.charAt(0).toUpperCase() + key.slice(1)}
                                    </span>
                                  </div>
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
                        <AlertDialog>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 shrink-0"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem
                                onClick={() => duplicateField(field.id)}
                              >
                                <Copy className="mr-2 h-4 w-4" />
                                <span>Duplicate</span>
                              </DropdownMenuItem>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem className="text-destructive focus:text-destructive">
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  <span>Delete</span>
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                            </DropdownMenuContent>
                          </DropdownMenu>

                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle className="font-headline">
                                Are you sure?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will
                                permanently delete this form field.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => removeField(field.id)}
                              >
                                Delete
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
                              placeholder={`Option ${i + 1}`}
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
                          <Plus className="mr-2 h-4 w-4" /> Add Option
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
          );
        })}
        <Button onClick={addField} variant="secondary" className="w-full">
          <Plus className="mr-2 h-4 w-4" /> Add Question
        </Button>
      </CardContent>
    </Card>
  );
}
