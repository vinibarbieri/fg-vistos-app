import { NextResponse } from "next/server";
import { z } from "zod";

// Schema de validação
const createCheckoutSchema = z.object({
  handle: z.string().min(1, "Handle é obrigatório"),
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
    const body = await request.json();
    const validatedData = createCheckoutSchema.parse(body);

    console.log("Criando checkout InfinitePay:", {
      handle: validatedData.handle,
      order_nsu: validatedData.order_nsu,
      items_count: validatedData.items.length,
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
        body: JSON.stringify(validatedData),
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
