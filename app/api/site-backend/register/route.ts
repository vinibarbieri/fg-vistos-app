import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

// Schema de validação
const userRegistrationSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  quantity: z
    .number()
    .min(1, "Quantidade deve ser pelo menos 1")
    .max(100, "Quantidade máxima de 100 applicants"),
  planId: z.string().uuid("ID do plano inválido"), // Usar .uuid() se for um UUID
});

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    // 1. Validar dados de entrada
    const validatedData = userRegistrationSchema.parse(body);
    const { name, email, password, quantity, planId } = validatedData;

    console.log("Iniciando cadastro...", { name, email, quantity, planId });

    // 2. Verificar se o email já está cadastrado
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email)
      .single();

    if (existingProfile) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Este email já está cadastrado. Use outro email ou faça login.",
        },
        { status: 409 }
      ); // 409 Conflict
    }

    // 3. Criar usuário no Supabase Auth
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });

    if (authError || !user) {
      console.error("Erro na autenticação Supabase:", authError);
      return NextResponse.json(
        {
          success: false,
          error: authError?.message || "Erro ao criar usuário autenticado",
        },
        { status: 500 }
      );
    }

    console.log("Usuário autenticado criado:", user.id);

    // 4. Criar o perfil do usuário na tabela profiles
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .upsert([{
        id: user.id,
        email,
        name,
        account_status: 'true',
        role: 'Cliente'
      }], {
        onConflict: 'id'
      })
      .select()
      .single();

    if (profileError || !profile) {
      console.error("Erro ao processar profile:", profileError);
      return NextResponse.json(
        { success: false, error: "Erro ao processar perfil do usuário" },
        { status: 500 }
      );
    }

    console.log("Profile processado:", profile.id);

    // 5. Criar a Order vinculada ao perfil e plano
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert([
        {
          responsible_user_id: profile.id,
          plan_id: planId,
          applicants_quantity: quantity,
          payment_status: "pendente",
        },
      ])
      .select()
      .single();

    if (orderError || !order) {
      console.error("Erro ao criar order:", orderError);
      return NextResponse.json(
        { success: false, error: "Erro ao criar pedido" },
        { status: 500 }
      );
    }

    console.log("Order criada:", order.id);

    // 6. Criar os Applicants com base na quantidade
    const applicantsToCreate = Array.from({ length: quantity }, (_, i) => ({
      responsible_user_id: profile.id,
      order_id: order.id,
      is_responsible: i === 0, // Apenas o primeiro é o responsável
      name: i === 0 ? name : "", // Apenas o primeiro recebe o nome
      status: "pendente",
    }));

    const { data: createdApplicants, error: applicantsError } = await supabase
      .from("applicants")
      .insert(applicantsToCreate)
      .select();

    if (applicantsError) {
      console.error("Erro ao criar applicants:", applicantsError);
      return NextResponse.json(
        { success: false, error: "Erro ao criar applicants" },
        { status: 500 }
      );
    }

    console.log("Applicants criados:", createdApplicants?.length);

    // 7. Retornar sucesso com todos os dados criados
    return NextResponse.json(
      {
        success: true,
        data: {
          user: { id: user.id, email, name },
          profile,
          order,
        },
        message: "Usuário registrado com sucesso",
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Dados inválidos",
          details: error.issues.map((e) => ({
            path: e.path,
            message: e.message,
          })),
        },
        { status: 400 }
      );
    }

    console.error("Erro no endpoint de cadastro:", error);
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
