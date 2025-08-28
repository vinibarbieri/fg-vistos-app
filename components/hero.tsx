import { NextLogo } from "./next-logo";
import { SupabaseLogo } from "./supabase-logo";

export function Hero() {
  return (
    <div className="flex flex-col gap-16 items-center">
      <div className="text-center">
        <h1 className="text-5xl lg:text-6xl font-bold mb-6">
          FG Vistos
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl">
          Sistema completo para gerenciamento de vistos e processos de imigração
        </p>
      </div>
      
      <div className="grid gap-8 md:grid-cols-3 text-center">
        <div className="p-6 border rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Gestão de Pedidos</h3>
          <p className="text-muted-foreground">
            Acompanhe o status dos seus pedidos de visto
          </p>
        </div>
        <div className="p-6 border rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Formulários Inteligentes</h3>
          <p className="text-muted-foreground">
            Preencha formulários personalizados baseados no seu plano
          </p>
        </div>
        <div className="p-6 border rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Controle Total</h3>
          <p className="text-muted-foreground">
            Funcionários têm acesso completo ao sistema
          </p>
        </div>
      </div>
    </div>
  );
}
