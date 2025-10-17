import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkUserRole } from "../../../utils/role-check";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id: applicantId } = await params;
    
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

    // Buscar applicant e verificar propriedade
    const { data: applicant, error: applicantError } = await supabase
      .from("applicants")
      .select(`
        id,
        responsible_user_id,
        order_id,
        orders!inner(
          id,
          plan_id,
          plans!inner(
            id,
            visa_id,
            visas!inner(
              id,
              form_questions_id,
              form_questions!inner(
                id,
                questions,
                country
              )
            )
          )
        )
      `)
      .eq("id", applicantId)
      .single();
    
    if (applicantError || !applicant) {
      if (applicantError?.code === "PGRST116") {
        return NextResponse.json(
          { error: "Applicant não encontrado." },
          { status: 404 }
        );
      }
      return NextResponse.json({ 
        error: applicantError?.message || "Erro ao buscar applicant." 
      }, { status: 500 });
    }

    // CONTROLE DE ACESSO BASEADO NO ROLE
    if (roleCheck.role === "cliente") {
      // Cliente: só pode ver form_questions dos seus próprios applicants
      if (applicant.responsible_user_id !== user.id) {
        return NextResponse.json({ 
          error: "Acesso negado. Clientes só podem ver form_questions dos seus próprios applicants." 
        }, { status: 403 });
      }
    } else if (roleCheck.role === "admin" || roleCheck.role === "funcionario") {
      // Admin/Funcionario: pode ver form_questions de qualquer applicant
      // Não precisa de verificação adicional
    } else {
      return NextResponse.json({ 
        error: "Role não reconhecido." 
      }, { status: 403 });
    }

    // Extrair form_questions do resultado
    const order = Array.isArray(applicant.orders) ? applicant.orders[0] : applicant.orders;
    const plan = Array.isArray(order?.plans) ? order.plans[0] : order?.plans;
    const visas = Array.isArray(plan?.visas) ? plan.visas[0] : plan?.visas;
    const formQuestions = Array.isArray(visas?.form_questions) ? visas.form_questions[0] : visas?.form_questions;
    
    if (!formQuestions) {
      return NextResponse.json(
        { error: "Formulário não encontrado para este tipo de visto." },
        { status: 404 }
      );
    }

    // Parse do JSON das perguntas se necessário
    let parsedQuestions;
    try {
      parsedQuestions = typeof formQuestions.questions === 'string' 
        ? JSON.parse(formQuestions.questions) 
        : formQuestions.questions;
    } catch (parseError) {
      return NextResponse.json(
        { error: "Erro ao processar formulário. Formato inválido." },
        { status: 500 }
      );
    }

    // Retornar dados estruturados para o frontend
    const response = {
      formQuestionsId: formQuestions.id,
      country: formQuestions.country,
      visas: visas.name,
      visasId: visas.id,
      planId: plan.id,
      orderId: order?.id,
      applicantId: applicant.id,
      questions: parsedQuestions
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar form_questions:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}
