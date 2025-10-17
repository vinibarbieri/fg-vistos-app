import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { orderId, transactionNsu, slug } = await request.json();

    if (!orderId || !transactionNsu || !slug) {
      return NextResponse.json(
        {
          success: false,
          error: "orderId, transactionNsu e slug são obrigatórios",
        },
        { status: 400 }
      );
    }

    // Mantendo a sua lógica de verificação mockada
    const mockPaymentStatus = {
      success: true,
      paid: Math.random() > 0.5,
      amount: 29990,
      paid_amount: 29990,
      installments: 1,
      capture_method: "credit_card",
    };

    return NextResponse.json({
      success: true,
      data: mockPaymentStatus,
    });
  } catch (error) {
    console.error("Erro ao verificar status do pagamento:", error);
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
