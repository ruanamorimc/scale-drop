"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function initiateNuvemshopAuth() {
  const clientId = process.env.NS_APP_ID;

  if (!clientId) {
    throw new Error("A variável de ambiente NS_APP_ID não está configurada.");
  }

  const authUrl = `https://www.nuvemshop.com.br/apps/${clientId}/authorize`;

  return { success: true, url: authUrl };
}

export async function disconnectNuvemshopIntegration(
  userId: string,
  slug: string, // 🔥 Agora indicamos claramente que estamos recebendo o slug
) {
  try {
    // 🔍 PASSO 1: Traduzir o slug no ID verdadeiro do Workspace
    const workspace = await prisma.workspace.findUnique({
      where: { slug: slug },
    });

    if (!workspace) {
      return { success: false, error: "Workspace não encontrado." };
    }

    const realWorkspaceId = workspace.id;

    // 🔍 PASSO 2: Busca a integração para pegar os dados usando o ID Real
    const integration = await prisma.storeIntegration.findFirst({
      where: { userId, workspaceId: realWorkspaceId, platform: "NUVEMSHOP" },
    });

    if (!integration) {
      return { success: false, error: "Integração não encontrada." };
    }

    // 3. Limpeza de Webhooks na API da Nuvemshop (Silenciosa)
    if (integration.storeId && integration.accessToken) {
      try {
        const webhooksRes = await fetch(
          `https://api.nuvemshop.com/v1/${integration.storeId}/webhooks`,
          {
            method: "GET",
            headers: {
              Authentication: `bearer ${integration.accessToken}`,
              "User-Agent": "Scale Drop (contato@scaledrop.com.br)",
            },
          },
        );

        if (webhooksRes.ok) {
          const webhooks = await webhooksRes.json();
          const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";

          for (const webhook of webhooks) {
            if (
              webhook.url.includes(appUrl) ||
              webhook.url.includes("api/webhooks/nuvemshop")
            ) {
              await fetch(
                `https://api.nuvemshop.com/v1/${integration.storeId}/webhooks/${webhook.id}`,
                {
                  method: "DELETE",
                  headers: {
                    Authentication: `bearer ${integration.accessToken}`,
                    "User-Agent": "Scale Drop (contato@scaledrop.com.br)",
                  },
                },
              );
            }
          }
        }
      } catch (apiError) {
        console.error(
          "Erro ignorado ao limpar webhooks na Nuvemshop:",
          apiError,
        );
      }
    }

    // 4. Deleta do banco do Scale Drop usando o ID Real
    await prisma.storeIntegration.deleteMany({
      where: { userId, workspaceId: realWorkspaceId, platform: "NUVEMSHOP" },
    });

    revalidatePath("/settings/integrations");

    return { success: true };
  } catch (error) {
    console.error("Erro ao desconectar Nuvemshop:", error);
    return { success: false, error: "Falha ao desconectar Nuvemshop." };
  }
}
