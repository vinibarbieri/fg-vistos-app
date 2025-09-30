"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminDashboard } from "../pages/admin/adminDashboard";
import { apiService } from "@/lib/api-service";
import { FuncionarioDashboard } from "../pages/funcionario/funcionarioDashboard";
import { ProfilesT } from "@/types/ProfilesT";
import { getRedirectUrlByRole } from "@/lib/auth-redirect";

export function AuthGuard() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<ProfilesT | null>(null);
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

      // Buscar o perfil do usuário para determinar o papel
      const profileResponse = await apiService.getProfile(currentUser.id);

      if (profileResponse.error || !profileResponse.data) {
        console.error("Erro ao buscar perfil:", profileResponse.error);
        // Se não encontrar perfil, redirecionar para criar um
        router.push("/auth/sign-up");
        return;
      }

      setProfile(profileResponse.data);

      // Redirecionar automaticamente baseado no role se não estiver na página correta
      const currentPath = window.location.pathname;
      const expectedPath = getRedirectUrlByRole(profileResponse.data);
      
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

  if (!user || !profile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <main>
        {profile.role === "Admin" ? (
          <AdminDashboard />
        ) : (
          <FuncionarioDashboard />
        )}
      </main>
    </div>
  );
}
