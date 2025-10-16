import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { id } = params;

    const { data, error } = await supabase
      .from("attachments")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar anexo:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { id } = params;
    const updateData = await request.json();

    const { data, error } = await supabase
      .from("attachments")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Erro ao atualizar anexo:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { id } = params;

    // Primeiro, buscar informações do arquivo para remover do storage
    const { data: attachment, error: fetchError } = await supabase
      .from("attachments")
      .select("file_path, applicant_id")
      .eq("id", id)
      .single();

    if (fetchError) {
      return NextResponse.json({ error: "Documento não encontrado" }, { status: 404 });
    }

    // Remover arquivo do Supabase Storage
    if (attachment.file_path) {
      const { error: storageError } = await supabase.storage
        .from('attachments')
        .remove([attachment.file_path]);

      if (storageError) {
        console.error('Erro ao remover arquivo do storage:', storageError);
        // Continuar mesmo se falhar no storage, pois pode ter sido removido manualmente
      }
    }

    // Remover registro do banco de dados
    const { error: deleteError } = await supabase
      .from("attachments")
      .delete()
      .eq("id", id);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    // Se era um passaporte, limpar attachment_id do applicant
    const { error: updateError } = await supabase
      .from('applicants')
      .update({ attachment_id: null })
      .eq('attachment_id', id);

    if (updateError) {
      console.error('Erro ao limpar attachment_id do applicant:', updateError);
      // Não falhar a operação por causa disso
    }

    return NextResponse.json(
      { message: "Documento removido com sucesso." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro ao deletar documento:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}
