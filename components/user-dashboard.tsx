"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiService, Order, FormQuestion } from "@/lib/api-service";

export function UserDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [forms, setForms] = useState<FormQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedForm, setSelectedForm] = useState<FormQuestion | null>(null);
  const [formAnswers, setFormAnswers] = useState<Record<string, any>>({});

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      // Buscar usuário atual
      const currentUser = await apiService.getCurrentUser();
      if (!currentUser) return;

      // Buscar pedidos do usuário
      const ordersResponse = await apiService.getUserOrders(currentUser.id);
      if (ordersResponse.data) {
        setOrders(ordersResponse.data);
      }

      // Buscar formulários disponíveis para o usuário
      const formsResponse = await apiService.getFormQuestions();
      if (formsResponse.data) {
        setForms(formsResponse.data);
      }
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = async (formId: string) => {
    try {
      // Buscar usuário atual
      const currentUser = await apiService.getCurrentUser();
      if (!currentUser) return;

      // Aqui você pode implementar a lógica para salvar as respostas
      // Por exemplo, criar uma nova tabela para armazenar as respostas dos usuários
      console.log("Respostas do formulário:", formAnswers);

      // Reset do formulário
      setFormAnswers({});
      setSelectedForm(null);
    } catch (error) {
      console.error("Erro ao enviar formulário:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Pendente";
      case "approved":
        return "Aprovado";
      case "rejected":
        return "Rejeitado";
      default:
        return "Desconhecido";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Meu Dashboard</h1>
        <p className="text-muted-foreground">
          Gerencie seus pedidos e acesse os formulários disponíveis
        </p>
      </div>

      {/* Seção de Pedidos */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Meus Pedidos</h2>
        {orders.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                Você ainda não possui pedidos.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {orders.map((order) => (
              <Card key={order.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{order.plan_name}</CardTitle>
                  <CardDescription>
                    Pedido #{order.id.slice(0, 8)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <Badge className={getStatusColor(order.status)}>
                        {getStatusText(order.status)}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Quantidade:</span>
                      <span>{order.applicants_quantity} candidato(s)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Data:</span>
                      <span>
                        {new Date(order.created_at).toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Seção de Formulários */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Formulários Disponíveis</h2>
        {forms.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                Nenhum formulário disponível no momento.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {forms.map((form) => (
              <Card key={form.id}>
                <CardHeader>
                  <CardTitle className="text-lg">Formulário</CardTitle>
                  <CardDescription>
                    Plano: {form.plans?.plan_name || "N/A"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => setSelectedForm(form)}
                    className="w-full"
                  >
                    Preencher Formulário
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Modal do Formulário */}
      {selectedForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-background rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Formulário</h3>
              <Button variant="ghost" onClick={() => setSelectedForm(null)}>
                ✕
              </Button>
            </div>

            <div className="space-y-4">
              {selectedForm.questions &&
                typeof selectedForm.questions === "object" &&
                Object.entries(selectedForm.questions).map(
                  ([key, question]: [string, any]) => (
                    <div key={key} className="space-y-2">
                      <Label htmlFor={key}>{question.label || key}</Label>
                      {question.type === "textarea" ? (
                        <textarea
                          id={key}
                          className="w-full p-2 border rounded-md"
                          rows={3}
                          value={formAnswers[key] || ""}
                          onChange={(e) =>
                            setFormAnswers((prev) => ({
                              ...prev,
                              [key]: e.target.value,
                            }))
                          }
                        />
                      ) : (
                        <Input
                          id={key}
                          type={question.type || "text"}
                          value={formAnswers[key] || ""}
                          onChange={(e) =>
                            setFormAnswers((prev) => ({
                              ...prev,
                              [key]: e.target.value,
                            }))
                          }
                        />
                      )}
                    </div>
                  )
                )}

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={() => handleFormSubmit(selectedForm.id)}
                  className="flex-1"
                >
                  Enviar Formulário
                </Button>
                <Button variant="outline" onClick={() => setSelectedForm(null)}>
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
