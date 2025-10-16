"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ClientList } from "../funcionario/clientList";
import { FuncionarioManager } from "./tabs/funcionarioManager";

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'clientes' | 'funcionarios'>('clientes');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold mb-2">Dashboard do Administrador</h1>
        <p className="text-muted-foreground">
          Gerencie clientes e funcionários
        </p>
      </div>

      {/* Tabs de Navegação */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg mb-6">
        <Button
          variant={activeTab === 'clientes' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('clientes')}
          className="flex-1"
        >
          Clientes
        </Button>
        <Button
          variant={activeTab === 'funcionarios' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('funcionarios')}
          className="flex-1"
        >
          Funcionários
        </Button>
      </div>

      {/* Conteúdo das Tabs */}
      {activeTab === 'clientes' && (
        <ClientList />
      )}

      {activeTab === 'funcionarios' && (
        <FuncionarioManager />
      )}
    </div>
  );
}
