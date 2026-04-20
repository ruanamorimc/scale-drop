"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function saveCartpandaIntegration(
  userId: string,
  data: { name: string },
) {
  try {
    const existing = await prisma.storeIntegration.findFirst({
      where: { userId, platform: "CARTPANDA" },
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
          platform: "CARTPANDA",
          storeName: data.name,
          accessToken: "", // 🔥 SOLUÇÃO AQUI: Passamos vazio para o Prisma não reclamar
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

export async function disconnectCartpandaIntegration(userId: string) {
  try {
    await prisma.storeIntegration.deleteMany({
      where: { userId, platform: "CARTPANDA" },
    });
    revalidatePath("/settings/integrations");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Falha ao desconectar." };
  }
}
