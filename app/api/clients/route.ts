import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkUserRole } from "../utils/role-check";

// Tipo para dados consolidados do cliente
interface ClientDetails {
  id: string;
  name: string;
  email: string;
  role: string;
  account_status: boolean;
  interview_city?: string;
  created_at: string;
  updated_at: string;
  // Dados relacionados
  status_processo?: string;
  applicants_quantity?: number;
  plan_name?: string;
  visa_name?: string;
  country?: string;
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.log("❌ Erro de autenticação:", authError);
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    console.log("✅ Usuário autenticado:", user.id);

    // Verificar permissões - apenas Funcionario e Admin podem ver lista de clientes
    const roleCheck = await checkUserRole(user.id, "Funcionario");
    console.log("🔍 Verificação de role:", roleCheck);
    
    if (!roleCheck.hasAccess) {
      console.log("❌ Permissão insuficiente. Role do usuário:", roleCheck.role);
      return NextResponse.json({ error: "Permissão insuficiente." }, { status: 403 });
    }

    console.log("✅ Permissão concedida. Role:", roleCheck.role);

    // Buscar todos os clientes
    console.log("🔍 Buscando clientes na tabela profiles...");
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("*")
      .eq("role", "Cliente")  // Buscar por 'Cliente' que é o role correto
      .order("name");

    if (profilesError) {
      console.log("❌ Erro ao buscar profiles:", profilesError);
      return NextResponse.json({ error: profilesError.message }, { status: 500 });
    }

    console.log("📊 Profiles encontrados:", profiles?.length || 0);
    console.log("📋 Dados dos profiles:", profiles);

    if (!profiles || profiles.length === 0) {
      console.log("⚠️ Nenhum cliente encontrado - verificando se existem profiles com role diferente...");
      
      // Debug: verificar todos os profiles para entender a estrutura
      const { data: allProfiles, error: allProfilesError } = await supabase
        .from("profiles")
        .select("id, name, email, role")
        .order("name");
      
      if (allProfilesError) {
        console.log("❌ Erro ao buscar todos os profiles:", allProfilesError);
      } else {
        console.log("📊 Todos os profiles na tabela:", allProfiles);
        console.log("🔍 Roles únicos encontrados:", [...new Set(allProfiles?.map(p => p.role) || [])]);
      }
      
      return NextResponse.json([], { status: 200 });
    }

    // Consolidar dados relacionados para cada cliente
    const clientsDetails: ClientDetails[] = await Promise.all(
      profiles.map(async (profile) => {
        try {
          // Buscar status do processo
          const { data: applicantStatus } = await supabase
            .from("applicants")
            .select("status")
            .eq("responsible_user_id", profile.id)
            .limit(1);

          const status_processo = applicantStatus?.[0]?.status || "Não informado";

          // Buscar detalhes do pedido (applicants_quantity e plan_id)
          const { data: orderDetails } = await supabase
            .from("orders")
            .select("applicants_quantity, plan_id")
            .eq("responsible_user_id", profile.id)
            .limit(1);

          const applicants_quantity = orderDetails?.[0]?.applicants_quantity || 0;
          const plan_id = orderDetails?.[0]?.plan_id;

          // Buscar nome do plano e visa_id
          let plan_name = "Não informado";
          let visa_name = "Não informado";
          let country = "Não informado";

          if (plan_id) {
            const { data: planData } = await supabase
              .from("plans")
              .select("plan_name, visa_id")
              .eq("id", plan_id)
              .single();

            if (planData) {
              plan_name = planData.plan_name || "Não informado";
              const visa_id = planData.visa_id;

              if (visa_id) {
                const { data: visaData } = await supabase
                  .from("visas")
                  .select("name, country")
                  .eq("id", visa_id)
                  .single();

                if (visaData) {
                  visa_name = visaData.name || "Não informado";
                  country = visaData.country || "Não informado";
                }
              }
            }
          }

          return {
            ...profile,
            status_processo,
            applicants_quantity,
            plan_name,
            visa_name,
            country,
            interview_city: profile.interview_city || "Não informada",
            account_status: profile.account_status || false,
          };
        } catch (error) {
          console.warn(`Erro ao buscar dados relacionados para cliente ${profile.id}:`, error);
          // Retornar dados básicos mesmo se houver erro nos dados relacionados
          return {
            ...profile,
            status_processo: "Não informado",
            applicants_quantity: 0,
            plan_name: "Não informado",
            visa_name: "Não informado",
            country: "Não informado",
            interview_city: profile.interview_city || "Não informada",
            account_status: profile.account_status || false,
          };
        }
      })
    );

    return NextResponse.json(clientsDetails, { status: 200 });

  } catch (error) {
    console.error("Erro ao buscar clientes:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}
