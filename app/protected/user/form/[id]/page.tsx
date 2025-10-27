"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Save, CheckCircle, Circle, Loader2 } from "lucide-react";
import { FormData, FormProgress, FormAnswer, FormStep } from "@/types/FormT";
import { FormStepComponent } from "@/components/form/FormStepComponent";
import { useAuth } from "@/lib/hooks/useAuth";
import { apiService } from "@/lib/api-service";
import { calculateFormProgress } from "@/lib/form-progress";

export default function FormPage() {
  const params = useParams();
  const router = useRouter();
  useAuth();
  const applicantId = params.id as string;

  const [formData, setFormData] = useState<FormData | null>(null);
  const [formProgress, setFormProgress] = useState<FormProgress>({
    currentStep: 0,
    completedSteps: [],
    answers: {},
  });
  const [calculatedProgress, setCalculatedProgress] = useState<{
    totalSteps: number;
    completedSteps: number;
    totalFields: number;
    completedFields: number;
    progressPercentage: number;
    stepProgress: Array<{
      stepIndex: number;
      stepId: string;
      stepTitle: string;
      totalFields: number;
      completedFields: number;
      progressPercentage: number;
      isCompleted: boolean;
      fields: Array<{
        fieldId: string;
        fieldText: string;
        isCompleted: boolean;
        hasValue: boolean;
      }>;
    }>;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Carregar dados do formulário
  useEffect(() => {
    const loadFormData = async () => {
      try {
        setIsLoading(true);
        
        // Buscar form_questions via API
        const response = await apiService.getFormQuestionsByApplicant(applicantId);
        
        if (response.error) {
          console.error("Erro ao carregar formulário:", response.error);
          return;
        }

        const { questions } = response.data || {};
        
        // Converter as perguntas do formato JSON para FormData
        const steps = Array.isArray(questions) ? questions as FormStep[] : (questions?.steps as FormStep[] || []);
        const formData: FormData = {
          steps,
          totalSteps: steps.length
        };

        setFormData(formData);

        // Carregar respostas salvas do banco
        const savedAnswersResponse = await apiService.getFormAnswers(applicantId);
        if (savedAnswersResponse.data && savedAnswersResponse.data.hasAnswers) {
          setFormProgress(prev => ({ 
            ...prev, 
            answers: savedAnswersResponse.data!.answers as FormAnswer
          }));
          
          // Definir progresso calculado se disponível
          if (savedAnswersResponse.data.progress) {
            setCalculatedProgress(savedAnswersResponse.data.progress as {
              totalSteps: number;
              completedSteps: number;
              totalFields: number;
              completedFields: number;
              progressPercentage: number;
              stepProgress: Array<{
                stepIndex: number;
                stepId: string;
                stepTitle: string;
                totalFields: number;
                completedFields: number;
                progressPercentage: number;
                isCompleted: boolean;
                fields: Array<{
                  fieldId: string;
                  fieldText: string;
                  isCompleted: boolean;
                  hasValue: boolean;
                }>;
              }>;
            });
          }
        }

      } catch (error) {
        console.error("Erro ao carregar formulário:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (applicantId) {
      loadFormData();
    }
  }, [applicantId]);

  // Salvar progresso
  const saveProgress = async (answers?: FormAnswer) => {
    try {
      setIsSaving(true);
      
      const answersToSave = answers || formProgress.answers;
      const response = await apiService.saveFormAnswers(applicantId, answersToSave, false);
      
      if (response.error) {
        console.error("Erro ao salvar:", response.error);
        return;
      }
      
      setHasUnsavedChanges(false);
      setFormProgress(prev => ({
        ...prev,
        lastSaved: response.data?.savedAt
      }));
      
      console.log("Progresso salvo com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar progresso:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Atualizar resposta
  const updateAnswer = (fieldId: string, value: string | boolean | number | null) => {
    const newAnswers = {
      ...formProgress.answers,
      [fieldId]: value
    };
    
    setFormProgress(prev => ({
      ...prev,
      answers: newAnswers
    }));
    
    // Recalcular progresso
    if (formData) {
      const progress = calculateFormProgress(formData, newAnswers);
      setCalculatedProgress(progress as {
        totalSteps: number;
        completedSteps: number;
        totalFields: number;
        completedFields: number;
        progressPercentage: number;
        stepProgress: Array<{
          stepIndex: number;
          stepId: string;
          stepTitle: string;
          totalFields: number;
          completedFields: number;
          progressPercentage: number;
          isCompleted: boolean;
          fields: Array<{
            fieldId: string;
            fieldText: string;
            isCompleted: boolean;
            hasValue: boolean;
          }>;
        }>;
      });
    }
    
    setHasUnsavedChanges(true);
  };

  // Navegar para próxima etapa
  const goToNextStep = () => {
    if (!formData) return;
    
    const currentStepIndex = formProgress.currentStep;
    const isLastStep = currentStepIndex >= formData.totalSteps - 1;
    
    if (isLastStep) {
      // Finalizar formulário
      handleSubmit();
    } else {
      // Marcar etapa como completa e avançar
      const newCompletedSteps = [...formProgress.completedSteps];
      if (!newCompletedSteps.includes(currentStepIndex)) {
        newCompletedSteps.push(currentStepIndex);
      }
      
      setFormProgress(prev => ({
        ...prev,
        currentStep: prev.currentStep + 1,
        completedSteps: newCompletedSteps
      }));
      
      // Salvar automaticamente ao final de cada etapa
      saveProgress();
    }
  };

  // Navegar para etapa anterior
  const goToPreviousStep = () => {
    if (formProgress.currentStep > 0) {
      setFormProgress(prev => ({
        ...prev,
        currentStep: prev.currentStep - 1
      }));
    }
  };

  // Ir para etapa específica
  const goToStep = (stepIndex: number) => {
    setFormProgress(prev => ({
      ...prev,
      currentStep: stepIndex
    }));
  };

  // Finalizar formulário
  const handleSubmit = async () => {
    try {
      // Salvar e marcar como completo
      const response = await apiService.saveFormAnswers(applicantId, formProgress.answers, true);
      
      if (response.error) {
        console.error("Erro ao finalizar formulário:", response.error);
        return;
      }
      
      console.log("Formulário finalizado com sucesso!");
      
      // Redirecionar de volta ao dashboard
      router.push("/protected/user");
    } catch (error) {
      console.error("Erro ao finalizar formulário:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-2">
          <Loader2 className="w-10 h-10 animate-spin mx-auto" />
          <p className="text-center">Carregando formulário...</p>
        </div>
      </div>
    );
  }

  if (!formData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-2">
          <p className="text-center text-red-500">Erro ao carregar formulário</p>
          <Button onClick={() => router.push("/protected/user")}>
            Voltar ao Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const currentStep = formData.steps[formProgress.currentStep];
  const isLastStep = formProgress.currentStep >= formData.totalSteps - 1;
  const progressPercentage = calculatedProgress?.progressPercentage ?? ((formProgress.currentStep + 1) / formData.totalSteps) * 100;

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 justify-center items-center sm:justify-start sm:items-start">
        <h1 className="text-3xl font-bold">Formulário de Aplicação</h1>
        <p className="text-muted-foreground text-center">
          Preencha todas as informações necessárias para sua aplicação de visto
        </p>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span>Etapa {formProgress.currentStep + 1} de {formData.totalSteps}</span>
              <span>{Math.round(progressPercentage)}% completo</span>
            </div>
            <Progress value={progressPercentage} className="h-3" />
            
            {/* Informações detalhadas do progresso */}
            {/* {calculatedProgress && (
              <div className="text-xs text-muted-foreground">
                {calculatedProgress.completedFields} de {calculatedProgress.totalFields} campos preenchidos
                {calculatedProgress.completedSteps > 0 && (
                  <span> • {calculatedProgress.completedSteps} etapa(s) completa(s)</span>
                )}
              </div>
            )} */}
            
            {/* Step Indicators */}
            <div className="relative">
              <div className="flex gap-2 overflow-x-auto pb-4 step-indicators-scroll">
                {formData.steps.map((step, index) => {
                  const stepProgress = calculatedProgress?.stepProgress?.find(sp => sp.stepIndex === index);
                  const isPreenchido = (stepProgress?.progressPercentage ?? 0) > 0;
                  const isCurrentStep = index === formProgress.currentStep;
                  const isCompleted = formProgress.completedSteps.includes(index);
                  
                  // Remove prefixos e artigos do início do título da etapa
                  const cleanTitle = (title: string): string => {
                    if (!title) return title;
                    
                    // Remove "Informações sobre"
                    let cleaned = title.replace(/^Informações sobre\s+/i, '');
                    // Remove "Informações"
                    cleaned = cleaned.replace(/^Informações\s+/i, '');
                    // Remove artigos (o, a, os, as) no início da string
                    cleaned = cleaned.replace(/^(o|a|os|as|de|da|do|das|dos)\s+/i, '');
                    // Remove espaços extras no início
                    cleaned = cleaned.trim();
                    
                    return cleaned;
                  };
                  const stepTitle = cleanTitle(step.section) || `Etapa ${index + 1}`;
                  
                  return (
                    <button
                      key={step.section || `step-${index}`}
                      onClick={() => goToStep(index)}
                      className={`
                        flex flex-col items-center gap-2 min-w-[80px] max-w-[150px] px-3 py-2 rounded-lg transition-all cursor-pointer
                        ${isCurrentStep 
                          ? 'bg-primary text-primary-foreground shadow-md' 
                          : isPreenchido
                            ? 'bg-primary/20 hover:bg-primary/30 text-foreground' 
                            : 'bg-secondary/5 text-foreground'
                        }
                      `}
                    >
                      <div className="flex items-center justify-center h-6 w-6 rounded-full border-2 shrink-0 relative"
                        style={{
                          backgroundColor: isCompleted || isPreenchido ? 'secondary' : '`transparent`',
                          borderColor: isCurrentStep ? 'currentColor' : 'currentColor',
                          opacity: isPreenchido || isCurrentStep ? 1 : 0.5
                        }}
                      >
                        {isCompleted || isPreenchido ? (
                          <div className="flex items-center justify-center absolute inset-0">
                            <svg 
                              className={`h-3 w-3 ${isCurrentStep ? 'text-primary-foreground' : 'text-foreground'}`}
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        ) : (
                          <span className="text-xs font-medium">{index + 1}</span>
                        )}
                      </div>
                      <span className="text-xs font-medium text-center leading-tight line-clamp-2">
                        {stepTitle}
                      </span>
                      {isPreenchido && !isCompleted && (
                        <div className="h-1 w-full bg-primary/30 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary transition-all"
                            style={{ width: `${stepProgress?.progressPercentage ?? 0}%` }}
                          />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form Step */}
      <Card>
        <CardHeader>
          <CardTitle>{currentStep.section}</CardTitle>
        </CardHeader>
        <CardContent>
          <FormStepComponent
            fields={currentStep.fields}
            answers={formProgress.answers}
            onAnswerChange={updateAnswer}
          />
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={goToPreviousStep}
            disabled={formProgress.currentStep === 0}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Anterior
          </Button>
          
          <Button
            variant="outline"
            onClick={() => saveProgress()}
            disabled={isSaving || !hasUnsavedChanges}
          >
            {isSaving ? (
              <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Salvar Progresso
          </Button>
        </div>

        <Button
          onClick={goToNextStep}
          disabled={isSaving}
        >
          {isLastStep ? (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              Finalizar
            </>
          ) : (
            <>
              Próximo
              <ArrowRight className="h-4 w-4 ml-2" />
            </>
          )}
        </Button>
      </div>

      {/* Save Status */}
      {formProgress.lastSaved && (
        <p className="text-sm text-muted-foreground text-center">
          Último salvamento: {new Date(formProgress.lastSaved).toLocaleString()}
        </p>
      )}
    </div>
  );
}
