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
      return 'pendente';
    }
    const applicantResponsavel = applications.filter(a => a.is_responsible);
    const status = applicantResponsavel.status;
    return status;

  } catch (error) {
    console.error('Erro ao buscar status do processo:', error);
    return 'pendente';
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

// ============================================================================
// FUNÇÕES PARA FUNCIONÁRIOS E ADMINS
// ============================================================================

// Atualizar status do processo de todos applicants de uma vez
export async function updateProcessStatusAPI(userId: string, newStatus: string): Promise<boolean> {
  try {
    // Primeiro, buscar todos os applicants do usuário
    const applicantsResponse = await fetch(`/api/applicants?responsible_user_id=${userId}`);

    if (!applicantsResponse.ok) {
      throw new Error(`HTTP error! status: ${applicantsResponse.status}`);
    }
    
    const applicants = await applicantsResponse.json();
    console.log("applicants:", applicants);
    
    // Atualizar cada applicant individualmente
    const updatePromises = applicants.map((applicant: any) => 
      fetch(`/api/applicants/${applicant.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          updated_at: new Date().toISOString()
        })
      })
    );
    
    const results = await Promise.all(updatePromises);
    console.log("results:", results);
    // Verificar se todas as atualizações foram bem-sucedidas
    const allSuccessful = results.every(response => response.ok);
    
    if (!allSuccessful) {
      throw new Error('Algumas atualizações falharam');
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao atualizar status do processo:', error);
    return false;
  }
}

// Criar novo applicant
export async function createApplicantAPI(applicantData: {
  responsible_user_id: string;
  order_id: string;
  is_responsible: boolean;
  name: string;
  status: string;
  form_status: string;
}): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const response = await fetch('/api/applicants', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...applicantData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        form_answer: '',
        attachment_id: null
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Erro ao criar applicant:', error);
    return { success: false, error: (error as Error).message };
  }
}

// Deletar applicant
export async function deleteApplicantAPI(applicantId: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/applicants/${applicantId}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao deletar applicant:', error);
    return false;
  }
}

// Atualizar form_status de um applicant específico
export async function updateApplicantFormStatusAPI(applicantId: string, formStatus: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/applicants/${applicantId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        form_status: formStatus,
        updated_at: new Date().toISOString()
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao atualizar form_status:', error);
    return false;
  }
}

// Atualizar nome do responsável via API
export async function updateResponsibleNameAPI(userId: string, newName: string): Promise<boolean> {
  try {
    
    const response = await fetch(`/api/profiles/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: newName
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erro na resposta da API:', {
        status: response.status,
        statusText: response.statusText,
        errorText
      });
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }
    return true;
  } catch (error) {
    console.error('Erro ao atualizar nome do responsável:', error);
    return false;
  }
}