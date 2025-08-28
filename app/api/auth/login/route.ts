import { NextResponse, type NextRequest } from "next/server";
// Vamos usar o `updateSession` que você já tem, pois ele lida com os cookies.
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json(
      { error: "E-mail e senha são obrigatórios." },
      { status: 400 }
    );
  }

  // É preciso criar o cliente DENTRO da rota para que ele tenha o contexto da requisição.
  // O ideal aqui é ter uma função helper para não repetir código.
  // Vamos usar o updateSession que já faz a criação do cliente e o gerenciamento da resposta.
  // No entanto, para login, o mais direto é usar o createServerClient e gerenciar a resposta.

  // A maneira mais direta e correta para uma API Route de login:
  const supabase = await createClient(); // Precisamos de um helper para isso

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return NextResponse.json(
      { error: "Credenciais inválidas.", details: error.message },
      { status: 401 }
    );
  }

  // O signInWithPassword já lida com os cookies de sessão através do cliente SSR.
  // A resposta deve conter os headers 'Set-Cookie' para que o navegador guarde a sessão.
  // O cliente Supabase SSR já faz isso.
  return NextResponse.json(
    { message: "Login bem-sucedido.", user: data.user },
    { status: 200 }
  );
}
