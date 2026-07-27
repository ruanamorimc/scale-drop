"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// ==========================================
// 1. Função para Criar
// ==========================================
export async function getOrGenerateAppmaxWebhook(
  userId: string,
  slug: string, // 🔥 Mudamos o nome para deixar claro que estamos recebendo o slug
  storeName: string = "Minha Loja Appmax",
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

    // 🔍 PASSO 2: Procura se já existe no workspace (usando o ID verdadeiro)
    const existing = await prisma.storeIntegration.findFirst({
      where: { userId, workspaceId: realWorkspaceId, platform: "APPMAX" },
    });

    let integrationId = "";

    if (existing) {
      const updated = await prisma.storeIntegration.update({
        where: { id: existing.id },
        data: {
          storeName: storeName,
          isConnected: true,
        },
      });
      integrationId = updated.id;
    } else {
      const created = await prisma.storeIntegration.create({
        data: {
          userId,
          workspaceId: realWorkspaceId, // 🔥 Passando o ID verdadeiro pro banco!
          platform: "APPMAX",
          storeName: storeName,
          isActive: true,
          isConnected: true,
          accessToken: "webhook_inbound_only",
        },
      });
      integrationId = created.id;
    }

    revalidatePath("/settings/integrations");
    return { success: true, integrationId };
  } catch (error) {
    console.error("Erro Appmax Action:", error);
    return { success: false, error: "Falha ao gerar webhook" };
  }
}

// ==========================================
// 2. Função para Desconectar
// ==========================================
export async function disconnectAppmaxIntegration(
  userId: string,
  slug: string,
) {
  try {
    // 🔍 PASSO 1: Traduzir o slug no ID verdadeiro do Workspace
    const workspace = await prisma.workspace.findUnique({
      where: { slug: slug },
    });

    if (!workspace) {
      return { success: false, error: "Workspace não encontrado." };
    }

    // 🔍 PASSO 2: Deletar usando o ID verdadeiro
    await prisma.storeIntegration.deleteMany({
      where: {
        userId,
        workspaceId: workspace.id, // 🔥 ID Verdadeiro
        platform: "APPMAX",
      },
    });

    revalidatePath("/settings/integrations");
    return { success: true };
  } catch (error) {
    console.error("Erro ao desconectar Appmax:", error);
    return { success: false, error: "Erro ao desconectar" };
  }
}
