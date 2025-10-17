import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "O ID do visto é obrigatório" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("visas")
      .select("*")
      .eq("id", id)
      .eq("active", true)
      .single();

    if (error) {
      // Handle the case where the visa is not found
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { success: false, error: "Visto não encontrado" },
          { status: 404 }
        );
      }
      throw error;
    }

    return NextResponse.json({ success: true, data: data });
  } catch (error) {
    console.error("Erro ao buscar o visto:", error);
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
