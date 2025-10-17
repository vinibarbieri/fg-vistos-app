import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: Request,
  { params }: { params: { country_key: string } }
) {
  try {
    const { country_key } = params;

    if (!country_key) {
      return NextResponse.json(
        {
          success: false,
          error: "A chave do país (country_key) é obrigatória",
        },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("visas")
      .select("*")
      .eq("country_key", country_key)
      .eq("active", true)
      .order("name", { ascending: true });

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, data: data || [] });
  } catch (error) {
    console.error("Erro ao buscar tipos de visto:", error);
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
