// ============================================================================
// FUNÇÕES PARA CHAMAR ENDPOINTS DA API (SUBSTITUINDO CHAMADAS DIRETAS)
// ============================================================================

// Buscar dados do responsável via API
export async function getResponsibleDataAPI(userId: string): Promise<{ name: string; email: string } | null> {
  try {
    const response = await fetch(`/api/profiles/${userId}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    return {
      name: data.name || '',
      email: data.email || ''
    };
  } catch (error) {
    console.error('Erro ao buscar dados do responsável:', error);
    return null;
  }
}

// Buscar aplicações do responsável via API
export async function getResponsibleApplicationsAPI(userId: string) {
  try {
    // O endpoint agora usa o ID do usuário autenticado automaticamente
    const response = await fetch(`/api/applicants?responsible_user_id=${userId}`);
    
    if (!response.ok) {
      if (response.status === 403) {
        console.error('Acesso negado: usuário não pode ver estes applicants');
        return [];
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data || [];
  } catch (error) {
    console.error('Erro ao buscar aplicações:', error);
    return [];
  }
}

// Atualizar nome do aplicante via API
export async function updateApplicantNameAPI(applicantId: string, newName: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/applicants/${applicantId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: newName,
        updated_at: new Date().toISOString()
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao atualizar nome do aplicante:', error);
    return false;
  }
}

// Buscar status do processo via API (precisa ser implementado)
export async function getProcessStatusAPI(userId: string): Promise<string> {
  try {
    // Por enquanto, vamos calcular baseado nas aplicações
    const applications = await getResponsibleApplicationsAPI(userId);
    
    if (!applications || applications.length === 0) {
      return 'pending';
    }
    
    // Determinar status geral baseado nos status dos aplicantes
    const statuses = applications.map(a => a.status);
    
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

// ============================================================================
// FUNÇÕES UTILITÁRIAS (MANTIDAS COMO ESTAVAM)
// ============================================================================

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
