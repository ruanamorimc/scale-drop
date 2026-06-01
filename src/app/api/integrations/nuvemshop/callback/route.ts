import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { registerNuvemshopWebhooks } from "@/lib/nuvemshop";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error || !code) {
    return NextResponse.redirect(
      new URL("/settings/integrations?error=auth_failed", request.url),
    );
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
      return NextResponse.redirect(
        new URL("/settings/integrations?error=auth_failed", request.url),
      );
    }

    // 3. Salva no banco de dados
    await prisma.storeIntegration.upsert({
      where: {
        userId_platform: { userId, platform: "NUVEMSHOP" },
      },
      update: {
        storeId,
        storeName,
        storeUrl,
        accessToken,
        isConnected: true,
        isActive: true,
        lastSyncAt: new Date(),
      },
      create: {
        userId,
        platform: "NUVEMSHOP",
        storeId,
        storeName,
        storeUrl,
        accessToken,
        isConnected: true,
        isActive: true,
      },
    });

    await registerNuvemshopWebhooks(storeId, accessToken);

    return NextResponse.redirect(
      new URL(
        "/settings/integrations?success=nuvemshop_connected",
        request.url,
      ),
    );
  } catch (err) {
    console.error("[Scale Drop] Erro Crítico no Callback:", err);
    return NextResponse.redirect(
      new URL("/settings/integrations?error=internal_error", request.url),
    );
  }
}
