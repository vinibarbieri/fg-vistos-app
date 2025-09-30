"use client";

import { ClientList } from "./clientList";

export function FuncionarioDashboard() {

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard do Funcionário</h1>
        <p className="text-muted-foreground">
          Gerencie clientes
        </p>
      </div>
        <ClientList />
    </div>
  );
}
