import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const nextUrl = request.nextUrl;

  // -----------------------------------------------------------------------------
  // 1. A CORREÇÃO DO NGROK (Mantivemos isso)
  // -----------------------------------------------------------------------------
  // Se for desenvolvimento, forçamos localhost para evitar o erro "fetch failed"
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
    // Se der erro técnico na auth, seguimos vida para não travar o app,
    // as checagens abaixo vão tratar o user como nulo.
  }

  const isAuthenticated = !!session?.user;

  // -----------------------------------------------------------------------------
  // 2. SUAS REGRAS DE ROTAS (Restauramos isso do seu print)
  // -----------------------------------------------------------------------------

  const isDashboardRoute =
    nextUrl.pathname.startsWith("/dashboard") ||
    nextUrl.pathname.startsWith("/settings") ||
    nextUrl.pathname.startsWith("/orders");
  const isAuthRoute =
    nextUrl.pathname.startsWith("/auth") ||
    nextUrl.pathname === "/login" ||
    nextUrl.pathname === "/sign-up";
  const isPricingRoute = nextUrl.pathname.startsWith("/planos");

  // A. Se não está logado e tenta acessar área privada -> Manda pro Login
  if (isDashboardRoute && !isAuthenticated) {
    // Redireciona para o login padrão
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // B. Se já está logado, mas tenta acessar página de login -> Manda pro Dashboard
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // C. 🔒 O GUARDIÃO DO SAAS: Verifica o Pagamento
  if (isDashboardRoute && isAuthenticated) {
    // Baseado no seu print image_15497d.png
    // Verifique se o campo no seu banco chama 'accessStatus' ou 'planStatus'
    // Estou mantendo 'accessStatus' conforme seu print.
    if (user?.accessStatus !== "ACTIVE" && !isPricingRoute) {
      return NextResponse.redirect(new URL("/planos", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Todas as rotas que precisam passar pelo middleware
    "/dashboard/:path*",
    "/settings/:path*",
    "/orders/:path*",
    "/auth/:path*",
    "/login",
    "/sign-up",
    "/planos", // Importante incluir pricing para não dar loop infinito se precisar tratar algo lá
  ],
};
