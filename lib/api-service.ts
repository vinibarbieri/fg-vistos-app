// Serviço de API para integração entre frontend e backend
import { createClient } from "@/lib/supabase/client";
import { ProfilesT } from "@/types/ProfilesT";

// Tipos para as respostas da API
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  status: number;
}


export interface Plan {
  id: string;
  plan_name: string;
  description: string;
  price: number;
  active: boolean;
  visa_type_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  responsible_user_id: string;
  applicants_quantity: number;
  plan_id: string;
  status: "pending" | "processing" | "approved" | "rejected";
  payment_details?: any;
  created_at: string;
  updated_at: string;
  plan_name?: string;
  user_email?: string;
}

export interface Applicant {
  id: string;
  name: string;
  email: string;
  phone?: string;
  order_id: string;
  status: "pending" | "processing" | "approved" | "rejected";
  personal_info?: any;
  documents?: any;
  created_at: string;
  updated_at: string;
  order_details?: {
    plan_name: string;
    responsible_user_email: string;
  };
}

export interface FormQuestion {
  id: string;
  plan: {
    id: string;
    name?: string;
  }
  questions: any;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface FormResponse {
  id: string;
  applicant_id: string;
  form_id: string;
  responses: any;
  submitted_at: string;
}

export interface VisaType {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

// Classe principal do serviço de API
class ApiService {
  private supabase = createClient();
  
  // Expor o cliente supabase para uso em componentes específicos
  get supabaseClient() {
    return this.supabase;
  }

  // Métodos para perfis
  async getProfiles(): Promise<ApiResponse<ProfilesT[]>> {
    try {
      const { data, error } = await this.supabase
        .from("profiles")
        .select("*")
        .order("name");

      if (error) {
        return { error: error.message, status: 500 };
      }

      return { data, status: 200 };
    } catch (error) {
      return { error: "Erro ao buscar perfis", status: 500 };
    }
  }

  async getProfile(userId: string): Promise<ApiResponse<ProfilesT>> {
    try {
      const { data, error } = await this.supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        return { error: error.message, status: 500 };
      }

      return { data, status: 200 };
    } catch (error) {
      return { error: "Erro ao buscar perfil", status: 500 };
    }
  }

  async createProfile(
    profile: Partial<ProfilesT>
  ): Promise<ApiResponse<ProfilesT>> {
    try {
      const { data, error } = await this.supabase
        .from("profiles")
        .insert(profile)
        .select()
        .single();

      if (error) {
        return { error: error.message, status: 500 };
      }

      return { data, status: 201 };
    } catch (error) {
      return { error: "Erro ao criar perfil", status: 500 };
    }
  }

  async updateProfile(
    userId: string,
    updates: Partial<ProfilesT>
  ): Promise<ApiResponse<ProfilesT>> {
    try {
      const { data, error } = await this.supabase
        .from("profiles")
        .update(updates)
        .eq("id", userId)
        .select()
        .single();

      if (error) {
        return { error: error.message, status: 500 };
      }

      return { data, status: 200 };
    } catch (error) {
      return { error: "Erro ao atualizar perfil", status: 500 };
    }
  }

  async deleteProfile(userId: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await this.supabase
        .from("profiles")
        .delete()
        .eq("id", userId);

      if (error) {
        return { error: error.message, status: 500 };
      }

      return { status: 200 };
    } catch (error) {
      return { error: "Erro ao deletar perfil", status: 500 };
    }
  }

  // Métodos para planos
  async getPlans(): Promise<ApiResponse<Plan[]>> {
    try {
      const { data, error } = await this.supabase
        .from("plans")
        .select("*")
        .order("plan_name");

      if (error) {
        return { error: error.message, status: 500 };
      }

      return { data, status: 200 };
    } catch (error) {
      return { error: "Erro ao buscar planos", status: 500 };
    }
  }

  async getActivePlans(): Promise<ApiResponse<Plan[]>> {
    try {
      const { data, error } = await this.supabase
        .from("plans")
        .select("*")
        .eq("active", true)
        .order("plan_name");

      if (error) {
        return { error: error.message, status: 500 };
      }

      return { data, status: 200 };
    } catch (error) {
      return { error: "Erro ao buscar planos ativos", status: 500 };
    }
  }

