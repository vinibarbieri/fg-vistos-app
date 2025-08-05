"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { FileText, User, Calendar, CheckCircle, Info } from "lucide-react";
import Link from "next/link";
import { getUserApplication, getStepData } from "@/lib/application";
import { getStatusInfo } from "@/types/application";
import { PersonalData, Application } from "@/types/application";
import { EditableName } from "@/components/editable-name";

export default function DashboardPage() {
  const [application, setApplication] = useState<Application | null>(null);
  const [userName, setUserName] = useState("Vinicius");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Simular dados do usuário (em produção viria do auth)
        const mockUserId = "mock-user-123";
        const appData = await getUserApplication(mockUserId);
        
        if (appData) {
          setApplication(appData);
          const personalData = getStepData<PersonalData>(appData.step_data, "personal_data");
          setUserName(personalData?.full_name || "Vinicius");
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Dados da aplicação (mockados por enquanto)
  const applicationData = application || {
    id: "mock-app-123",
    status: "draft" as const,
    progress_percentage: 0,
    current_step: 1,
    step_data: {}
  };

  const statusInfo = getStatusInfo(applicationData.status);

  // Obter dados pessoais atuais
  const personalData = getStepData<PersonalData>(applicationData.step_data, "personal_data");

  const handleNameUpdate = (newName: string) => {
    setUserName(newName);
    // Atualizar também no estado da aplicação
    if (application) {
      setApplication({
        ...application,
        step_data: {
          ...application.step_data,
          personal_data: {
            ...personalData,
            full_name: newName
          }
        }
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header da página */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Bem-vindo ao sistema de vistos. Acompanhe o progresso da sua aplicação.
        </p>
      </div>

      {/* Informações do usuário */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Informações Pessoais
          </CardTitle>
          <CardDescription>
            Clique no ícone de edição ao lado do nome para modificá-lo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Nome</p>
              <EditableName
                currentName={userName}
                applicationId={applicationData.id}
                currentPersonalData={personalData}
                onUpdate={handleNameUpdate}
              />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p className="text-lg">vinicius@email.com</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status da aplicação */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Status da Aplicação
          </CardTitle>
          <CardDescription>
            Acompanhe o progresso da sua solicitação de visto
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status atual */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${statusInfo.color}`}></div>
                {statusInfo.label}
              </Badge>
            </div>
            <span className="text-sm text-muted-foreground">
              Etapa {applicationData.current_step} de 5
            </span>
          </div>

          {/* Barra de progresso */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progresso geral</span>
              <span>{applicationData.progress_percentage}%</span>
            </div>
            <Progress value={applicationData.progress_percentage} className="h-2" />
          </div>

          {/* Ações */}
          <div className="flex gap-3">
            <Button asChild className="flex-1">
              <Link href="/dashboard/application">
                {applicationData.status === "draft" ? "Continuar Aplicação" : "Ver Detalhes"}
              </Link>
            </Button>
            {applicationData.status === "draft" && (
              <Button variant="outline" asChild>
                <Link href="/dashboard/application/step/1">
                  Nova Aplicação
                </Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Próximos passos */}
      <Card>
        <CardHeader>
          <CardTitle>Próximos Passos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {applicationData.status === "draft" && (
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <FileText className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="font-medium">Complete o formulário de aplicação</p>
                  <p className="text-sm text-muted-foreground">
                    Preencha todas as informações necessárias para prosseguir
                  </p>
                </div>
              </div>
            )}
            {applicationData.status === "submitted" && (
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <Calendar className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="font-medium">Aguardando análise</p>
                  <p className="text-sm text-muted-foreground">
                    Sua aplicação está sendo revisada pela nossa equipe
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
