import { FormData, FormAnswer, FormField } from "@/types/FormT";

/**
 * Calcula o progresso do formulário baseado nas respostas fornecidas
 * @param formData - Dados do formulário (steps e fields)
 * @param answers - Respostas do usuário
 * @returns Objeto com progresso detalhado
 */
export function calculateFormProgress(formData: FormData, answers: FormAnswer) {
  if (!formData || !formData.steps) {
    return {
      totalSteps: 0,
      completedSteps: 0,
      totalFields: 0,
      completedFields: 0,
      progressPercentage: 0,
      stepProgress: []
    };
  }

  const stepProgress = formData.steps.map((step, stepIndex) => {
    const stepFields = step.fields || [];
    const completedFieldsInStep = stepFields.filter(field => {
      return isFieldCompleted(field, answers);
    }).length;

    const stepProgressPercentage = stepFields.length > 0 
      ? (completedFieldsInStep / stepFields.length) * 100 
      : 0;

    const isStepCompleted = stepProgressPercentage === 100;

    return {
      stepIndex,
      stepId: step.section || `step-${stepIndex}`,
      stepTitle: step.section || `Etapa ${stepIndex + 1}`,
      totalFields: stepFields.length,
      completedFields: completedFieldsInStep,
      progressPercentage: Math.round(stepProgressPercentage),
      isCompleted: isStepCompleted,
      fields: stepFields.map(field => ({
        fieldId: field.id,
        fieldText: field.text,
        isCompleted: isFieldCompleted(field, answers),
        hasValue: answers[field.id] !== undefined && answers[field.id] !== null && answers[field.id] !== ''
      }))
    };
  });

  const totalSteps = formData.steps.length;
  const completedSteps = stepProgress.filter(step => step.isCompleted).length;
  
  const totalFields = stepProgress.reduce((sum, step) => sum + step.totalFields, 0);
  const completedFields = stepProgress.reduce((sum, step) => sum + step.completedFields, 0);
  
  const progressPercentage = totalFields > 0 ? (completedFields / totalFields) * 100 : 0;

  return {
    totalSteps,
    completedSteps,
    totalFields,
    completedFields,
    progressPercentage: Math.round(progressPercentage),
    stepProgress
  };
}

/**
 * Verifica se um campo específico foi preenchido corretamente
 * @param field - Campo do formulário
 * @param answers - Respostas do usuário
 * @returns true se o campo foi preenchido
 */
function isFieldCompleted(field: FormField, answers: FormAnswer): boolean {
  const value = answers[field.id];
  
  // Se o campo é obrigatório e não tem valor, não está completo
  if (field.required && (value === undefined || value === null || value === '')) {
    return false;
  }

  // Se tem campos dependentes, verificar se eles também estão preenchidos
  if (field.dependent_fields && field.dependent_fields.length > 0) {
    const shouldShowDependentFields = shouldShowDependentFieldsForValue(field, value);
    
    if (shouldShowDependentFields) {
      // Se deve mostrar campos dependentes, todos devem estar preenchidos
      const allDependentFieldsCompleted = field.dependent_fields.every(dependentField => {
        return isFieldCompleted(dependentField, answers);
      });
      
      // O campo principal deve ter valor E os dependentes devem estar completos
      return hasValidValue(value) && allDependentFieldsCompleted;
    }
  }

  // Para campos normais, apenas verificar se tem valor válido
  return hasValidValue(value);
}

/**
 * Verifica se deve mostrar campos dependentes baseado no valor
 * @param field - Campo do formulário
 * @param value - Valor atual
 * @returns true se deve mostrar campos dependentes
 */
function shouldShowDependentFieldsForValue(field: FormField, value: any): boolean {
  if (field.type === 'boolean') {
    return value === 'Sim' || value === true;
  }
  
  // Para outros tipos, pode ser customizado conforme necessário
  return false;
}

/**
 * Verifica se um valor é válido (não vazio)
 * @param value - Valor a ser verificado
 * @returns true se o valor é válido
 */
function hasValidValue(value: any): boolean {
  if (value === undefined || value === null) {
    return false;
  }
  
  if (typeof value === 'string') {
    return value.trim() !== '';
  }
  
  if (typeof value === 'number') {
    return !isNaN(value);
  }
  
  if (typeof value === 'boolean') {
    return true; // boolean sempre é válido
  }
  
  return true;
}

/**
 * Calcula o progresso de um step específico
 * @param stepIndex - Índice do step
 * @param formData - Dados do formulário
 * @param answers - Respostas do usuário
 * @returns Progresso do step específico
 */
export function calculateStepProgress(stepIndex: number, formData: FormData, answers: FormAnswer) {
  if (!formData.steps || stepIndex >= formData.steps.length) {
    return {
      progressPercentage: 0,
      completedFields: 0,
      totalFields: 0,
      isCompleted: false
    };
  }

  const step = formData.steps[stepIndex];
  const fields = step.fields || [];
  
  const completedFields = fields.filter(field => isFieldCompleted(field, answers)).length;
  const totalFields = fields.length;
  const progressPercentage = totalFields > 0 ? (completedFields / totalFields) * 100 : 0;
  
  return {
    progressPercentage: Math.round(progressPercentage),
    completedFields,
    totalFields,
    isCompleted: progressPercentage === 100
  };
}
