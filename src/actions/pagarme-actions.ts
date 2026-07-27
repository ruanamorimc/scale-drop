"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function connectPagarme(
  userId: string,
  slug: string, // 🔥 Recebe o slug
  data: { secretKey: string; publicKey: string },
) {
  try {
    if (!data.secretKey || !data.publicKey) {
      return { success: false, error: "Ambas as chaves são obrigatórias." };
    }

    const workspace = await prisma.workspace.findUnique({
      where: { slug },
    });

    if (!workspace)
      return { success: false, error: "Workspace não encontrado." };

    const existing = await prisma.storeIntegration.findFirst({
      where: { userId, workspaceId: workspace.id, platform: "PAGARME" },
    });

    let integrationId = "";

    if (existing) {
      const updated = await prisma.storeIntegration.update({
        where: { id: existing.id },
        data: {
          accessToken: data.secretKey,
          publicKey: data.publicKey,
          isConnected: true,
          isActive: true,
        },
      });
      integrationId = updated.id;
    } else {
      const created = await prisma.storeIntegration.create({
        data: {
          userId,
          workspaceId: workspace.id, // 🔥 Salva com o ID real
          platform: "PAGARME",
          storeName: "Checkout Pagar.me",
          accessToken: data.secretKey,
          publicKey: data.publicKey,
          isConnected: true,
          isActive: true,
        },
      });
      integrationId = created.id;
    }

    revalidatePath("/settings/integrations");

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const webhookUrl = `${appUrl}/api/webhooks/pagarme?id=${integrationId}`;

    return { success: true, webhookUrl };
  } catch (error) {
    console.error("Erro ao conectar Pagar.me:", error);
    return { success: false, error: "Falha interna ao salvar credenciais." };
  }
}

export async function disconnectPagarmeIntegration(
  userId: string,
  slug: string, // 🔥 Recebe o slug
) {
  try {
    const workspace = await prisma.workspace.findUnique({
      where: { slug },
    });

    if (!workspace)
      return { success: false, error: "Workspace não encontrado." };

    await prisma.storeIntegration.deleteMany({
      where: {
        userId,
        workspaceId: workspace.id, // 🔥 Deleta focado no ID real
        platform: "PAGARME",
      },
    });

    revalidatePath("/settings/integrations");
    return { success: true };
  } catch (error) {
    console.error("Erro ao desconectar Pagar.me:", error);
    return { success: false, error: "Falha ao desconectar." };
  }
}
