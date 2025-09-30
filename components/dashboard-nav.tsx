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
  userEmail?: string;
}

export function DashboardNav({ userRole, userName, userEmail }: DashboardNavProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Determinar o link do dashboard baseado no role
  const getDashboardLink = () => {
    switch (userRole) {
      case "Cliente":
        return "/protected/user";
      default:
        return "/dashboard";
    }
  };

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
            <Link href={getDashboardLink()} className="text-2xl font-bold flex items-center gap-8">
              <img src="/fg-logo.svg" alt="FG Vistos" className="h-10 w-auto" />
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <Badge variant="secondary">
              {userRole === "Admin" ? "Administrador" : userRole === "Funcionario" ? "Funcionário" : "Cliente"}
            </Badge>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 bg-primary text-primary-foreground rounded-full"
                >                  
                  {userName?.charAt(0).toUpperCase() || "U"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    {userName && <p className="font-medium">{userName}</p>}
                    <p className="w-[200px] truncate text-sm text-muted-foreground">
                      {userEmail ? userEmail : "Não informado"}
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
