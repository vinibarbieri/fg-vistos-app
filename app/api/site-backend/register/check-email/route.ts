import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: "O campo email é obrigatório e deve ser uma string.",
        },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data: existingProfile, error } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 = not found, which is ok here
      throw error;
    }

    return NextResponse.json({
      success: true,
      exists: !!existingProfile,
      message: existingProfile ? "Email já cadastrado" : "Email disponível",
    });
  } catch (error) {
    console.error("Erro ao verificar email:", error);
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
