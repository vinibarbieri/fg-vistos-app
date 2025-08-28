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
import { apiService, Order, Plan } from "@/lib/api-service";

export function OrderManager() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [newOrder, setNewOrder] = useState({
    responsible_user_id: "",
    applicants_quantity: 1,
    plan_id: "",
    payment_details: {},
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Buscar pedidos existentes
      const ordersResponse = await apiService.getOrders();
      if (ordersResponse.data) {
        setOrders(ordersResponse.data);
      }

      // Buscar planos disponíveis
      const plansResponse = await apiService.getActivePlans();
      if (plansResponse.data) {
        setPlans(plansResponse.data);
      }
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateOrder = async () => {
    try {
      const response = await apiService.createOrder({
        responsible_user_id: newOrder.responsible_user_id,
        applicants_quantity: newOrder.applicants_quantity,
        plan_id: newOrder.plan_id,
        payment_details: newOrder.payment_details,
        status: "pending",
      });

      if (response.error) throw new Error(response.error);

      // Atualizar lista de pedidos
      const plan = plans.find((p) => p.id === newOrder.plan_id);
      const newOrderWithDetails = {
        ...response.data!,
        plan_name: plan?.plan_name || "N/A",
        user_email: "N/A", // Será atualizado na próxima busca
      };

      setOrders((prev) => [newOrderWithDetails, ...prev]);

      // Reset do formulário
      setNewOrder({
        responsible_user_id: "",
        applicants_quantity: 1,
        plan_id: "",
        payment_details: {},
      });
      setShowCreateForm(false);
    } catch (error) {
      console.error("Erro ao criar pedido:", error);
    }
  };

  const handleUpdateOrder = async (
    orderId: string,
    updatedData: Partial<Order>
  ) => {
    try {
      const response = await apiService.updateOrder(orderId, updatedData);

      if (response.error) throw new Error(response.error);

      // Atualizar estado local
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, ...updatedData } : order
        )
      );

      setEditingOrder(null);
    } catch (error) {
      console.error("Erro ao atualizar pedido:", error);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    try {
      const response = await apiService.deleteOrder(orderId);

      if (response.error) throw new Error(response.error);

      // Remover da lista local
      setOrders((prev) => prev.filter((order) => order.id !== orderId));
    } catch (error) {
      console.error("Erro ao deletar pedido:", error);
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
        <h2 className="text-2xl font-semibold">Gerenciar Pedidos</h2>
        <Button onClick={() => setShowCreateForm(true)}>
          Criar Novo Pedido
        </Button>
      </div>

      {/* Lista de Pedidos */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {orders.map((order) => (
          <Card key={order.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{order.plan_name}</CardTitle>
                  <CardDescription>
                    Pedido #{order.id.slice(0, 8)}
                  </CardDescription>
                </div>
                <Badge className={getStatusColor(order.status)}>
                  {getStatusText(order.status)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Quantidade:</span>
                  <span>{order.applicants_quantity} candidato(s)</span>
                </div>
                <div className="flex justify-between">
                  <span>Usuário:</span>
                  <span className="text-sm text-muted-foreground">
                    {order.user_email}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Data:</span>
                  <span className="text-sm text-muted-foreground">
                    {new Date(order.created_at).toLocaleDateString("pt-BR")}
                  </span>
                </div>

                <div className="flex gap-2 mt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingOrder(order)}
                    className="flex-1"
                  >
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteOrder(order.id)}
                  >
                    Deletar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal para Criar Pedido */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-background rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Criar Novo Pedido</h3>
              <Button variant="ghost" onClick={() => setShowCreateForm(false)}>
                ✕
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="responsible_user_id">
                  ID do Usuário Responsável
                </Label>
                <Input
                  id="responsible_user_id"
                  value={newOrder.responsible_user_id}
                  onChange={(e) =>
                    setNewOrder((prev) => ({
                      ...prev,
                      responsible_user_id: e.target.value,
                    }))
                  }
                  placeholder="ID do usuário"
                />
              </div>

              <div>
                <Label htmlFor="applicants_quantity">
                  Quantidade de Candidatos
                </Label>
                <Input
                  id="applicants_quantity"
                  type="number"
                  min="1"
                  value={newOrder.applicants_quantity}
                  onChange={(e) =>
                    setNewOrder((prev) => ({
                      ...prev,
                      applicants_quantity: parseInt(e.target.value) || 1,
                    }))
                  }
                  placeholder="1"
                />
              </div>

              <div>
                <Label htmlFor="plan_id">Plano</Label>
                <select
                  id="plan_id"
                  className="w-full p-2 border rounded-md mt-1"
                  value={newOrder.plan_id}
                  onChange={(e) =>
                    setNewOrder((prev) => ({
                      ...prev,
                      plan_id: e.target.value,
                    }))
                  }
                >
                  <option value="">Selecione um plano</option>
                  {plans.map((plan) => (
                    <option key={plan.id} value={plan.id}>
                      {plan.plan_name} - R$ {plan.price.toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleCreateOrder}
                  className="flex-1"
                  disabled={!newOrder.responsible_user_id || !newOrder.plan_id}
                >
                  Criar Pedido
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

      {/* Modal para Editar Pedido */}
      {editingOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-background rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Editar Pedido</h3>
              <Button variant="ghost" onClick={() => setEditingOrder(null)}>
                ✕
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="edit_status">Status</Label>
                <select
                  id="edit_status"
                  className="w-full p-2 border rounded-md mt-1"
                  value={editingOrder.status}
                  onChange={(e) =>
                    setEditingOrder((prev) =>
                      prev ? { ...prev, status: e.target.value } : null
                    )
                  }
                >
                  <option value="pending">Pendente</option>
                  <option value="processing">Processando</option>
                  <option value="approved">Aprovado</option>
                  <option value="rejected">Rejeitado</option>
                </select>
              </div>

              <div>
                <Label htmlFor="edit_applicants_quantity">
                  Quantidade de Candidatos
                </Label>
                <Input
                  id="edit_applicants_quantity"
                  type="number"
                  min="1"
                  value={editingOrder.applicants_quantity}
                  onChange={(e) =>
                    setEditingOrder((prev) =>
                      prev
                        ? {
                            ...prev,
                            applicants_quantity: parseInt(e.target.value) || 1,
                          }
                        : null
                    )
                  }
                  placeholder="1"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={() => {
                    if (editingOrder) {
                      handleUpdateOrder(editingOrder.id, {
                        status: editingOrder.status,
                        applicants_quantity: editingOrder.applicants_quantity,
                      });
                    }
                  }}
                  className="flex-1"
                >
                  Atualizar Pedido
                </Button>
                <Button variant="outline" onClick={() => setEditingOrder(null)}>
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
