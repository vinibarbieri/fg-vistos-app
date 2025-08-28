import { createClient } from "@/lib/supabase/client";
import { ApplicantT } from "@/types/ApplicantT";

// ============================================================================
// FUNÇÕES PARA BUSCAR DADOS DO PROCESSO
// ============================================================================

// Buscar status do processo baseado nos aplicantes
export async function getProcessStatus(userId: string): Promise<string> {
  try {
    const supabase = createClient();
    
    // Buscar todos os aplicantes do usuário
    const { data: applicants, error } = await supabase
      .from('applicants')
      .select('status')
      .eq('resposible_user_id', userId);
      
    if (error) {
      console.error('Erro ao buscar status do processo:', error);
      return 'pending';
    }
    
    if (!applicants || applicants.length === 0) {
      return 'pending';
    }
    
    // Determinar status geral baseado nos status dos aplicantes
    const statuses = applicants.map(a => a.status);
    
    // Se todos estão aprovados, processo está completo
    if (statuses.every(s => s === 'approved')) {
      return 'completed';
    }
    
    // Se algum foi rejeitado, processo falhou
    if (statuses.some(s => s === 'rejected')) {
      return 'rejected';
    }
    
    // Se algum está em análise, processo está em andamento
    if (statuses.some(s => s === 'reviewing')) {
      return 'reviewing';
    }
    
    // Se algum foi enviado, processo está em análise
    if (statuses.some(s => s === 'submitted')) {
      return 'submitted';
    }
    
    // Padrão: em andamento
    return 'in_progress';
  } catch (error) {
    console.error('Erro ao buscar status do processo:', error);
    return 'pending';
  }
}

// Buscar informações detalhadas do processo
export async function getProcessDetails(userId: string): Promise<{
  status: string;
  totalApplicants: number;
  completedForms: number;
  pendingForms: number;
  overallProgress: number;
}> {
  try {
    const supabase = createClient();
    
    // Buscar todos os aplicantes do usuário
    const { data: applicants, error } = await supabase
      .from('applicants')
      .select('status, form_status')
      .eq('resposible_user_id', userId);
      
    if (error) {
      console.error('Erro ao buscar detalhes do processo:', error);
      return {
        status: 'pending',
        totalApplicants: 0,
        completedForms: 0,
        pendingForms: 0,
        overallProgress: 0
      };
    }
    
    if (!applicants || applicants.length === 0) {
      return {
        status: 'pending',
        totalApplicants: 0,
        completedForms: 0,
        pendingForms: 0,
        overallProgress: 0
      };
    }
    
    const totalApplicants = applicants.length;
    const completedForms = applicants.filter(a => a.form_status === 'completed').length;
    const pendingForms = applicants.filter(a => a.form_status === 'not_started').length;
    
    // Calcular progresso geral baseado no form_status
    const progressMap: Record<string, number> = {
      'not_started': 0,
      'in_progress': 50,
      'completed': 100
    };
    
    const totalProgress = applicants.reduce((sum, applicant) => {
      return sum + (progressMap[applicant.form_status] || 0);
    }, 0);
    
    const overallProgress = Math.round(totalProgress / totalApplicants);
    
    // Determinar status geral
    const statuses = applicants.map(a => a.status);
    let processStatus = 'in_progress';
    
    if (statuses.every(s => s === 'approved')) {
      processStatus = 'completed';
    } else if (statuses.some(s => s === 'rejected')) {
      processStatus = 'rejected';
    } else if (statuses.some(s => s === 'reviewing')) {
      processStatus = 'reviewing';
    } else if (statuses.some(s => s === 'submitted')) {
      processStatus = 'submitted';
    }
    
    return {
      status: processStatus,
      totalApplicants,
      completedForms,
      pendingForms,
      overallProgress
    };
  } catch (error) {
    console.error('Erro ao buscar detalhes do processo:', error);
    return {
      status: 'pending',
      totalApplicants: 0,
      completedForms: 0,
      pendingForms: 0,
      overallProgress: 0
    };
  }
}

// Buscar estatísticas do processo
export async function getProcessStats(userId: string): Promise<{
  totalApplications: number;
  applicationsInProgress: number;
  applicationsCompleted: number;
  applicationsPending: number;
  averageFormProgress: number;
}> {
  try {
    const supabase = createClient();
    
    // Buscar todos os aplicantes do usuário
    const { data: applicants, error } = await supabase
      .from('applicants')
      .select('status, form_status')
      .eq('resposible_user_id', userId);
      
    if (error) {
      console.error('Erro ao buscar estatísticas do processo:', error);
      return {
        totalApplications: 0,
        applicationsInProgress: 0,
        applicationsCompleted: 0,
        applicationsPending: 0,
        averageFormProgress: 0
      };
    }
    
    if (!applicants || applicants.length === 0) {
      return {
        totalApplications: 0,
        applicationsInProgress: 0,
        applicationsCompleted: 0,
        applicationsPending: 0,
        averageFormProgress: 0
      };
    }
    
    const totalApplications = applicants.length;
    const applicationsInProgress = applicants.filter(a => a.form_status === 'in_progress').length;
    const applicationsCompleted = applicants.filter(a => a.form_status === 'completed').length;
    const applicationsPending = applicants.filter(a => a.form_status === 'not_started').length;
    
    // Calcular progresso médio dos formulários
    const progressMap: Record<string, number> = {
      'not_started': 0,
      'in_progress': 50,
      'completed': 100
    };
    
    const totalProgress = applicants.reduce((sum, applicant) => {
      return sum + (progressMap[applicant.form_status] || 0);
    }, 0);
    
    const averageFormProgress = Math.round(totalProgress / totalApplications);
    
    return {
      totalApplications,
      applicationsInProgress,
      applicationsCompleted,
      applicationsPending,
      averageFormProgress
    };
  } catch (error) {
    console.error('Erro ao buscar estatísticas do processo:', error);
    return {
      totalApplications: 0,
      applicationsInProgress: 0,
      applicationsCompleted: 0,
      applicationsPending: 0,
      averageFormProgress: 0
    };
  }
}

// ============================================================================
// FUNÇÕES UTILITÁRIAS
// ============================================================================

// Obter informações do status do processo
export function getProcessStatusInfo(status: string) {
  switch (status) {
    case "pending":
      return { 
        label: "Pendente", 
        color: "bg-yellow-500", 
        description: "Processo aguardando início" 
      };
    case "in_progress":
      return { 
        label: "Em Andamento", 
        color: "bg-blue-500", 
        description: "Processo sendo executado" 
      };
    case "submitted":
      return { 
        label: "Enviado", 
        color: "bg-orange-500", 
        description: "Processo enviado para análise" 
      };
    case "reviewing":
      return { 
        label: "Em Análise", 
        color: "bg-purple-500", 
        description: "Sendo analisado pela equipe" 
      };
    case "completed":
      return { 
        label: "Concluído", 
        color: "bg-green-500", 
        description: "Processo finalizado com sucesso" 
      };
    case "rejected":
      return { 
        label: "Rejeitado", 
        color: "bg-red-500", 
        description: "Processo foi rejeitado" 
      };
    default:
      return { 
        label: "Pendente", 
        color: "bg-yellow-500", 
        description: "Status não definido" 
      };
  }
}

// Calcular progresso baseado no status
export function calculateProgressFromStatus(status: string): number {
  const progressMap: Record<string, number> = {
    'pending': 0,
    'in_progress': 25,
    'submitted': 50,
    'reviewing': 75,
    'completed': 100,
    'rejected': 0
  };
  
  return progressMap[status] || 0;
}
