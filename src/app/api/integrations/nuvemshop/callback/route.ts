import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { registerNuvemshopWebhooks } from "@/lib/nuvemshop";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  // 🔥 Helper para gerar o script que avisa a Sheet e fecha o popup
  const popupScript = (type: string) => `
    <script>
      window.opener.postMessage({ type: "${type}" }, "*");
      window.close();
    </script>
  `;

  if (error || !code) {
    // Ao invés de redirect, fecha o popup disparando o erro para a Sheet
    return new NextResponse(popupScript("NUVEMSHOP_OAUTH_ERROR"), {
      headers: { "Content-Type": "text/html" },
    });
  }

  try {
    // 🔥 PATCH 1: Usando as variáveis exatas do seu .env
    const clientId = process.env.NS_APP_ID;
    const clientSecret = process.env.NS_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error(
        "Variáveis NS_APP_ID ou NS_CLIENT_SECRET não configuradas.",
      );
    }

    // 1. Troca o 'code' pelo 'access_token'
    const tokenResponse = await fetch(
      "https://www.nuvemshop.com.br/apps/authorize/token",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          grant_type: "authorization_code",
          code: code,
        }),
      },
    );

    const tokenData = await tokenResponse.json();

    // 🔥 PATCH 2: Bloqueio de segurança. Se não vier token, paramos aqui!
    if (!tokenResponse.ok || !tokenData.access_token) {
      console.error(
        "[Scale Drop] Erro na geração do token Nuvemshop:",
        tokenData,
      );
      throw new Error("Falha ao gerar o access token");
    }

    const accessToken = tokenData.access_token;
    const storeId = String(tokenData.user_id);

    // 2. Busca os dados da loja (Com Fallback para não dar 404)
    let storeName = `Loja #${storeId}`;
    let storeUrl = null;

    try {
      const storeResponse = await fetch(
        `https://api.nuvemshop.com.br/v1/${storeId}/store`,
        {
          method: "GET",
          headers: {
            Authentication: `bearer ${accessToken}`,
            "User-Agent": "Scale Drop (contato@scaledrop.com.br)",
            "Content-Type": "application/json",
          },
        },
      );

      if (storeResponse.ok) {
        const storeData = await storeResponse.json();
        storeName =
          typeof storeData.name === "object"
            ? storeData.name.pt || Object.values(storeData.name)[0]
            : storeData.name || storeName;
        storeUrl = storeData.main_domain || storeData.contact_email || null;
      }
    } catch (e) {
      console.warn(
        "[Scale Drop] Aviso: Não foi possível ler os metadados da loja.",
        e,
      );
    }

    const session = await auth.api.getSession({
      headers: await headers(), // Lendo os cookies da sessão
    });

    const userId = session?.user?.id;

    if (!userId) {
      return new NextResponse(popupScript("NUVEMSHOP_OAUTH_ERROR"), {
        headers: { "Content-Type": "text/html" },
      });
    }

    // 🔥 NOVO: Busca o workspaceId, que agora é obrigatório no Prisma
    const workspace = await prisma.workspace.findFirst({
      where: { userId: userId },
    });

    if (!workspace) {
      console.error("[Scale Drop] Workspace não encontrado para o usuário.");
      throw new Error("Workspace não encontrado");
    }

    // 3. Salva no banco de dados (Substituindo o antigo upsert)
    const existingIntegration = await prisma.storeIntegration.findFirst({
      where: {
        userId: userId,
        workspaceId: workspace.id,
        platform: "NUVEMSHOP",
      },
    });

    if (existingIntegration) {
      await prisma.storeIntegration.update({
        where: { id: existingIntegration.id },
        data: {
          storeId,
          storeName,
          storeUrl,
          accessToken,
          isConnected: true,
          isActive: true,
          lastSyncAt: new Date(),
        },
      });
    } else {
      await prisma.storeIntegration.create({
        data: {
          userId,
          workspaceId: workspace.id, // 🔥 Coluna obrigatória!
          platform: "NUVEMSHOP",
          storeId,
          storeName,
          storeUrl,
          accessToken,
          isConnected: true,
          isActive: true,
        },
      });
    }

    // Registra os webhooks
    await registerNuvemshopWebhooks(storeId, accessToken);

    // Retorna o HTML para fechar o popup avisando a Sheet que deu certo!
    return new NextResponse(popupScript("NUVEMSHOP_OAUTH_SUCCESS"), {
      headers: { "Content-Type": "text/html" },
    });
  } catch (err) {
    console.error("[Scale Drop] Erro Crítico no Callback:", err);
    return new NextResponse(
      `
      <script>
        window.opener.postMessage({ type: "NUVEMSHOP_OAUTH_ERROR" }, "*");
        window.close();
      </script>
      `,
      { headers: { "Content-Type": "text/html" } },
    );
  }
}
