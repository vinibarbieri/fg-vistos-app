import { NextResponse } from "next/server";
import { z } from "zod";

// Schema de validação
const checkPaymentSchema = z.object({
  handle: z.string().min(1, "Handle é obrigatório"),
  transaction_nsu: z.string().min(1, "NSU da transação é obrigatório"),
  slug: z.string().min(1, "Slug é obrigatório"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = checkPaymentSchema.parse(body);

    console.log("Verificando pagamento:", {
      handle: validatedData.handle,
      transaction_nsu: validatedData.transaction_nsu,
    });

    const response = await fetch(
      "https://api.infinitepay.io/invoices/public/checkout/payment_check",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(validatedData),
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
