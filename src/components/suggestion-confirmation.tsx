'use client';

import React, { useState, useEffect } from 'react';
import { FormFlow, ExtractedPair, FormAnswers } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Check, ArrowRight } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';

interface Props {
  suggestions: ExtractedPair[];
  formFlow: FormFlow;
  onConfirm: (confirmedAnswers: FormAnswers) => void;
}

export function SuggestionConfirmation({ suggestions, formFlow, onConfirm }: Props) {
  const [currentSuggestionIndex, setCurrentSuggestionIndex] = useState(0);
  const [answers, setAnswers] = useState<FormAnswers>({});
  const [matchedFieldKey, setMatchedFieldKey] = useState<string | null>(null);

  const currentSuggestion = suggestions[currentSuggestionIndex];

  useEffect(() => {
    if (currentSuggestion) {
      // Simple matching logic: find a form field whose question includes the suggestion key.
      const lowerCaseKey = currentSuggestion.key.toLowerCase();
      const field = formFlow.find(f => f.question.toLowerCase().includes(lowerCaseKey));
      setMatchedFieldKey(field ? field.key : null);
    }
  }, [currentSuggestion, formFlow]);

  const handleConfirm = () => {
    if (!matchedFieldKey) {
        // If no match, just skip to the next suggestion
        handleSkip();
        return;
    };

    const newAnswers = {
      ...answers,
      [matchedFieldKey]: currentSuggestion.value,
    };
    setAnswers(newAnswers);

    if (currentSuggestionIndex < suggestions.length - 1) {
      setCurrentSuggestionIndex(currentSuggestionIndex + 1);
    } else {
      onConfirm(newAnswers);
    }
  };

  const handleSkip = () => {
     if (currentSuggestionIndex < suggestions.length - 1) {
      setCurrentSuggestionIndex(currentSuggestionIndex + 1);
    } else {
      onConfirm(answers); // Finish with the answers collected so far
    }
  }

  const handleFinish = () => {
      onConfirm(answers);
  }

  if (!currentSuggestion) {
    return (
        <div className="w-full text-center">
            <p className="text-sm text-muted-foreground mb-4">No suggestions to confirm.</p>
            <Button onClick={handleFinish}>Continue Manually</Button>
        </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center gap-3 p-2 rounded-lg bg-muted">
        <p className="text-sm text-center text-muted-foreground">
            Does this look right for the field <strong className='text-foreground'>{matchedFieldKey ? formFlow.find(f => f.key === matchedFieldKey)?.question : '...'}</strong>?
        </p>
      
        <div className="w-full p-3 text-center bg-background rounded-md border">
            <p className="text-xs text-muted-foreground">{currentSuggestion.key}</p>
            <p className="font-semibold">{currentSuggestion.value}</p>
        </div>

      <div className="w-full grid grid-cols-2 gap-2">
        <Button variant="outline" onClick={handleSkip}>
            Skip <ArrowRight className="ml-2" />
        </Button>
        <Button onClick={handleConfirm} disabled={!matchedFieldKey}>
            Confirm <Check className="ml-2" />
        </Button>
      </div>
      <Button variant="link" size="sm" onClick={handleFinish} className="mt-2">Finish & Fill Manually</Button>
    </div>
  );
}
