import prisma from "@/lib/prisma";
import { IntegrationProvider } from "@prisma/client";

// Tipagem do que o Mercado Livre devolve
interface MLTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number; // vem em segundos (ex: 21600)
  user_id?: number; // ID do vendedor no ML
}

export async function updateIntegrationTokens(
  userId: string,
  data: MLTokenResponse,
  workspaceId: string,
) {
  // 1. Verificação de Segurança
  // Se o Mercado Livre não mandou o user_id, não temos como salvar a loja correta.
  if (!data.user_id) {
    console.error(
      "❌ ERRO CRÍTICO: Mercado Livre não retornou o user_id na renovação do token.",
    );
    return; // Para a execução aqui para não quebrar o banco
  }

  // Calculamos a data exata que vai vencer (Agora + Segundos que o ML mandou)
  const expiresAt = new Date(Date.now() + data.expires_in * 1000);
  const storeId = data.user_id.toString(); // O ID da loja no ML

  // O "upsert" é mágico:
  // Se já existe a integração desse usuário, ele ATUALIZA.
  // Se não existe, ele CRIA uma nova.
  await prisma.storeIntegration.upsert({
    where: {
      // 1. Mudamos a chave de busca para usar o workspaceId
      workspaceId_platform_storeId: {
        workspaceId: workspaceId,
        platform: IntegrationProvider.MERCADO_LIVRE,
        storeId: storeId,
      },
    },
    update: {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      tokenExpiresAt: expiresAt,
      isConnected: true,
      lastSyncAt: new Date(),
    },
    create: {
      userId: userId,
      workspaceId: workspaceId, // 2. Adicionamos o workspaceId na criação!
      platform: IntegrationProvider.MERCADO_LIVRE,
      storeId: storeId,
      storeName: `Mercado Livre - ${storeId}`,
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      tokenExpiresAt: expiresAt,
      isConnected: true,
      isActive: true,
    },
  });

  console.log(
    `✅ Tokens do Mercado Livre atualizados com sucesso para a loja ${storeId}`,
  );
}
