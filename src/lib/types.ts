export type FormField = {
  id: string;
  question: string;
  inputType: 'text' | 'email' | 'number' | 'date' | 'select' | 'textarea' | 'file';
  validationRules: string[];
  options?: string[];
  key: string;
};

export type FormFlow = FormField[];

export type FormAnswers = Record<string, string | number | File | null>;
