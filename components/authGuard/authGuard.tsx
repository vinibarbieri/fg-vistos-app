"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminDashboard } from "../pages/admin/adminDashboard";
import { apiService } from "@/lib/api-service";
import { DashboardNav } from "../dashboard-nav";
import { FuncionarioDashboard } from "../pages/funcionario/funcionarioDashboard";
import { ProfilesT } from "@/types/ProfilesT";
import { ClienteDashboard } from "../pages/cliente/clienteDashboard";

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
      <DashboardNav userRole={profile.role} userName={profile.name} userEmail={user.email} />

      <main>
        {profile.role === "Admin" ? (
          <AdminDashboard />
        ) : profile.role === "Funcionario" ? (
          <FuncionarioDashboard />
        ) : (
          <ClienteDashboard />
        )}
      </main>
    </div>
  );
}
