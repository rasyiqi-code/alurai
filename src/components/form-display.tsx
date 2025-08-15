'use client';
import { useState, useEffect } from 'react';
import type { FormFlowData } from '@/lib/types';
import { ConversationalForm } from './conversational-form';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Timer } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Props {
  formFlowData: FormFlowData;
}

const Countdown = ({ targetDate }: { targetDate: string }) => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      const distance = formatDistanceToNow(new Date(targetDate));
      setTimeLeft(distance);
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <div className="text-center">
      <p className="text-2xl font-bold font-headline">{timeLeft}</p>
    </div>
  );
};

export function FormDisplay({ formFlowData }: Props) {
  const [formState, setFormState] = useState<'loading' | 'unavailable' | 'active' | 'expired'>('loading');

  useEffect(() => {
    if (formFlowData.status !== 'published') {
      setFormState('unavailable');
      return;
    }
    
    const now = new Date();
    const startTime = formFlowData.publishStartTime ? new Date(formFlowData.publishStartTime) : null;
    const endTime = formFlowData.publishEndTime ? new Date(formFlowData.publishEndTime) : null;

    if (startTime && now < startTime) {
      setFormState('unavailable');
    } else if (endTime && now > endTime) {
      setFormState('expired');
    } else {
      setFormState('active');
    }
  }, [formFlowData]);

  const renderContent = () => {
    switch (formState) {
      case 'active':
        return <ConversationalForm formFlowData={formFlowData} />;
      case 'unavailable':
        return (
          <Card className="h-full w-full flex flex-col items-center justify-center shadow-2xl bg-card p-8">
            <CardHeader className="text-center">
                <div className="mx-auto bg-primary text-primary-foreground rounded-full h-16 w-16 flex items-center justify-center mb-4">
                 <Timer className="h-8 w-8" />
                </div>
              <CardTitle className="font-headline">{formFlowData.publishStartTime ? "Form opens soon!" : "Form Not Available"}</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              {formFlowData.publishStartTime ? (
                <>
                  <p className="mb-4 text-muted-foreground">This form is not yet available. It will open in:</p>
                  <Countdown targetDate={formFlowData.publishStartTime} />
                </>
              ) : (
                <p>This form has not been published yet.</p>
              )}
            </CardContent>
          </Card>
        );
      case 'expired':
        return (
          <Card className="h-full w-full flex flex-col items-center justify-center shadow-2xl bg-card p-8 text-center">
            <CardHeader>
                <div className="mx-auto bg-destructive text-destructive-foreground rounded-full h-16 w-16 flex items-center justify-center mb-4">
                    <Timer className="h-8 w-8" />
                </div>
                <CardTitle className="font-headline">Form Closed</CardTitle>
            </CardHeader>
             <CardContent>
                 <p className="text-muted-foreground">The submission period for this form has ended.</p>
             </CardContent>
          </Card>
        );
      default:
        return null; // Loading state
    }
  };

  return <>{renderContent()}</>;
}
