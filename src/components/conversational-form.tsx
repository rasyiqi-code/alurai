
'use client';
import React, { useState, useRef, useEffect } from 'react';
import type { FormFlowData, FormField, FormAnswers, ExtractedPair } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MinioUpload, MinioUploadedFile } from './minio-upload';
import { Send, CheckCircle, Bot, RefreshCw, RotateCcw, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DataParser } from './data-parser';
import { saveSubmissionAction, validateAnswerAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Spinner } from './spinner';
import { ScrollArea, ScrollBar } from './ui/scroll-area';


interface Props {
  formFlowData: FormFlowData;
}

type Message = {
  type: 'bot' | 'user';
  content: React.ReactNode;
  isThinking?: boolean;
};

export function ConversationalForm({ formFlowData }: Props) {
  const { title, flow: formFlow, id: formId } = formFlowData;
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<FormAnswers>({});
  const [messages, setMessages] = useState<Message[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [suggestedAnswers, setSuggestedAnswers] = useState<ExtractedPair[] | null>(null);

  const [minioFiles, setMinioFiles] = useState<MinioUploadedFile[]>([]);
  const [isStateLoaded, setIsStateLoaded] = useState(false);
  const [isStateRestored, setIsStateRestored] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Generate storage key based on form ID
  const getStorageKey = () => `form_state_${formId}`;

  // Save state to localStorage
  const saveFormState = () => {
    if (!formId || !isStateLoaded) return;
    
    const stateToSave = {
      currentStep,
      answers,
      messages: messages.map(msg => ({
        ...msg,
        content: typeof msg.content === 'string' ? msg.content : '[Complex Content]'
      })),
      isCompleted,
      isSubmitted,
      suggestedAnswers,
      minioFiles,
      timestamp: Date.now()
    };
    
    try {
      localStorage.setItem(getStorageKey(), JSON.stringify(stateToSave));
    } catch (error) {
      console.warn('Failed to save form state:', error);
    }
  };

  // Load state from localStorage
  const loadFormState = () => {
    if (!formId) return false;
    
    try {
      const savedState = localStorage.getItem(getStorageKey());
      if (!savedState) return false;
      
      const parsedState = JSON.parse(savedState);
      
      // Check if saved state is not too old (24 hours)
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
      if (Date.now() - parsedState.timestamp > maxAge) {
        localStorage.removeItem(getStorageKey());
        return false;
      }
      
      setCurrentStep(parsedState.currentStep || 0);
      setAnswers(parsedState.answers || {});
      setMessages(parsedState.messages || []);
      setIsCompleted(parsedState.isCompleted || false);
      setIsSubmitted(parsedState.isSubmitted || false);
      setSuggestedAnswers(parsedState.suggestedAnswers || null);
      setMinioFiles(parsedState.minioFiles || []);
      setIsStateRestored(true);
      
      // Show toast notification
      setTimeout(() => {
        toast({
          title: 'Form Progress Restored',
          description: 'Your previous form progress has been restored.',
          duration: 3000,
        });
      }, 500);
      
      return true;
    } catch (error) {
      console.warn('Failed to load form state:', error);
      localStorage.removeItem(getStorageKey());
      return false;
    }
  };

  // Clear saved state
  const clearFormState = () => {
    if (!formId) return;
    localStorage.removeItem(getStorageKey());
  };

  // Handle MinIO file upload
  const handleMinioUpload = (files: MinioUploadedFile[]) => {
    setMinioFiles(files);
    
    const currentField = formFlow[currentStep];
    if (!currentField) return;
    
    // Update answers with MinIO file data (JSON string)
    const answerValue = files.length > 0 ? JSON.stringify(files) : '';
    
    setAnswers(prev => ({
      ...prev,
      [currentField.key]: answerValue
    }));
    
    // Auto proceed to next step if files are uploaded
    if (files.length > 0) {
      validateAndProceed(currentField, answerValue, { [currentField.key]: answerValue });
    }
  };

  useEffect(() => {
    // Load saved state first, then start form if no saved state
    const hasLoadedState = loadFormState();
    setIsStateLoaded(true);
    
    if (!hasLoadedState) {
      startForm();
    }
  }, [formFlow]);

  useEffect(() => {
    // Scroll to bottom when messages change
    const scrollToBottom = () => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    };
    
    // Use setTimeout to ensure DOM is updated
    const timeoutId = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timeoutId);
  }, [messages]);

  // Save state whenever important state changes
  useEffect(() => {
    saveFormState();
  }, [currentStep, answers, messages, isCompleted, isSubmitted, suggestedAnswers, minioFiles, isStateLoaded]);

  const startForm = (isRestart = false) => {
    setCurrentStep(0);
    setAnswers({});
    setIsCompleted(false);
    setIsSubmitted(false);
    setIsSubmitting(false);
    setMinioFiles([]);
    if (!isRestart) {
       setSuggestedAnswers(null);
    }
    if (formFlow.length > 0) {
      setMessages([{ type: 'bot', content: formFlow[0].question }]);
    } else {
      setMessages([]);
    }
    
    // Clear saved state when restarting
    if (isRestart) {
      clearFormState();
      setIsStateRestored(false);
    }
  };
  
  const handleDataParsed = (parsedData: ExtractedPair[]) => {
    setMessages(prev => [
        ...prev,
        { type: 'bot', content: "Great! I've analyzed your text. I'll show suggestions for each step." }
    ]);
    
    setTimeout(() => {
        setSuggestedAnswers(parsedData);
        setCurrentStep(0);
        setAnswers({});
        setIsCompleted(false);
        setMessages([{ type: 'bot', content: formFlow[0].question }]);
    }, 100);
  };

  const handleSubmission = async () => {
    if (!formId) {
      toast({ variant: 'destructive', title: 'Cannot Submit', description: 'This form has not been saved yet.' });
      return;
    }
    setIsSubmitting(true);
    
    const result = await saveSubmissionAction(formId, answers);
    setIsSubmitting(false);

    if ('error' in result) {
      toast({ variant: 'destructive', title: 'Submission Failed', description: result.error });
      setMessages(prev => [...prev, { type: 'bot', content: 'Sorry, there was an error submitting your form. Please try again.'}]);
    } else {
      setIsSubmitted(true);
      setMessages(prev => [...prev, { type: 'user', content: 'Submit Form' }, { type: 'bot', content: 'Thank you for completing the form! Your submission has been received.'}]);
      
      // Clear saved state after successful submission
      setTimeout(() => {
        clearFormState();
      }, 1000);
    }
  };
  
  const proceedToNextStep = (updatedAnswers: FormAnswers) => {
    const newAnswers = { ...answers, ...updatedAnswers };
    setAnswers(newAnswers);

    if (currentStep < formFlow.length - 1) {
        const nextStep = currentStep + 1;
        setCurrentStep(nextStep);
    } else {
        setIsCompleted(true);
        setMessages(prev => [...prev, { type: 'bot', content: 'Great, that\'s all the questions. Please click Submit to finish.'}]);
    }
  };

  const validateAndProceed = async (field: FormField, answer: any, currentAnswers: FormAnswers) => {
     const answerContent =
      field.inputType === 'file'
        ? (answer?.fileName || (answer as File)?.name || 'File attached')
        : String(answer || '');

    setIsValidating(true);
    setMessages(prev => [...prev, { type: 'user', content: answerContent }, {type: 'bot', content: <Spinner />, isThinking: true}]);

    const validationResult = await validateAnswerAction(field, answerContent);

    setMessages(prev => prev.filter(m => !m.isThinking));

    if ('error' in validationResult) {
        toast({ variant: 'destructive', title: 'Validation Error', description: validationResult.error });
        // Don't add the bot thinking message back, just remove user's wrong answer
        setMessages(prev => [...prev.slice(0, -1)]);
    } else if (validationResult.isValid) {
        if (currentStep < formFlow.length - 1) {
             setMessages(prev => [...prev, { type: 'bot', content: formFlow[currentStep + 1].question }]);
        }
        proceedToNextStep(currentAnswers);
    } else {
        // Remove user message, add feedback
        setMessages(prev => [...prev.slice(0,-1), { type: 'bot', content: validationResult.feedback }]);
    }
    setIsValidating(false);
  }

  const handleNextStep = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isValidating) return;
    
    const currentField = formFlow[currentStep];
    const answer = answers[currentField.key];

    // For file inputs, check if files are uploaded
    if (currentField.inputType === 'file') {
      if (minioFiles.length === 0 && currentField.validationRules.includes('required')) {
        toast({
          variant: 'destructive',
          title: 'Please upload at least one file.',
        });
        return;
      }
      // File upload already handled by handleMinioUpload, no need to proceed here
      return;
    }

    if (!answer && currentField.validationRules.includes('required')) {
        toast({
            variant: 'destructive',
            title: 'This field is required.',
        });
        return;
    }
    
    validateAndProceed(currentField, answer, { [currentField.key]: answer });
  };
  
  const handleSuggestionClick = (value: string) => {
    const currentField = formFlow[currentStep];
    const newAnswers = { ...answers, [currentField.key]: value };
    setAnswers(newAnswers);
  };
  
  const handleRadioSelect = (field: FormField, value: string) => {
    if (isValidating) return;
    setAnswers(prev => ({ ...prev, [field.key]: value }));
    validateAndProceed(field, value, { [field.key]: value });
  }

  const renderSuggestions = () => {
    if (!suggestedAnswers || suggestedAnswers.length === 0) {
      return null;
    }
    
    return (
        <ScrollArea className="w-full whitespace-nowrap rounded-md mb-2">
            <div className="flex w-max space-x-2 pb-2">
                {suggestedAnswers.map((suggestion, index) => (
                    <Button 
                        key={`${suggestion.key}-${index}`} 
                        size="sm" 
                        variant="outline"
                        className="h-auto py-1 px-3 text-xs"
                        onClick={() => handleSuggestionClick(suggestion.value)}
                    >
                        {suggestion.value}
                    </Button>
                ))}
            </div>
            <ScrollBar orientation="horizontal" />
        </ScrollArea>
    )
  }



  const renderInput = (field: FormField) => {
    // Ensure value is always a string to prevent controlled/uncontrolled error for text-based inputs
    const value = (answers[field.key] as string) || '';

    // 'select' type is handled in renderFooterContent, so we don't render it here.
    if (field.inputType === 'select') {
      return null;
    }
    
    switch (field.inputType) {
      case 'textarea':
        return <Textarea value={value} onChange={(e) => setAnswers({ ...answers, [field.key]: e.target.value })} placeholder="Type your answer here..." />;
      case 'file':
        return (
          <MinioUpload 
            formId={formFlowData.id || ''}
            onFilesUploaded={handleMinioUpload}
            maxFiles={5}
            maxFileSize={10 * 1024 * 1024}
          />
        );
      default:
        return <Input type={field.inputType} value={value} onChange={(e) => setAnswers({ ...answers, [field.key]: e.target.value })} placeholder="Type your answer here..." />;
    }
  };

  const renderFooterContent = () => {
    if (isCompleted) {
       return (
        <div className="w-full flex flex-col items-center gap-4">
          <Button onClick={handleSubmission} size="lg" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? <Spinner className='mr-2' /> : <Send className="h-4 w-4 mr-2" />}
            {isSubmitting ? 'Submitting...' : 'Submit Form'}
          </Button>
        </div>
      );
    }
    
    if (formFlow.length === 0 || currentStep >= formFlow.length) return null;

    const currentField = formFlow[currentStep];

    // Handle 'select' type as quick replies in the footer
    if (currentField.inputType === 'select') {
      return (
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex w-max space-x-2 pb-2">
            {currentField.options?.map(opt => (
              <Button
                key={opt}
                variant="outline"
                size="sm"
                disabled={isValidating}
                onClick={() => handleRadioSelect(currentField, opt)}
              >
                {opt}
              </Button>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      );
    }

    return (
      <form onSubmit={handleNextStep} className="w-full flex flex-col gap-2">
        <div>
          {renderSuggestions()}
          {renderInput(currentField)}
        </div>
        <div className='flex items-center justify-between'>
          <DataParser formFlow={formFlow} onDataParsed={handleDataParsed} />
          {currentField.inputType !== 'file' && (
            <Button type="submit" size="sm" disabled={isValidating}>
              {isValidating ? <Spinner /> : <Send className="h-4 w-4 mr-2" />}
              {isValidating ? '' : (currentStep === formFlow.length - 1 ? 'Finish' : 'Next')}
            </Button>
          )}
        </div>
      </form>
    );
  }

  return (
    <Card className="h-full w-full flex flex-col shadow-none bg-card rounded-none md:rounded-xl border-0">
      {isStateRestored && (
        <div className="border-b bg-blue-50 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2 text-blue-700 text-sm">
            <Info size={16} />
            <span>Form progress restored from previous session</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                clearFormState();
                setIsStateRestored(false);
                startForm(true);
              }}
              className="text-blue-700 hover:text-blue-900 hover:bg-blue-100"
            >
              <RotateCcw size={14} className="mr-1" />
              Clear & Restart
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsStateRestored(false)}
              className="text-blue-700 hover:text-blue-900 hover:bg-blue-100 p-1"
            >
              <X size={16} />
            </Button>
          </div>
        </div>
      )}
      <ScrollArea ref={scrollRef} className="flex-1" type="auto">
        <CardContent className="p-4 space-y-4">
            {messages.map((msg, index) => (
            <div key={index} className={cn('flex items-end gap-2 text-sm', msg.type === 'user' ? 'justify-end' : 'justify-start')}>
                {msg.type === 'bot' && <Avatar className='h-8 w-8'><AvatarFallback className='bg-primary text-primary-foreground'><Bot size={20}/></AvatarFallback></Avatar>}
                <div className={cn('max-w-[75%] rounded-lg px-4 py-2', msg.type === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted', msg.isThinking ? 'p-3' : '')}>
                {msg.content}
                </div>
                {msg.type === 'user' && <Avatar className='h-8 w-8'><AvatarFallback>U</AvatarFallback></Avatar>}
            </div>
            ))}
            {isSubmitted && (
                <div className="text-center p-4 flex flex-col items-center justify-center gap-4">
                <div className="flex items-center gap-2 text-green-600 font-semibold">
                    <CheckCircle size={20} />
                    <p>Submission Received!</p>
                </div>
                <Button onClick={() => startForm(true)} variant="outline" size="sm">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Fill Again
                </Button>
                </div>
            )}
            {/* Invisible element to scroll to */}
            <div ref={messagesEndRef} />
        </CardContent>
      </ScrollArea>
      {!isSubmitted && (
        <CardFooter className="border-t p-4 bg-background/95 backdrop-blur-sm">
          {renderFooterContent()}
        </CardFooter>
      )}
    </Card>
  );
}
