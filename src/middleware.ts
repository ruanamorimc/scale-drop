import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { nextUrl } = request;
  
  // 1. Busca a sessão direto da API do Better Auth
  // Usamos fetch aqui porque o middleware roda no Edge e não tem acesso ao Prisma direto
  const response = await fetch(`${nextUrl.origin}/api/auth/get-session`, {
    headers: {
      cookie: request.headers.get("cookie") || "",
    },
  });

  const session = await response.json();
  const user = session?.user;
  const isAuthenticated = !!session?.user;

  // Defina suas rotas
  const isDashboardRoute = nextUrl.pathname.startsWith("/dashboard");
  const isAuthRoute = nextUrl.pathname.startsWith("/login") || nextUrl.pathname.startsWith("/sign-up");
  const isPricingRoute = nextUrl.pathname.startsWith("/pricing"); // Sua página de planos

  // LÓGICA DE PROTEÇÃO

  // A. Se não está logado e tenta acessar dashboard -> Manda pro Login
  if (isDashboardRoute && !isAuthenticated) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // B. Se está logado, mas tenta acessar auth (login/cadastro) -> Manda pro Dashboard
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // C. 🔒 O GUARDIÃO DO SAAS: Verifica o Pagamento
  if (isDashboardRoute && isAuthenticated) {
    // Verifique se o status no seu banco é "ACTIVE" ou "active" (case sensitive!)
    // Baseado no seu print, parece estar "PENDING".
    if (user.accessStatus !== "ACTIVE") {
      // Se não pagou, redireciona para a página de vendas
      return NextResponse.redirect(new URL("/pricing", request.url));
    }
  }

  return NextResponse.next();
}

// Configuração para o Middleware não rodar em arquivos estáticos, imagens, etc.
export const config = {
  matcher: [
    // Roda em todas as rotas, EXCETO arquivos estáticos, imagens, favicon, api
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};