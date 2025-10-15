import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkUserRole } from "../../utils/role-check";

export async function PUT(request: Request) {
  try {
    const supabase = await createClient();
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.log("❌ Erro de autenticação:", authError);
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    console.log("✅ Usuário autenticado:", user.id);

    // Verificar se é Admin - apenas Admin pode alterar user_metadata
    const roleCheck = await checkUserRole(user.id, "Admin");
    console.log("🔍 Verificação de role:", roleCheck);
    
    if (!roleCheck.hasAccess) {
      console.log("❌ Permissão insuficiente. Role do usuário:", roleCheck.role);
      return NextResponse.json({ error: "Apenas Admin pode alterar user_metadata." }, { status: 403 });
    }

    console.log("✅ Permissão concedida. Role:", roleCheck.role);

    const { userId, userRole } = await request.json();

    if (!userId || !userRole) {
      return NextResponse.json({ 
        error: "userId e userRole são obrigatórios." 
      }, { status: 400 });
    }

    // Validar se o role é válido
    const validRoles = ["admin", "cliente", "funcionario"];
    if (!validRoles.includes(userRole.toLowerCase())) {
      return NextResponse.json({ 
        error: "Role inválido. Valores aceitos: admin, cliente, funcionario." 
      }, { status: 400 });
    }

    console.log(`🔄 Alterando user_metadata para usuário ${userId} com role ${userRole}`);

    // Criar cliente administrativo para operações que requerem service role
    const adminSupabase = createAdminClient();

    // Atualizar user_metadata usando admin API
    const { data: updateData, error: updateError } = await adminSupabase.auth.admin.updateUserById(
      userId,
      {
        user_metadata: {
          user_role: userRole.toLowerCase()
        }
      }
    );

    if (updateError) {
      console.log("❌ Erro ao atualizar user_metadata:", updateError);
      return NextResponse.json({ 
        error: "Erro ao atualizar user_metadata.", 
        details: updateError.message 
      }, { status: 500 });
    }

    console.log("✅ user_metadata atualizado com sucesso:", updateData);

    return NextResponse.json({
      message: "user_metadata atualizado com sucesso!",
      user: {
        id: updateData.user.id,
        email: updateData.user.email,
        user_metadata: updateData.user.user_metadata
      }
    }, { status: 200 });

  } catch (error) {
    console.error("Erro ao atualizar user_metadata:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}

// Endpoint para listar todos os usuários com seus user_metadata
export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    // Verificar se é Admin
    const roleCheck = await checkUserRole(user.id, "Admin");
    if (!roleCheck.hasAccess) {
      return NextResponse.json({ error: "Apenas Admin pode visualizar user_metadata." }, { status: 403 });
    }

    // Criar cliente administrativo para operações que requerem service role
    const adminSupabase = createAdminClient();

    // Buscar todos os usuários usando admin API
    const { data: usersData, error: usersError } = await adminSupabase.auth.admin.listUsers();

    if (usersError) {
      console.log("❌ Erro ao buscar usuários:", usersError);
      return NextResponse.json({ 
        error: "Erro ao buscar usuários.", 
        details: usersError.message 
      }, { status: 500 });
    }

    // Filtrar apenas os dados necessários
    const users = usersData.users.map(user => ({
      id: user.id,
      email: user.email,
      user_metadata: user.user_metadata,
      created_at: user.created_at,
      last_sign_in_at: user.last_sign_in_at
    }));

    console.log(`📊 Encontrados ${users.length} usuários`);

    return NextResponse.json({
      message: "Usuários listados com sucesso!",
      users,
      total: users.length
    }, { status: 200 });

  } catch (error) {
    console.error("Erro ao listar usuários:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}
