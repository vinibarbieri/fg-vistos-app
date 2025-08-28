"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiService } from "@/lib/api-service";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

interface DashboardNavProps {
  userRole: string;
  userName?: string;
}

export function DashboardNav({ userRole, userName }: DashboardNavProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);

    try {
      await apiService.signOut();
      router.push("/auth/login");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard" className="text-xl font-bold">
              FG Vistos
            </Link>

            {userRole === "employee" && (
              <div className="flex items-center space-x-4">
                <Link
                  href="/dashboard/orders"
                  className="text-sm hover:text-primary"
                >
                  Pedidos
                </Link>
                <Link
                  href="/dashboard/applicants"
                  className="text-sm hover:text-primary"
                >
                  Candidatos
                </Link>
                <Link
                  href="/dashboard/plans"
                  className="text-sm hover:text-primary"
                >
                  Planos
                </Link>
                <Link
                  href="/dashboard/forms"
                  className="text-sm hover:text-primary"
                >
                  Formulários
                </Link>
              </div>
            )}

            {userRole === "user" && (
              <div className="flex items-center space-x-4">
                <Link
                  href="/dashboard/my-orders"
                  className="text-sm hover:text-primary"
                >
                  Meus Pedidos
                </Link>
                <Link
                  href="/dashboard/forms"
                  className="text-sm hover:text-primary"
                >
                  Formulários
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            <Badge variant={userRole === "employee" ? "default" : "secondary"}>
              {userRole === "employee" ? "Funcionário" : "Usuário"}
            </Badge>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    {userName?.charAt(0).toUpperCase() || "U"}
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    {userName && <p className="font-medium">{userName}</p>}
                    <p className="w-[200px] truncate text-sm text-muted-foreground">
                      {userRole === "employee" ? "Funcionário" : "Usuário"}
                    </p>
                  </div>
                </div>
                <DropdownMenuItem onClick={handleLogout} disabled={isLoading}>
                  {isLoading ? "Saindo..." : "Sair"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
}
