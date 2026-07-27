"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function saveCartpandaIntegration(
  userId: string,
  slug: string, // 🔥 Recebe o slug
  data: { name: string },
) {
  try {
    const workspace = await prisma.workspace.findUnique({
      where: { slug },
    });

    if (!workspace)
      return { success: false, error: "Workspace não encontrado." };

    const existing = await prisma.storeIntegration.findFirst({
      where: { userId, workspaceId: workspace.id, platform: "CARTPANDA" },
    });

    let integrationId = "";

    if (existing) {
      const updated = await prisma.storeIntegration.update({
        where: { id: existing.id },
        data: {
          storeName: data.name,
          isConnected: true,
        },
      });
      integrationId = updated.id;
    } else {
      const created = await prisma.storeIntegration.create({
        data: {
          userId,
          workspaceId: workspace.id, // 🔥 Salva com o ID real
          platform: "CARTPANDA",
          storeName: data.name,
          accessToken: "",
          isConnected: true,
        },
      });
      integrationId = created.id;
    }

    revalidatePath("/settings/integrations");

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const baseUrl = `${appUrl}/api/webhooks/cartpanda?id=${integrationId}`;

    return { success: true, webhookUrl: baseUrl };
  } catch (error) {
    console.error("Erro ao salvar Cartpanda:", error);
    return { success: false, error: "Falha ao salvar integração." };
  }
}

export async function disconnectCartpandaIntegration(
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
      where: { userId, workspaceId: workspace.id, platform: "CARTPANDA" },
    });

    revalidatePath("/settings/integrations");
    return { success: true };
  } catch (error) {
    console.error("Erro ao desconectar Cartpanda:", error);
    return { success: false, error: "Falha ao desconectar." };
  }
}
