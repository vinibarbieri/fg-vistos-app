"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { FormField, FormAnswer } from "@/types/FormT";

interface FormStepComponentProps {
  fields: FormField[];
  answers: FormAnswer;
  onAnswerChange: (fieldId: string, value: string | boolean | number | null) => void;
}

interface FormFieldComponentProps {
  field: FormField;
  value: string | boolean | number | null;
  onValueChange: (value: string | boolean | number | null) => void;
  answers?: FormAnswer;
  onAnswerChange?: (fieldId: string, value: string | boolean | number | null) => void;
}

function FormFieldComponent({ field, value, onValueChange, answers, onAnswerChange }: FormFieldComponentProps) {
  const [showDependentFields, setShowDependentFields] = useState(
    field.type === 'boolean' && value === 'Sim'
  );

  const handleValueChange = (newValue: string | boolean | number | null) => {
    onValueChange(newValue);
    
    // Mostrar/esconder campos dependentes para campos boolean
    if (field.type === 'boolean' && field.dependent_fields) {
      setShowDependentFields(newValue === 'Sim');
    }
  };

  const renderField = () => {
    switch (field.type) {
      case 'text':
      case 'email':
        return (
          <Input
            id={field.id}
            type={field.type}
            value={value as string || ''}
            onChange={(e) => handleValueChange(e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            className="w-full"
          />
        );

      case 'textarea':
        return (
          <textarea
            id={field.id}
            value={value as string || ''}
            onChange={(e) => handleValueChange(e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            className="w-full min-h-[100px] px-3 py-2 border border-input bg-background rounded-md text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
        );

      case 'number':
        return (
          <Input
            id={field.id}
            type="number"
            value={value as number || ''}
            onChange={(e) => handleValueChange(e.target.value ? Number(e.target.value) : null)}
            placeholder={field.placeholder}
            required={field.required}
            className="w-full"
          />
        );

      case 'date':
        return (
          <Input
            id={field.id}
            type="date"
            value={value as string || ''}
            onChange={(e) => handleValueChange(e.target.value)}
            required={field.required}
            className="w-full"
          />
        );

      case 'boolean':
        return (
          <div className="flex gap-4">
            {field.options?.map((option) => (
              <label key={option} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name={field.id}
                  value={option}
                  checked={value === option}
                  onChange={(e) => handleValueChange(e.target.value)}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                />
                <span className="text-sm">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'select':
        return (
          <select
            id={field.id}
            value={value as string || ''}
            onChange={(e) => handleValueChange(e.target.value)}
            required={field.required}
            className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">Selecione uma opção</option>
            {field.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      default:
        return (
          <Input
            id={field.id}
            type="text"
            value={value as string || ''}
            onChange={(e) => handleValueChange(e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            className="w-full"
          />
        );
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor={field.id} className="text-sm font-medium">
          {field.text}
          {field.required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        {renderField()}
      </div>

      {/* Campos dependentes */}
      {showDependentFields && field.dependent_fields && (
        <Card className="ml-4 border-l-4 border-l-primary">
          <CardContent className="p-4">
            <div className="space-y-4">
              {field.dependent_fields.map((dependentField, index) => (
                <FormFieldComponent
                  key={dependentField.id || `dependent-field-${index}`}
                  field={dependentField}
                  value={answers?.[dependentField.id] || null}
                  onValueChange={(newValue) => onAnswerChange?.(dependentField.id, newValue)}
                  answers={answers}
                  onAnswerChange={onAnswerChange}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export function FormStepComponent({ fields, answers, onAnswerChange }: FormStepComponentProps) {
  return (
    <div className="space-y-6">
      {fields.map((field, index) => (
        <FormFieldComponent
          key={field.id || `field-${index}`}
          field={field}
          value={answers[field.id] || null}
          onValueChange={(value) => onAnswerChange(field.id, value)}
          answers={answers}
          onAnswerChange={onAnswerChange}
        />
      ))}
    </div>
  );
}
