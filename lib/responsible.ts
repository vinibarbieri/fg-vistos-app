import { createClient } from "@/lib/supabase/client";
import { ApplicantT } from "@/types/ApplicantT";

// ============================================================================
// FUNÇÕES DO BACKEND - INTEGRADAS COM SUPABASE
// ============================================================================

// Buscar dados do responsável (profiles)
export async function getResponsibleData(userId: string): Promise<{ name: string; email: string } | null> {
  try {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('profiles')
      .select('name, email')
      .eq('id', userId)
      .single();
      
    if (error) {
      console.error('Erro ao buscar dados do responsável:', error);
      return null;
    }
    
    return {
      name: data.name,
      email: data.email
    };
  } catch (error) {
    console.error('Erro ao buscar dados do responsável:', error);
    return null;
  }
}

// Buscar todas as aplicações onde o usuário é responsável
export async function getResponsibleApplications(userId: string): Promise<ApplicantT[]> {
  try {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('applicants')
      .select('*')
      .eq('resposible_user_id', userId)
      .order('created_at', { ascending: true });
      
    if (error) {
      console.error('Erro ao buscar aplicações:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Erro ao buscar aplicações:', error);
    return [];
  }
}

// Buscar dados de um aplicante específico
export async function getApplicantData(applicantId: string): Promise<ApplicantT | null> {
  try {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('applicants')
      .select('*')
      .eq('id', applicantId)
      .single();
      
    if (error) {
      console.error('Erro ao buscar dados do aplicante:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Erro ao buscar dados do aplicante:', error);
    return null;
  }
}

// Adicionar novo aplicante
export async function addApplicant(responsibleId: string, orderId: string): Promise<ApplicantT | null> {
  try {
    const supabase = createClient();
    
    // Contar aplicantes existentes para gerar nome padrão
    const { count } = await supabase
      .from('applicants')
      .select('*', { count: 'exact', head: true })
      .eq('resposible_user_id', responsibleId);
      
    const applicantNumber = (count || 0) + 1;
    const defaultName = `Aplicante ${applicantNumber}`;
    
    const { data, error } = await supabase
      .from('applicants')
      .insert({
        resposible_user_id: responsibleId,
        order_id: orderId,
        is_responsible: false,
        name: defaultName,
        status: 'pending',
        form_status: 'not_started',
        form_answer: '',
        attachment_id: null
      })
      .select()
      .single();
      
    if (error) {
      console.error('Erro ao adicionar aplicante:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Erro ao adicionar aplicante:', error);
    return null;
  }
}

// Atualizar nome do aplicante
export async function updateApplicantName(applicantId: string, newName: string): Promise<boolean> {
  try {
    const supabase = createClient();
    
    const { error } = await supabase
      .from('applicants')
      .update({
        name: newName,
        updated_at: new Date().toISOString()
      })
      .eq('id', applicantId);
      
    if (error) {
      console.error('Erro ao atualizar nome do aplicante:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao atualizar nome do aplicante:', error);
    return false;
  }
}

// Atualizar status do formulário do aplicante
export async function updateApplicantFormStatus(applicantId: string, formStatus: string): Promise<boolean> {
  try {
    const supabase = createClient();
    
    const { error } = await supabase
      .from('applicants')
      .update({
        form_status: formStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', applicantId);
      
    if (error) {
      console.error('Erro ao atualizar status do formulário:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao atualizar status do formulário:', error);
    return false;
  }
}

// Atualizar status geral do aplicante
export async function updateApplicantStatus(applicantId: string, status: string): Promise<boolean> {
  try {
    const supabase = createClient();
    
    const { error } = await supabase
      .from('applicants')
      .update({
        status: status,
        updated_at: new Date().toISOString()
      })
      .eq('id', applicantId);
      
    if (error) {
      console.error('Erro ao atualizar status do aplicante:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao atualizar status do aplicante:', error);
    return false;
  }
}

// ============================================================================
// FUNÇÕES UTILITÁRIAS
// ============================================================================

// Gerar nome padrão para novo aplicante
export function generateDefaultName(applicants: ApplicantT[]): string {
  const applicantNumber = applicants.length + 1;
  return `Aplicante ${applicantNumber}`;
}

// Verificar se nome já existe
export function isNameTaken(applicants: ApplicantT[], name: string, excludeId?: string): boolean {
  return applicants.some(applicant => 
    applicant.name.toLowerCase() === name.toLowerCase() && 
    applicant.id !== excludeId
  );
}

// Calcular progresso médio baseado no form_status
export function calculateAverageProgress(applicants: ApplicantT[]): number {
  if (applicants.length === 0) return 0;
  
  const progressMap: Record<string, number> = {
    'not_started': 0,
    'in_progress': 50,
    'completed': 100
  };
  
  const totalProgress = applicants.reduce((sum, applicant) => {
    return sum + (progressMap[applicant.form_status] || 0);
  }, 0);
  
  return Math.round(totalProgress / applicants.length);
}

// Mapear form_status para progresso numérico
export function getFormStatusProgress(formStatus: string): number {
  const progressMap: Record<string, number> = {
    'not_started': 0,
    'in_progress': 50,
    'completed': 100
  };
  
  return progressMap[formStatus] || 0;
}

// Obter informações do status do formulário
export function getFormStatusInfo(formStatus: string) {
  switch (formStatus) {
    case "not_started":
      return { 
        label: "Não Iniciado", 
        color: "bg-gray-500", 
        description: "Formulário ainda não foi preenchido" 
      };
    case "in_progress":
      return { 
        label: "Em Andamento", 
        color: "bg-blue-500", 
        description: "Formulário sendo preenchido" 
      };
    case "completed":
      return { 
        label: "Completo", 
        color: "bg-green-500", 
        description: "Formulário totalmente preenchido" 
      };
    default:
      return { 
        label: "Não Iniciado", 
        color: "bg-gray-500", 
        description: "Status não definido" 
      };
  }
} 