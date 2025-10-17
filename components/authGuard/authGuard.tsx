"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminDashboard } from "../pages/admin/adminDashboard";
import { apiService } from "@/lib/api-service";
import { FuncionarioDashboard } from "../pages/funcionario/funcionarioDashboard";
import { getRedirectUrlByRole } from "@/lib/auth-redirect";

export function AuthGuard() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      // Verificar se o usuário está autenticado
      const currentUser = await apiService.getCurrentUser();

      if (!currentUser) {
        router.push("/auth/login");
        return;
      }

      setUser(currentUser);

      // Obter o role do JWT
      const userRole = currentUser.app_metadata?.user_role;
      
      if (!userRole) {
        console.error("Erro ao buscar role do usuário:", userRole);
        // Se não encontrar role, redirecionar para criar um perfil
        router.push("/auth/sign-up");
        return;
      }

      // Redirecionar automaticamente baseado no role se não estiver na página correta
      const currentPath = window.location.pathname;
      const expectedPath = getRedirectUrlByRole(userRole);
      
      // Se não estiver na página correta, redirecionar
      if (currentPath !== expectedPath && !currentPath.startsWith('/protected/user')) {
        router.push(expectedPath);
        return;
      }
    } catch (error) {
      console.error("Erro ao verificar usuário:", error);
      router.push("/auth/login");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Carregando...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const userRole = user.app_metadata?.user_role;

  return (
    <div className="min-h-screen bg-background">
      <main>
        {userRole === "admin" ? (
          <AdminDashboard />
        ) : (
          <FuncionarioDashboard />
        )}
      </main>
    </div>
  );
}
