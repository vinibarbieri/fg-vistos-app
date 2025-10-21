import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: Request,
  { params }: { params: { applicantId: string } }
) {
  try {
    const supabase = await createClient();
    const { applicantId } = params;

    const { data, error } = await supabase
      .from("form_responses")
      .select("*")
      .eq("applicant_id", applicantId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar respostas por applicant_id:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}
