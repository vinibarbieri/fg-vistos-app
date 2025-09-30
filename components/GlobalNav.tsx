"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { apiService } from "@/lib/api-service";
import { ProfilesT } from "@/types/ProfilesT";
import { Navbar } from "./Navbar";

export function GlobalNav() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<ProfilesT | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      // Verificar se o usuário está autenticado
      const currentUser = await apiService.getCurrentUser();

      if (!currentUser) {
        setUser(null);
        setProfile(null);
        return;
      }

      setUser(currentUser);

      // Buscar o perfil do usuário
      const profileResponse = await apiService.getProfile(currentUser.id);

      if (profileResponse.error || !profileResponse.data) {
        console.error("Erro ao buscar perfil:", profileResponse.error);
        setProfile(null);
        return;
      }

      setProfile(profileResponse.data);
    } catch (error) {
      console.error("Erro ao verificar usuário:", error);
      setUser(null);
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Não mostrar navbar em páginas de autenticação
  const authPages = ['/auth/login', '/auth/sign-up', '/auth/forgot-password', '/auth/update-password'];
  const isAuthPage = authPages.some(page => pathname.startsWith(page));

  // Não mostrar navbar se estiver carregando ou se for página de auth
  if (isLoading || isAuthPage || !user || !profile) {
    return null;
  }

  return (
    <Navbar 
      userRole={profile.role} 
      userName={profile.name} 
      userEmail={user.email} 
    />
  );
}
