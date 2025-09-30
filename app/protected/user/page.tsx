"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { ProcessInfo } from "@/components/process-info";
import { VisaApplications } from "@/components/visa-applications";
import { DEFAULT_PROCESS_STEPS, ProcessStep } from "@/types/process";
import { ApplicantT } from "@/types/ApplicantT";
import { 
  getResponsibleDataAPI, 
  getResponsibleApplicationsAPI, 
  updateApplicantNameAPI,
  getFormStatusProgress,
  getFormStatusInfo
} from "@/lib/api/responsible-api";
import { 
  getProcessStatusAPI
} from "@/lib/api/responsible-api";
import { useAuth } from "@/lib/hooks/useAuth";
import { ClienteDashboard } from "@/components/pages/cliente/clienteDashboard";

export default function ResponsiblePage() {
  const searchParams = useSearchParams();
  const clientId = searchParams.get('clientId');
  
  // Se há um clientId, usar o ClienteDashboard com o clientId específico
  if (clientId) {
    return <ClienteDashboard clientId={clientId} />;
  }

  // Caso contrário, usar a lógica original para o usuário logado
  const { user, loading: authLoading, userId } = useAuth();
  const [applicants, setApplicants] = useState<ApplicantT[]>([]);
  const [responsibleData, setResponsibleData] = useState<{ name: string; email: string } | null>(null);
  const [processStatus, setProcessStatus] = useState<string>('pending');
  const [isLoading, setIsLoading] = useState(true);

  // Usar os passos padrão e modificar baseado no status real
  const [processSteps, setProcessSteps] = useState<ProcessStep[]>(DEFAULT_PROCESS_STEPS);

  // Carregar dados do responsável e aplicações
  useEffect(() => {
    if (!userId) return;

    const loadData = async () => {
      try {
        setIsLoading(true);

        // Buscar dados do responsável
        const responsible = await getResponsibleDataAPI(userId);
        setResponsibleData(responsible);

        // Buscar aplicações do responsável
        const applications = await getResponsibleApplicationsAPI(userId);
        setApplicants(applications);

        // Buscar status do processo
        const status = await getProcessStatusAPI(userId);
        setProcessStatus(status);

        // Atualizar passos do processo baseado no status
        updateProcessSteps(status);

      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [userId]);

  // Atualizar passos do processo baseado no status
  const updateProcessSteps = (status: string) => {
    const newSteps = [...DEFAULT_PROCESS_STEPS];
    
    switch (status) {
      case 'completed':
        newSteps.forEach(step => step.completed = true);
        break;
      case 'reviewing':
        newSteps.slice(0, 4).forEach(step => step.completed = true);
        break;
      case 'submitted':
        newSteps.slice(0, 3).forEach(step => step.completed = true);
        break;
      case 'in_progress':
        newSteps.slice(0, 2).forEach(step => step.completed = true);
        break;
      case 'pending':
        newSteps.slice(0, 1).forEach(step => step.completed = true);
        break;
    }
    
    setProcessSteps(newSteps);
  };

  const handleNameChange = (newName: string) => {
    console.log("Nome do responsável alterado para:", newName);
    // TODO: Implementar atualização no banco
  };

  const handleEditPersonName = async (personId: string, newName: string) => {
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
    }
  };

  const handleFillForm = (personId: string) => {
    console.log("Abrir formulário para aplicante:", personId);
    // TODO: Implementar navegação para o formulário
    // Por exemplo: router.push(`/protected/user/form/${personId}`);
  };



  if (authLoading || isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold">Área do visto</h1>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  // Converter ApplicantT para Person (interface esperada pelo componente)
  const people = applicants.map(applicant => ({
    id: applicant.id,
    name: applicant.name,
    progress: getFormStatusProgress(applicant.form_status),
    status: (applicant.form_status === 'completed' ? 'completed' : 
            applicant.form_status === 'in_progress' ? 'in_progress' : 'not_started') as 'not_started' | 'in_progress' | 'completed',
    formData: {},
    created_at: applicant.created_at,
    updated_at: applicant.updated_at
  }));

  return (
    <div className="space-y-6">
      {/* Header da página */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Acompanhe o seu processo</h1>
        <p className="text-muted-foreground">
          Bem-vindo ao sistema da FG Vistos. Acompanhe o progresso do seu processo.
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
        people={people}
        onEditName={handleEditPersonName}
        onFillForm={handleFillForm}
      />
    </div>
  );
} 