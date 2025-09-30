// ============================================================================
// UTILITÁRIOS PARA REDIRECIONAMENTO BASEADO NO ROLE DO USUÁRIO
// ============================================================================

import { ProfilesT } from "@/types/ProfilesT";

/**
 * Determina para qual dashboard o usuário deve ser redirecionado baseado no seu role
 * @param profile Perfil do usuário com role definido
 * @returns URL de redirecionamento
 */
export function getRedirectUrlByRole(profile: ProfilesT | null): string {
  if (!profile) {
    return "/auth/login";
  }

  switch (profile.role) {
    case "Admin":
      return "/dashboard";
    case "Funcionario":
      return "/dashboard";
    case "Cliente":
      return "/protected/user";
    default:
      return "/auth/login";
  }
}

/**
 * Determina para qual dashboard o usuário deve ser redirecionado baseado no role string
 * @param role Role do usuário como string
 * @returns URL de redirecionamento
 */
export function getRedirectUrlByRoleString(role: string): string {
  switch (role) {
    case "Admin":
      return "/dashboard";
    case "Funcionario":
      return "/dashboard";
    case "Cliente":
      return "/protected/user";
    default:
      return "/auth/login";
  }
}
