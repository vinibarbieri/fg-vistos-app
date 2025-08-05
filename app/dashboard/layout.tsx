import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "@/components/logout-button";
import Link from "next/link";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser();
  
  // TEMPORÁRIO: Comentando verificação de auth para teste
  /*
  if (error || !data?.user) {
    redirect("/auth/login");
  }
  */
  
  // Dados mockados para teste sem login
  const user = data?.user || {
    email: "vinicius@email.com",
    name: "Vinicius",
    id: "mock-user-123"
  };

  return (
    <main className="min-h-screen flex flex-col">
      {/* Header do Dashboard */}
      <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
        <div className="w-full max-w-7xl flex justify-between items-center p-3 px-5 text-sm">
          <div className="flex gap-5 items-center font-semibold">
            <Link href="/dashboard">Sistema de Vistos</Link>
            <span className="text-muted-foreground">Área do Cliente</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Olá, {user.name ? user.name : "Vinicius"}
            </span>
            <LogoutButton />
          </div>
        </div>
      </nav>

      {/* Conteúdo Principal */}
      <div className="flex-1 w-full flex flex-col">
        <div className="flex-1 flex flex-col max-w-7xl mx-auto w-full p-5">
          {children}
        </div>
      </div>
    </main>
  );
}
