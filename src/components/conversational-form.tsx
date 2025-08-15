'use client';
import React, { useState, useRef, useEffect } from 'react';
import type { FormFlowData, FormField, FormAnswers } from '@/lib/types';
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
import { saveSubmissionAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Spinner } from './spinner';

interface Props {
  formFlowData: FormFlowData;
}

type Message = {
  type: 'bot' | 'user';
  content: React.ReactNode;
};

export function ConversationalForm({ formFlowData }: Props) {
  const { title, flow: formFlow, id: formId } = formFlowData;
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<FormAnswers>({});
  const [messages, setMessages] = useState<Message[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    startForm();
  }, [formFlow]);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages]);

  const startForm = () => {
    setCurrentStep(0);
    setAnswers({});
    setIsCompleted(false);
    setIsSubmitting(false);
    if (formFlow.length > 0) {
      setMessages([{ type: 'bot', content: formFlow[0].question }]);
    }
  };
  
  const handleDataParsed = (parsedData: Record<string, any>) => {
    const newAnswers = { ...answers };
    let firstUnansweredStep = -1;

    formFlow.forEach((field, index) => {
      if (parsedData[field.key]) {
        newAnswers[field.key] = parsedData[field.key];
      }
      if (!newAnswers[field.key] && firstUnansweredStep === -1) {
        firstUnansweredStep = index;
      }
    });

    setAnswers(newAnswers);

    const nextStep = firstUnansweredStep !== -1 ? firstUnansweredStep : formFlow.length;
    
    if (nextStep >= formFlow.length) {
      setIsCompleted(true);
      setMessages(prev => [...prev, {type: 'bot', content: "Thanks! I've filled the form with your data. Please review and submit."}]);
    } else {
       setCurrentStep(nextStep);
       setMessages(prev => [...prev, {type: 'bot', content: "Great, I've filled in what I could. Let's continue with the rest."}, { type: 'bot', content: formFlow[nextStep].question }]);
    }
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
      setMessages(prev => [...prev, { type: 'bot', content: 'Thank you for completing the form! Your submission has been received.'}]);
    }
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    const currentField = formFlow[currentStep];
    const answer = answers[currentField.key];
    
    if (currentField.validationRules.includes('required') && !answer) {
        // Basic validation feedback
        return;
    }

    const answerContent = currentField.inputType === 'file' 
      ? (answer as File)?.name || 'File attached'
      : answer as string;

    setMessages(prev => [...prev, { type: 'user', content: answerContent }]);
    
    if (currentStep < formFlow.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      setMessages(prev => [...prev, { type: 'bot', content: formFlow[nextStep].question }]);
    } else {
      setIsCompleted(true);
      handleSubmission();
    }
  };

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

  const progress = isCompleted ? 100 : (currentStep / formFlow.length) * 100;

  return (
    <Card className="h-full w-full flex flex-col shadow-2xl bg-card">
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
            <div className={cn('max-w-[75%] rounded-lg px-4 py-2', msg.type === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
              {msg.content}
            </div>
            {msg.type === 'user' && <Avatar className='h-8 w-8'><AvatarFallback>U</AvatarFallback></Avatar>}
          </div>
        ))}
         {isCompleted && (
            <div className="text-center p-4 flex flex-col items-center justify-center gap-4">
              <div className="flex items-center gap-2 text-green-600 font-semibold">
                <CheckCircle size={20} />
                <p>Form completed!</p>
              </div>
              <Button onClick={startForm} variant="outline" size="sm">
                <RefreshCw className="mr-2 h-4 w-4" />
                Fill Again
              </Button>
            </div>
          )}
      </CardContent>
      {!isCompleted && formFlow.length > 0 && (
        <CardFooter className="border-t p-4">
          <form onSubmit={handleNextStep} className="w-full flex flex-col gap-2">
            <div>
             {renderInput(formFlow[currentStep])}
            </div>
            <div className='flex items-center justify-between'>
              <DataParser formFlow={formFlow} onDataParsed={handleDataParsed} />
              <Button type="submit" size="sm" disabled={isSubmitting}>
                {isSubmitting ? <Spinner className='mr-2' /> : <Send className="h-4 w-4 mr-2" />}
                {currentStep === formFlow.length - 1 ? (isSubmitting ? 'Submitting...' : 'Submit') : 'Next'}
              </Button>
            </div>
          </form>
        </CardFooter>
      )}
    </Card>
  );
}