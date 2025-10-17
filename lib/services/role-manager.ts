// ============================================================================
// UTILITÁRIO PARA GERENCIAMENTO DE ROLES DE USUÁRIOS
// ============================================================================
// Este utilitário fornece métodos seguros para gerenciar roles de usuários
// através da API interna do sistema

import { apiService } from '@/lib/api-service';

export type UserRole = 'admin' | 'funcionario' | 'cliente';

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface ManageRolesResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export interface UsersListResponse {
  success: boolean;
  data?: UserProfile[];
  error?: string;
}

/**
 * Classe para gerenciar roles de usuários de forma segura
 */
export class RoleManager {
  private baseUrl: string;

  constructor() {
    this.baseUrl = '/api/admin/manage-roles';
  }

  /**
   * Obtém o token de autenticação atual
   */
  private async getAuthToken(): Promise<string | null> {
    try {
      const supabase = (await import('@/lib/supabase/client')).createClient();
      const { data: { session } } = await supabase.auth.getSession();
      return session?.access_token || null;
    } catch (error) {
      console.error('Erro ao obter token de autenticação:', error);
      return null;
    }
  }

  /**
   * Lista todos os usuários do sistema (apenas para admins)
   */
  async getUsersList(): Promise<UsersListResponse> {
    try {
      const token = await this.getAuthToken();
      
      if (!token) {
        return {
          success: false,
          error: 'Usuário não autenticado'
        };
      }

      const response = await fetch(this.baseUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error('RoleManager.getUsersList - Erro na resposta:', data);
        return {
          success: false,
          error: data.error || 'Erro ao buscar usuários'
        };
      }

      return data;
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      return {
        success: false,
        error: 'Erro interno do cliente'
      };
    }
  }

  /**
   * Altera o role de um usuário (apenas para admins)
   */
  async setUserRole(userId: string, targetRole: UserRole): Promise<ManageRolesResponse> {
    try {
      const token = await this.getAuthToken();
      
      if (!token) {
        return {
          success: false,
          error: 'Usuário não autenticado'
        };
      }

      // Validações básicas
      if (!userId || !targetRole) {
        return {
          success: false,
          error: 'userId e targetRole são obrigatórios'
        };
      }

      const validRoles: UserRole[] = ['admin', 'funcionario', 'cliente'];
      if (!validRoles.includes(targetRole)) {
        return {
          success: false,
          error: 'Role inválido'
        };
      }

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          targetRole
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Erro ao alterar role do usuário'
        };
      }

      return data;
    } catch (error) {
      console.error('Erro ao alterar role do usuário:', error);
      return {
        success: false,
        error: 'Erro interno do cliente'
      };
    }
  }

  /**
   * Promove um usuário para admin
   */
  async promoteToAdmin(userId: string): Promise<ManageRolesResponse> {
    return this.setUserRole(userId, 'admin');
  }

  /**
   * Promove um usuário para Funcionário
   */
  async promoteToFuncionario(userId: string): Promise<ManageRolesResponse> {
    return this.setUserRole(userId, 'funcionario');
  }

  /**
   * Rebaixa um usuário para Cliente
   */
  async demoteToCliente(userId: string): Promise<ManageRolesResponse> {
    return this.setUserRole(userId, 'cliente');
  }

  /**
   * Verifica se o usuário atual tem permissão de admin
   */
  async isCurrentUserAdmin(): Promise<boolean> {
    try {
      const user = await apiService.getCurrentUser();
      
      if (!user) {
        return false;
      }

      // Verificar role diretamente do JWT através do app_metadata
      const userRole = user.app_metadata?.user_role;
      
      return userRole === 'admin';
    } catch (error) {
      console.error('Erro ao verificar permissão de admin:', error);
      return false;
    }
  }
}

// Instância singleton para uso em toda a aplicação
export const roleManager = new RoleManager();
