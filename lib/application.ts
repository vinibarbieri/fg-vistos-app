import { Application, ApplicationStatus } from "@/types/application";

// ============================================================================
// FUNÇÕES DO BACKEND - DESATIVADAS POR ENQUANTO
// ============================================================================

/*
// Buscar aplicação do usuário
export async function getUserApplication(userId: string): Promise<Application | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('applications')
    .select('*')
    .eq('client_id', userId)
    .single();
    
  if (error) {
    console.error('Erro ao buscar aplicação:', error);
    return null;
  }
  
  return data;
}

// Criar nova aplicação
export async function createApplication(userId: string): Promise<Application | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('applications')
    .insert({
      client_id: userId,
      current_step: 1,
      progress_percentage: 0,
      status: 'draft',
      step_data: {}
    })
    .select()
    .single();
    
  if (error) {
    console.error('Erro ao criar aplicação:', error);
    return null;
  }
  
  return data;
}

// Salvar dados de uma etapa
export async function saveStepData(
  applicationId: string, 
  stepKey: string, 
  data: any
): Promise<boolean> {
  const supabase = await createClient();
  
  // Buscar dados atuais
  const { data: currentData } = await supabase
    .from('applications')
    .select('step_data, current_step, progress_percentage')
    .eq('id', applicationId)
    .single();
    
  if (!currentData) return false;
  
  // Atualizar dados da etapa
  const updatedStepData = {
    ...currentData.step_data,
    [stepKey]: data
  };
  
  // Calcular novo progresso
  const completedSteps = Object.keys(updatedStepData).length;
  const newProgress = Math.round((completedSteps / 5) * 100);
  
  // Atualizar aplicação
  const { error } = await supabase
    .from('applications')
    .update({
      step_data: updatedStepData,
      current_step: Math.max(currentData.current_step, getStepNumber(stepKey)),
      progress_percentage: newProgress,
      updated_at: new Date().toISOString()
    })
    .eq('id', applicationId);
    
  if (error) {
    console.error('Erro ao salvar dados da etapa:', error);
    return false;
  }
  
  return true;
}

// Atualizar status da aplicação
export async function updateApplicationStatus(
  applicationId: string, 
  status: ApplicationStatus
): Promise<boolean> {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('applications')
    .update({
      status,
      updated_at: new Date().toISOString()
    })
    .eq('id', applicationId);
    
  if (error) {
    console.error('Erro ao atualizar status:', error);
    return false;
  }
  
  return true;
}

// Função auxiliar para obter número da etapa
function getStepNumber(stepKey: string): number {
  const stepMap: Record<string, number> = {
    'personal_data': 1,
    'documents': 2,
    'travel_destination': 3,
    'travel_purpose': 4,
    'review': 5
  };
  return stepMap[stepKey] || 1;
}
*/

// ============================================================================
// DADOS MOCKADOS PARA TESTE DO FRONTEND
// ============================================================================

// Dados mockados da aplicação
const mockApplicationData: Application = {
  id: "mock-app-123",
  client_id: "mock-user-123",
  current_step: 1,
  progress_percentage: 20,
  status: "draft",
  step_data: {
    personal_data: {
      full_name: "Vinicius Barbieri",
      cpf: "123.456.789-00",
      email: "vinicius@email.com",
      phone: "(11) 99999-9999",
      birth_date: "1990-05-15",
      nationality: "Brasileiro",
      address: {
        street: "Rua das Flores",
        number: "123",
        complement: "Apto 45",
        neighborhood: "Centro",
        city: "São Paulo",
        state: "SP",
        zip_code: "01234-567"
      }
    }
  },
  created_at: "2024-01-15T10:00:00Z",
  updated_at: "2024-01-15T14:30:00Z"
};

// Funções mockadas que simulam o comportamento do backend
export async function getUserApplication(): Promise<Application | null> {
  // Simular delay de rede
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Retornar dados mockados
  return mockApplicationData;
}

export async function createApplication(userId: string): Promise<Application | null> {
  // Simular delay de rede
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Retornar nova aplicação mockada
  return {
    id: `mock-app-${Date.now()}`,
    client_id: userId,
    current_step: 1,
    progress_percentage: 0,
    status: "draft",
    step_data: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}

export async function saveStepData(
  applicationId: string, 
  stepKey: string, 
  data: Record<string, unknown>
): Promise<boolean> {
  // Simular delay de rede
  await new Promise(resolve => setTimeout(resolve, 400));
  
  // Simular salvamento bem-sucedido
  console.log(`[MOCK] Salvando dados da etapa ${stepKey}:`, data);
  
  // Atualizar dados mockados
  mockApplicationData.step_data[stepKey] = data;
  mockApplicationData.updated_at = new Date().toISOString();
  
  // Calcular novo progresso
  const completedSteps = Object.keys(mockApplicationData.step_data).length;
  mockApplicationData.progress_percentage = Math.round((completedSteps / 5) * 100);
  
  return true;
}

export async function updateApplicationStatus(
  applicationId: string, 
  status: ApplicationStatus
): Promise<boolean> {
  // Simular delay de rede
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Simular atualização bem-sucedida
  console.log(`[MOCK] Atualizando status para: ${status}`);
  
  // Atualizar status mockado
  mockApplicationData.status = status;
  mockApplicationData.updated_at = new Date().toISOString();
  
  return true;
}

// ============================================================================
// FUNÇÕES UTILITÁRIAS
// ============================================================================

// Verificar se uma etapa está completa
export function isStepCompleted(stepData: Record<string, unknown>, stepKey: string): boolean {
  return stepData[stepKey] !== undefined && stepData[stepKey] !== null;
}

// Obter dados de uma etapa específica
export function getStepData<T>(stepData: Record<string, unknown>, stepKey: string): T | null {
  return (stepData[stepKey] as T) || null;
}

// Calcular progresso baseado nas etapas completadas
export function calculateProgressFromSteps(stepData: Record<string, unknown>): number {
  const totalSteps = 5;
  const completedSteps = Object.keys(stepData).filter(key => 
    stepData[key] !== undefined && stepData[key] !== null
  ).length;
  
  return Math.round((completedSteps / totalSteps) * 100);
}