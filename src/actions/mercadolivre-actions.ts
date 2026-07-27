"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getServerSession } from "@/lib/get-session";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
// 🔥 Importamos a interface MLItem junto com a função
import { getSellerItems, MLItem } from "@/services/mercado-livre";

/**
 * Função Mágica: Garante que sempre teremos um token válido.
 * Se estiver vencido, ela renova sozinha antes de devolver.
 */
async function getMercadoLivreToken(userId: string, workspaceId: string) {
  const integration = await prisma.storeIntegration.findFirst({
    where: {
      userId: userId,
      workspaceId: workspaceId,
      platform: "MERCADO_LIVRE",
      isConnected: true,
    },
  });

  if (!integration || !integration.accessToken || !integration.refreshToken) {
    throw new Error(
      "Integração com Mercado Livre não encontrada ou incompleta.",
    );
  }

  const now = new Date();
  const expiresAt = integration.tokenExpiresAt
    ? new Date(integration.tokenExpiresAt)
    : new Date(0);
  const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60000);

  if (expiresAt > fiveMinutesFromNow) {
    return {
      accessToken: integration.accessToken,
      storeId: integration.storeId,
    };
  }

  console.log("🔄 Token do ML vencido. Renovando...");

  const params = new URLSearchParams();
  params.append("grant_type", "refresh_token");
  params.append("client_id", process.env.ML_CLIENT_ID!);
  params.append("client_secret", process.env.ML_CLIENT_SECRET!);
  params.append("refresh_token", integration.refreshToken);

  const response = await fetch("https://api.mercadolibre.com/oauth/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: params,
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("❌ Falha ao renovar token:", errorBody);
    await prisma.storeIntegration.update({
      where: { id: integration.id },
      data: { isConnected: false },
    });
    throw new Error(
      "Sua conexão com o Mercado Livre expirou. Por favor, conecte novamente.",
    );
  }

  const data = await response.json();

  const updatedIntegration = await prisma.storeIntegration.update({
    where: { id: integration.id },
    data: {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      tokenExpiresAt: new Date(Date.now() + data.expires_in * 1000),
      updatedAt: new Date(),
    },
  });

  console.log("✅ Token renovado com sucesso!");

  return {
    accessToken: updatedIntegration.accessToken,
    storeId: updatedIntegration.storeId,
  };
}

// --- ACTIONS ---

export async function connectMercadoLivreAction(slug: string) {
  const appId = process.env.ML_CLIENT_ID;
  const redirectUri = process.env.ML_REDIRECT_URI;
  const state = slug;

  const authUrl = `https://auth.mercadolivre.com.br/authorization?response_type=code&client_id=${appId}&redirect_uri=${redirectUri}&state=${state}`;

  redirect(authUrl);
}

export async function testImportProductsAction(slug: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return { error: "Usuário não logado" };
    }

    const workspace = await prisma.workspace.findUnique({
      where: { slug: slug },
    });

    if (!workspace) {
      return { error: "Workspace não encontrado" };
    }

    const { accessToken, storeId } = await getMercadoLivreToken(
      session.user.id,
      workspace.id,
    );

    if (!storeId) return { error: "ID da loja não encontrado" };

    console.log("🔄 Buscando produtos no ML...");
    const products = await getSellerItems(accessToken, storeId);

    console.log("✅ SUCESSO! PRODUTOS ENCONTRADOS:");
    // 🔥 Sem ANY! O TypeScript agora sabe que p tem id, title e price
    products.forEach((p: MLItem) => {
      console.log(`- [${p.id}] ${p.title} | R$ ${p.price}`);
    });

    return { success: true, count: products.length };
  } catch (error: unknown) {
    // 🔥 Sem ANY! Usamos unknown e checamos o tipo abaixo
    console.error("Erro na action:", error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "Erro desconhecido ao tentar importar produtos" };
  }
}

export async function disconnectMercadoLivre(slug: string) {
  const session = await getServerSession();

  if (!session?.user) {
    return { error: "Não autorizado." };
  }

  try {
    const workspace = await prisma.workspace.findUnique({
      where: { slug: slug },
    });

    if (!workspace) {
      return { error: "Workspace não encontrado." };
    }

    await prisma.storeIntegration.deleteMany({
      where: {
        userId: session.user.id,
        workspaceId: workspace.id,
        platform: "MERCADO_LIVRE",
      },
    });

    revalidatePath(`/[slug]/settings/integrations`, "page");

    return { success: true };
  } catch (error) {
    console.error("Erro ao desconectar ML:", error);
    return { error: "Falha ao desconectar a integração." };
  }
}

export async function toggleMercadoLivreStore(
  integrationId: string,
  isActive: boolean,
) {
  const session = await getServerSession();

  if (!session?.user) {
    return { error: "Não autorizado." };
  }

  try {
    await prisma.storeIntegration.update({
      where: { id: integrationId },
      data: { isActive: isActive },
    });

    revalidatePath(`/[slug]/settings/integrations`, "page");

    return { success: true };
  } catch (error) {
    console.error("Erro ao alternar status da loja ML:", error);
    return { error: "Falha ao atualizar o status da loja." };
  }
}

export async function getMercadoLivreAuthUrl(slug: string) {
  const appId = process.env.ML_CLIENT_ID;
  const redirectUri = process.env.ML_REDIRECT_URI;
  const state = slug;

  const authUrl = `https://auth.mercadolivre.com.br/authorization?response_type=code&client_id=${appId}&redirect_uri=${redirectUri}&state=${state}`;

  return { url: authUrl };
}
