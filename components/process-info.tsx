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
import { ProcessStep, getCurrentStep } from "@/types/process";

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
            <Label htmlFor="responsible-name" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Responsável
            </Label>
            <Input
              id="responsible-name"
              value={name}
              onChange={handleNameChange}
              placeholder="Digite o nome do responsável"
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
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
            <Stepper value={activeStep} className="w-full">
              {processSteps.map((step, index) => (
                <StepperItem
                  key={step.step}
                  step={step.step}
                  completed={step.completed}
                  className="max-md:items-start [&:not(:last-child)]:flex-1"
                >
                  <StepperTrigger className="max-md:flex-col">
                    <StepperIndicator />
                    <div className="text-center md:text-left">
                      <StepperTitle>{step.title}</StepperTitle>
                      {step.description && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {step.description}
                        </p>
                      )}
                    </div>
                  </StepperTrigger>
                  {index < processSteps.length - 1 && (
                    <StepperSeparator className="max-md:mt-3.5 md:mx-4" />
                  )}
                </StepperItem>
              ))}
            </Stepper>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 