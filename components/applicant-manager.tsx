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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { apiService, Applicant, Order } from "@/lib/api-service";

export function ApplicantManager() {
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newApplicant, setNewApplicant] = useState({
    name: "",
    email: "",
    order_id: "",
    status: "pending",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Buscar candidatos existentes
      const applicantsResponse = await apiService.getApplicants();
      if (applicantsResponse.data) {
        setApplicants(applicantsResponse.data);
      }

      // Buscar pedidos disponíveis
      const ordersResponse = await apiService.getOrders();
      if (ordersResponse.data) {
        setOrders(ordersResponse.data);
      }
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateApplicant = async () => {
    try {
      const response = await apiService.createApplicant({
        name: newApplicant.name,
        email: newApplicant.email,
        order_id: newApplicant.order_id,
        status: newApplicant.status,
      });

      if (response.error) throw new Error(response.error);

      // Atualizar lista de candidatos
      const order = orders.find((o) => o.id === newApplicant.order_id);
      const newApplicantWithDetails = {
        ...response.data!,
        order_details: order
          ? {
              plan_name: order.plan_name,
              responsible_user_email: "N/A", // Será atualizado na próxima busca
            }
          : undefined,
      };

      setApplicants((prev) => [newApplicantWithDetails, ...prev]);

      // Reset do formulário
      setNewApplicant({ name: "", email: "", order_id: "", status: "pending" });
      setShowCreateForm(false);
    } catch (error) {
      console.error("Erro ao criar candidato:", error);
    }
  };

  const handleUpdateStatus = async (applicantId: string, newStatus: string) => {
    try {
      const response = await apiService.updateApplicant(applicantId, {
        status: newStatus,
      });

      if (response.error) throw new Error(response.error);

      // Atualizar estado local
      setApplicants((prev) =>
        prev.map((applicant) =>
          applicant.id === applicantId
            ? { ...applicant, status: newStatus }
            : applicant
        )
      );
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
    }
  };

  const handleDeleteApplicant = async (applicantId: string) => {
    try {
      const response = await apiService.deleteApplicant(applicantId);

      if (response.error) throw new Error(response.error);

      // Remover da lista local
      setApplicants((prev) =>
        prev.filter((applicant) => applicant.id !== applicantId)
      );
    } catch (error) {
      console.error("Erro ao deletar candidato:", error);
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
      case "processing":
        return "bg-blue-100 text-blue-800";
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
      case "processing":
        return "Processando";
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Gerenciar Candidatos</h2>
        <Button onClick={() => setShowCreateForm(true)}>
          Adicionar Candidato
        </Button>
      </div>

      {/* Lista de Candidatos */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {applicants.map((applicant) => (
          <Card key={applicant.id}>
            <CardHeader>
              <CardTitle className="text-lg">{applicant.name}</CardTitle>
              <CardDescription>{applicant.email}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Status:</span>
                  <Badge className={getStatusColor(applicant.status)}>
                    {getStatusText(applicant.status)}
                  </Badge>
                </div>
                {applicant.order_details && (
                  <>
                    <div className="flex justify-between">
                      <span>Plano:</span>
                      <span className="text-sm text-muted-foreground">
                        {applicant.order_details.plan_name}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Usuário:</span>
                      <span className="text-sm text-muted-foreground">
                        {applicant.order_details.responsible_user_email}
                      </span>
                    </div>
                  </>
                )}
                <div className="flex justify-between">
                  <span>Data:</span>
                  <span className="text-sm text-muted-foreground">
                    {new Date(applicant.created_at).toLocaleDateString("pt-BR")}
                  </span>
                </div>

                <div className="flex gap-2 mt-3">
                  <select
                    className="flex-1 p-2 border rounded-md text-sm"
                    value={applicant.status}
                    onChange={(e) =>
                      handleUpdateStatus(applicant.id, e.target.value)
                    }
                  >
                    <option value="pending">Pendente</option>
                    <option value="processing">Processando</option>
                    <option value="approved">Aprovado</option>
                    <option value="rejected">Rejeitado</option>
                  </select>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteApplicant(applicant.id)}
                  >
                    Deletar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal para Adicionar Candidato */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-background rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Adicionar Candidato</h3>
              <Button variant="ghost" onClick={() => setShowCreateForm(false)}>
                ✕
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  value={newApplicant.name}
                  onChange={(e) =>
                    setNewApplicant((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  placeholder="Nome completo do candidato"
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newApplicant.email}
                  onChange={(e) =>
                    setNewApplicant((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  placeholder="Email do candidato"
                />
              </div>

              <div>
                <Label htmlFor="order">Pedido</Label>
                <select
                  id="order"
                  className="w-full p-2 border rounded-md mt-1"
                  value={newApplicant.order_id}
                  onChange={(e) =>
                    setNewApplicant((prev) => ({
                      ...prev,
                      order_id: e.target.value,
                    }))
                  }
                >
                  <option value="">Selecione um pedido</option>
                  {orders.map((order) => (
                    <option key={order.id} value={order.id}>
                      {order.plan_name} - #{order.id.slice(0, 8)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="status">Status Inicial</Label>
                <select
                  id="status"
                  className="w-full p-2 border rounded-md mt-1"
                  value={newApplicant.status}
                  onChange={(e) =>
                    setNewApplicant((prev) => ({
                      ...prev,
                      status: e.target.value,
                    }))
                  }
                >
                  <option value="pending">Pendente</option>
                  <option value="processing">Processando</option>
                  <option value="approved">Aprovado</option>
                  <option value="rejected">Rejeitado</option>
                </select>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleCreateApplicant}
                  className="flex-1"
                  disabled={
                    !newApplicant.name ||
                    !newApplicant.email ||
                    !newApplicant.order_id
                  }
                >
                  Adicionar Candidato
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                >
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
