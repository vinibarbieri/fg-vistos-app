// Tipos para a aplicação de vistos

export interface Application {
  id: string;
  client_id: string;
  current_step: number;
  progress_percentage: number;
  status: ApplicationStatus;
  step_data: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export type ApplicationStatus = 
  | 'draft' 
  | 'submitted' 
  | 'reviewing' 
  | 'approved' 
  | 'rejected';

export interface ApplicationStep {
  id: number;
  title: string;
  description: string;
  key: string;
  path: string;
  is_completed: boolean;
  data: Record<string, any>;
}

// Dados específicos de cada etapa
export interface PersonalData {
  full_name: string;
  cpf: string;
  email: string;
  phone: string;
  birth_date: string;
  nationality: string;
  address: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zip_code: string;
  };
}

export interface Documents {
  rg_front: string;
  rg_back: string;
  cpf_document: string;
  photo: string;
  additional_documents?: string[];
}

export interface TravelDestination {
  country: string;
  city: string;
  arrival_date: string;
  departure_date: string;
  accommodation_address?: string;
}

export interface TravelPurpose {
  visa_type: string;
  purpose: string;
  employer_or_institution?: string;
  invitation_letter?: string;
  additional_info?: string;
}

export interface ApplicationReview {
  personal_data: PersonalData;
  documents: Documents;
  travel_destination: TravelDestination;
  travel_purpose: TravelPurpose;
  terms_accepted: boolean;
  privacy_policy_accepted: boolean;
}

// Configuração das etapas
export const APPLICATION_STEPS_CONFIG = [
  {
    id: 1,
    title: "Dados Pessoais",
    description: "Informações básicas sobre você",
    key: "personal_data" as const,
    path: "/dashboard/application/step/1"
  },
  {
    id: 2,
    title: "Documentos",
    description: "Upload de documentos necessários",
    key: "documents" as const,
    path: "/dashboard/application/step/2"
  },
  {
    id: 3,
    title: "Destino da Viagem",
    description: "Informações sobre o destino",
    key: "travel_destination" as const,
    path: "/dashboard/application/step/3"
  },
  {
    id: 4,
    title: "Motivo da Viagem",
    description: "Tipo de visto e propósito",
    key: "travel_purpose" as const,
    path: "/dashboard/application/step/4"
  },
  {
    id: 5,
    title: "Revisão e Envio",
    description: "Revisar e enviar aplicação",
    key: "review" as const,
    path: "/dashboard/application/step/5"
  }
] as const;

export type StepKey = typeof APPLICATION_STEPS_CONFIG[number]['key'];

// Status de cada etapa
export type StepStatus = 'pending' | 'current' | 'completed';

// Função para calcular o progresso
export function calculateProgress(completedSteps: number[], totalSteps: number): number {
  return Math.round((completedSteps.length / totalSteps) * 100);
}

// Função para obter informações do status
export function getStatusInfo(status: ApplicationStatus) {
  switch (status) {
    case "draft":
      return { 
        label: "Rascunho", 
        color: "bg-yellow-500", 
        description: "Aplicação em andamento" 
      };
    case "submitted":
      return { 
        label: "Enviado", 
        color: "bg-blue-500", 
        description: "Aplicação enviada para análise" 
      };
    case "reviewing":
      return { 
        label: "Em Análise", 
        color: "bg-orange-500", 
        description: "Sendo analisada pela equipe" 
      };
    case "approved":
      return { 
        label: "Aprovado", 
        color: "bg-green-500", 
        description: "Aplicação aprovada" 
      };
    case "rejected":
      return { 
        label: "Rejeitado", 
        color: "bg-red-500", 
        description: "Aplicação rejeitada" 
      };
    default:
      return { 
        label: "Rascunho", 
        color: "bg-yellow-500", 
        description: "Aplicação em andamento" 
      };
  }
} 