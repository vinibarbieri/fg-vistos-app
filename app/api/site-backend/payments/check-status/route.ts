import { NextResponse } from "next/server";
import { infinitePayService } from "@/lib/services/infinitiPayService"; // Ajuste o caminho se necessário

export async function POST(request: Request) {
  try {
    const { order_nsu, transaction_nsu } = await request.json();

    if (!order_nsu || !transaction_nsu) {
      return NextResponse.json(
        {
          success: false,
          error: "order_nsu e transaction_nsu são obrigatórios",
        },
        { status: 400 }
      );
    }

    const result = await infinitePayService.checkPayment({
      order_nsu,
      transaction_nsu,
    });

    return NextResponse.json({
      success: true,
      payment_status: result,
    });
  } catch (error) {
    console.error("Erro ao verificar pagamento:", error);
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
