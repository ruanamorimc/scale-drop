"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

// Função para Criar
export async function getOrGenerateAppmaxWebhook(
  storeName: string = "Minha Loja Appmax",
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) throw new Error("Não autorizado");

  try {
    const integration = await prisma.storeIntegration.upsert({
      where: {
        userId_platform: {
          userId: session.user.id,
          platform: "APPMAX",
        },
      },
      update: {
        storeName: storeName, // Atualiza o nome se já existir
      },
      create: {
        userId: session.user.id,
        platform: "APPMAX",
        storeName: storeName,
        isActive: true,
        accessToken: "webhook_inbound_only",
      },
    });

    revalidatePath("/settings/integrations");
    return { success: true, integrationId: integration.id };
  } catch (error) {
    console.error("Erro Appmax Action:", error);
    return { error: "Falha ao gerar webhook" };
  }
}

// 🔥 NOVA: Função para Desconectar
export async function disconnectAppmaxIntegration(userId: string) {
  try {
    await prisma.storeIntegration.delete({
      where: {
        userId_platform: {
          userId: userId,
          platform: "APPMAX",
        },
      },
    });
    revalidatePath("/settings/integrations");
    return { success: true };
  } catch (error) {
    console.error("Erro ao desconectar Appmax:", error);
    return { error: "Erro ao desconectar" };
  }
}
