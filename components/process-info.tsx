"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Stepper,
  StepperIndicator,
  StepperItem,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from "@/components/ui/stepper";
import { User, Mail, FileText } from "lucide-react";
import { ProcessStep, getCurrentStep, getStepDescription } from "@/types/process";

interface ProcessInfoProps {
  responsibleName: string;
  responsibleEmail: string;
  processSteps: ProcessStep[];
  onNameChange?: (name: string) => void;
}

export function ProcessInfo({
  responsibleName,
  responsibleEmail,
  processSteps,
  onNameChange
}: ProcessInfoProps) {
  const [name, setName] = useState(responsibleName);
  
  // Encontrar o passo atual usando a função utilitária
  const activeStep = getCurrentStep(processSteps);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);
    onNameChange?.(newName);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Status da Aplicação
        </CardTitle>
        <CardDescription>
          Dados do responsável e status atual do processo de visto
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Informações do Responsável */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="responsible-name" className="flex items-center gap-2 text-sm font-medium">
              <User className="h-4 w-4" />
              Responsável
            </Label>
            <Input
              id="responsible-name"
              value={name}
              onChange={handleNameChange}
              placeholder="Digite o nome do responsável"
              className="text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <Mail className="h-4 w-4" />
              Email
            </Label>
            <div className="flex items-center h-10 px-3 text-sm border border-input bg-background rounded-md">
              {responsibleEmail}
            </div>
          </div>
        </div>

        {/* Status do Processo */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-4">Status do Processo</h3>
            
            {/* Layout Desktop - Stepper horizontal */}
            <div className="hidden md:block">
              <Stepper value={activeStep} className="w-full">
                {processSteps.map((step, index) => {
                  const dynamicDescription = getStepDescription(step, activeStep, index);
                  return (
                    <StepperItem
                      key={step.step}
                      step={step.step}
                      completed={step.completed}
                      className="[&:not(:last-child)]:flex-1"
                    >
                      <StepperTrigger>
                        <StepperIndicator />
                        <div className="text-left">
                          <StepperTitle className="text-sm font-medium">{step.title}</StepperTitle>
                          <p className="text-xs text-muted-foreground mt-1">
                            {dynamicDescription}
                          </p>
                        </div>
                      </StepperTrigger>
                      {index < processSteps.length - 1 && (
                        <StepperSeparator className="mx-4" />
                      )}
                    </StepperItem>
                  );
                })}
              </Stepper>
            </div>

            {/* Layout Mobile - Lista vertical compacta */}
            <div className="md:hidden space-y-3">
              {processSteps.map((step, index) => {
                const dynamicDescription = getStepDescription(step, activeStep, index);
                const isActive = index + 1 === activeStep;
                const isCompleted = step.completed;
                
                return (
                  <div
                    key={step.step}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                      isActive 
                        ? 'bg-primary/5 border-primary/20' 
                        : isCompleted 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    {/* Indicador circular */}
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${
                      isCompleted 
                        ? 'bg-green-500 text-white' 
                        : isActive 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-gray-300 text-gray-600'
                    }`}>
                      {isCompleted ? '✓' : step.step}
                    </div>
                    
                    {/* Conteúdo do step */}
                    <div className="flex-1 min-w-0">
                      <h4 className={`text-sm font-medium ${
                        isActive ? 'text-primary' : isCompleted ? 'text-green-700' : 'text-gray-700'
                      }`}>
                        {step.title}
                      </h4>
                      <p className={`text-xs mt-0.5 ${
                        isActive ? 'text-primary/70' : isCompleted ? 'text-green-600' : 'text-gray-500'
                      }`}>
                        {dynamicDescription}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 