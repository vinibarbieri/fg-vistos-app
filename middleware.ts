import { updateSession } from "@/lib/supabase/middleware";
import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function middleware(request: NextRequest) {
  // Primeiro, atualizar a sessão
  const response = await updateSession(request);
  
  // Verificar se é uma rota protegida
  const { pathname } = request.nextUrl;
  
  // Rotas que precisam de autenticação
  const protectedRoutes = ['/dashboard', '/protected'];
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  
  if (isProtectedRoute) {
    // Verificar se o usuário está autenticado
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
    
    // Verificar role para rotas específicas
    if (pathname.startsWith('/dashboard')) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      
      if (!profile || profile.role === 'Cliente') {
        return NextResponse.redirect(new URL('/auth/login', request.url));
      }
    }
  }
  
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
