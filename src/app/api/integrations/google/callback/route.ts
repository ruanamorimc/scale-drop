import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
// Importe a sua configuração do BetterAuth para pegar o usuário logado
import { auth } from "@/lib/auth"; // Ajuste para o caminho real do seu auth
import { headers } from "next/headers";

export async function GET(request: Request) {
  try {
    // 1. Pega a URL e os parâmetros que o Google nos enviou
    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const stateParam = url.searchParams.get("state");

    if (!code) {
      return NextResponse.redirect(
        new URL("/settings/integrations?error=google_auth_failed", request.url),
      );
    }

    // 2. Descriptografa o state para saber para onde voltar
    let workspaceSlug = "";
    if (stateParam) {
      try {
        const stateData = JSON.parse(decodeURIComponent(stateParam));
        workspaceSlug = stateData.workspaceSlug;
      } catch (e) {
        console.error("Erro ao dar parse no state", e);
      }
    }

    // 3. Verifica qual usuário está logado no nosso sistema (BetterAuth)
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // 4. Troca o 'code' temporário pelos Tokens Reais na API do Google
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error("Erro ao buscar tokens do Google:", tokenData);
      return NextResponse.redirect(
        new URL(
          `/${workspaceSlug}/settings/integrations?error=google_token_failed`,
          request.url,
        ),
      );
    }

    // 5. Calcula a data de expiração (Google devolve 'expires_in' em segundos, geralmente 3599)
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + tokenData.expires_in);

    // 6. Salva tudo no banco de dados para o usuário
    // IMPORTANTE: O Google só manda o refresh_token no PRIMEIRO login.
    // Se ele vier, nós salvamos. Se não vier, mantemos o que já estava lá.
    // 6. Salva tudo no banco de dados para o usuário
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        googleAccessToken: tokenData.access_token,
        googleTokenExpiresAt: expiresAt,
        ...(tokenData.refresh_token && {
          googleRefreshToken: tokenData.refresh_token,
        }),
      },
    });

    // 7. 🔥 NOVO: Devolve um HTML que avisa a página principal e fecha o popup!
    const htmlResponse = `
      <html>
        <body>
          <script>
            // Envia a mensagem para a janela pai (sua plataforma)
            window.opener.postMessage({ type: 'GOOGLE_OAUTH_SUCCESS' }, '*');
            // Fecha o popup
            window.close();
          </script>
        </body>
      </html>
    `;

    return new NextResponse(htmlResponse, {
      headers: { "Content-Type": "text/html" },
    });
  } catch (error) {
    console.error("Erro crítico no Callback do Google:", error);
    return NextResponse.redirect(
      new URL(
        "/settings/integrations?error=internal_server_error",
        request.url,
      ),
    );
  }
}
