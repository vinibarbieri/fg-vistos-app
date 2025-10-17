import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkUserRole } from "../utils/role-check";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }
    
    // Verificar role do usuário
    const roleCheck = await checkUserRole();
    
    if (!roleCheck.hasAccess || !roleCheck.role) {
      return NextResponse.json({ 
        error: roleCheck.error || "Acesso negado." 
      }, { status: 403 });
    }
    
    // Extrair query parameters da URL
    const { searchParams } = new URL(request.url);
    const responsibleUserId = searchParams.get('responsible_user_id');
    
    let query = supabase.from("applicants").select("*");
    
    // CONTROLE DE ACESSO BASEADO NO ROLE
    if (roleCheck.role === "cliente") {
      // Cliente: só pode ver seus próprios applicants
      if (!responsibleUserId || responsibleUserId !== user.id) {
        return NextResponse.json({ 
          error: "Acesso negado. Clientes só podem ver seus próprios applicants." 
        }, { status: 403 });
      }
      query = query.eq('responsible_user_id', user.id);
      
    } else if (roleCheck.role === "admin" || roleCheck.role === "funcionario") {
      // Admin/Funcionario: pode ver todos ou filtrar por usuário específico
      if (responsibleUserId) {
        query = query.eq('responsible_user_id', responsibleUserId);
      }
      // Se não especificar responsible_user_id, retorna todos
      
    } else {
      return NextResponse.json({ 
        error: "Role não reconhecido." 
      }, { status: 403 });
    }
    
    const { data: applicants, error } = await query;
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(applicants, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar applicants:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const newApplicant = await request.json();

    const { data, error } = await supabase
      .from("applicants")
      .insert(newApplicant)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar applicant:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}
