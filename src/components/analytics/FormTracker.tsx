'use client';

import { useEffect } from 'react';
import { useAnalytics } from '@/hooks/use-analytics';

interface FormTrackerProps {
  formId: string;
  userId?: string;
  children: React.ReactNode;
}

export function FormTracker({ formId, userId, children }: FormTrackerProps) {
  const analytics = useAnalytics({
    formId,
    userId: userId || 'anonymous',
    sessionId: crypto.randomUUID()
  });

  return <>{children}</>;
}

// Hook untuk tracking field interactions
export function useFieldTracking(formId: string, userId?: string) {
  const analytics = useAnalytics({
    formId,
    userId: userId || 'anonymous',
    sessionId: crypto.randomUUID()
  });

  return {
    trackFieldFocus: analytics.trackFieldFocus,
    trackFieldBlur: analytics.trackFieldBlur,
    trackFieldChange: analytics.trackFieldChange,
    trackProgress: analytics.trackProgress,
    trackSubmission: analytics.trackSubmission
  };
}
