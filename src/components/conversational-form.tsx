
'use client';
import React, { useState, useRef, useEffect } from 'react';
import type { FormFlowData, FormField, FormAnswers, ExtractedPair } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MinioUpload, MinioUploadedFile } from './minio-upload';
import { Send, Bot, CheckCircle, RefreshCw } from 'lucide-react';
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
  const [submissionAttempts, setSubmissionAttempts] = useState(0);
  const [lastSubmissionTime, setLastSubmissionTime] = useState<number>(0);
  const [isOnline, setIsOnline] = useState(true);
  const [pendingSubmission, setPendingSubmission] = useState<FormAnswers | null>(null);

  const [minioFiles, setMinioFiles] = useState<MinioUploadedFile[]>([]);
  const [isStateLoaded, setIsStateLoaded] = useState(false);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Generate storage key based on form ID
  const getStorageKey = () => `form_state_${formId}`;

  // Save state to localStorage
  const saveFormState = () => {
    if (!formId || !isStateLoaded) return;
    
    // Serialize messages properly, preserving important information
    const serializedMessages = messages.map(msg => {
      if (typeof msg.content === 'string') {
        return { ...msg, content: msg.content };
      } else if (React.isValidElement(msg.content)) {
        // Extract text content from React elements
        const element = msg.content as React.ReactElement;
        if (element.props?.children) {
          return { ...msg, content: String(element.props.children) };
        }
        return { ...msg, content: '[Bot Message]' };
      } else {
        return { ...msg, content: '[Complex Content]' };
      }
    });
    
    const stateToSave = {
      currentStep,
      answers,
      messages: serializedMessages,
      isCompleted,
      isSubmitted,
      suggestedAnswers,
      minioFiles,
      submissionAttempts,
      lastSubmissionTime,
      timestamp: Date.now()
    };
    
    try {
      localStorage.setItem(getStorageKey(), JSON.stringify(stateToSave));
    } catch (error) {
      console.warn('Failed to save form state:', error);
      // If localStorage is full, try to clear old entries
      try {
        const keys = Object.keys(localStorage);
        const formStateKeys = keys.filter(key => key.startsWith('form_state_'));
        if (formStateKeys.length > 10) {
          // Remove oldest entries
          formStateKeys.sort().slice(0, 5).forEach(key => {
            localStorage.removeItem(key);
          });
          // Retry saving
          localStorage.setItem(getStorageKey(), JSON.stringify(stateToSave));
        }
      } catch (retryError) {
        console.error('Failed to save form state even after cleanup:', retryError);
      }
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
      
      // Validate and restore state with fallbacks
      setCurrentStep(Math.max(0, parsedState.currentStep || 0));
      setAnswers(parsedState.answers || {});
      
      // Restore messages with proper validation
      const restoredMessages = Array.isArray(parsedState.messages) 
        ? parsedState.messages.map((msg: any) => ({
            type: msg.type === 'bot' || msg.type === 'user' ? msg.type : 'bot',
            content: typeof msg.content === 'string' ? msg.content : '[Restored Message]',
            isThinking: Boolean(msg.isThinking)
          }))
        : [];
      
      setMessages(restoredMessages);
      setIsCompleted(Boolean(parsedState.isCompleted));
      setIsSubmitted(Boolean(parsedState.isSubmitted));
      setSuggestedAnswers(parsedState.suggestedAnswers || null);
      setMinioFiles(Array.isArray(parsedState.minioFiles) ? parsedState.minioFiles : []);
      setSubmissionAttempts(Math.max(0, parsedState.submissionAttempts || 0));
      setLastSubmissionTime(parsedState.lastSubmissionTime || 0);

      return true;
    } catch (error) {
      console.warn('Failed to load form state:', error);
      // Clear corrupted state
      try {
        localStorage.removeItem(getStorageKey());
      } catch (clearError) {
        console.error('Failed to clear corrupted state:', clearError);
      }
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

  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // If we have a pending submission and we're back online, try to submit it
      if (pendingSubmission && !isSubmitting) {
        toast({ 
          title: 'Back Online', 
          description: 'Connection restored. Retrying submission...' 
        });
        setTimeout(() => {
          handleSubmission();
        }, 1000);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast({ 
        variant: 'destructive', 
        title: 'Connection Lost', 
        description: 'You are offline. Your progress will be saved locally.' 
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check initial online status
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [pendingSubmission, isSubmitting]);

  // Save state whenever important state changes
  useEffect(() => {
    saveFormState();
  }, [currentStep, answers, messages, isCompleted, isSubmitted, suggestedAnswers, minioFiles, isStateLoaded]);

  // Auto-focus input when step changes
  useEffect(() => {
    if (isStateLoaded && inputRef.current && !isSubmitted && !isCompleted) {
      // Small delay to ensure DOM is updated
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          console.log('Auto-focused input for step:', currentStep);
        }
      }, 100);
    }
  }, [currentStep, isStateLoaded, isSubmitted, isCompleted]);

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

    // Check if offline
    if (!isOnline) {
      setPendingSubmission(answers);
      toast({ 
        variant: 'destructive', 
        title: 'Offline Mode', 
        description: 'You are offline. Your submission will be sent when connection is restored.' 
      });
      setMessages(prev => [...prev, { type: 'bot', content: 'You are currently offline. Your submission will be automatically sent when you are back online.'}]);
      return;
    }

    // Prevent multiple submissions
    const now = Date.now();
    const timeSinceLastSubmission = now - lastSubmissionTime;
    const SUBMISSION_COOLDOWN = 2000; // 2 seconds cooldown
    
    if (isSubmitting) {
      toast({ variant: 'destructive', title: 'Already Submitting', description: 'Please wait for the current submission to complete.' });
      return;
    }

    if (timeSinceLastSubmission < SUBMISSION_COOLDOWN) {
      toast({ variant: 'destructive', title: 'Too Soon', description: 'Please wait a moment before submitting again.' });
      return;
    }

    if (submissionAttempts >= 3) {
      toast({ variant: 'destructive', title: 'Too Many Attempts', description: 'Maximum submission attempts reached. Please refresh the page and try again.' });
      return;
    }

    setIsSubmitting(true);
    setLastSubmissionTime(now);
    setSubmissionAttempts(prev => prev + 1);
    setPendingSubmission(answers);
    
    try {
      const result = await saveSubmissionAction(formId, answers);

      if ('error' in result) {
        // Check if it's a retryable error
        const isRetryableError = result.error.includes('network') || 
                                result.error.includes('timeout') || 
                                result.error.includes('temporarily unavailable');
        
        if (isRetryableError && submissionAttempts < 3) {
          toast({ 
            variant: 'destructive', 
            title: 'Submission Failed', 
            description: `${result.error} Retrying... (${submissionAttempts}/3)` 
          });
          setMessages(prev => [...prev, { type: 'bot', content: 'Network error detected. Retrying submission...'}]);
          
          // Retry after a delay
          setTimeout(() => {
            handleSubmission();
          }, 2000);
          return;
        }
        
        toast({ variant: 'destructive', title: 'Submission Failed', description: result.error });
        setMessages(prev => [...prev, { type: 'bot', content: 'Sorry, there was an error submitting your form. Please try again.'}]);
      } else {
        setIsSubmitted(true);
        setPendingSubmission(null); // Clear pending submission on success
        setMessages(prev => [...prev, { type: 'user', content: 'Submit Form' }, { type: 'bot', content: 'Thank you for completing the form! Your submission has been received.'}]);
        
        // Clear saved state after successful submission
        setTimeout(() => {
          clearFormState();
        }, 1000);
      }
    } catch (error) {
      console.error('Submission error:', error);
      
      // Check if it's a network error that can be retried
      const isNetworkError = error instanceof TypeError && error.message.includes('fetch');
      
      if (isNetworkError && submissionAttempts < 3) {
        toast({ 
          variant: 'destructive', 
          title: 'Network Error', 
          description: `Connection lost. Retrying... (${submissionAttempts}/3)` 
        });
        setMessages(prev => [...prev, { type: 'bot', content: 'Network connection lost. Retrying submission...'}]);
        
        // Retry after a delay
        setTimeout(() => {
          handleSubmission();
        }, 3000);
        return;
      }
      
      toast({ variant: 'destructive', title: 'Submission Error', description: 'An unexpected error occurred. Please try again.' });
      setMessages(prev => [...prev, { type: 'bot', content: 'Sorry, there was an unexpected error. Please try again.'}]);
    } finally {
      setIsSubmitting(false);
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

  const handleKeyDownSelect = (e: React.KeyboardEvent, field: FormField, value: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleRadioSelect(field, value);
    }
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
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                handleSuggestionClick(suggestion.value);
                            }
                        }}
                        tabIndex={0}
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

    console.log('Rendering input for field:', field.key, 'type:', field.inputType, 'value:', value, 'isValidating:', isValidating, 'isSubmitting:', isSubmitting);

    // 'select' type is handled in renderFooterContent, so we don't render it here.
    if (field.inputType === 'select') {
      return null;
    }
    
    // Handle Enter key press for form submission
    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (!isValidating && !isSubmitting) {
          handleNextStep(e as any);
        }
      }
    };

    // Handle focus events for debugging
    const handleFocus = () => {
      console.log('Input focused:', field.key, field.inputType);
    };

    const handleClick = () => {
      console.log('Input clicked:', field.key, field.inputType);
    };
    
    switch (field.inputType) {
      case 'textarea':
        return (
          <Textarea 
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={value} 
            onChange={(e) => setAnswers({ ...answers, [field.key]: e.target.value })} 
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            onClick={handleClick}
            placeholder="Type your answer here... (Press Enter to submit, Shift+Enter for new line)" 
            autoFocus={true}
            tabIndex={0}
            className="pointer-events-auto"
          />
        );
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
        return (
          <Input 
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type={field.inputType} 
            value={value} 
            onChange={(e) => setAnswers({ ...answers, [field.key]: e.target.value })} 
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            onClick={handleClick}
            placeholder="Type your answer here... (Press Enter to submit)" 
            autoFocus={true}
            tabIndex={0}
            disabled={isValidating || isSubmitting}
            className="pointer-events-auto"
          />
        );
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
                onKeyDown={(e) => handleKeyDownSelect(e, currentField, opt)}
                tabIndex={0}
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
      <form onSubmit={handleNextStep} className="w-full flex flex-col gap-2 pointer-events-auto">
        <div className="pointer-events-auto">
          {renderSuggestions()}
          {renderInput(currentField)}
        </div>
        <div className='flex items-center justify-between pointer-events-auto'>
          <DataParser formFlow={formFlow} onDataParsed={handleDataParsed} />
          {currentField.inputType !== 'file' && (
            <Button 
              type="submit" 
              size="sm" 
              disabled={isValidating || isSubmitting}
              className="min-w-[80px]"
            >
              {isValidating ? <Spinner /> : <Send className="h-4 w-4 mr-2" />}
              {isValidating ? 'Validating...' : (currentStep === formFlow.length - 1 ? 'Finish' : 'Next')}
            </Button>
          )}
        </div>
      </form>
    );
  }

  return (
    <Card className="h-full w-full flex flex-col shadow-none bg-card rounded-none md:rounded-xl border-0">
      {/* Status Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-muted/50 border-b">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{title}</span>
          <span className="text-xs text-muted-foreground">
            {currentStep + 1} of {formFlow.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
          {!isOnline && (
            <span className="text-xs text-red-500 font-medium">Offline</span>
          )}
          {pendingSubmission && (
            <span className="text-xs text-yellow-500 font-medium">Pending</span>
          )}
        </div>
      </div>

      <ScrollArea ref={scrollRef} className="flex-1" type="auto">
        <CardContent className="p-4 space-y-4">
            {messages.map((msg, index) => (
            <div key={index} className={cn('flex items-end gap-2 text-sm', msg.type === 'user' ? 'justify-end' : 'justify-start')}>
                {msg.type === 'bot' && <Avatar className='h-8 w-8'><AvatarFallback className='bg-primary text-primary-foreground'><Bot size={20}/></AvatarFallback></Avatar>}
                <div className={cn('max-w-[75%] rounded-lg px-4 py-2', msg.type === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted', msg.isThinking ? 'p-3' : undefined)}>
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
        <CardFooter className="border-t p-4 bg-background/95 backdrop-blur-sm relative z-10">
          {renderFooterContent()}
        </CardFooter>
      )}
    </Card>
  );
}
