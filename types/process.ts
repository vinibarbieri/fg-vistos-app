// Tipos para o processo de visto

export interface ProcessStep {
  step: number;
  title: string;
  description?: string;
  completed?: boolean;
  order: number;
}

export interface Responsible {
  id: string;
  name: string;
  email: string;
  phone?: string;
  processSteps: ProcessStep[];
  created_at: string;
  updated_at: string;
}

export interface Person {
  id: string;
  name: string; // "Pessoa 1", "Pessoa 2", etc.
  progress: number; // 0-100
  status: 'not_started' | 'in_progress' | 'completed';
  formData?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface ResponsibleApplication {
  id: string;
  responsible_id: string;
  people: Person[];
  processSteps: ProcessStep[];
  status: 'draft' | 'submitted' | 'reviewing' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

// Configuração padrão dos passos do processo
export const DEFAULT_PROCESS_STEPS: ProcessStep[] = [
  {
    step: 1,
    title: "Pago",
    description: "Pagamento confirmado",
    completed: false,
    order: 1
  },
  {
    step: 2,
    title: "Documentos Enviados",
    description: "Documentação submetida",
    completed: false,
    order: 2
  },
  {
    step: 3,
    title: "Documentos em Análise",
    description: "Em revisão pela equipe",
    completed: false,
    order: 3
  },
  {
    step: 4,
    title: "Entrevista Marcada",
    description: "Agendamento pendente",
    completed: false,
    order: 4
  },
  {
    step: 5,
    title: "Visto Aprovado",
    description: "Processo finalizado",
    completed: false,
    order: 5
  }
];

// Função para obter o passo atual
export function getCurrentStep(steps: ProcessStep[]): number {
  const currentStep = steps.findIndex(step => !step.completed) + 1;
  return currentStep > 0 ? currentStep : steps.length;
}

// Função para calcular progresso geral
export function calculateOverallProgress(steps: ProcessStep[]): number {
  const completedSteps = steps.filter(step => step.completed).length;
  return Math.round((completedSteps / steps.length) * 100);
}

// Função para obter informações do status
export function getProcessStatusInfo(status: string) {
  switch (status) {
    case "draft":
      return { 
        label: "Rascunho", 
        color: "bg-yellow-500", 
        description: "Processo em andamento" 
      };
    case "submitted":
      return { 
        label: "Enviado", 
        color: "bg-blue-500", 
        description: "Processo enviado para análise" 
      };
    case "reviewing":
      return { 
        label: "Em Análise", 
        color: "bg-orange-500", 
        description: "Sendo analisado pela equipe" 
      };
    case "approved":
      return { 
        label: "Aprovado", 
        color: "bg-green-500", 
        description: "Processo aprovado" 
      };
    case "rejected":
      return { 
        label: "Rejeitado", 
        color: "bg-red-500", 
        description: "Processo rejeitado" 
      };
    default:
      return { 
        label: "Rascunho", 
        color: "bg-yellow-500", 
        description: "Processo em andamento" 
      };
  }
} 