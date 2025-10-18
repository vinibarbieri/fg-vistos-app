import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: attachments, error } = await supabase
      .from("attachments")
      .select("*");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(attachments, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar anexos:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { attachments } = await request.json();

    // Validação básica
    if (!attachments) {
      return NextResponse.json(
        { error: "O campo 'attachments' é obrigatório" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("attachments")
      .insert({ attachments })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar anexo:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}
