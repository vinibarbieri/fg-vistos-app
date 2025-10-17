/**
 * API para criação de checkout InfinitePay
 * 
 * IMPORTANTE: O handle é fixo e não pode ser alterado pelo usuário por questões de segurança.
 * Permitir que o usuário altere o handle poderia redirecionar pagamentos para contas incorretas.
 */
import { NextResponse } from "next/server";
import { z } from "zod";
import { validateHandleSecurity, validateRequestOrigin, getSecureHandle } from "@/lib/security/infinitepay-security";

// Schema de validação
const createCheckoutSchema = z.object({
  redirect_url: z.string().url("URL de redirecionamento inválida"),
  order_nsu: z.string().min(1, "ID do pedido é obrigatório"),
  items: z
    .array(
      z.object({
        name: z.string().min(1, "Nome do item é obrigatório"),
        price: z.number().min(300, "Preço deve ser maior que 300"),
        quantity: z.number().min(1, "Quantidade deve ser maior que 0"),
        description: z.string().min(1, "Descrição do item é obrigatória"),
      })
    )
    .min(1, "Pelo menos um item é obrigatório"),
  customer: z
    .object({
      name: z.string().min(1, "Nome do cliente é obrigatório"),
      email: z.string().email("Email inválido"),
      document: z.string().optional(),
    })
    .optional(),
});

export async function POST(request: Request) {
  try {
    // Validação de origem da requisição
    if (!validateRequestOrigin(request)) {
      return NextResponse.json(
        {
          success: false,
          error: "Acesso não autorizado",
        },
        { status: 403 }
      );
    }

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
    
    const validatedData = createCheckoutSchema.parse(body);

    // Handle fixo para segurança - SEMPRE fgvistos
    const handle = getSecureHandle();

    // Log de auditoria para monitoramento
    console.log("🔒 Criando checkout InfinitePay:", {
      handle: handle.substring(0, 3) + "***", // Mascarar para logs
      order_nsu: validatedData.order_nsu,
      items_count: validatedData.items.length,
      timestamp: new Date().toISOString(),
    });

    const response = await fetch(
      "https://api.infinitepay.io/invoices/public/checkout/links",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "User-Agent": "FG-Vistos/1.0",
        },
        body: JSON.stringify({
          ...validatedData,
          handle: handle,
        }),
      }
    );

    const responseData = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.error("Erro na API do InfinitePay:", {
        status: response.status,
        statusText: response.statusText,
        error: responseData,
      });

      return NextResponse.json(
        {
          success: false,
          error: responseData?.message || "Erro na API do InfinitePay",
          details: responseData,
        },
        { status: response.status }
      );
    }

    console.log("Checkout criado com sucesso:", {
      order_nsu: validatedData.order_nsu,
      checkout_id: responseData?.id || responseData?.checkout_id,
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

    console.error("Erro ao criar checkout:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Erro interno do servidor",
      },
      { status: 500 }
    );
  }
}
