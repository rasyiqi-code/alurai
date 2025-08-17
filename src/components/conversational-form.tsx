
'use client';
import React, { useState, useRef, useEffect } from 'react';
import type { FormFlowData, FormField, FormAnswers, ExtractedPair } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send, CheckCircle, Bot, RefreshCw } from 'lucide-react';
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
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    startForm();
  }, [formFlow]);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages]);

  const startForm = (isRestart = false) => {
    setCurrentStep(0);
    setAnswers({});
    setIsCompleted(false);
    setIsSubmitted(false);
    setIsSubmitting(false);
    if (!isRestart) {
       setSuggestedAnswers(null);
    }
    if (formFlow.length > 0) {
      setMessages([{ type: 'bot', content: formFlow[0].question }]);
    } else {
      setMessages([]);
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
        ? (answer as File)?.name || 'File attached'
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
        // File inputs are uncontrolled, so we don't pass a value prop.
        return <Input type="file" onChange={(e) => setAnswers({ ...answers, [field.key]: e.target.files?.[0] || null })} />;
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
          <Button type="submit" size="sm" disabled={isValidating}>
            {isValidating ? <Spinner /> : <Send className="h-4 w-4 mr-2" />}
            {isValidating ? '' : (currentStep === formFlow.length - 1 ? 'Finish' : 'Next')}
          </Button>
        </div>
      </form>
    );
  }

  return (
    <Card className="h-full w-full flex flex-col shadow-none bg-card rounded-none md:rounded-xl border-0">
      <ScrollArea ref={scrollRef} className="flex-1" type="auto">
        <CardContent className="p-4 space-y-4">
            {messages.map((msg, index) => (
            <div key={index} className={cn('flex items-end gap-2', msg.type === 'user' ? 'justify-end' : 'justify-start')}>
                {msg.type === 'bot' && <Avatar className='h-8 w-8'><AvatarFallback className='bg-primary text-primary-foreground'><Bot size={20}/></AvatarFallback></Avatar>}
                <div className={cn('max-w-[75%] rounded-lg px-4 py-2 text-sm', msg.type === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted', msg.isThinking ? 'p-3' : '')}>
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
