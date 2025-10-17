import { NextResponse } from "next/server";
import { infinitePayService } from "@/lib/services/infinitiPayService"; // Ajuste o caminho se necessário

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await infinitePayService.handleWebhook(body);

    // Replicando a lógica original: sucesso retorna 200, falha retorna 500
    if (result.success) {
      return NextResponse.json({ success: true }, { status: 200 });
    } else {
      // Nota: Para webhooks, geralmente é melhor retornar 200 mesmo em caso de falha
      // para evitar que o serviço tente reenviar a notificação.
      // Mas estou mantendo sua lógica original que retorna 500.
      return NextResponse.json({ success: false }, { status: 500 });
    }
  } catch (error) {
    console.error("Erro no webhook:", error);
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
