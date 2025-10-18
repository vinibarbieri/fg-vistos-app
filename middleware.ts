
import { updateSession } from "@/lib/supabase/middleware";
import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Lista de origens (frontends) que podem acessar seu backend
const allowedOrigins = [
  'https://fg-vistos.vercel.app',
  'https://fg-vistos-app.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
];
// ++ FIM NOVO CÓDIGO CORS ++

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const origin = request.headers.get('origin');

  if (request.method === "OPTIONS") {
    // Só responde OK se a origem for uma das permitidas
    if (origin && allowedOrigins.includes(origin)) {
      const preflightResponse = new NextResponse(null, { status: 200 });
      preflightResponse.headers.set('Access-Control-Allow-Origin', origin);
      preflightResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      preflightResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // Adicione 'Authorization' ou outros headers que seu frontend envia
      preflightResponse.headers.set('Access-Control-Allow-Credentials', 'true');
      return preflightResponse;
    }
    // Se a origem não for permitida, bloqueia o OPTIONS
    return new NextResponse('Origin not allowed for OPTIONS', { status: 403 });
  }


  const response = await updateSession(request);
  
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // ## 1. Proteção das Rotas da API ##
  const protectedApiRoutes = [
    "/api/site-backend/payments/create-checkout",
    "/api/site-backend/payments/check-status",
  ];

  const isProtectedApiRoute = protectedApiRoutes.some((route) =>
    pathname.startsWith(route)
  );


  if (isProtectedApiRoute && !user) {
    const errorResponse = NextResponse.json(
      { error: "Não autorizado. Requer autenticação." },
      { status: 401 }
    );
    
    if (origin && allowedOrigins.includes(origin)) {
      errorResponse.headers.set('Access-Control-Allow-Origin', origin);
      errorResponse.headers.set('Access-Control-Allow-Credentials', 'true');
    }
    return errorResponse;
  }

  // ## 2. Proteção das Rotas do Frontend ##
  const protectedFrontendRoutes = ["/dashboard", "/protected"];
  const isProtectedFrontendRoute = protectedFrontendRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtectedFrontendRoute) {
    if (!user) {
      const redirectResponse = NextResponse.redirect(new URL("/auth/login", request.url));
      if (origin && allowedOrigins.includes(origin)) {
        redirectResponse.headers.set('Access-Control-Allow-Origin', origin);
        redirectResponse.headers.set('Access-Control-Allow-Credentials', 'true');
      }
      return redirectResponse;
    }

    if (pathname.startsWith("/dashboard")) {
      const userRole = user.app_metadata?.user_role;
      if (!userRole || userRole === "cliente") {
        const redirectResponse = NextResponse.redirect(new URL("/", request.url));
        if (origin && allowedOrigins.includes(origin)) {
          redirectResponse.headers.set('Access-Control-Allow-Origin', origin);
          redirectResponse.headers.set('Access-Control-Allow-Credentials', 'true');
        }
        return redirectResponse;
      }
    }
  }

  // ## 3. Resposta Final ##
  // Se a requisição passou por tudo, nós retornamos a 'response' do updateSession.
  
  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.headers.set('Access-Control-Allow-Credentials', 'true');
  }

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