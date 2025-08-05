import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  // CORREÇÃO: O await é necessário pois sua função createClient é async.
  const supabase = await createClient();

  const { email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json(
      { error: "E-mail e senha são obrigatórios." },
      { status: 400 }
    );
  }

  // Agora, com o 'await' na linha acima, 'supabase' é o cliente Supabase
  // e podemos acessar a propriedade '.auth' sem erro.
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${new URL(request.url).origin}/auth/callback`,
    },
  });

  if (error) {
    console.error("Erro no cadastro:", error);
    return NextResponse.json(
      {
        error: "Não foi possível registrar o usuário.",
        details: error.message,
      },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { message: "Cadastro realizado. Verifique seu e-mail para confirmação." },
    { status: 201 }
  );
}
