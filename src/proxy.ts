import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const nextUrl = request.nextUrl;
  const pathname = nextUrl.pathname;

  // -----------------------------------------------------------------------------
  // 1. OBTENÇÃO DA SESSÃO E DADOS DO USUÁRIO
  // -----------------------------------------------------------------------------
  const baseURL =
    process.env.NODE_ENV === "production"
      ? nextUrl.origin
      : "http://127.0.0.1:3000";

  let session = null;
  let user = null;

  try {
    const response = await fetch(`${baseURL}/api/auth/get-session`, {
      headers: {
        cookie: request.headers.get("cookie") || "",
      },
    });

    session = await response.json();
    user = session?.user;
  } catch (error) {
    console.error("Erro no middleware (Auth check):", error);
  }

  const isAuthenticated = !!session?.user;

  // -----------------------------------------------------------------------------
  // 2. DEFINIÇÃO DOS GRUPOS DE ROTAS
  // -----------------------------------------------------------------------------
  const isPublicRoute =
    pathname === "/" ||
    pathname.startsWith("/auth") ||
    pathname === "/login" ||
    pathname === "/sign-up";

  const isPricingRoute = pathname.startsWith("/planos");

  // -----------------------------------------------------------------------------
  // 3. O FUNIL DE REGRAS DE NEGÓCIO (Strict Flow)
  // -----------------------------------------------------------------------------

  // REGRA A: USUÁRIO NÃO AUTENTICADO
  if (!isAuthenticated) {
    // Se tentar acessar qualquer área que não seja pública ou de planos, manda pro login
    if (!isPublicRoute && !isPricingRoute) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next(); // Libera acesso às rotas públicas
  }

  // REGRA B: USUÁRIO AUTENTICADO
  const isActive = user?.accessStatus === "ACTIVE";

  // B1. O Guardião Financeiro: Logado, mas SEM plano ativo
  if (!isActive) {
    // Se ele tentar acessar QUALQUER rota que não seja a de planos (incluindo o /start), bloqueia e manda pagar.
    if (!isPricingRoute) {
      return NextResponse.redirect(new URL("/planos", request.url));
    }
    return NextResponse.next(); // Deixa ele navegar livremente pelas rotas de /planos
  }

  // B2. O Guardião de Fluxo: Logado e COM plano ativo (ACTIVE)
  // Se um usuário que já paga tentar acessar a raiz, telas de login, ou tentar acessar planos de novo
  if (isPublicRoute || isPricingRoute || pathname === "/dashboard") {
    // Aqui o /start atua como um Gateway Inteligente. (A própria página /start deve verificar
    // se ele já tem um workspace no banco e mandar pro /[slug]/dashboard, caso contrário, deixa ele criar).
    return NextResponse.redirect(new URL("/start", request.url));
  }

  // Se passou por todo o funil, o acesso está totalmente autorizado!
  return NextResponse.next();
}

// 🔥 O MATCHER OFICIAL
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.png|.*\\.svg).*)",
  ],
};
