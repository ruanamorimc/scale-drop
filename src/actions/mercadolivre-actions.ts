"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getSellerItems } from "@/services/mercado-livre";

/**
 * Função Mágica: Garante que sempre teremos um token válido.
 * Se estiver vencido, ela renova sozinha antes de devolver.
 */
async function getMercadoLivreToken(userId: string) {
  // 1. Busca a integração no banco
  const integration = await prisma.storeIntegration.findFirst({
    where: {
      userId: userId,
      platform: "MERCADO_LIVRE",
      isConnected: true,
    },
  });

  if (!integration || !integration.accessToken || !integration.refreshToken) {
    throw new Error(
      "Integração com Mercado Livre não encontrada ou incompleta.",
    );
  }

  // 2. Verifica se o token JÁ venceu (ou vai vencer nos próximos 5 minutos)
  // Adicionamos uma margem de segurança de 5 minutos
  const now = new Date();
  const expiresAt = integration.tokenExpiresAt
    ? new Date(integration.tokenExpiresAt)
    : new Date(0);
  const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60000);

  // SE O TOKEN AINDA É VÁLIDO: Retorna ele direto.
  if (expiresAt > fiveMinutesFromNow) {
    return {
      accessToken: integration.accessToken,
      storeId: integration.storeId,
    };
  }

  // 3. SE VENCEU: Vamos renovar! (Refresh Token Flow)
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
    // Se falhar a renovação, desconectamos a loja para o usuário conectar de novo
    await prisma.storeIntegration.update({
      where: { id: integration.id },
      data: { isConnected: false },
    });
    throw new Error(
      "Sua conexão com o Mercado Livre expirou. Por favor, conecte novamente.",
    );
  }

  const data = await response.json();

  // 4. Salva os novos tokens no Banco
  // O ML sempre devolve um Access Token novo E um Refresh Token novo. Temos que salvar ambos.
  const updatedIntegration = await prisma.storeIntegration.update({
    where: { id: integration.id },
    data: {
      accessToken: data.access_token,
      refreshToken: data.refresh_token, // O "Pulo do Gato": O ML troca o refresh token também!
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

export async function connectMercadoLivreAction() {
  const appId = process.env.ML_CLIENT_ID;
  const redirectUri = process.env.ML_REDIRECT_URI;
  const state = "random_state_string"; // Em produção, use algo aleatório seguro

  const authUrl = `https://auth.mercadolivre.com.br/authorization?response_type=code&client_id=${appId}&redirect_uri=${redirectUri}&state=${state}`;

  redirect(authUrl);
}

// Essa é a action que você está chamando no botão
export async function testImportProductsAction(_formData?: FormData) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return { error: "Usuário não logado" };
    }

    // 👇 AQUI MUDOU: Em vez de buscar direto no prisma, chamamos nossa função inteligente
    // Ela vai renovar o token sozinha se precisar.
    const { accessToken, storeId } = await getMercadoLivreToken(
      session.user.id,
    );

    if (!storeId) return { error: "ID da loja não encontrado" };

    console.log("🔄 Buscando produtos no ML...");
    const products = await getSellerItems(accessToken, storeId);

    console.log("✅ SUCESSO! PRODUTOS ENCONTRADOS:");
    products.forEach((p) => {
      console.log(`- [${p.id}] ${p.title} | R$ ${p.price}`);
    });

    return { success: true, count: products.length };
  } catch (error: any) {
    console.error("Erro na action:", error);
    return { error: error.message || "Erro desconhecido" };
  }
}
