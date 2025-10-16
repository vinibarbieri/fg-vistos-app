"use client";

import { useState, useEffect } from "react";
import { ProcessInfo } from "@/components/process-info";
import { VisaApplications } from "@/components/visa-applications";
import { DEFAULT_PROCESS_STEPS, ProcessStep } from "@/types/process";
import { ApplicantT } from "@/types/ApplicantT";
import { 
  getResponsibleDataAPI, 
  getResponsibleApplicationsAPI, 
  updateApplicantNameAPI,
  getFormStatusProgress,
} from "@/lib/api/responsible-api";
import { useAuth } from "@/lib/hooks/useAuth";
import { apiService } from "@/lib/api-service";

interface ClienteDashboardProps {
  clientId?: string;
}

export function ClienteDashboard({ clientId }: ClienteDashboardProps = {}) {
  const { user, loading: authLoading, userId } = useAuth();
  const [applicants, setApplicants] = useState<ApplicantT[]>([]);
  const [statusProcesso, setStatusProcesso] = useState<string>("");
  const [responsibleData, setResponsibleData] = useState<{ name: string; email: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editingNames, setEditingNames] = useState<Set<string>>(new Set());

  // Usar os passos padrão e modificar baseado no status real
  const [processSteps, setProcessSteps] = useState<ProcessStep[]>(DEFAULT_PROCESS_STEPS);

  // Determinar qual userId usar: clientId específico ou usuário logado
  const targetUserId = clientId || userId;

  // Carregar dados do responsável e aplicações
  useEffect(() => {
    if (!targetUserId) return;

    const loadData = async () => {
      try {
        setIsLoading(true);

        // Buscar dados do responsável
        const responsible = await getResponsibleDataAPI(targetUserId);
        setResponsibleData(responsible);

        // Buscar aplicações do responsável
        const applications = await getResponsibleApplicationsAPI(targetUserId);

        // Buscar progresso real de cada applicant
        const applicantsProgress = applications.map(async (applicant) => {
          let progressValue: number;
          try {
            const progressResponse = await apiService.getFormAnswers(applicant.id);
            progressValue = progressResponse.data?.progress?.progressPercentage || getFormStatusProgress(applicant.form_status)
          } catch (error) {
            console.error(`Erro ao buscar progresso do applicant ${applicant.id}:`, error);
            progressValue = getFormStatusProgress(applicant.form_status)
          }
          
          return {
            ...applicant,
            progress: progressValue
          };
        });

        const finalApplicants = await Promise.all(applicantsProgress);
        
        setApplicants(finalApplicants);
        
        // Atualizar passos do processo baseado no status
        updateProcessSteps(finalApplicants[0].status);

      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [targetUserId]);

  // Atualizar passos do processo baseado no status
  const updateProcessSteps = (status: string) => {
    const newSteps = [...DEFAULT_PROCESS_STEPS];
    
    switch (status) {
      case 'rejeitado':
        newSteps.forEach(step => step.completed = true);
        break;
      case 'aprovado':
        newSteps.forEach(step => step.completed = true);
        break;
      case 'entrevista':
        newSteps.slice(0, 4).forEach(step => step.completed = true);
        break;
      case 'documentos_em_analise':
        newSteps.slice(0, 3).forEach(step => step.completed = true);
        break;
      case 'documentos_enviados':
        newSteps.slice(0, 2).forEach(step => step.completed = true);
        break;
      case 'pago':
        newSteps.slice(0, 1).forEach(step => step.completed = true);
        break;
      case 'pendente':
        newSteps.slice(0, 0).forEach(step => step.completed = true);
        break;
    }
    
    setProcessSteps(newSteps);
  };

  const handleNameChange = (newName: string) => {
    console.log("Nome do responsável alterado para:", newName);
    // TODO: Implementar atualização no banco
  };

  const handleEditPersonName = async (personId: string, newName: string) => {
    // Adicionar o ID do aplicante ao set de edição
    setEditingNames(prev => new Set(prev).add(personId));
    
    try {
      const success = await updateApplicantNameAPI(personId, newName);
      if (success) {
        setApplicants(prev => 
          prev.map(applicant => 
            applicant.id === personId 
              ? { ...applicant, name: newName }
              : applicant
          )
        );
      }
    } catch (error) {
      console.error("Erro ao atualizar nome:", error);
    } finally {
      // Remover o ID do aplicante do set de edição
      setEditingNames(prev => {
        const newSet = new Set(prev);
        newSet.delete(personId);
        return newSet;
      });
    }
  };



  if (authLoading || isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex flex-col gap-2">
          <p className="text-center">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header da página */}
      <div className="flex flex-col items-center justify-center gap-2">
        <h1 className="text-3xl font-bold">Acompanhe o seu processo</h1>
        <p className="text-muted-foreground text-center">
          Seu visto está sendo processado. Acompanhe o progresso aqui.
        </p>
      </div>

      {/* Informações do Processo */}
      <ProcessInfo
        responsibleName={responsibleData?.name || "Carregando..."}
        responsibleEmail={responsibleData?.email || "carregando@email.com"}
        processSteps={processSteps}
        onNameChange={handleNameChange}
      />

      {/* Minhas Aplicações de Visto */}
      <VisaApplications
        applicants={applicants}
        onEditName={handleEditPersonName}
        editingNames={editingNames}
      />
    </div>
  );
}