
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
    setSuggestedAnswers(parsedData);
    setMessages(prev => [
      ...prev,
      { type: 'bot', content: "Great! I've analyzed your text. I'll show suggestions for each step." }
    ]);
    // This is the key fix: restart the form flow to show the first question
    // along with the new suggestions.
    setTimeout(() => {
      startForm(true); // pass true to keep suggestions
    }, 10);
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
        setMessages(prev => [...prev.slice(0, -1)]);
    } else if (validationResult.isValid) {
        if (currentStep < formFlow.length - 1) {
             setMessages(prev => [...prev, { type: 'bot', content: formFlow[currentStep + 1].question }]);
        }
        proceedToNextStep(currentAnswers);
    } else {
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
    setAnswers({ ...answers, [currentField.key]: value });
  };

  const renderSuggestions = () => {
    if (!suggestedAnswers || suggestedAnswers.length === 0) {
      return null;
    }
    
    // Simple logic: Show all extracted values as buttons.
    // The user can then click the one that is relevant for the current question.
    return (
        <div className="flex flex-wrap gap-2 mb-2">
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
    )
  }

  const renderInput = (field: FormField) => {
    const value = (answers[field.key] as string) || '';

    switch (field.inputType) {
      case 'textarea':
        return <Textarea value={value} onChange={(e) => setAnswers({ ...answers, [field.key]: e.target.value })} placeholder="Type your answer here..." />;
      case 'select':
        return (
            <RadioGroup value={value} onValueChange={(val) => setAnswers({ ...answers, [field.key]: val })}>
                {field.options?.map(opt => (
                    <div key={opt} className="flex items-center space-x-2">
                        <RadioGroupItem value={opt} id={`${field.key}-${opt}`} />
                        <Label htmlFor={`${field.key}-${opt}`}>{opt}</Label>
                    </div>
                ))}
            </RadioGroup>
        );
      case 'file':
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

  const progress = isCompleted ? 100 : (currentStep / formFlow.length) * 100;

  return (
    <Card className="h-full w-full flex flex-col shadow-none bg-card rounded-none border-0">
      <CardHeader className="border-b">
        <p className="font-semibold font-headline">{title}</p>
        <p className="text-sm text-muted-foreground">
          by AlurAI
        </p>
        <Progress value={progress} className="mt-2" />
      </CardHeader>
      <CardContent ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={cn('flex items-end gap-2', msg.type === 'user' ? 'justify-end' : 'justify-start')}>
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
      </CardContent>
      {!isSubmitted && (
        <CardFooter className="border-t p-4 bg-background/95 backdrop-blur-sm">
          {renderFooterContent()}
        </CardFooter>
      )}
    </Card>
  );
}
