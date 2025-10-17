import { NextResponse } from "next/server";
import { headers } from "next/headers";
// 1. Importe o serviço do novo local
import { infinitePayService } from "@/lib/services/infinitiPayService";
import { validateRequestBody, paymentSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const { data, error } = await validateRequestBody(request, paymentSchema);
    if (error) {
      return error;
    }

    // Narrow data to a known shape after successful validation
    type PaymentData = {
      amount: number;
      description?: string;
      order_nsu?: string;
      redirect_url?: string;
    };
    const payload = data as PaymentData;

    const headersList = headers();
    const host = (await headersList).get("host") || "localhost:3000";
    const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
    const webhook_url = `${protocol}://${host}/api/site-backend/payments/webhook`;

    // 2. Use o serviço importado
    const result = await infinitePayService.createCheckout({
      amount: payload.amount,
      description: payload.description ?? "",
      order_nsu: payload.order_nsu ?? "",
      redirect_url: payload.redirect_url ?? "", // Supondo que isso venha no seu schema
      webhook_url: webhook_url,
    });

    return NextResponse.json({
      success: true,
      checkout_url: result.url,
      message: "Checkout criado com sucesso",
    });
  } catch (error) {
    console.error("Erro na rota /create-checkout:", error);
    // O erro lançado pelo serviço será capturado aqui
    return NextResponse.json(
      { success: false, error: "Erro ao criar checkout" },
      { status: 500 }
    );
  }
}
