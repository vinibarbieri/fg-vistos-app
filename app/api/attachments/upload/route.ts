import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";

export async function POST(request: NextRequest) {
  try {
    // Usar Service Role Key que bypassa RLS
    const supabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    const formData = await request.formData();
    
    const file = formData.get('file') as File;
    const applicantId = formData.get('applicantId') as string;
    const documentType = formData.get('documentType') as 'passport' | 'other';

    if (!file) {
      return NextResponse.json({ error: "Arquivo não fornecido" }, { status: 400 });
    }

    if (!applicantId) {
      return NextResponse.json({ error: "ID do aplicante não fornecido" }, { status: 400 });
    }

    if (!documentType || !['passport', 'other'].includes(documentType)) {
      return NextResponse.json({ error: "Tipo de documento inválido" }, { status: 400 });
    }

    // Validar tamanho do arquivo (10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: `Arquivo muito grande. Tamanho máximo: 10MB. Tamanho atual: ${(file.size / (1024 * 1024)).toFixed(2)}MB` 
      }, { status: 400 });
    }

    // Validar tipo do arquivo
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: `Formato não suportado. Formatos aceitos: PDF, JPG, PNG. Formato atual: ${file.type}` 
      }, { status: 400 });
    }

    // Gerar nome único para o arquivo
    const fileExtension = file.name.split('.').pop();
    const fileName = `${applicantId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExtension}`;
    const filePath = `documents/${applicantId}/${fileName}`;

    // Upload para Supabase Storage (usando Service Role que bypassa RLS)
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('attachments')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Erro no upload para storage:', uploadError);
      return NextResponse.json({ 
        error: "Erro ao fazer upload do arquivo para o servidor" 
      }, { status: 500 });
    }

    // Salvar informações do arquivo no banco de dados
    const { data: attachmentData, error: dbError } = await supabase
      .from('attachments')
      .insert({
        applicant_id: applicantId,
        file_name: file.name,
        file_path: filePath,
        file_type: file.type,
        file_size: file.size,
        document_type: documentType
      })
      .select()
      .single();

    if (dbError) {
      console.error('Erro ao salvar no banco:', dbError);
      
      // Tentar remover o arquivo do storage se falhou ao salvar no banco
      await supabase.storage.from('attachments').remove([filePath]);
      
      return NextResponse.json({ 
        error: "Erro ao salvar informações do arquivo" 
      }, { status: 500 });
    }

    // Atualizar attachment_id no applicant se for passaporte
    if (documentType === 'passport') {
      const { error: updateError } = await supabase
        .from('applicants')
        .update({ attachment_id: attachmentData.id })
        .eq('id', applicantId);

      if (updateError) {
        console.error('Erro ao atualizar applicant:', updateError);
        // Não falhar o upload por causa disso, apenas logar o erro
      }
    }

    return NextResponse.json({ 
      document: attachmentData,
      message: "Arquivo enviado com sucesso" 
    }, { status: 201 });

  } catch (error) {
    console.error('Erro no upload:', error);
    return NextResponse.json({ 
      error: "Erro interno do servidor" 
    }, { status: 500 });
  }
}
