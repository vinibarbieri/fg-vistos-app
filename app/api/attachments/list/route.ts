import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const applicantId = searchParams.get('applicantId');

    if (!applicantId) {
      return NextResponse.json({ error: "ID do aplicante não fornecido" }, { status: 400 });
    }

    const { data: attachments, error } = await supabase
      .from('attachments')
      .select('*')
      .eq('applicant_id', applicantId)
      .order('uploaded_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar anexos:', error);
      return NextResponse.json({ error: "Erro ao buscar documentos" }, { status: 500 });
    }

    return NextResponse.json({ documents: attachments || [] }, { status: 200 });

  } catch (error) {
    console.error('Erro ao buscar documentos:', error);
    return NextResponse.json({ 
      error: "Erro interno do servidor" 
    }, { status: 500 });
  }
}
