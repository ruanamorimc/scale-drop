"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function saveYampiIntegration(userId: string, data: { name: string; secretToken: string }) {
  try {
    // Procura se já tem uma integração da Yampi
    const existing = await prisma.storeIntegration.findFirst({
      where: { userId, platform: "YAMPI" }
    });

    let integrationId = "";

    if (existing) {
      // Atualiza a existente
      const updated = await prisma.storeIntegration.update({
        where: { id: existing.id },
        data: { 
          storeName: data.name, // 🔥 CORREÇÃO: Usando 'storeName' conforme o Schema
          accessToken: data.secretToken,
          isConnected: true
        }
      });
      integrationId = updated.id;
    } else {
      // Cria uma nova
      const created = await prisma.storeIntegration.create({
        data: {
          userId,
          platform: "YAMPI",
          storeName: data.name, // 🔥 CORREÇÃO AQUI TAMBÉM
          accessToken: data.secretToken,
          isConnected: true
        }
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

export async function disconnectYampiIntegration(userId: string) {
  try {
    await prisma.storeIntegration.deleteMany({
      where: { userId, platform: "YAMPI" }
    });
    revalidatePath("/settings/integrations");
    return { success: true };
  } catch (error) {
    console.error("Erro ao desconectar Yampi:", error);
    return { success: false, error: "Falha ao desconectar." };
  }
}