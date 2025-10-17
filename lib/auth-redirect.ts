// ============================================================================
// UTILITÁRIOS PARA REDIRECIONAMENTO BASEADO NO ROLE DO USUÁRIO
// ============================================================================

/**
 * Determina para qual dashboard o usuário deve ser redirecionado baseado no seu role
 * @param userRole role do usuário definido no jwt
 * @returns URL de redirecionamento
 */
export function getRedirectUrlByRole(userRole: string): string {
  if (!userRole) {
    return "/auth/login";
  }

  switch (userRole) {
    case "admin":
      return "/dashboard";
    case "funcionario":
      return "/dashboard";
    case "cliente":
      return "/protected/user";
    default:
      return "/auth/login";
  }
}
