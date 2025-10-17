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
  deleteApplicantAPI,
  updateApplicantFormStatusAPI,
  updateResponsibleNameAPI,
} from "@/lib/api/responsible-api";
import { useAuth } from "@/lib/hooks/useAuth";
import { apiService } from "@/lib/api-service";
import { Loader2 } from "lucide-react";
import { updateProcessSteps } from "@/utils/updateProcessSteps";

interface ClienteDashboardProps {
  clientId?: string;
}

export function ClienteDashboard({ clientId }: ClienteDashboardProps = {}) {
  const { loading: authLoading, userId, userRole } = useAuth();
  const [applicants, setApplicants] = useState<ApplicantT[]>([]);
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
        if (finalApplicants.length > 0) {
          setProcessSteps(updateProcessSteps(finalApplicants[0].status));
        }

      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [targetUserId]);


  const handleNameChange = async (newName: string) => {
    if (!targetUserId || !newName.trim()) return;
    
    try {
      const success = await updateResponsibleNameAPI(targetUserId, newName.trim());
      if (success) {
        // Atualizar o estado local com o novo nome
        setResponsibleData(prev => 
          prev ? { ...prev, name: newName.trim() } : null
        );
      } else {
        console.error("Falha ao atualizar nome do responsável");
      }
    } catch (error) {
      console.error("Erro ao atualizar nome do responsável:", error);
    }
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


  const handleDeleteApplicant = async (applicantId: string) => {
    if (!confirm("Tem certeza que deseja deletar este aplicante?")) return;
    
    try {
      const success = await deleteApplicantAPI(applicantId);
      if (success) {
        setApplicants(prev => prev.filter(applicant => applicant.id !== applicantId));
      }
    } catch (error) {
      console.error("Erro ao deletar applicant:", error);
    }
  };

  const handleUpdateFormStatus = async (applicantId: string, formStatus: string) => {
    try {
      const success = await updateApplicantFormStatusAPI(applicantId, formStatus);
      if (success) {
        setApplicants(prev => 
          prev.map(applicant => 
            applicant.id === applicantId 
              ? { ...applicant, form_status: formStatus }
              : applicant
          )
        );
      }
    } catch (error) {
      console.error("Erro ao atualizar form_status:", error);
    }
  };

  // Verificar se o usuário é funcionário ou admin
  const isStaff = userRole === "funcionario" || userRole === "admin";



  if (authLoading || isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex flex-col gap-2">
          <Loader2 className="w-10 h-10 animate-spin mx-auto" />
          <p className="text-center">Carregando...</p>
        </div>
      </div>
    );
  }

  const applicantResponsavel = applicants.find(applicant => applicant.is_responsible);

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
        statusProcesso={applicantResponsavel?.status || "pendente"}
        userIdResponsavel={applicantResponsavel?.responsible_user_id || ""}
        onNameChange={handleNameChange}
      />

      {/* Minhas Aplicações de Visto */}
      <VisaApplications
        applicantsProps={applicants}
        userIdResponsavel={applicantResponsavel?.responsible_user_id || ""}
        onEditName={handleEditPersonName}
        editingNames={editingNames}
        isStaff={isStaff}
        onDeleteApplicant={handleDeleteApplicant}
        onUpdateFormStatus={handleUpdateFormStatus}
      />
    </div>
  );
}