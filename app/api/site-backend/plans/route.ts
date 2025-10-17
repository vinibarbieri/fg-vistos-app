import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    // No Next.js, os query parameters são acessados através de searchParams
    const visa_id = request.nextUrl.searchParams.get("visa_id");

    if (!visa_id) {
      return NextResponse.json(
        { success: false, error: "O parâmetro visa_id é obrigatório" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("plans")
      .select("*")
      .eq("visa_id", visa_id)
      .eq("active", true)
      .order("price", { ascending: true });

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, data: data || [] });
  } catch (error) {
    console.error("Erro ao buscar planos:", error);
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