  async createPlan(plan: Partial<Plan>): Promise<ApiResponse<Plan>> {
    try {
      const { data, error } = await this.supabase
        .from("plans")
        .insert(plan)
        .select()
        .single();

      if (error) {
        return { error: error.message, status: 500 };
      }

      return { data, status: 201 };
    } catch (error) {
      return { error: "Erro ao criar plano", status: 500 };
    }
  }

  async updatePlan(
    planId: string,
    updates: Partial<Plan>
  ): Promise<ApiResponse<Plan>> {
    try {
      const { data, error } = await this.supabase
        .from("plans")
        .update(updates)
        .eq("id", planId)
        .select()
        .single();

      if (error) {
        return { error: error.message, status: 500 };
      }

      return { data, status: 200 };
    } catch (error) {
      return { error: "Erro ao atualizar plano", status: 500 };
    }
  }

  async deletePlan(planId: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await this.supabase
        .from("plans")
        .delete()
        .eq("id", planId);

      if (error) {
        return { error: error.message, status: 500 };
      }

      return { status: 200 };
    } catch (error) {
      return { error: "Erro ao deletar plano", status: 500 };
    }
  }

  // Métodos para pedidos
  async getOrders(): Promise<ApiResponse<Order[]>> {
    try {
      const { data, error } = await this.supabase
        .from("orders")
        .select(
          `
          *,
          plans!inner(plan_name)
        `
        )
        .order("created_at", { ascending: false });

      if (error) {
        return { error: error.message, status: 500 };
      }

      // Buscar emails dos usuários responsáveis
      const userIds = [
        ...new Set(data.map((order) => order.responsible_user_id)),
      ];
      const { data: userProfiles } = await this.supabase
        .from("profiles")
        .select("id, email")
        .in("id", userIds);

      const userEmailMap =
        userProfiles?.reduce((acc, profile) => {
          acc[profile.id] = profile.email;
          return acc;
        }, {} as Record<string, string>) || {};

      const ordersWithDetails = data.map((order) => ({
        ...order,
        plan_name: order.plans?.plan_name,
        user_email: userEmailMap[order.responsible_user_id] || "N/A",
      }));

      return { data: ordersWithDetails, status: 200 };
    } catch (error) {
      return { error: "Erro ao buscar pedidos", status: 500 };
    }
  }

  async getUserOrders(userId: string): Promise<ApiResponse<Order[]>> {
    try {
      const { data, error } = await this.supabase
        .from("orders")
        .select(
          `
          *,
          plans!inner(plan_name)
        `
        )
        .eq("responsible_user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        return { error: error.message, status: 500 };
      }

      const ordersWithDetails = data.map((order) => ({
        ...order,
        plan_name: order.plans?.plan_name,
      }));

      return { data: ordersWithDetails, status: 200 };
    } catch (error) {
      return { error: "Erro ao buscar pedidos do usuário", status: 500 };
    }
  }

  async createOrder(order: Partial<Order>): Promise<ApiResponse<Order>> {
    try {
      const { data, error } = await this.supabase
        .from("orders")
        .insert(order)
        .select()
        .single();

      if (error) {
        return { error: error.message, status: 500 };
      }

      return { data, status: 201 };
    } catch (error) {
      return { error: "Erro ao criar pedido", status: 500 };
    }
  }

  async updateOrder(
    orderId: string,
    updates: Partial<Order>
  ): Promise<ApiResponse<Order>> {
    try {
      const { data, error } = await this.supabase
        .from("orders")
        .update(updates)
        .eq("id", orderId)
        .select()
        .single();

      if (error) {
        return { error: error.message, status: 500 };
      }

      return { data, status: 200 };
    } catch (error) {
      return { error: "Erro ao atualizar pedido", status: 500 };
    }
  }

  async deleteOrder(orderId: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await this.supabase
        .from("orders")
        .delete()
        .eq("id", orderId);

      if (error) {
        return { error: error.message, status: 500 };
      }

      return { status: 200 };
    } catch (error) {
      return { error: "Erro ao deletar pedido", status: 500 };
    }
  }

  // Métodos para candidatos
  async getApplicants(): Promise<ApiResponse<Applicant[]>> {
    try {
      const { data, error } = await this.supabase
        .from("applicants")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        return { error: error.message, status: 500 };
      }

      // Buscar detalhes dos pedidos
      const orderIds = [...new Set(data.map((app) => app.order_id))];
      const { data: orderDetails } = await this.supabase
        .from("orders")
        .select(
          `
          id,
          plan_name,
          responsible_user_id
        `
        )
        .in("id", orderIds);

      // Buscar emails dos usuários responsáveis
      if (orderDetails) {
        const userIds = [
          ...new Set(orderDetails.map((order) => order.responsible_user_id)),
        ];
        const { data: userProfiles } = await this.supabase
          .from("profiles")
          .select("id, email")
          .in("id", userIds);

        const userEmailMap =
          userProfiles?.reduce((acc, profile) => {
            acc[profile.id] = profile.email;
            return acc;
          }, {} as Record<string, string>) || {};

        const applicantsWithDetails = data.map((applicant) => {
          const order = orderDetails.find((o) => o.id === applicant.order_id);
          return {
            ...applicant,
            order_details: order
              ? {
                  plan_name: order.plan_name,
                  responsible_user_email:
                    userEmailMap[order.responsible_user_id] || "N/A",
                }
              : undefined,
          };
        });

        return { data: applicantsWithDetails, status: 200 };
      }

      return { data, status: 200 };
    } catch (error) {
      return { error: "Erro ao buscar candidatos", status: 500 };
    }
  }


  async createApplicant(
    applicant: Partial<Applicant>
  ): Promise<ApiResponse<Applicant>> {
    try {
      const { data, error } = await this.supabase
        .from("applicants")
        .insert(applicant)
        .select()
        .single();

      if (error) {
        return { error: error.message, status: 500 };
      }

      return { data, status: 201 };
    } catch (error) {
      return { error: "Erro ao criar candidato", status: 500 };
    }
  }

  async updateApplicant(
    applicantId: string,
    updates: Partial<Applicant>
  ): Promise<ApiResponse<Applicant>> {
    try {
      const { data, error } = await this.supabase
        .from("applicants")
        .update(updates)
        .eq("id", applicantId)
        .select()
        .single();

      if (error) {
        return { error: error.message, status: 500 };
      }

      return { data, status: 200 };
    } catch (error) {
      return { error: "Erro ao atualizar candidato", status: 500 };
    }
  }

  async deleteApplicant(applicantId: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await this.supabase
        .from("applicants")
        .delete()
        .eq("id", applicantId);

      if (error) {
        return { error: error.message, status: 500 };
      }

      return { status: 200 };
    } catch (error) {
      return { error: "Erro ao deletar candidato", status: 500 };
    }
  }

  // Métodos para formulários
  async getFormQuestions(): Promise<ApiResponse<FormQuestion[]>> {
    try {
      const { data, error } = await this.supabase
        .from("form_questions")
        .select(
          `
          *,
          plans!inner(plan_name)
        `
        )
        .order("created_at", { ascending: false });

      if (error) {
        return { error: error.message, status: 500 };
      }

      const formsWithDetails = data.map((form) => ({
        ...form,
        plan_name: form.plans?.plan_name,
      }));

      return { data: formsWithDetails, status: 200 };
    } catch (error) {
      return { error: "Erro ao buscar formulários", status: 500 };
    }
  }

  async getFormQuestionsByPlan(
    planId: string
  ): Promise<ApiResponse<FormQuestion[]>> {
    try {
      const { data, error } = await this.supabase
        .from("form_questions")
        .select("*")
        .eq("plan_id", planId)
        .eq("active", true);

      if (error) {
        return { error: error.message, status: 500 };
      }

      return { data, status: 200 };
    } catch (error) {
      return { error: "Erro ao buscar formulários do plano", status: 500 };
    }
  }

  async createFormQuestion(
    form: Partial<FormQuestion>
  ): Promise<ApiResponse<FormQuestion>> {
    try {
      const { data, error } = await this.supabase
        .from("form_questions")
        .insert(form)
        .select()
        .single();

      if (error) {
        return { error: error.message, status: 500 };
      }

      return { data, status: 201 };
    } catch (error) {
      return { error: "Erro ao criar formulário", status: 500 };
    }
  }

  async updateFormQuestion(
    formId: string,
    updates: Partial<FormQuestion>
  ): Promise<ApiResponse<FormQuestion>> {
    try {
      const { data, error } = await this.supabase
        .from("form_questions")
        .update(updates)
        .eq("id", formId)
        .select()
        .single();

      if (error) {
        return { error: error.message, status: 500 };
      }

      return { data, status: 200 };
    } catch (error) {
      return { error: "Erro ao atualizar formulário", status: 500 };
    }
  }

  async deleteFormQuestion(formId: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await this.supabase
        .from("form_questions")
        .delete()
        .eq("id", formId);

      if (error) {
        return { error: error.message, status: 500 };
      }

      return { status: 200 };
    } catch (error) {
      return { error: "Erro ao deletar formulário", status: 500 };
    }
  }

  // Métodos para tipos de visto
  async getVisas(): Promise<ApiResponse<VisaType[]>> {
    try {
      const { data, error } = await this.supabase
        .from("visas")
        .select("*")
        .order("name");

      if (error) {
        return { error: error.message, status: 500 };
      }

      return { data, status: 200 };
    } catch (error) {
      return { error: "Erro ao buscar vistos", status: 500 };
    }
  }

  // Método para buscar form_questions por applicant
  async getFormQuestionsByApplicant(applicantId: string): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`/api/applicants/${applicantId}/form-questions`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: data.error || 'Erro ao buscar formulário', status: response.status };
      }

      return { data, status: 200 };
    } catch (error) {
      return { error: "Erro ao buscar formulário do applicant", status: 500 };
    }
  }

  // Método para salvar respostas do formulário
  async saveFormAnswers(applicantId: string, answers: any, isComplete: boolean = false): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`/api/applicants/${applicantId}/form-answer`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ answers, isComplete }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: data.error || 'Erro ao salvar respostas', status: response.status };
      }

      return { data, status: 200 };
    } catch (error) {
      return { error: "Erro ao salvar respostas do formulário", status: 500 };
    }
  }

  // Método para carregar respostas salvas do formulário
  async getFormAnswers(applicantId: string): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`/api/applicants/${applicantId}/form-answer`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: data.error || 'Erro ao carregar respostas', status: response.status };
      }

      return { data, status: 200 };
    } catch (error) {
      return { error: "Erro ao carregar respostas do formulário", status: 500 };
    }
  }

  // Métodos para respostas de formulário
  async submitFormResponse(
    response: Partial<FormResponse>
  ): Promise<ApiResponse<FormResponse>> {
    try {
      const { data, error } = await this.supabase
        .from("form_responses")
        .insert(response)
        .select()
        .single();

      if (error) {
        return { error: error.message, status: 500 };
      }

      return { data, status: 201 };
    } catch (error) {
      return { error: "Erro ao enviar formulário", status: 500 };
    }
  }

  async getFormResponses(
    applicantId: string
  ): Promise<ApiResponse<FormResponse[]>> {
    try {
      const { data, error } = await this.supabase
        .from("form_responses")
        .select("*")
        .eq("applicant_id", applicantId)
        .order("submitted_at", { ascending: false });

      if (error) {
        return { error: error.message, status: 500 };
      }

      return { data, status: 200 };
    } catch (error) {
      return { error: "Erro ao buscar respostas do formulário", status: 500 };
    }
  }

  // Método para verificar se o usuário está autenticado
  async getCurrentUser() {
    try {
      const {
        data: { user },
        error,
      } = await this.supabase.auth.getUser();

      if (error || !user) {
        return null;
      }

      return user;
    } catch (error) {
      return null;
    }
  }

  // Método para fazer logout
  async signOut() {
    try {
      const { error } = await this.supabase.auth.signOut();
      return !error;
    } catch (error) {
      return false;
    }
  }
}

// Exportar uma instância única do serviço
export const apiService = new ApiService();

