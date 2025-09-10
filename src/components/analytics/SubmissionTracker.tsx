'use client';

import { useEffect, useRef, useState } from 'react';
import { useAnalytics } from '@/hooks/use-analytics';

interface SubmissionTrackerProps {
  formId: string;
  userId?: string;
  onSubmit: (data: any) => void;
  children: React.ReactNode;
}

export function SubmissionTracker({ formId, userId, onSubmit, children }: SubmissionTrackerProps) {
  const analytics = useAnalytics({
    formId,
    userId,
    sessionId: crypto.randomUUID()
  });

  const startTimeRef = useRef<number>(Date.now());
  const [completedFields, setCompletedFields] = useState(0);
  const [totalFields, setTotalFields] = useState(0);

  const handleSubmit = (data: any) => {
    const completionTime = Math.round((Date.now() - startTimeRef.current) / 1000);
    const isComplete = completedFields === totalFields;

    // Track submission
    analytics.trackSubmission(completedFields, totalFields, isComplete);

    // Call original onSubmit
    onSubmit(data);
  };

  return (
    <div>
      {children}
    </div>
  );
}

// Hook untuk tracking form progress
export function useSubmissionTracking(formId: string, userId?: string) {
  const analytics = useAnalytics({
    formId,
    userId,
    sessionId: crypto.randomUUID()
  });

  const trackProgress = (completedFields: number, totalFields: number) => {
    analytics.trackProgress(completedFields, totalFields);
  };

  const trackSubmission = (completedFields: number, totalFields: number, isComplete: boolean) => {
    analytics.trackSubmission(completedFields, totalFields, isComplete);
  };

  return {
    trackProgress,
    trackSubmission
  };
}
