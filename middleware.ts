import { updateSession } from "@/lib/supabase/middleware";
import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function middleware(request: NextRequest) {
  // A função updateSession é crucial para manter o estado de autenticação do usuário atualizado.
  const response = await updateSession(request);
  const { pathname } = request.nextUrl;

  // Inicializa o cliente Supabase para verificar o status de autenticação.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // ## 1. Proteção das Rotas da API ##
  const protectedApiRoutes = [
    "/api/site-backend/order",
    "/api/site-backend/payments/create-checkout",
    "/api/site-backend/payments/check-status",
  ];

  const isProtectedApiRoute = protectedApiRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtectedApiRoute && !user) {
    // Para rotas de API, é essencial retornar um erro JSON em vez de um redirecionamento.
    return NextResponse.json(
      { error: "Não autorizado. Requer autenticação." },
      { status: 401 }
    );
  }

  // ## 2. Proteção das Rotas do Frontend ##
  const protectedFrontendRoutes = ["/dashboard", "/protected"]; // Adicione outras rotas do site aqui
  const isProtectedFrontendRoute = protectedFrontendRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtectedFrontendRoute) {
    if (!user) {
      // Para rotas do frontend, redirecionamos o usuário para a página de login.
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }

    // Exemplo de verificação de permissão (role) para o dashboard.
    if (pathname.startsWith("/dashboard")) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      // Se o usuário não tiver a permissão necessária, redireciona para a página inicial.
      if (!profile || profile.role === "Cliente") {
        return NextResponse.redirect(new URL("/", request.url));
      }
    }
  }

  // Se a rota não for protegida, ou se o usuário estiver autorizado,
  // prossegue com a resposta de updateSession.
  return response;
}

export const config = {
  matcher: [
    /*
     * Faz o match com todos os caminhos de requisição, exceto:
     * - _next/static (arquivos estáticos)
     * - _next/image (arquivos de otimização de imagem)
     * - favicon.ico (arquivo de favicon)
     * - arquivos de imagem (svg, png, jpg, etc.)
     * Isso garante que o middleware execute em todas as navegações de página e chamadas de API.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
