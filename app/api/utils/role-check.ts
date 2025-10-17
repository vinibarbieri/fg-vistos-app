// ============================================================================
// UTILITÁRIOS PARA VERIFICAÇÃO DE ROLES E PERMISSÕES (BACKEND)
// ============================================================================

import { createClient } from "@/lib/supabase/server";

export type UserRole = "cliente" | "funcionario" | "admin";

export interface RoleCheckResult {
  hasAccess: boolean;
  role: UserRole | null;
  error?: string;
}

/**
 * Verifica se o usuário tem permissão para acessar recursos usando JWT
 * @param requiredRole Role mínimo necessário (opcional)
 * @returns Resultado da verificação de permissão
 */
export async function checkUserRole(requiredRole?: UserRole): Promise<RoleCheckResult> {
  try {
    const supabase = await createClient();
    
    // Buscar o usuário para obter o role do JWT
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      return {
        hasAccess: false,
        role: null,
        error: "Usuário não encontrado"
      };
    }
    
    const userRole = user.app_metadata?.user_role as UserRole;
    
    if (!userRole) {
      return {
        hasAccess: false,
        role: null,
        error: "Role não encontrado no JWT"
      };
    }
    
    // Se não especificar role necessário, qualquer role autenticado tem acesso
    if (!requiredRole) {
      return {
        hasAccess: true,
        role: userRole
      };
    }
    
    // Verificar hierarquia de roles
    const roleHierarchy: Record<UserRole, number> = {
      "cliente": 1,
      "funcionario": 2,
      "admin": 3
    };
    
    const hasAccess = roleHierarchy[userRole] >= roleHierarchy[requiredRole];
    
    return {
      hasAccess,
      role: userRole,
      error: hasAccess ? undefined : "Permissão insuficiente"
    };
    
  } catch (error) {
    return {
      hasAccess: false,
      role: null,
      error: "Erro ao verificar permissões"
    };
  }
}

/**
 * Verifica se o usuário pode acessar dados de outro usuário
 * @param userId ID do usuário autenticado
 * @param targetUserId ID do usuário alvo
 * @returns true se pode acessar, false caso contrário
 */
export async function canAccessUserData(userId: string, targetUserId: string): Promise<boolean> {
  const roleCheck = await checkUserRole();
  
  if (!roleCheck.hasAccess || !roleCheck.role) {
    return false;
  }
  
  // Cliente só pode acessar seus próprios dados
  if (roleCheck.role === "cliente") {
    return userId === targetUserId;
  }
  
  // Admin e Funcionario podem acessar dados de qualquer usuário
  return true;
}

/**
 * Verifica se o usuário pode editar dados de outro usuário
 * @param userId ID do usuário autenticado
 * @param targetUserId ID do usuário alvo
 * @returns true se pode editar, false caso contrário
 */
export async function canEditUserData(userId: string, targetUserId: string): Promise<boolean> {
  const roleCheck = await checkUserRole();
  
  if (!roleCheck.hasAccess || !roleCheck.role) {
    return false;
  }
  
  // Cliente só pode editar seus próprios dados
  if (roleCheck.role === "cliente") {
    return userId === targetUserId;
  }
  
  // Admin e Funcionario podem editar dados de qualquer usuário
  return true;
}
