// Analytics Database Schema Types
export interface FormView {
  id: string;
  formId: string;
  userId?: string; // Optional for anonymous views
  sessionId: string;
  timestamp: Date;
  userAgent: string;
  ipAddress?: string;
  referrer?: string;
  device: 'desktop' | 'mobile' | 'tablet';
  browser: string;
  os: string;
  country?: string;
  city?: string;
}

export interface FormInteraction {
  id: string;
  formId: string;
  sessionId: string;
  timestamp: Date;
  action: 'start' | 'field_focus' | 'field_blur' | 'field_change' | 'submit' | 'abandon';
  fieldId?: string;
  fieldType?: string;
  timeSpent?: number; // in seconds
  progress?: number; // percentage completed
}

export interface FormSubmission {
  id: string;
  formId: string;
  sessionId: string;
  timestamp: Date;
  completionTime: number; // in seconds
  fieldsCompleted: number;
  totalFields: number;
  isComplete: boolean;
  userAgent: string;
  device: 'desktop' | 'mobile' | 'tablet';
  country?: string;
}

export interface DailyAnalytics {
  id: string; // format: formId_YYYY-MM-DD
  formId: string;
  date: string; // YYYY-MM-DD
  views: number;
  submissions: number;
  completions: number;
  abandonmentRate: number;
  avgCompletionTime: number;
  avgFieldsCompleted: number;
  deviceBreakdown: {
    desktop: number;
    mobile: number;
    tablet: number;
  };
  countryBreakdown: Record<string, number>;
  hourlyBreakdown: Record<string, number>; // hour -> count
}

export interface FormAnalytics {
  formId: string;
  totalViews: number;
  totalSubmissions: number;
  totalCompletions: number;
  conversionRate: number;
  completionRate: number;
  avgCompletionTime: number;
  avgFieldsCompleted: number;
  bounceRate: number;
  lastUpdated: Date;
  dailyData: DailyAnalytics[];
}

export interface AnalyticsOverview {
  totalForms: number;
  totalViews: number;
  totalSubmissions: number;
  totalCompletions: number;
  avgConversionRate: number;
  avgCompletionRate: number;
  avgBounceRate: number;
  mostPopularForm: {
    id: string;
    title: string;
    views: number;
    submissions: number;
  } | null;
  trends: {
    views: { current: number; previous: number; change: number };
    submissions: { current: number; previous: number; change: number };
    conversion: { current: number; previous: number; change: number };
  };
  deviceBreakdown: {
    desktop: number;
    mobile: number;
    tablet: number;
  };
  countryBreakdown: Record<string, number>;
  hourlyActivity: Record<string, number>;
}
