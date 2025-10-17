"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { apiService } from "@/lib/api-service";
import { Navbar } from "./Navbar";

export function GlobalNav() {
  const [user, setUser] = useState<any>(null);
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
        return;
      }

      setUser(currentUser);
    } catch (error) {
      console.error("Erro ao verificar usuário:", error);
      setUser(null);
    } finally {
      // Loading completed
    }
  };

  // Não mostrar navbar em páginas de autenticação
  const authPages = ['/auth/login', '/auth/sign-up', '/auth/forgot-password', '/auth/update-password'];
  const isAuthPage = authPages.some(page => pathname.startsWith(page));

  // Não mostrar navbar se estiver carregando ou se for página de auth
  if (isAuthPage || !user) {
    return null;
  }

  const userRole = user.app_metadata?.user_role;

  return (
    <Navbar 
      userRole={userRole} 
      userName={user.user_metadata?.name || user.email} 
      userEmail={user.email} 
    />
  );
}
