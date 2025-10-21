import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { PostgrestSingleResponse } from "@supabase/supabase-js";

// 1. Definição do tipo Json (para JSONB)
type Json =
  | { [key: string]: unknown }
  | unknown[]
  | string
  | number
  | boolean
  | null;

// 2. Definição da interface para o objeto de perguntas (form_questions)
interface FormQuestions {
  id: string;
  questions: Json;
  country: string;
}

// 3. Definição da interface para o resultado do JOIN aninhado
interface PlanWithQuestions {
  visas: {
    form_questions: FormQuestions | null;
  } | null;
}

export async function GET(
  request: Request,
  // Usa 'plan_id' como parâmetro, conforme solicitado.
  { params }: { params: { plan_id: string } }
) {
  // A execução de Route Handlers (GET) no Next.js é assíncrona.
  // A desestruturação `const { plan_id } = params;` é a forma correta.
  // O aviso/erro no console do Next.js é um problema de ambiente de desenvolvimento
  // que só se resolve com o restart, mas a sintaxe está correta.

  try {
    const supabase = await createClient();
    const { plan_id } = params;

    if (!plan_id) {
      return NextResponse.json(
        { error: "Plan ID não fornecido na URL." },
        { status: 400 }
      );
    }

    // A consulta otimizada (que você provou que funciona no SQL)
    const result: PostgrestSingleResponse<PlanWithQuestions | null> =
      await supabase
        .from("plans")
        .select(
          `
        visas!inner (
          form_questions!inner (*)
        )
      `
        )
        .eq("id", plan_id)
        .limit(1)
        .maybeSingle();

    const { data, error } = result;

    if (error) {
      console.error("Erro do Supabase (JOIN):", error);
      return NextResponse.json(
        { error: "Erro interno no servidor ao consultar o banco de dados." },
        { status: 500 }
      );
    }

    // O erro 'Nenhum plano encontrado' (404) do curl ocorria aqui
    // quando o Next.js falhava na leitura de params.
    if (!data) {
      return NextResponse.json(
        {
          error: "Nenhum plano encontrado ou falha crítica no relacionamento.",
        },
        { status: 404 }
      );
    }

    // Desestrutura o resultado com segurança
    const formQuestions = data.visas?.form_questions;

    if (!formQuestions) {
      return NextResponse.json(
        { error: "Questões do formulário não encontradas." },
        { status: 404 }
      );
    }

    // O retorno de sucesso
    return NextResponse.json(formQuestions, { status: 200 });
  } catch (error) {
    console.error("Erro interno no servidor:", error);
    return NextResponse.json(
      { error: "Erro interno no servidor" },
      { status: 500 }
    );
  }
}
