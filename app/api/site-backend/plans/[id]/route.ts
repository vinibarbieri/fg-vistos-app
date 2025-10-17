import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // O parâmetro dinâmico da URL é acessado através de 'params'
    const { id } = params;

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("plans")
      .select("*")
      .eq("id", id)
      .eq("active", true)
      .single();

    if (error) {
      // Trata o caso específico de 'não encontrado'
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { success: false, error: "Plano não encontrado" },
          { status: 404 }
        );
      }
      throw error;
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Erro ao buscar plano:", error);
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
