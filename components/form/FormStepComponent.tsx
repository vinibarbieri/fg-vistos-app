"use client";

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
  const handleValueChange = (newValue: string | boolean | number | null) => {
    onValueChange(newValue);
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

      case 'radio':
        return (
          <div className="flex flex-col gap-3">
            {field.options?.map((option) => (
              <label key={option} className="flex items-start gap-2 cursor-pointer p-3 rounded-lg hover:bg-accent hover:text-white">
                <input
                  type="radio"
                  name={field.id}
                  value={option}
                  checked={value === option}
                  onChange={(e) => handleValueChange(e.target.value)}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 mt-1 flex-shrink-0"
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

      case 'object':
        // Campos do tipo object renderizam seus campos aninhados
        if (!field.fields || field.fields.length === 0) return null;
        
        return (
          <div className="space-y-4">
            {field.fields.map((nestedField, index) => (
              <FormFieldComponent
                key={nestedField.id || `nested-field-${index}`}
                field={nestedField}
                value={answers?.[nestedField.id] || null}
                onValueChange={(newValue) => onAnswerChange?.(nestedField.id, newValue)}
                answers={answers}
                onAnswerChange={onAnswerChange}
              />
            ))}
          </div>
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
      {/* Para campos do tipo 'object', renderizar como seção */}
      {field.type === 'object' ? (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold border-b pb-2">
            {field.text}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </h3>
          {renderField()}
        </div>
      ) : (
        <div className="space-y-2">
          <Label htmlFor={field.id} className="text-sm font-medium">
            {field.text}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          {renderField()}
        </div>
      )}

      {/* Campos dependentes */}
      {field.dependent_fields && field.dependent_fields.length > 0 && (() => {
        // Para campos do tipo radio, mostrar apenas o campo dependente correspondente à opção selecionada
        if (field.type === 'radio' && value) {
          const selectedIndex = field.options?.indexOf(value as string);
          if (selectedIndex !== undefined && selectedIndex >= 0) {
            const matchingDependent = field.dependent_fields.find(
              (df) => df.option_index === selectedIndex
            );
            
            if (matchingDependent) {
              return (
                <Card className="ml-4 border-l-4 border-l-primary">
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      {/* Se for um objeto, renderizar título e campos aninhados */}
                      {matchingDependent.type === 'object' && matchingDependent.fields ? (
                        <>
                          {matchingDependent.text && (
                            <h3 className="text-sm font-semibold mb-4">
                              {matchingDependent.text}
                            </h3>
                          )}
                          {matchingDependent.fields.map((dependentField, index) => (
                            <FormFieldComponent
                              key={dependentField.id || `dependent-field-${index}`}
                              field={dependentField}
                              value={answers?.[dependentField.id] || null}
                              onValueChange={(newValue) => onAnswerChange?.(dependentField.id, newValue)}
                              answers={answers}
                              onAnswerChange={onAnswerChange}
                            />
                          ))}
                        </>
                      ) : (
                        /* Se for um campo simples, renderizar diretamente */
                        <FormFieldComponent
                          key={matchingDependent.id}
                          field={matchingDependent}
                          value={answers?.[matchingDependent.id] || null}
                          onValueChange={(newValue) => onAnswerChange?.(matchingDependent.id, newValue)}
                          answers={answers}
                          onAnswerChange={onAnswerChange}
                        />
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            }
          }
        }
        
        // Para campos do tipo boolean, mostrar campos dependentes quando resposta for 'Sim'
        if (field.type === 'boolean' && value === 'Sim' && field.dependent_fields && field.dependent_fields.length > 0) {
          return (
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
          );
        }
        
        return null;
      })()}
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
