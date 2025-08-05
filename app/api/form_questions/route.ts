import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: formQuestions, error } = await supabase
      .from("form_questions")
      .select("*");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(formQuestions, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar questões de formulário:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { questions } = await request.json();

    if (!questions) {
      return NextResponse.json(
        { error: "O campo 'questions' é obrigatório" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("form_questions")
      .insert({ questions })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar questões de formulário:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}
