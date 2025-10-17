// ============================================================================
// ENDPOINT API INTERNO PARA GERENCIAR ROLES DE USUÁRIOS
// ============================================================================
// Este endpoint funciona diretamente no Next.js sem depender de edge functions

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface SetUserRoleRequest {
  userId: string;
  targetRole: 'admin' | 'funcionario' | 'cliente';
}

interface SetUserRoleResponse {
  success: boolean;
  data?: unknown;
  error?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // 1. Verificar se o usuário está autenticado
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Usuário não autenticado' } as SetUserRoleResponse,
        { status: 401 }
      );
    }

    // 2. Verificar se o usuário tem permissão de admin através do JWT
    const userRole = user.app_metadata?.user_role;
    
    if (userRole !== 'admin') {
      console.error(`Tentativa de acesso não autorizado por usuário ${user.id} com role ${userRole}`);
      return NextResponse.json(
        { success: false, error: 'Permissão insuficiente. Apenas administradores podem alterar roles.' } as SetUserRoleResponse,
        { status: 403 }
      );
    }

    // 3. Extrair dados da requisição
    const requestData: SetUserRoleRequest = await request.json();

    // 4. Validações dos dados
    if (!requestData.userId || !requestData.targetRole) {
      return NextResponse.json(
        { success: false, error: 'userId e targetRole são obrigatórios' } as SetUserRoleResponse,
        { status: 400 }
      );
    }

    // 5. Validar role fornecido
    const validRoles = ['admin', 'funcionario', 'cliente'];
    if (!validRoles.includes(requestData.targetRole)) {
      return NextResponse.json(
        { success: false, error: 'Role inválido' } as SetUserRoleResponse,
        { status: 400 }
      );
    }

    // 6. Verificar se não está tentando alterar seu próprio role
    if (requestData.userId === user.id) {
      return NextResponse.json(
        { success: false, error: 'Você não pode alterar seu próprio role' } as SetUserRoleResponse,
        { status: 400 }
      );
    }

    // 7. Criar cliente admin para atualizar roles
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('POST /api/admin/manage-roles - Variáveis de ambiente não configuradas');
      return NextResponse.json(
        { success: false, error: 'Configuração do servidor inválida' } as SetUserRoleResponse,
        { status: 500 }
      );
    }

    const { createClient: createAdminClient } = await import('@supabase/supabase-js');
    const supabaseAdmin = createAdminClient(supabaseUrl, supabaseServiceKey);

    // 8. Verificar se o usuário alvo existe
    const { data: targetUser, error: userError } = await supabaseAdmin.auth.admin.getUserById(
      requestData.userId
    );

    if (userError || !targetUser.user) {
      console.error('POST /api/admin/manage-roles - Usuário alvo não encontrado:', userError);
      return NextResponse.json(
        { success: false, error: 'Usuário não encontrado' } as SetUserRoleResponse,
        { status: 404 }
      );
    }

    // 9. Atualizar o app_metadata do usuário
    const { error } = await supabaseAdmin.auth.admin.updateUserById(
      requestData.userId,
      {
        app_metadata: {
          user_role: requestData.targetRole,
          updated_at: new Date().toISOString(),
          updated_by: user.id
        }
      }
    );

    if (error) {
      console.error('POST /api/admin/manage-roles - Erro ao atualizar usuário:', error);
      return NextResponse.json(
        { success: false, error: `Erro ao atualizar usuário: ${error.message}` } as SetUserRoleResponse,
        { status: 400 }
      );
    }

    const primeiraLetraMaiuscula = requestData.targetRole.charAt(0).toUpperCase() + requestData.targetRole.slice(1);

    // 10. Atualizar também a tabela profiles para manter consistência
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({ 
        role: primeiraLetraMaiuscula,
      })
      .eq('id', requestData.userId);

    if (profileError) {
      console.error('POST /api/admin/manage-roles - Erro ao atualizar perfil:', profileError);
      // Não falhamos aqui, pois o app_metadata foi atualizado com sucesso
    }

    // 11. Log da operação para auditoria
    console.log(`Admin ${user.id} alterou role do usuário ${requestData.userId} para ${requestData.targetRole}`);

    // 12. Retornar sucesso
    return NextResponse.json(
      { 
        success: true, 
        data: {
          userId: requestData.userId,
          newRole: requestData.targetRole,
          updatedBy: user.id,
          updatedAt: new Date().toISOString()
        }
      } as SetUserRoleResponse,
      { status: 200 }
    );

  } catch (error) {
    console.error('POST /api/admin/manage-roles - Erro interno:', error);
    return NextResponse.json(
      { success: false, error: `Erro interno do servidor: ${error instanceof Error ? error.message : 'Erro desconhecido'}` } as SetUserRoleResponse,
      { status: 500 }
    );
  }
}

// Método GET para listar usuários (opcional, para interface de admin)
export async function GET(): Promise<NextResponse> {
  try {
    
    // Verificar autenticação e permissão de Admin
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('GET /api/admin/manage-roles - Usuário não autenticado');
      return NextResponse.json(
        { success: false, error: 'Usuário não autenticado' },
        { status: 401 }
      );
    }

    // Verificar se o usuário tem permissão de admin através do JWT
    const userRole = user.app_metadata?.user_role;
    
    if (userRole !== 'admin') {
      console.error('GET /api/admin/manage-roles - Permissão insuficiente para usuário:', user.id);
      return NextResponse.json(
        { success: false, error: 'Permissão insuficiente' },
        { status: 403 }
      );
    }

    // Buscar lista de usuários com seus roles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, role')
      .order('name', { ascending: true });

    if (profilesError) {
      console.error('GET /api/admin/manage-roles - Erro ao buscar profiles:', profilesError);
      return NextResponse.json(
        { success: false, error: `Erro ao buscar usuários: ${profilesError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        success: true, 
        data: profiles 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('GET /api/admin/manage-roles - Erro interno:', error);
    return NextResponse.json(
      { success: false, error: `Erro interno do servidor: ${error instanceof Error ? error.message : 'Erro desconhecido'}` },
      { status: 500 }
    );
  }
}
