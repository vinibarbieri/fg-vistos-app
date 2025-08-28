import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const country_key = searchParams.get("country_key");

    let query = supabase.from("visa_types").select("*");

    if (country_key) {
      query = query.eq("country_key", country_key);
    }

    const { data: visaTypes, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!visaTypes || visaTypes.length === 0) {
      return NextResponse.json(
        { message: "Nenhum visto encontrado para o país especificado." },
        { status: 404 }
      );
    }

    return NextResponse.json(visaTypes, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar tipos de visto:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { form_questions_id, name, country, visa_type, active } = await request.json();
    
    if (!name || !country || !visa_type) {
        return NextResponse.json({ error: "Dados obrigatórios faltando" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("visa_types")
      .insert({ form_questions_id, name, country, visa_type, active })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar tipo de visto:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}