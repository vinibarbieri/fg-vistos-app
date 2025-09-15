// ============================================================================
// UTILITÁRIOS PARA VERIFICAÇÃO DE ROLES E PERMISSÕES (BACKEND)
// ============================================================================

import { createClient } from "@/lib/supabase/server";

export type UserRole = "Cliente" | "Funcionario" | "Admin";

export interface RoleCheckResult {
  hasAccess: boolean;
  role: UserRole | null;
  error?: string;
}

/**
 * Verifica se o usuário tem permissão para acessar recursos
 * @param userId ID do usuário autenticado
 * @param requiredRole Role mínimo necessário (opcional)
 * @returns Resultado da verificação de permissão
 */
export async function checkUserRole(userId: string, requiredRole?: UserRole): Promise<RoleCheckResult> {
  try {
    const supabase = await createClient();
    
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();
    
    if (error || !profile) {
      return {
        hasAccess: false,
        role: null,
        error: "Perfil não encontrado"
      };
    }
    
    const userRole = profile.role as UserRole;
    
    // Se não especificar role necessário, qualquer role autenticado tem acesso
    if (!requiredRole) {
      return {
        hasAccess: true,
        role: userRole
      };
    }
    
    // Verificar hierarquia de roles
    const roleHierarchy: Record<UserRole, number> = {
      "Cliente": 1,
      "Funcionario": 2,
      "Admin": 3
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
  const roleCheck = await checkUserRole(userId);
  
  if (!roleCheck.hasAccess || !roleCheck.role) {
    return false;
  }
  
  // Cliente só pode acessar seus próprios dados
  if (roleCheck.role === "Cliente") {
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
  const roleCheck = await checkUserRole(userId);
  
  if (!roleCheck.hasAccess || !roleCheck.role) {
    return false;
  }
  
  // Cliente só pode editar seus próprios dados
  if (roleCheck.role === "Cliente") {
    return userId === targetUserId;
  }
  
  // Admin e Funcionario podem editar dados de qualquer usuário
  return true;
}
