export type FormField = {
  id: string;
  question: string;
  inputType: 'text' | 'email' | 'number' | 'date' | 'select' | 'textarea' | 'file';
  validationRules: string[];
  options?: string[];
  key: string;
};

export type FormFlow = FormField[];

export type FormFlowData = {
  id?: string;
  title: string;
  flow: FormFlow;
  slug?: string;
  createdAt?: string;
  updatedAt?: string;
  status?: 'draft' | 'published';
  publishStartTime?: string;
  publishEndTime?: string;
  submissionCount?: number;
};

export type FormAnswers = Record<string, string | number | File | null>;

export type ExtractedPair = {
  key: string;
  value: string;
};

export type SubscriptionTier = 'free' | 'basic' | 'pro' | 'enterprise';

export type BillingInterval = 'month' | 'year';

export type PaymentStatus = 'pending' | 'succeeded' | 'failed' | 'cancelled';

export type WebhookEventType = 
  | 'checkout.session.completed'
  | 'subscription.created'
  | 'subscription.updated'
  | 'subscription.cancelled'
  | 'payment.succeeded'
  | 'payment.failed';

export type SubscriptionPlan = {
  id: string;
  name: string;
  description: string;
  price: number;
  priceDisplay: string;
  originalPrice?: number;
  originalPriceDisplay?: string;
  features: string[];
  limits: {
    forms: number | 'unlimited';
    responses: number | 'unlimited';
    storage: string;
    apiCalls: number | 'unlimited';
    aiGenerations?: number | 'unlimited';
    teamMembers?: number | 'unlimited';
  };
  popular?: boolean;
  badge?: string;
  tier: SubscriptionTier;
  creemProductId?: string | null;
};

export type UserSubscription = {
  id: string;
  userId: string;
  planId: string;
  tier: SubscriptionTier;
  status: 'active' | 'inactive' | 'cancelled' | 'past_due' | 'trialing';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  stripeSubscriptionId?: string;
  stripeCustomerId?: string;
  creemSubscriptionId?: string;
  creemCustomerId?: string;
  createdAt: string;
  updatedAt: string;
};

export type UsageStats = {
  userId: string;
  formsCreated: number;
  responsesReceived: number;
  storageUsed: number; // in MB
  apiCallsUsed: number;
  aiGenerationsUsed?: number;
  lastUpdated: string;
  period?: string; // YYYY-MM format
};

export type QuotaAction = 'form_creation' | 'form_submission' | 'api_call' | 'ai_generation';

export type RateLimitConfig = {
  windowMs: number;
  maxRequests: number;
};

export type CreemWebhookEvent = {
  id: string;
  type: string;
  data: any;
  created: number;
};

export type CreemCheckoutSession = {
  id: string;
  url: string;
  status: 'open' | 'complete' | 'expired';
  customer_email?: string;
  success_url: string;
  cancel_url: string;
  metadata?: Record<string, string>;
};

export type CreemSubscription = {
  id: string;
  customer_id: string;
  product_id: string;
  status: 'active' | 'cancelled' | 'past_due' | 'trialing';
  current_period_start: number;
  current_period_end: number;
  cancel_at_period_end: boolean;
  created: number;
  updated: number;
};
