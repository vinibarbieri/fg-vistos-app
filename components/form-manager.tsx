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
import { apiService, FormQuestion, Plan } from "@/lib/api-service";
import { useToast } from "@/lib/toast-context";

export function FormManager() {
  const [forms, setForms] = useState<FormQuestion[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newForm, setNewForm] = useState({
    plan_id: "",
    questions: {},
  });
  const toast = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Buscar formulários existentes
      const formsResponse = await apiService.getFormQuestions();
      if (formsResponse.data) {
        setForms(formsResponse.data);
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

  const handleCreateForm = async () => {
    try {
      const response = await apiService.createFormQuestion({
        plan_id: newForm.plan_id,
        questions: newForm.questions,
      });

      if (response.error) throw new Error(response.error);

      // Atualizar lista de formulários
      const plan = plans.find((p) => p.id === newForm.plan_id);
      setForms((prev) => [
        ...prev,
        { ...response.data!, plan_name: plan?.plan_name },
      ]);

      // Reset do formulário
      setNewForm({ plan_id: "", questions: {} });
      setShowCreateForm(false);

      toast.success("Formulário criado com sucesso!");
    } catch (error) {
      console.error("Erro ao criar formulário:", error);
      toast.error(
        "Erro ao criar formulário",
        error instanceof Error ? error.message : "Erro desconhecido"
      );
    }
  };

  const handleDeleteForm = async (formId: string) => {
    try {
      const response = await apiService.deleteFormQuestion(formId);

      if (response.error) throw new Error(response.error);

      // Remover da lista local
      setForms((prev) => prev.filter((form) => form.id !== formId));
      toast.success("Formulário deletado com sucesso!");
    } catch (error) {
      console.error("Erro ao deletar formulário:", error);
      toast.error(
        "Erro ao deletar formulário",
        error instanceof Error ? error.message : "Erro desconhecido"
      );
    }
  };

  const addQuestion = () => {
    const questionKey = `question_${Object.keys(newForm.questions).length + 1}`;
    setNewForm((prev) => ({
      ...prev,
      questions: {
        ...prev.questions,
        [questionKey]: {
          label: `Pergunta ${Object.keys(newForm.questions).length + 1}`,
          type: "text",
          required: true,
        },
      },
    }));
  };

  const updateQuestion = (key: string, field: string, value: any) => {
    setNewForm((prev) => ({
      ...prev,
      questions: {
        ...prev.questions,
        [key]: {
          ...prev.questions[key],
          [field]: value,
        },
      },
    }));
  };

  const removeQuestion = (key: string) => {
    const { [key]: removed, ...remaining } = newForm.questions;
    setNewForm((prev) => ({
      ...prev,
      questions: remaining,
    }));
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
        <h2 className="text-2xl font-semibold">Gerenciar Formulários</h2>
        <Button onClick={() => setShowCreateForm(true)}>
          Criar Novo Formulário
        </Button>
      </div>

      {/* Lista de Formulários Existentes */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {forms.map((form) => (
          <Card key={form.id}>
            <CardHeader>
              <CardTitle className="text-lg">Formulário</CardTitle>
              <CardDescription>
                Plano: {form.plan_name || "N/A"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  {Object.keys(form.questions).length} pergunta(s)
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteForm(form.id)}
                  className="w-full"
                >
                  Deletar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal para Criar Formulário */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-background rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Criar Novo Formulário</h3>
              <Button variant="ghost" onClick={() => setShowCreateForm(false)}>
                ✕
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="plan">Plano</Label>
                <select
                  id="plan"
                  className="w-full p-2 border rounded-md mt-1"
                  value={newForm.plan_id}
                  onChange={(e) =>
                    setNewForm((prev) => ({ ...prev, plan_id: e.target.value }))
                  }
                >
                  <option value="">Selecione um plano</option>
                  {plans.map((plan) => (
                    <option key={plan.id} value={plan.id}>
                      {plan.plan_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label>Perguntas</Label>
                  <Button type="button" onClick={addQuestion} size="sm">
                    Adicionar Pergunta
                  </Button>
                </div>

                {Object.entries(newForm.questions).map(
                  ([key, question]: [string, any]) => (
                    <div key={key} className="border rounded-lg p-4 mb-4">
                      <div className="grid grid-cols-3 gap-4 mb-2">
                        <div>
                          <Label>Rótulo</Label>
                          <Input
                            value={question.label}
                            onChange={(e) =>
                              updateQuestion(key, "label", e.target.value)
                            }
                            placeholder="Digite o rótulo da pergunta"
                          />
                        </div>
                        <div>
                          <Label>Tipo</Label>
                          <select
                            className="w-full p-2 border rounded-md"
                            value={question.type}
                            onChange={(e) =>
                              updateQuestion(key, "type", e.target.value)
                            }
                          >
                            <option value="text">Texto</option>
                            <option value="email">Email</option>
                            <option value="number">Número</option>
                            <option value="textarea">Área de Texto</option>
                            <option value="select">Seleção</option>
                          </select>
                        </div>
                        <div className="flex items-end">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeQuestion(key)}
                          >
                            Remover
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`required_${key}`}
                          checked={question.required}
                          onChange={(e) =>
                            updateQuestion(key, "required", e.target.checked)
                          }
                        />
                        <Label htmlFor={`required_${key}`}>Obrigatório</Label>
                      </div>
                    </div>
                  )
                )}
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleCreateForm}
                  className="flex-1"
                  disabled={
                    !newForm.plan_id ||
                    Object.keys(newForm.questions).length === 0
                  }
                >
                  Criar Formulário
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
