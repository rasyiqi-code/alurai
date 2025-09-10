'use client';

import { useEffect, useRef, useState } from 'react';

interface AnalyticsData {
  formId: string;
  userId?: string;
  sessionId: string;
  country?: string;
  city?: string;
}

export function useAnalytics(data: AnalyticsData) {
  const [sessionId] = useState(() => data.sessionId || crypto.randomUUID());
  const startTimeRef = useRef<number>(Date.now());
  const fieldTimesRef = useRef<Map<string, number>>(new Map());
  const [currentProgress, setCurrentProgress] = useState(0);

  // Track form view on mount
  useEffect(() => {
    trackEvent('view', {
      formId: data.formId,
      userId: data.userId,
      sessionId,
      country: data.country,
      city: data.city
    });

    // Track form start
    trackEvent('interaction', {
      formId: data.formId,
      sessionId,
      action: 'start'
    });
  }, []);

  const trackEvent = async (type: string, eventData: any) => {
    try {
      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          data: eventData
        })
      });
    } catch (error) {
      console.error('Error tracking analytics event:', error);
    }
  };

  const trackFieldFocus = (fieldId: string, fieldType: string) => {
    fieldTimesRef.current.set(fieldId, Date.now());
    
    trackEvent('interaction', {
      formId: data.formId,
      sessionId,
      action: 'field_focus',
      fieldId: fieldId || 'unknown',
      fieldType: fieldType || 'unknown'
    });
  };

  const trackFieldBlur = (fieldId: string, fieldType: string) => {
    const startTime = fieldTimesRef.current.get(fieldId);
    if (startTime) {
      const timeSpent = Math.round((Date.now() - startTime) / 1000);
      fieldTimesRef.current.delete(fieldId);
      
      trackEvent('interaction', {
        formId: data.formId,
        sessionId,
        action: 'field_blur',
        fieldId: fieldId || 'unknown',
        fieldType: fieldType || 'unknown',
        timeSpent
      });
    }
  };

  const trackFieldChange = (fieldId: string, fieldType: string) => {
    trackEvent('interaction', {
      formId: data.formId,
      sessionId,
      action: 'field_change',
      fieldId: fieldId || 'unknown',
      fieldType: fieldType || 'unknown'
    });
  };

  const trackProgress = (completedFields: number, totalFields: number) => {
    const progress = Math.round((completedFields / totalFields) * 100);
    setCurrentProgress(progress);
    
    trackEvent('interaction', {
      formId: data.formId,
      sessionId,
      action: 'field_change',
      progress
    });
  };

  const trackSubmission = (fieldsCompleted: number, totalFields: number, isComplete: boolean) => {
    const completionTime = Math.round((Date.now() - startTimeRef.current) / 1000);
    
    trackEvent('submission', {
      formId: data.formId,
      sessionId,
      completionTime,
      fieldsCompleted,
      totalFields,
      isComplete,
      country: data.country
    });

    if (isComplete) {
      trackEvent('interaction', {
        formId: data.formId,
        sessionId,
        action: 'submit'
      });
    } else {
      trackEvent('interaction', {
        formId: data.formId,
        sessionId,
        action: 'abandon'
      });
    }
  };

  return {
    sessionId,
    currentProgress,
    trackFieldFocus,
    trackFieldBlur,
    trackFieldChange,
    trackProgress,
    trackSubmission
  };
}
