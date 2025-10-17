// app/api/agency/applicants/[id]/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient();
  const applicantId = params.id; // Aqui pegamos o ID da URL

  // 1. Verificação de Segurança (papel do usuário)
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const userRole = user.app_metadata?.user_role;
  if (userRole !== "admin" && userRole !== "funcionario") {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  // 2. A Query Principal para buscar o aplicante e seus dados relacionados
  const { data: applicant, error } = await supabase
    .from("aplicantes")
    .select(
      `
      *,
      formularios ( * ),
      tipos_de_visto ( * ),
      pedidos ( * )
    `
    )
    .eq("id", applicantId)
    .single(); // .single() para buscar apenas um registro

  if (error) {
    return NextResponse.json(
      { error: "Erro ao buscar detalhes do aplicante", details: error.message },
      { status: 500 }
    );
  }

  if (!applicant) {
    return NextResponse.json(
      { error: "Aplicante não encontrado" },
      { status: 404 }
    );
  }

  // 3. Retorna o objeto completo
  return NextResponse.json({ applicant });
}
