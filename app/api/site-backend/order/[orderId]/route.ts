import { NextResponse } from "next/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: "ID da order é obrigatório" },
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
      .select(
        `
        *,
        profiles (id, name, email),
        plans (
          id, 
          plan_name, 
          price,
          visas (name, country)
        )
      `
      )
      .eq("id", orderId)
      // .gte("created_at", tenMinutesAgo) // Só orders criadas nas últimas 10 minutos
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { success: false, error: "Order não encontrada ou expirada. Faça login para acessar." },
          { status: 404 }
        );
      }
      throw error;
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Erro ao buscar dados da order pública:", error);
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
