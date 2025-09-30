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
import { apiService } from "@/lib/api-service";
import { ProfilesT } from "@/types/ProfilesT";

export function FuncionarioManager() {
  const [funcionarios, setFuncionarios] = useState<ProfilesT[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newFuncionario, setNewFuncionario] = useState({
    name: "",
    email: "",
    password: "",
    role: "Funcionario" as "Funcionario" | "Admin",
  });

  useEffect(() => {
    fetchFuncionarios();
  }, []);

  const fetchFuncionarios = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getProfiles();
      
      if (response.error) throw new Error(response.error);
      
      // Filtrar apenas funcionários e admins
      const funcionarioProfiles = response.data?.filter(
        profile => profile.role === "Funcionario" || profile.role === "Admin"
      ) || [];
      
      setFuncionarios(funcionarioProfiles);
    } catch (error) {
      console.error("Erro ao buscar funcionários:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateFuncionario = async () => {
    try {
      // Primeiro criar o usuário no Supabase Auth
      const { data: authData, error: authError } = await apiService.supabaseClient.auth.admin.createUser({
        email: newFuncionario.email,
        password: newFuncionario.password,
        email_confirm: true,
      });

      if (authError) throw new Error(authError.message);

      // Depois criar o perfil
      const response = await apiService.createProfile({
        id: authData.user.id,
        name: newFuncionario.name,
        email: newFuncionario.email,
        role: newFuncionario.role,
      });

      if (response.error) throw new Error(response.error);

      // Atualizar lista local
      setFuncionarios(prev => [response.data!, ...prev]);

      // Reset do formulário
      setNewFuncionario({
        name: "",
        email: "",
        password: "",
        role: "Funcionario",
      });
      setShowCreateForm(false);
    } catch (error) {
      console.error("Erro ao criar funcionário:", error);
      alert("Erro ao criar funcionário: " + (error as Error).message);
    }
  };

  const handleUpdateFuncionario = async (funcionarioId: string, updates: Partial<ProfilesT>) => {
    try {
      const response = await apiService.updateProfile(funcionarioId, updates);
      
      if (response.error) throw new Error(response.error);

      // Atualizar estado local
      setFuncionarios(prev =>
        prev.map(funcionario =>
          funcionario.id === funcionarioId
            ? { ...funcionario, ...updates }
            : funcionario
        )
      );
    } catch (error) {
      console.error("Erro ao atualizar funcionário:", error);
      alert("Erro ao atualizar funcionário: " + (error as Error).message);
    }
  };

  const handleDeleteFuncionario = async (funcionarioId: string) => {
    if (!confirm("Tem certeza que deseja deletar este funcionário?")) {
      return;
    }

    try {
      // Primeiro deletar o perfil
      const response = await apiService.deleteProfile(funcionarioId);
      
      if (response.error) throw new Error(response.error);

      // Depois deletar o usuário do auth
      const { error: authError } = await apiService.supabaseClient.auth.admin.deleteUser(funcionarioId);
      
      if (authError) throw new Error(authError.message);

      // Remover da lista local
      setFuncionarios(prev =>
        prev.filter(funcionario => funcionario.id !== funcionarioId)
      );
    } catch (error) {
      console.error("Erro ao deletar funcionário:", error);
      alert("Erro ao deletar funcionário: " + (error as Error).message);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800";
      case "funcionario":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case "admin":
        return "Administrador";
      case "funcionario":
        return "Funcionário";
      default:
        return "Desconhecido";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Carregando funcionários...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Gerenciar Funcionários</h2>
        <Button onClick={() => setShowCreateForm(true)}>
          Adicionar Funcionário
        </Button>
      </div>

      {/* Lista de Funcionários */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {funcionarios.map((funcionario) => (
          <Card key={funcionario.id}>
            <CardHeader>
              <CardTitle className="text-lg">
                {funcionario.name || "Nome não informado"}
              </CardTitle>
              <CardDescription>{funcionario.email}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <select
                  className="flex-1 p-2 border rounded-md text-sm bg-white"
                  value={funcionario.role}
                  onChange={(e) =>
                    handleUpdateFuncionario(funcionario.id, { role: e.target.value as "Funcionario" | "Admin" })
                  }
                >
                  <option value="Funcionario">Funcionário</option>
                  <option value="Admin">Administrador</option>
                </select>
                <Button
                  variant="outline"
                  className="bg-primary text-primary-foreground"
                  size="sm"
                  onClick={() => handleDeleteFuncionario(funcionario.id)}
                >
                  Deletar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal para Adicionar Funcionário */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-background rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Adicionar Funcionário</h3>
              <Button variant="ghost" onClick={() => setShowCreateForm(false)}>
                ✕
              </Button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="firstName">Nome</Label>
                  <Input
                    id="firstName"
                    value={newFuncionario.name}
                    onChange={(e) =>
                      setNewFuncionario((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    placeholder="Nome"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newFuncionario.email}
                  onChange={(e) =>
                    setNewFuncionario((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  placeholder="Email do funcionário"
                />
              </div>

              <div>
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={newFuncionario.password}
                  onChange={(e) =>
                    setNewFuncionario((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
                  placeholder="Senha temporária"
                />
              </div>

              <div>
                <Label htmlFor="role">Função</Label>
                <select
                  id="role"
                  className="w-full bg-white p-2 border rounded-md mt-1"
                  value={newFuncionario.role}
                  onChange={(e) =>
                    setNewFuncionario((prev) => ({
                      ...prev,
                      role: e.target.value as "Funcionario" | "Admin",
                    }))
                  }
                >
                  <option value="Funcionario">Funcionário</option>
                  <option value="Admin">Administrador</option>
                </select>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleCreateFuncionario}
                  className="flex-1"
                  disabled={
                    !newFuncionario.name ||
                    !newFuncionario.email ||
                    !newFuncionario.password
                  }
                >
                  Adicionar Funcionário
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
