import { NextResponse } from "next/server";
import prisma from "@/lib/prisma"; // ⚠️ Ajuste o caminho do prisma se o seu for diferente!

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  // 🔥 Pegamos de volta o userId que enviamos no passo anterior
  const userId = searchParams.get("state");

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const returnUrl = `${appUrl}/settings/integrations`;

  // Se o usuário recusou ou faltou algum dado
  if (error || !code || !userId) {
    return NextResponse.redirect(new URL(`${returnUrl}?error=access_denied`));
  }

  try {
    const clientId = process.env.NEXT_PUBLIC_META_APP_ID;
    const clientSecret = process.env.META_APP_SECRET;
    const redirectUri = `${appUrl}/api/auth/callback/facebook`;

    // ==========================================
    // 1. TROCAR O CÓDIGO PELO TOKEN DE ACESSO
    // ==========================================
    const tokenUrl = `https://graph.facebook.com/v19.0/oauth/access_token?client_id=${clientId}&redirect_uri=${redirectUri}&client_secret=${clientSecret}&code=${code}`;
    const tokenRes = await fetch(tokenUrl);
    const tokenData = await tokenRes.json();

    if (tokenData.error) {
      console.error("Erro na Meta:", tokenData.error);
      throw new Error(tokenData.error.message);
    }

    let accessToken = tokenData.access_token;

    // ==========================================
    // 2. BUSCAR AS CONTAS DE ANÚNCIO DELE
    // ==========================================
    // Vamos bater na API da Meta para pegar as "AdAccounts" atreladas a esse perfil
    const accountsUrl = `https://graph.facebook.com/v19.0/me/adaccounts?fields=name,account_id,account_status&access_token=${accessToken}`;
    const accountsRes = await fetch(accountsUrl);
    const accountsData = await accountsRes.json();

    const adAccounts = accountsData.data || [];

    // ==========================================
    // 3. SALVAR TUDO NO BANCO DE DADOS (PRISMA)
    // ==========================================

    // Atualiza o Token do usuário
    await prisma.user.update({
      where: { id: userId },
      data: { metaAccessToken: accessToken },
    });

    // Salva as contas de anúncio usando Upsert (Atualiza se existir, cria se não existir)
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
          isActive: true,
        },
      });
    }

    console.log(`✅ [META ADS] Conectado! ${adAccounts.length} contas salvas.`);

    // 🔥 Redireciona de volta para a tela de configurações com sucesso!
    return NextResponse.redirect(
      new URL(`${returnUrl}?success=meta_connected`),
    );
  } catch (error) {
    console.error("Erro interno no OAuth do Facebook:", error);
    return NextResponse.redirect(
      new URL(`${returnUrl}?error=internal_server_error`),
    );
  }
}
