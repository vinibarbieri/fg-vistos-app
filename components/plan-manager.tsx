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
import { apiService, Plan, VisaType } from "@/lib/api-service";

export function PlanManager() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [visaTypes, setVisaTypes] = useState<VisaType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [newPlan, setNewPlan] = useState({
    plan_name: "",
    description: "",
    price: 0,
    active: true,
    visa_type_id: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Buscar planos existentes
      const plansResponse = await apiService.getPlans();
      if (plansResponse.data) {
        setPlans(plansResponse.data);
      }

      // Buscar tipos de visto disponíveis
      const visaTypesResponse = await apiService.getVisaTypes();
      if (visaTypesResponse.data) {
        setVisaTypes(visaTypesResponse.data);
      }
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePlan = async () => {
    try {
      const response = await apiService.createPlan({
        plan_name: newPlan.plan_name,
        description: newPlan.description,
        price: newPlan.price,
        active: newPlan.active,
        visa_type_id: newPlan.visa_type_id || null,
      });

      if (response.error) throw new Error(response.error);

      // Atualizar lista de planos
      setPlans((prev) => [...prev, response.data!]);

      // Reset do formulário
      setNewPlan({
        plan_name: "",
        description: "",
        price: 0,
        active: true,
        visa_type_id: "",
      });
      setShowCreateForm(false);
    } catch (error) {
      console.error("Erro ao criar plano:", error);
    }
  };

  const handleUpdatePlan = async (
    planId: string,
    updatedData: Partial<Plan>
  ) => {
    try {
      const response = await apiService.updatePlan(planId, updatedData);

      if (response.error) throw new Error(response.error);

      // Atualizar estado local
      setPlans((prev) =>
        prev.map((plan) =>
          plan.id === planId ? { ...plan, ...updatedData } : plan
        )
      );

      setEditingPlan(null);
    } catch (error) {
      console.error("Erro ao atualizar plano:", error);
    }
  };

  const handleDeletePlan = async (planId: string) => {
    try {
      const response = await apiService.deletePlan(planId);

      if (response.error) throw new Error(response.error);

      // Remover da lista local
      setPlans((prev) => prev.filter((plan) => plan.id !== planId));
    } catch (error) {
      console.error("Erro ao deletar plano:", error);
    }
  };

  const togglePlanStatus = async (planId: string, currentStatus: boolean) => {
    await handleUpdatePlan(planId, { active: !currentStatus });
  };

  const getVisaTypeName = (visaTypeId: string) => {
    const visaType = visaTypes.find((vt) => vt.id === visaTypeId);
    return visaType ? visaType.name : "N/A";
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
        <h2 className="text-2xl font-semibold">Gerenciar Planos</h2>
        <Button onClick={() => setShowCreateForm(true)}>
          Criar Novo Plano
        </Button>
      </div>

      {/* Lista de Planos */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => (
          <Card key={plan.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{plan.plan_name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </div>
                <Badge variant={plan.active ? "default" : "secondary"}>
                  {plan.active ? "Ativo" : "Inativo"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Preço:</span>
                  <span className="font-semibold">
                    R$ {plan.price.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Tipo de Visto:</span>
                  <span className="text-sm text-muted-foreground">
                    {plan.visa_type_id
                      ? getVisaTypeName(plan.visa_type_id)
                      : "N/A"}
                  </span>
                </div>

                <div className="flex gap-2 mt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingPlan(plan)}
                    className="flex-1"
                  >
                    Editar
                  </Button>
                  <Button
                    variant={plan.active ? "outline" : "default"}
                    size="sm"
                    onClick={() => togglePlanStatus(plan.id, plan.active)}
                    className="flex-1"
                  >
                    {plan.active ? "Desativar" : "Ativar"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeletePlan(plan.id)}
                  >
                    Deletar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal para Criar Plano */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-background rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Criar Novo Plano</h3>
              <Button variant="ghost" onClick={() => setShowCreateForm(false)}>
                ✕
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="plan_name">Nome do Plano</Label>
                <Input
                  id="plan_name"
                  value={newPlan.plan_name}
                  onChange={(e) =>
                    setNewPlan((prev) => ({
                      ...prev,
                      plan_name: e.target.value,
                    }))
                  }
                  placeholder="Nome do plano"
                />
              </div>

              <div>
                <Label htmlFor="description">Descrição</Label>
                <textarea
                  id="description"
                  className="w-full p-2 border rounded-md"
                  rows={3}
                  value={newPlan.description}
                  onChange={(e) =>
                    setNewPlan((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Descrição do plano"
                />
              </div>

              <div>
                <Label htmlFor="price">Preço</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={newPlan.price}
                  onChange={(e) =>
                    setNewPlan((prev) => ({
                      ...prev,
                      price: parseFloat(e.target.value) || 0,
                    }))
                  }
                  placeholder="0.00"
                />
              </div>

              <div>
                <Label htmlFor="visa_type">Tipo de Visto</Label>
                <select
                  id="visa_type"
                  className="w-full p-2 border rounded-md mt-1"
                  value={newPlan.visa_type_id}
                  onChange={(e) =>
                    setNewPlan((prev) => ({
                      ...prev,
                      visa_type_id: e.target.value,
                    }))
                  }
                >
                  <option value="">Selecione um tipo de visto</option>
                  {visaTypes.map((visaType) => (
                    <option key={visaType.id} value={visaType.id}>
                      {visaType.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="active"
                  checked={newPlan.active}
                  onChange={(e) =>
                    setNewPlan((prev) => ({
                      ...prev,
                      active: e.target.checked,
                    }))
                  }
                />
                <Label htmlFor="active">Ativo</Label>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleCreatePlan}
                  className="flex-1"
                  disabled={!newPlan.plan_name || newPlan.price <= 0}
                >
                  Criar Plano
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

      {/* Modal para Editar Plano */}
      {editingPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-background rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Editar Plano</h3>
              <Button variant="ghost" onClick={() => setEditingPlan(null)}>
                ✕
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="edit_plan_name">Nome do Plano</Label>
                <Input
                  id="edit_plan_name"
                  value={editingPlan.plan_name}
                  onChange={(e) =>
                    setEditingPlan((prev) =>
                      prev ? { ...prev, plan_name: e.target.value } : null
                    )
                  }
                  placeholder="Nome do plano"
                />
              </div>

              <div>
                <Label htmlFor="edit_description">Descrição</Label>
                <textarea
                  id="edit_description"
                  className="w-full p-2 border rounded-md"
                  rows={3}
                  value={editingPlan.description}
                  onChange={(e) =>
                    setEditingPlan((prev) =>
                      prev ? { ...prev, description: e.target.value } : null
                    )
                  }
                  placeholder="Descrição do plano"
                />
              </div>

              <div>
                <Label htmlFor="edit_price">Preço</Label>
                <Input
                  id="edit_price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={editingPlan.price}
                  onChange={(e) =>
                    setEditingPlan((prev) =>
                      prev
                        ? { ...prev, price: parseFloat(e.target.value) || 0 }
                        : null
                    )
                  }
                  placeholder="0.00"
                />
              </div>

              <div>
                <Label htmlFor="edit_visa_type">Tipo de Visto</Label>
                <select
                  id="edit_visa_type"
                  className="w-full p-2 border rounded-md mt-1"
                  value={editingPlan.visa_type_id || ""}
                  onChange={(e) =>
                    setEditingPlan((prev) =>
                      prev ? { ...prev, visa_type_id: e.target.value } : null
                    )
                  }
                >
                  <option value="">Selecione um tipo de visto</option>
                  {visaTypes.map((visaType) => (
                    <option key={visaType.id} value={visaType.id}>
                      {visaType.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={() => {
                    if (editingPlan) {
                      handleUpdatePlan(editingPlan.id, {
                        plan_name: editingPlan.plan_name,
                        description: editingPlan.description,
                        price: editingPlan.price,
                        visa_type_id: editingPlan.visa_type_id || null,
                      });
                    }
                  }}
                  className="flex-1"
                  disabled={!editingPlan.plan_name || editingPlan.price <= 0}
                >
                  Atualizar Plano
                </Button>
                <Button variant="outline" onClick={() => setEditingPlan(null)}>
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
