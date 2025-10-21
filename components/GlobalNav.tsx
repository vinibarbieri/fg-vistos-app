"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "./Navbar";
import { useAuth } from "@/lib/hooks/useAuth";

export function GlobalNav() {
  const { user, loading } = useAuth();
  const pathname = usePathname();

  // Não mostrar navbar em páginas de autenticação
  const authPages = ['/auth/login', '/auth/sign-up', '/auth/forgot-password', '/auth/update-password'];
  const isAuthPage = authPages.some(page => pathname.startsWith(page));

  // Não mostrar navbar se for página de auth ou se estiver carregando e não há usuário
  if (isAuthPage || (loading && !user)) {
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
