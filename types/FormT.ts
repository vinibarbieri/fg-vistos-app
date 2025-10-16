export type FormFieldType = 'text' | 'email' | 'boolean' | 'select' | 'number' | 'date' | 'textarea';

export interface FormField {
  id: string;
  text: string;
  type: FormFieldType;
  options?: string[];
  dependent_fields?: FormField[];
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
