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

// Configuração padrão dos passos do processo
export const DEFAULT_PROCESS_STEPS: ProcessStep[] = [
  {
    step: 1,
    title: "Pagamento",
    completed: false,
    order: 1
  },
  {
    step: 2,
    title: "Envio da Documentação",
    completed: false,
    order: 2
  },
  {
    step: 3,
    title: "Análise dos Documentos",
    completed: false,
    order: 3
  },
  {
    step: 4,
    title: "Entrevista",
    completed: false,
    order: 4
  },
  {
    step: 5,
    title: "Visto",
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

// Função para obter descrições dinâmicas dos steps baseado no status atual
export function getStepDescription(step: ProcessStep, currentStepIndex: number, stepIndex: number): string {
  const stepNumber = stepIndex + 1;
  
  // Se o step está completo, mostra status de concluído
  if (step.completed) {
    switch (stepNumber) {
      case 1:
        return "Confirmado";
      case 2:
        return "Enviada";
      case 3:
        return "Concluída";
      case 4:
        return "Realizada";
      case 5:
        return "Aprovado";
      default:
        return "Concluído";
    }
  }
  
  // Se é o step atual, mostra status em andamento
  if (stepNumber === currentStepIndex) {
    switch (stepNumber) {
      case 1:
        return "Aguardando pagamento";
      case 2:
        return "Aguardando documentos";
      case 3:
        return "Em análise pela equipe";
      case 4:
        return "Entrevista marcada";
      case 5:
        return "Visto aprovado";
      default:
        return "Em andamento";
    }
  }
  
  // Se é um step futuro, mostra status pendente
  switch (stepNumber) {
    case 1:
      return "Pagamento pendente";
    default:
      return "Pendente";
  }
} 