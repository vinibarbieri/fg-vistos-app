import { NextResponse } from "next/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    const { payment_status, payment_details } = await request.json();

    if (!payment_status) {
      return NextResponse.json(
        { success: false, error: "Status do pagamento é obrigatório" },
        { status: 400 }
      );
    }

    // Usar Service Role para bypassar RLS (usuário não autenticado)
    const supabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    const { data, error } = await supabase
      .from("orders")
      .update({
        payment_status,
        payment_details: {
          ...payment_details,
          updated_at: new Date().toISOString(),
        },
      })
      .eq("id", orderId)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { success: false, error: "Order não encontrada" },
          { status: 404 }
        );
      }
      throw error;
    }

    return NextResponse.json({
      success: true,
      data,
      message: "Status do pagamento atualizado com sucesso",
    });
  } catch (error) {
    console.error("Erro ao atualizar status do pagamento:", error);
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
