"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiService } from "@/lib/api-service";
import { getRedirectUrlByRole } from "@/lib/auth-redirect";
import { Loader2 } from "lucide-react";

export function AutoRedirect() {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuthAndRedirect();
  }, []);

  const checkAuthAndRedirect = async () => {
    try {
      // Verificar se o usuário está autenticado
      const currentUser = await apiService.getCurrentUser();

      if (!currentUser) {
        // Usuário não autenticado, redirecionar para login
        router.push("/auth/login");
        return;
      }

      // Usuário autenticado, buscar user_role para determinar redirecionamento
      const userRole = currentUser.app_metadata?.user_role;
      if (!userRole) {
        // Perfil não encontrado, redirecionar para sign-up
        router.push("/auth/sign-up");
        return;
      }

      // Redirecionar baseado no role
      const redirectUrl = getRedirectUrlByRole(userRole);
      router.push(redirectUrl);

    } catch (error) {
      console.error("Erro ao verificar autenticação:", error);
      // Em caso de erro, redirecionar para login
      router.push("/auth/login");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin" />
          <p className="text-lg">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // Este componente sempre redireciona, então nunca chegará aqui
  return null;
}
