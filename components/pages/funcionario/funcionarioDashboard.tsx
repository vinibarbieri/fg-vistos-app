"use client";

import { ClientList } from "./clientList";

export function FuncionarioDashboard() {

  return (
    <div className="flex flex-col items-center justify-center py-8">
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
