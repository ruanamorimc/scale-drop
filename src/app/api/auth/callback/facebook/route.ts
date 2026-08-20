import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const slug = searchParams.get("state");

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  const returnUrl = slug
    ? `${baseUrl}/${slug}/settings/integrations`
    : `${baseUrl}/start`;

  if (error || !code || !slug) {
    const errorHtmlResponse = `
      <!DOCTYPE html>
      <html>
        <head><title>Acesso Negado</title></head>
        <body style="background-color: #09090b; color: #ef4444; display: flex; justify-content: center; align-items: center; height: 100vh; font-family: sans-serif;">
          <h2>Acesso negado ou dados ausentes.</h2>
          <script>
            setTimeout(() => {
              if (window.opener) {
                window.opener.postMessage({ type: 'META_OAUTH_ERROR' }, '*');
                window.close();
              } else {
                window.location.href = "${returnUrl}?error=access_denied";
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

  try {
    const clientId = process.env.NEXT_PUBLIC_META_APP_ID;
    const clientSecret = process.env.META_APP_SECRET;
    const redirectUri = `${baseUrl}/api/auth/callback/facebook`;

    // ==========================================
    // 1. GERAR SHORT-LIVED TOKEN (2 horas)
    // ==========================================
    const tokenUrl = `https://graph.facebook.com/v19.0/oauth/access_token?client_id=${clientId}&redirect_uri=${redirectUri}&client_secret=${clientSecret}&code=${code}`;
    const tokenRes = await fetch(tokenUrl);
    const tokenData = await tokenRes.json();

    if (tokenData.error) {
      console.error("Erro na Meta (Short Token):", tokenData.error);
      throw new Error(tokenData.error.message);
    }

    const shortLivedToken = tokenData.access_token;

    // ==========================================
    // 1.5. CONVERTER PARA LONG-LIVED TOKEN (60 dias)
    // ==========================================
    const exchangeUrl = `https://graph.facebook.com/v19.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${clientId}&client_secret=${clientSecret}&fb_exchange_token=${shortLivedToken}`;
    const exchangeRes = await fetch(exchangeUrl);
    const exchangeData = await exchangeRes.json();

    if (exchangeData.error) {
      console.error("Erro na Meta (Long Token):", exchangeData.error);
      throw new Error(exchangeData.error.message);
    }

    const longLivedToken = exchangeData.access_token;

    // ==========================================
    // 2. BUSCAR AS CONTAS DE ANÚNCIO DELE
    // ==========================================
    const accountsUrl = `https://graph.facebook.com/v19.0/me/adaccounts?fields=name,account_id,account_status&access_token=${longLivedToken}`;
    const accountsRes = await fetch(accountsUrl);
    const accountsData = await accountsRes.json();

    const adAccounts = accountsData.data || [];

    // ==========================================
    // 3. SALVAR O TOKEN DE 60 DIAS NO USER
    // ==========================================
    await prisma.user.update({
      where: { id: userId },
      data: { metaAccessToken: longLivedToken },
    });

    for (const acc of adAccounts) {
      await prisma.metaAccount.upsert({
        where: {
          userId_accountId: { userId: userId, accountId: acc.account_id },
        },
        update: {
          name: acc.name || `Conta ${acc.account_id}`,
        },
        create: {
          userId: userId,
          accountId: acc.account_id,
          name: acc.name || `Conta ${acc.account_id}`,
          isActive: false,
        },
      });
    }

    console.log(
      `✅ [META ADS] Conectado! ${adAccounts.length} contas salvas com token de 60 dias.`,
    );

    const htmlResponse = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Autenticando Meta Ads...</title>
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
            setTimeout(() => {
              if (window.opener) {
                window.opener.postMessage({ type: 'META_OAUTH_SUCCESS' }, '*');
                window.close();
              } else {
                window.location.href = "${returnUrl}?success=meta_connected";
              }
            }, 800);
          </script>
        </body>
      </html>
    `;

    return new NextResponse(htmlResponse, {
      headers: { "Content-Type": "text/html" },
    });
  } catch (error) {
    console.error("Erro interno no OAuth do Facebook:", error);

    const errorHtmlResponse = `
      <!DOCTYPE html>
      <html>
        <head><title>Erro na Autenticação</title></head>
        <body style="background-color: #09090b; color: #ef4444; display: flex; justify-content: center; align-items: center; height: 100vh; font-family: sans-serif;">
          <h2>Ocorreu um erro na conexão com o Meta.</h2>
          <script>
            setTimeout(() => {
              if (window.opener) {
                window.opener.postMessage({ type: 'META_OAUTH_ERROR' }, '*');
                window.close();
              } else {
                window.location.href = "${returnUrl}?error=internal_server_error";
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
