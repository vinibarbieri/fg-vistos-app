import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { FileText, User, MapPin, Calendar, CheckCircle, ArrowRight } from "lucide-react";
import Link from "next/link";

// Definição das etapas do formulário
const APPLICATION_STEPS = [
  {
    id: 1,
    title: "Dados Pessoais",
    description: "Informações básicas sobre você",
    icon: User,
    key: "personal_data",
    path: "/dashboard/application/step/1"
  },
  {
    id: 2,
    title: "Documentos",
    description: "Upload de documentos necessários",
    icon: FileText,
    key: "documents",
    path: "/dashboard/application/step/2"
  },
  {
    id: 3,
    title: "Destino da Viagem",
    description: "Informações sobre o destino",
    icon: MapPin,
    key: "travel_destination",
    path: "/dashboard/application/step/3"
  },
  {
    id: 4,
    title: "Motivo da Viagem",
    description: "Tipo de visto e propósito",
    icon: Calendar,
    key: "travel_purpose",
    path: "/dashboard/application/step/4"
  },
  {
    id: 5,
    title: "Revisão e Envio",
    description: "Revisar e enviar aplicação",
    icon: CheckCircle,
    key: "review",
    path: "/dashboard/application/step/5"
  }
];

export default async function ApplicationPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // TODO: Buscar dados da aplicação do usuário
  // Por enquanto, dados mockados
  const applicationData = {
    currentStep: 1,
    progress: 20,
    completedSteps: [1],
    status: "draft"
  };

  const getStepStatus = (stepId: number) => {
    if (applicationData.completedSteps.includes(stepId)) {
      return "completed";
    } else if (stepId === applicationData.currentStep) {
      return "current";
    } else {
      return "pending";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Aplicação de Visto</h1>
        <p className="text-muted-foreground">
          Complete todas as etapas para finalizar sua aplicação
        </p>
      </div>

      {/* Progresso geral */}
      <Card>
        <CardHeader>
          <CardTitle>Progresso da Aplicação</CardTitle>
          <CardDescription>
            Etapa {applicationData.currentStep} de {APPLICATION_STEPS.length}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span>Progresso geral</span>
              <span>{applicationData.progress}%</span>
            </div>
            <Progress value={applicationData.progress} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Lista de etapas */}
      <div className="grid gap-4">
        {APPLICATION_STEPS.map((step, index) => {
          const status = getStepStatus(step.id);
          const Icon = step.icon;

          return (
            <Card key={step.id} className={`transition-all ${
              status === "current" ? "ring-2 ring-primary" : ""
            }`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Ícone da etapa */}
                    <div className={`flex items-center justify-center w-12 h-12 rounded-full ${
                      status === "completed" ? "bg-primary/10 text-primary" :
                      status === "current" ? "bg-secondary/10 text-secondary" :
                      "bg-muted text-muted-foreground"
                    }`}>
                      {status === "completed" ? (
                        <CheckCircle className="h-6 w-6" />
                      ) : (
                        <Icon className="h-6 w-6" />
                      )}
                    </div>

                    {/* Informações da etapa */}
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{step.title}</h3>
                      <p className="text-muted-foreground">{step.description}</p>
                      {status === "completed" && (
                        <span className="text-sm text-primary font-medium">
                          ✓ Concluída
                        </span>
                      )}
                      {status === "current" && (
                        <span className="text-sm text-secondary font-medium">
                          Em andamento
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Botão de ação */}
                  <div className="flex items-center gap-2">
                    {status === "completed" && (
                      <Button variant="outline" size="sm" asChild>
                        <Link href={step.path}>
                          Revisar
                        </Link>
                      </Button>
                    )}
                    {status === "current" && (
                      <Button size="sm" asChild>
                        <Link href={step.path}>
                          Continuar
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    )}
                    {status === "pending" && (
                      <Button variant="outline" size="sm" disabled>
                        Aguardando
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Ações */}
      <div className="flex justify-between items-center pt-6 border-t">
        <Button variant="outline" asChild>
          <Link href="/dashboard">
            Voltar ao Dashboard
          </Link>
        </Button>
        
        {applicationData.status === "draft" && (
          <Button asChild>
            <Link href={`/dashboard/application/step/${applicationData.currentStep}`}>
              {applicationData.currentStep === 1 ? "Iniciar Aplicação" : "Continuar"}
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
