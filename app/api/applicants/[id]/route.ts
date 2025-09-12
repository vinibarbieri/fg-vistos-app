import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkUserRole } from "../../utils/role-check";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { id } = params;
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }
    
    const roleCheck = await checkUserRole(user.id);
    
    if (!roleCheck.hasAccess || !roleCheck.role) {
      return NextResponse.json({ 
        error: roleCheck.error || "Acesso negado." 
      }, { status: 403 });
    }

    // Buscar dados do applicant
    const { data: applicant, error: fetchError } = await supabase
      .from("applicants")
      .select("*")
      .eq("id", id)
      .single();
    
    if (fetchError || !applicant) {
      if (fetchError?.code === "PGRST116") {
        return NextResponse.json(
          { error: "Applicant não encontrado." },
          { status: 404 }
        );
      }
      return NextResponse.json({ error: fetchError?.message || "Erro ao buscar applicant." }, { status: 500 });
    }
    
    // CONTROLE DE ACESSO BASEADO NO ROLE
    if (roleCheck.role === "Cliente") {
      // Cliente: só pode ver seus próprios applicants
      if (applicant.responsible_user_id !== user.id) {
        return NextResponse.json({ 
          error: "Acesso negado. Clientes só podem ver seus próprios applicants." 
        }, { status: 403 });
      }
    } else if (roleCheck.role === "Admin" || roleCheck.role === "Funcionario") {
      // Admin/Funcionario: pode ver qualquer applicant
      // Não precisa de verificação adicional
    } else {
      return NextResponse.json({ 
        error: "Role não reconhecido." 
      }, { status: 403 });
    }

    return NextResponse.json(applicant, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar applicant:", error);
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
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }
    
    // Verificar role do usuário
    const roleCheck = await checkUserRole(user.id);
    
    if (!roleCheck.hasAccess || !roleCheck.role) {
      return NextResponse.json({ 
        error: roleCheck.error || "Acesso negado." 
      }, { status: 403 });
    }
    
    // Buscar dados do applicant
    const { data: applicant, error: fetchError } = await supabase
      .from("applicants")
      .select("responsible_user_id")
      .eq("id", id)
      .single();
    
    if (fetchError || !applicant) {
      return NextResponse.json({ error: "Applicant não encontrado." }, { status: 404 });
    }
    
    // CONTROLE DE ACESSO BASEADO NO ROLE
    if (roleCheck.role === "Cliente") {
      // Cliente: só pode editar seus próprios applicants
      if (applicant.responsible_user_id !== user.id) {
        return NextResponse.json({ 
          error: "Acesso negado. Clientes só podem editar seus próprios applicants." 
        }, { status: 403 });
      }
    } else if (roleCheck.role === "Admin" || roleCheck.role === "Funcionario") {
      // Admin/Funcionario: pode editar qualquer applicant
      // Não precisa de verificação adicional
    } else {
      return NextResponse.json({ 
        error: "Role não reconhecido." 
      }, { status: 403 });
    }
    
    const updateData = await request.json();

    const { data, error } = await supabase
      .from("applicants")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Erro ao atualizar applicant:", error);
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
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }
    
    // Verificar role do usuário
    const roleCheck = await checkUserRole(user.id);
    
    if (!roleCheck.hasAccess || !roleCheck.role) {
      return NextResponse.json({ 
        error: roleCheck.error || "Acesso negado." 
      }, { status: 403 });
    }
    
    // Buscar dados do applicant para verificar propriedade
    const { data: applicant, error: fetchError } = await supabase
      .from("applicants")
      .select("responsible_user_id")
      .eq("id", id)
      .single();
    
    if (fetchError || !applicant) {
      return NextResponse.json({ error: "Applicant não encontrado." }, { status: 404 });
    }
    
    // CONTROLE DE ACESSO BASEADO NO ROLE
    if (roleCheck.role === "Cliente") {
      // Cliente: só pode deletar seus próprios applicants
      if (applicant.responsible_user_id !== user.id) {
        return NextResponse.json({ 
          error: "Acesso negado. Clientes só podem deletar seus próprios applicants." 
        }, { status: 403 });
      }
    } else if (roleCheck.role === "Admin" || roleCheck.role === "Funcionario") {
      // Admin/Funcionario: pode deletar qualquer applicant
      // Não precisa de verificação adicional
    } else {
      return NextResponse.json({ 
        error: "Role não reconhecido." 
      }, { status: 403 });
    }

    const { error } = await supabase.from("applicants").delete().eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { message: "Applicant deletado com sucesso." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro ao deletar applicant:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}
