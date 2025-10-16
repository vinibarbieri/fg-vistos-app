import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Usar Service Role Key para bypassar RLS (mesmo que o upload)
    const supabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    const { id } = await params;

    // Buscar informações do attachment
    const { data: attachment, error } = await supabase
      .from("attachments")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!attachment.file_path) {
      return NextResponse.json({ error: "Arquivo não encontrado" }, { status: 404 });
    }

    // Baixar o arquivo do Supabase Storage usando Service Role
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('attachments')
      .download(attachment.file_path);

    if (downloadError) {
      console.error('Erro ao baixar arquivo:', downloadError);
      return NextResponse.json({ error: "Erro ao baixar arquivo" }, { status: 500 });
    }

    // Converter para ArrayBuffer
    const arrayBuffer = await fileData.arrayBuffer();
    
    // Retornar o arquivo com headers apropriados
    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        'Content-Type': attachment.file_type || 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${attachment.file_name}"`,
        'Content-Length': arrayBuffer.byteLength.toString(),
      },
    });
  } catch (error) {
    console.error("Erro ao buscar anexo:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;
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
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Usar Service Role Key para bypassar RLS
    const supabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    const { id } = await params;

    // Primeiro, buscar informações do arquivo para remover do storage
    const { data: attachment, error: fetchError } = await supabase
      .from("attachments")
      .select("file_path, applicant_id, document_type")
      .eq("id", id)
      .single();

    if (fetchError) {
      console.error('Erro ao buscar attachment:', fetchError);
      return NextResponse.json({ error: "Documento não encontrado" }, { status: 404 });
    }

    // IMPORTANTE: Primeiro remover a referência do applicant (se for passaporte)
    if (attachment.document_type === 'passport') {
      const { error: updateError } = await supabase
        .from('applicants')
        .update({ attachment_id: null })
        .eq('attachment_id', id);

      if (updateError) {
        console.error('Erro ao limpar attachment_id do applicant:', updateError);
        return NextResponse.json({ 
          error: "Erro ao remover referência do documento" 
        }, { status: 500 });
      }
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

    // Por último, remover registro do banco de dados
    const { error: deleteError } = await supabase
      .from("attachments")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error('Erro ao deletar do banco:', deleteError);
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
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
