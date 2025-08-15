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
};

export type FormAnswers = Record<string, string | number | File | null>;
