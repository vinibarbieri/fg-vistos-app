"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ClientList } from "./clientList";



export function FuncionarioDashboard() {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'clientes'>('clientes');

  useEffect(() => {
    // Componente não precisa buscar dados inicialmente
  }, []);



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
        <h1 className="text-3xl font-bold mb-2">Dashboard do Funcionário</h1>
        <p className="text-muted-foreground">
          Gerencie pedidos, candidatos e planos do sistema
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
      </div>

      {/* Conteúdo das Tabs */}
      {activeTab === 'clientes' && (
        <ClientList />
      )}

    </div>
  );
}
