import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { updateIntegrationTokens } from "@/services/store-integration";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  // ==========================================
  // 1. VERIFICAÇÃO DE SEGURANÇA (USUÁRIO LOGADO)
  // ==========================================
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ==========================================
  // 2. CAPTURA DOS DADOS DA URL
  // ==========================================
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const slug = searchParams.get("state"); // Nosso identificador de Workspace

  if (!code || !slug) {
    return NextResponse.json(
      { error: "Code ou State (slug) ausente" },
      { status: 400 },
    );
  }

  try {
    // ==========================================
    // 3. BUSCA O WORKSPACE NO BANCO
    // ==========================================
    const workspace = await prisma.workspace.findUnique({
      where: { slug: slug },
    });

    if (!workspace) {
      throw new Error("Workspace não encontrado.");
    }

    // ==========================================
    // 4. TROCA O "CODE" PELOS TOKENS NO MERCADO LIVRE
    // ==========================================
    const params = new URLSearchParams();
    params.append("grant_type", "authorization_code");
    params.append("client_id", process.env.ML_CLIENT_ID!);
    params.append("client_secret", process.env.ML_CLIENT_SECRET!);
    params.append("code", code);
    params.append("redirect_uri", process.env.ML_REDIRECT_URI!);

    const response = await fetch("https://api.mercadolibre.com/oauth/token", {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/x-www-form-urlencoded",
      },
      body: params,
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Erro ML Token:", data);
      throw new Error("Falha ao obter token do ML");
    }

    // ==========================================
    // 5. SALVA OS TOKENS NO BANCO DE DADOS
    // ==========================================
    await updateIntegrationTokens(session.user.id, data, workspace.id);

    // ==========================================
    // 6. O PULO DO GATO: FECHAR O POPUP VIA HTML
    // ==========================================
    // Pega a URL do seu sistema (localhost ou Ngrok)
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    // Criamos uma página HTML simples. O JavaScript dentro dela verifica se foi
    // aberta como Popup (window.opener). Se sim, manda a mensagem de sucesso e fecha.
    // Se não (foi aberta numa guia normal), redireciona normalmente.
    const htmlResponse = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Autenticando Mercado Livre...</title>
          <style>
            body { background-color: #09090b; color: white; display: flex; justify-content: center; align-items: center; height: 100vh; font-family: sans-serif; }
            .loader { border: 4px solid #333; border-top: 4px solid #3b82f6; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin-bottom: 16px; }
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            .container { text-align: center; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="loader"></div>
            <h2>Autenticação concluída!</h2>
            <p>Fechando janela e retornando ao painel...</p>
          </div>
          <script>
            // Dá um pequeno delay apenas para o usuário ler a mensagem
            setTimeout(() => {
              if (window.opener) {
                // Dispara o evento de sucesso para a sua Sheet do Mercado Livre
                window.opener.postMessage({ type: 'ML_OAUTH_SUCCESS' }, '*');
                // Fecha o popup
                window.close();
              } else {
                // Fallback: Se o usuário abriu na mesma aba, redireciona normal
                window.location.href = "${baseUrl}/${slug}/settings/integrations?success=true";
              }
            }, 800);
          </script>
        </body>
      </html>
    `;

    // Retorna o HTML que criamos acima para o navegador
    return new NextResponse(htmlResponse, {
      headers: { "Content-Type": "text/html" },
    });
  } catch (error) {
    // ==========================================
    // 7. TRATAMENTO DE ERROS (FECHA O POPUP TAMBÉM)
    // ==========================================
    console.error("Erro no Callback ML:", error);
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const fallbackUrl = slug
      ? `${baseUrl}/${slug}/settings/integrations?error=true`
      : `${baseUrl}/start`;

    // Se der erro, faz a mesma coisa: tenta fechar o popup avisando de erro,
    // ou redireciona para a página de erro se for na mesma guia.
    const errorHtmlResponse = `
      <!DOCTYPE html>
      <html>
        <head><title>Erro na Autenticação</title></head>
        <body style="background-color: #09090b; color: #ef4444; display: flex; justify-content: center; align-items: center; height: 100vh; font-family: sans-serif;">
          <h2>Ocorreu um erro na autenticação.</h2>
          <script>
            setTimeout(() => {
              if (window.opener) {
                window.opener.postMessage({ type: 'ML_OAUTH_ERROR' }, '*');
                window.close();
              } else {
                window.location.href = "${fallbackUrl}";
              }
            }, 2000);
          </script>
        </body>
      </html>
    `;

    return new NextResponse(errorHtmlResponse, {
      headers: { "Content-Type": "text/html" },
    });
  }
}
