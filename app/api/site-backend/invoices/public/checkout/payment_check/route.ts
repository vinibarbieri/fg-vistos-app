/**
 * API para verificação de status de pagamento InfinitePay
 * 
 * IMPORTANTE: O handle é fixo e não pode ser alterado pelo usuário por questões de segurança.
 * Permitir que o usuário altere o handle poderia comprometer a verificação de pagamentos.
 */
import { NextResponse } from "next/server";
import { z } from "zod";
import { validateHandleSecurity, getSecureHandle } from "@/lib/security/infinitepay-security";

// Schema de validação
const checkPaymentSchema = z.object({
  transaction_nsu: z.string().min(1, "NSU da transação é obrigatório"),
  slug: z.string().min(1, "Slug é obrigatório"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Verificação crítica de segurança do handle
    if (!validateHandleSecurity(body, request)) {
      return NextResponse.json(
        {
          success: false,
          error: "Requisição inválida",
        },
        { status: 400 }
      );
    }
    
    const validatedData = checkPaymentSchema.parse(body);

    // Handle fixo para segurança - SEMPRE fgvistos
    const handle = getSecureHandle();

    // Log de auditoria para monitoramento
    console.log("🔒 Verificando pagamento:", {
      handle: handle.substring(0, 3) + "***", // Mascarar para logs
      transaction_nsu: validatedData.transaction_nsu,
      timestamp: new Date().toISOString(),
    });

    const response = await fetch(
      "https://api.infinitepay.io/invoices/public/checkout/payment_check",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          ...validatedData,
          handle: handle,
        }),
      }
    );

    const responseData = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.error("Erro ao verificar pagamento:", {
        status: response.status,
        statusText: response.statusText,
        error: responseData,
      });

      return NextResponse.json(
        {
          success: false,
          error: responseData?.message || "Erro ao verificar pagamento",
          details: responseData,
        },
        { status: response.status }
      );
    }

    console.log("Pagamento verificado:", {
      transaction_nsu: validatedData.transaction_nsu,
      status: responseData?.status,
    });

    return NextResponse.json({ success: true, data: responseData });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Dados inválidos",
          details: error.message,
        },
        { status: 400 }
      );
    }

    console.error("Erro ao verificar pagamento:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Erro interno do servidor",
      },
      { status: 500 }
    );
  }
}
