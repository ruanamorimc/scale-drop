"use server";

import prisma from "@/lib/prisma";

// 1. Gera a URL para o OAuth / Popup
export async function getGoogleAuthUrl(workspaceSlug: string) {
  try {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI;

    if (!clientId || !redirectUri) {
      throw new Error("Credenciais do Google não configuradas no .env");
    }

    const scope = "https://www.googleapis.com/auth/adwords";
    const state = encodeURIComponent(JSON.stringify({ workspaceSlug }));

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&access_type=offline&prompt=consent&state=${state}`;

    return { success: true, url: authUrl };
  } catch (error) {
    console.error("Erro ao gerar URL do Google:", error);
    return { success: false, message: "Falha ao iniciar integração" };
  }
}

// 2. Desconecta o Google Ads do usuário
export async function disconnectGoogleAds(userId: string) {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        googleAccessToken: null,
        googleRefreshToken: null,
        googleTokenExpiresAt: null,
      },
    });

    await prisma.googleAccount.deleteMany({
      where: { userId: userId },
    });

    return { success: true };
  } catch (error) {
    console.error("Erro ao desconectar Google Ads", error);
    return { success: false };
  }
}

// 3. Busca as contas cadastradas para o Sheet
export async function getGoogleAccounts(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        plan: true,
        googleAccounts: true,
        googleAccessToken: true, // 🔥 Puxamos o token para saber se ele autorizou o Google
      },
    });

    if (!user) {
      return { success: false, error: "Usuário não encontrado." };
    }

    let accounts = user.googleAccounts;

    // 🔥 SIMULAÇÃO: Se ele autorizou o Google (tem token) mas a tabela de contas está vazia,
    // nós injetamos uma conta mockada para destravar a interface.
    if (user.googleAccessToken && accounts.length === 0) {
      const mockAccount = await prisma.googleAccount.create({
        data: {
          userId: userId,
          accountId: "123-456-7890",
          name: "Minha Conta Google Ads",
          isActive: false,
        },
      });
      accounts = [mockAccount];
    }

    const initials = user.name
      ? user.name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .substring(0, 2)
          .toUpperCase()
      : "--";

    return {
      success: true,
      data: accounts,
      profileName: user.name,
      profileInitials: initials,
      userPlan: user.plan,
    };
  } catch (error) {
    console.error("Erro ao buscar contas do Google:", error);
    return { success: false, error: "Falha ao buscar contas." };
  }
}

// 4. Alterna o status da conta (Ativa / Inativa)
export async function toggleGoogleAccountStatus(
  userId: string,
  accountId: string,
  isActive: boolean,
) {
  try {
    const account = await prisma.googleAccount.findUnique({
      where: { id: accountId },
    });

    if (!account || account.userId !== userId) {
      return { success: false, error: "Não autorizado." };
    }

    await prisma.googleAccount.update({
      where: { id: accountId },
      data: { isActive },
    });

    return { success: true };
  } catch (error) {
    console.error("Erro ao alterar status da conta do Google:", error);
    return { success: false, error: "Erro interno ao atualizar." };
  }
}

// ==========================================
// AÇÕES DE PIXEL E RASTREIO (GOOGLE ADS)
// ==========================================

export async function getGooglePixels(userId: string) {
  try {
    const pixels = await prisma.googlePixel.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    return { success: true, data: pixels };
  } catch (error) {
    return { success: false, error: "Erro ao buscar tags do Google." };
  }
}

export async function saveGooglePixel(userId: string, data: any) {
  try {
    if (data.id) {
      await prisma.googlePixel.update({
        where: { id: data.id },
        data: {
          name: data.name,
          pixelIds: data.pixelIds,
          rules: data.rules,
        },
      });
    } else {
      await prisma.googlePixel.create({
        data: {
          userId,
          name: data.name,
          pixelIds: data.pixelIds,
          type: data.type,
          rules: data.rules,
        },
      });
    }
    return { success: true };
  } catch (error) {
    return { success: false, error: "Erro ao salvar tag do Google." };
  }
}

export async function deleteGooglePixel(userId: string, pixelId: string) {
  try {
    const pixel = await prisma.googlePixel.findUnique({
      where: { id: pixelId },
    });
    if (!pixel || pixel.userId !== userId)
      return { success: false, error: "Não autorizado." };

    await prisma.googlePixel.delete({ where: { id: pixelId } });
    return { success: true };
  } catch (error) {
    return { success: false, error: "Erro ao deletar tag." };
  }
}

export async function toggleGooglePixelStatus(
  userId: string,
  pixelId: string,
  status: string,
) {
  try {
    const pixel = await prisma.googlePixel.findUnique({
      where: { id: pixelId },
    });
    if (!pixel || pixel.userId !== userId)
      return { success: false, error: "Não autorizado." };

    await prisma.googlePixel.update({
      where: { id: pixelId },
      data: { status },
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: "Erro ao alterar status." };
  }
}

// ==========================================
// BUSCA DE CONVERSÕES NA API DO GOOGLE ADS
// ==========================================
export async function getGoogleConversionActions(
  userId: string,
  customerId: string,
) {
  try {
    // 1. Pega o Token do usuário no banco
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { googleAccessToken: true },
    });

    if (!user || !user.googleAccessToken) {
      return { success: false, error: "Usuário não autenticado com o Google." };
    }

    // 🔥 NOTA ARQUITETURAL:
    // Para chamar a API real do Google Ads, você precisará do seu "Developer Token"
    // (Token de Desenvolvedor) gerado no painel da MCC do Google.
    // O endpoint oficial do Google é:
    // POST https://googleads.googleapis.com/v16/customers/{customerId}/googleAds:search

    // Como estamos montando a estrutura visual primeiro para não travar o seu Frontend,
    // estou retornando uma lista estruturada exatamente no formato que a API do Google devolve.
    // Assim que seu App for aprovado no Google, substituímos este mock pelo fetch() real!

    const mockConversionsFromGoogle = [
      { id: "111111", name: "Compra (Purchase) - Principal", type: "PURCHASE" },
      { id: "222222", name: "Início de Checkout (IC)", type: "BEGIN_CHECKOUT" },
      { id: "333333", name: "Adição ao Carrinho", type: "ADD_TO_CART" },
      { id: "444444", name: "Lead / Cadastro", type: "LEAD" },
    ];

    // Simula o tempo de resposta da API do Google (meio segundo)
    await new Promise((resolve) => setTimeout(resolve, 500));

    return {
      success: true,
      data: mockConversionsFromGoogle,
    };
  } catch (error) {
    console.error("Erro ao buscar conversões do Google:", error);
    return {
      success: false,
      error: "Falha ao comunicar com a API do Google Ads.",
    };
  }
}
