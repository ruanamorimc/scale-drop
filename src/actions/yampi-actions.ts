"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function saveYampiIntegration(
  userId: string,
  slug: string, // 🔥 Recebe o slug
  data: { name: string; secretToken: string },
) {
  try {
    // 🔍 Traduz o slug no ID verdadeiro
    const workspace = await prisma.workspace.findUnique({
      where: { slug },
    });

    if (!workspace)
      return { success: false, error: "Workspace não encontrado." };

    const existing = await prisma.storeIntegration.findFirst({
      where: { userId, workspaceId: workspace.id, platform: "YAMPI" },
    });

    let integrationId = "";

    if (existing) {
      const updated = await prisma.storeIntegration.update({
        where: { id: existing.id },
        data: {
          storeName: data.name,
          accessToken: data.secretToken,
          isConnected: true,
        },
      });
      integrationId = updated.id;
    } else {
      const created = await prisma.storeIntegration.create({
        data: {
          userId,
          workspaceId: workspace.id, // 🔥 Salva com o ID real
          platform: "YAMPI",
          storeName: data.name,
          accessToken: data.secretToken,
          isConnected: true,
        },
      });
      integrationId = created.id;
    }

    revalidatePath("/settings/integrations");

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const webhookUrl = `${appUrl}/api/webhooks/yampi?id=${integrationId}`;

    return { success: true, webhookUrl };
  } catch (error) {
    console.error("Erro ao salvar Yampi:", error);
    return { success: false, error: "Falha ao salvar integração." };
  }
}

export async function disconnectYampiIntegration(
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
      where: { userId, workspaceId: workspace.id, platform: "YAMPI" },
    });

    revalidatePath("/settings/integrations");
    return { success: true };
  } catch (error) {
    console.error("Erro ao desconectar Yampi:", error);
    return { success: false, error: "Falha ao desconectar." };
  }
}
