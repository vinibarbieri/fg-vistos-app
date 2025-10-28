export type FormFieldType = 'text' | 'email' | 'boolean' | 'radio' | 'select' | 'number' | 'date' | 'textarea' | 'object';

export interface FormField {
  id: string;
  text: string;
  type: FormFieldType;
  options?: string[];
  fields?: FormField[];
  dependent_fields?: FormField[];
  option_index?: number;
  required?: boolean;
  placeholder?: string;
}

export interface FormStep {
  fields: FormField[];
  section: string;
}

export interface FormData {
  steps: FormStep[];
  totalSteps: number;
}

export interface FormAnswer {
  [fieldId: string]: string | boolean | number | null;
}

export interface FormProgress {
  currentStep: number;
  completedSteps: number[];
  answers: FormAnswer;
  lastSaved?: string;
}
