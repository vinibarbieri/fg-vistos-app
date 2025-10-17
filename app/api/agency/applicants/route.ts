import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  console.log("Usuário autenticado:", user);

    const userRole = user.app_metadata?.user_role;

  console.log("Perfil do usuário:", userRole);
  // Somente Admin ou Funcionario podem acessar esta rota
  if (userRole !== "admin" && userRole !== "funcionario") {
    return NextResponse.json(
      { error: "Acesso negado. Permissão insuficiente." },
      { status: 403 }
    );
  }

  // Busca os aplicantes
  const { data: applicants, error } = await supabase
    .from("aplicantes")
    .select("id, nome_identificador, status_formulario, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json(
      { error: "Erro ao buscar aplicantes", details: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ applicants });
}
