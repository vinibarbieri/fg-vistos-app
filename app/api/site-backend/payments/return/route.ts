import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const { orderId, transactionNsu, slug, receiptUrl, captureMethod } =
      await request.json();

    if (!orderId || !transactionNsu || !slug) {
      return NextResponse.json(
        {
          success: false,
          error: "orderId, transactionNsu e slug são obrigatórios",
        },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("orders")
      .update({
        payment_status: "pago",
        payment_details: {
          transaction_nsu: transactionNsu,
          slug: slug,
          receipt_url: receiptUrl,
          capture_method: captureMethod,
          paid_at: new Date().toISOString(),
          installments: 1,
        },
      })
      .eq("id", orderId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      data,
      message: "Retorno do pagamento processado com sucesso",
    });
  } catch (error) {
    console.error("Erro ao processar retorno do pagamento:", error);
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
