import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkUserRole } from "../../../utils/role-check";
import { calculateFormProgress } from "@/lib/form-progress";

export async function PUT(
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

    // Buscar dados do request
    const { answers, isComplete = false } = await request.json();
    
    if (!answers || typeof answers !== 'object') {
      return NextResponse.json(
        { error: "Respostas do formulário são obrigatórias." },
        { status: 400 }
      );
    }

    // Buscar applicant e verificar propriedade
    const { data: applicant, error: applicantError } = await supabase
      .from("applicants")
      .select("id, responsible_user_id, form_status")
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
      // Cliente: só pode salvar respostas dos seus próprios applicants
      if (applicant.responsible_user_id !== user.id) {
        return NextResponse.json({ 
          error: "Acesso negado. Clientes só podem salvar respostas dos seus próprios applicants." 
        }, { status: 403 });
      }
    } else if (roleCheck.role === "admin" || roleCheck.role === "funcionario") {
      // Admin/Funcionario: pode salvar respostas de qualquer applicant
      // Não precisa de verificação adicional
    } else {
      return NextResponse.json({ 
        error: "Role não reconhecido." 
      }, { status: 403 });
    }

    // Preparar dados para atualização
    const updateData: any = {
      form_answer: JSON.stringify(answers),
      updated_at: new Date().toISOString()
    };

    // Se o formulário foi marcado como completo, atualizar o status
    if (isComplete) {
      updateData.form_status = 'submetido';
    } else if (applicant.form_status === 'nao_iniciado') {
      // Se era "não iniciado" e agora tem respostas, marcar como "em preenchimento"
      updateData.form_status = 'em_preenchimento';
    }

    // Atualizar o applicant com as respostas
    const { data: updatedApplicant, error: updateError } = await supabase
      .from("applicants")
      .update(updateData)
      .eq("id", applicantId)
      .select("id, form_status, form_answer, updated_at")
      .single();

    if (updateError) {
      console.error("Erro ao atualizar applicant:", updateError);
      return NextResponse.json({ 
        error: updateError.message || "Erro ao salvar respostas do formulário." 
      }, { status: 500 });
    }

    // Buscar dados do formulário para calcular progresso
    let progressData: any = null;
    try {
      const { data: formQuestionsData } = await supabase
        .from("applicants")
        .select(`
          orders!inner(
            plans!inner(
              visas!inner(
                form_questions!inner(
                  questions
                )
              )
            )
          )
        `)
        .eq("id", applicantId)
        .single();

      const order = Array.isArray(formQuestionsData?.orders) ? formQuestionsData.orders[0] : formQuestionsData?.orders;
      const plan = Array.isArray(order?.plans) ? order.plans[0] : order?.plans;
      const visa = Array.isArray(plan?.visas) ? plan.visas[0] : plan?.visas;
      const formQuestions = Array.isArray(visa?.form_questions) ? visa.form_questions[0] : visa?.form_questions;
      
      if (formQuestions?.questions) {
        const questions = typeof formQuestions.questions === 'string'
          ? JSON.parse(formQuestions.questions)
          : formQuestions.questions;

        const formData = {
          steps: questions.steps || questions,
          totalSteps: questions.steps ? questions.steps.length : questions.length
        };

        progressData = calculateFormProgress(formData, answers);
      }
    } catch (progressError) {
      console.error("Erro ao calcular progresso:", progressError);
      // Continua sem o progresso se houver erro
    }

    // Retornar dados atualizados
    const response = {
      success: true,
      applicantId: updatedApplicant.id,
      formStatus: updatedApplicant.form_status,
      savedAt: updatedApplicant.updated_at,
      isComplete,
      progress: progressData,
      message: isComplete 
        ? "Formulário salvo e marcado como completo!" 
        : "Respostas salvas com sucesso!"
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Erro ao salvar form_answer:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}

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
      .select("id, responsible_user_id, form_answer, form_status, updated_at")
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
      // Cliente: só pode ver respostas dos seus próprios applicants
      if (applicant.responsible_user_id !== user.id) {
        return NextResponse.json({ 
          error: "Acesso negado. Clientes só podem ver respostas dos seus próprios applicants." 
        }, { status: 403 });
      }
    } else if (roleCheck.role === "admin" || roleCheck.role === "funcionario") {
      // Admin/Funcionario: pode ver respostas de qualquer applicant
      // Não precisa de verificação adicional
    } else {
      return NextResponse.json({ 
        error: "Role não reconhecido." 
      }, { status: 403 });
    }

    // Parse das respostas salvas
    let savedAnswers = {};
    if (applicant.form_answer) {
      try {
        savedAnswers = typeof applicant.form_answer === 'string' 
          ? JSON.parse(applicant.form_answer) 
          : applicant.form_answer;
      } catch (parseError) {
        console.error("Erro ao fazer parse das respostas salvas:", parseError);
        // Se não conseguir fazer parse, retorna objeto vazio
        savedAnswers = {};
      }
    }

    // Buscar dados do formulário para calcular progresso
    let progressData: any = null;
    try {
      const { data: formQuestionsData } = await supabase
        .from("applicants")
        .select(`
          orders!inner(
            plans!inner(
              visas!inner(
                form_questions!inner(
                  questions
                )
              )
            )
          )
        `)
        .eq("id", applicantId)
        .single();

      const order = Array.isArray(formQuestionsData?.orders) ? formQuestionsData.orders[0] : formQuestionsData?.orders;
      const plan = Array.isArray(order?.plans) ? order.plans[0] : order?.plans;
      const visa = Array.isArray(plan?.visas) ? plan.visas[0] : plan?.visas;
      const formQuestions = Array.isArray(visa?.form_questions) ? visa.form_questions[0] : visa?.form_questions;
      
      if (formQuestions?.questions) {
        const questions = typeof formQuestions.questions === 'string'
          ? JSON.parse(formQuestions.questions)
          : formQuestions.questions;

        const formData = {
          steps: questions.steps || questions,
          totalSteps: questions.steps ? questions.steps.length : questions.length
        };

        progressData = calculateFormProgress(formData, savedAnswers);
      }
    } catch (progressError) {
      console.error("Erro ao calcular progresso:", progressError);
      // Continua sem o progresso se houver erro
    }

    // Retornar dados das respostas salvas
    const response = {
      applicantId: applicant.id,
      formStatus: applicant.form_status,
      answers: savedAnswers,
      lastSaved: applicant.updated_at,
      hasAnswers: Object.keys(savedAnswers).length > 0,
      progress: progressData
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar form_answer:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}
