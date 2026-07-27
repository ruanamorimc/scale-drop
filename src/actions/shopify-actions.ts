"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// ==========================================
// 1. AÇÕES DA LOJA (SHOPIFY FULL)
// ==========================================
export async function saveShopifyIntegration(
  userId: string,
  workspaceId: string, // 🔥 Novo parâmetro obrigatório
  data: { shopDomain: string; accessToken: string },
) {
  try {
    const cleanDomain = data.shopDomain
      .replace(/^https?:\/\//, "")
      .replace(/\/$/, "")
      .trim();

    if (!data.accessToken.startsWith("shpat_")) {
      return { success: false, error: "O token deve começar com 'shpat_'" };
    }

    const existing = await prisma.storeIntegration.findFirst({
      where: { userId, workspaceId, platform: "SHOPIFY" },
    });

    let integrationId = "";

    if (existing) {
      const updated = await prisma.storeIntegration.update({
        where: { id: existing.id },
        data: {
          storeName: cleanDomain,
          accessToken: data.accessToken,
          isConnected: true,
        },
      });
      integrationId = updated.id;
    } else {
      // 🔥 Agora passamos o workspaceId exigido pelo Schema
      const created = await prisma.storeIntegration.create({
        data: {
          userId,
          workspaceId,
          platform: "SHOPIFY",
          storeName: cleanDomain,
          accessToken: data.accessToken,
          isConnected: true,
        },
      });
      integrationId = created.id;
    }

    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL || "https://seusite.ngrok.app";
    const webhookEndpoint = `${appUrl}/api/webhooks/shopify?id=${integrationId}`;

    const topics = [
      "orders/create",
      "orders/paid",
      "orders/updated",
      "orders/cancelled",
    ];

    let hasError = false;

    for (const topic of topics) {
      const shopifyResponse = await fetch(
        `https://${cleanDomain}/admin/api/2024-01/webhooks.json`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Shopify-Access-Token": data.accessToken,
          },
          body: JSON.stringify({
            webhook: {
              topic: topic,
              address: webhookEndpoint,
              format: "json",
            },
          }),
        },
      );

      if (!shopifyResponse.ok) {
        hasError = true;
        const errData = await shopifyResponse.text();
        console.error(`Erro ao criar webhook ${topic}:`, errData);
      }
    }

    revalidatePath("/settings/integrations");

    if (hasError) {
      return {
        success: true,
        warning:
          "Salvo no banco! Mas a Shopify recusou o registro automático dos webhooks.",
        webhookUrl: webhookEndpoint,
      };
    }

    return { success: true, webhookUrl: webhookEndpoint };
  } catch (error) {
    console.error("Erro ao salvar Shopify:", error);
    return { success: false, error: "Falha interna ao salvar integração." };
  }
}

export async function disconnectShopifyIntegration(
  userId: string,
  workspaceId: string,
) {
  try {
    await prisma.storeIntegration.deleteMany({
      where: { userId, workspaceId, platform: "SHOPIFY" },
    });
    revalidatePath("/settings/integrations");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Falha ao desconectar Shopify." };
  }
}

// ==========================================
// 2. AÇÕES DO GATEWAY (SHOPIFY PAYMENTS)
// ==========================================
export async function saveShopifyPaymentsIntegration(
  userId: string,
  workspaceId: string, // 🔥 Novo parâmetro obrigatório
  data: { name: string },
) {
  try {
    const existing = await prisma.storeIntegration.findFirst({
      where: { userId, workspaceId, platform: "SHOPIFY_PAYMENTS" },
    });

    let integrationId = "";

    if (existing) {
      const updated = await prisma.storeIntegration.update({
        where: { id: existing.id },
        data: {
          storeName: data.name,
        },
      });
      integrationId = updated.id;
    } else {
      const created = await prisma.storeIntegration.create({
        data: {
          userId,
          workspaceId, // 🔥 Passando o workspaceId
          platform: "SHOPIFY_PAYMENTS",
          storeName: data.name,
          accessToken: "", // 🔥 Passando vazio para satisfazer o Schema
          isConnected: true,
        },
      });
      integrationId = created.id;
    }

    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL || "https://seusite.ngrok.app";
    const webhookEndpoint = `${appUrl}/api/webhooks/shopify-payments?id=${integrationId}`;

    revalidatePath("/settings/integrations");
    return { success: true, webhookUrl: webhookEndpoint };
  } catch (error) {
    console.error("Erro ao salvar Shopify Payments:", error);
    return { success: false, error: "Falha interna ao salvar webhook." };
  }
}

export async function disconnectShopifyPaymentsIntegration(
  userId: string,
  workspaceId: string,
) {
  try {
    await prisma.storeIntegration.deleteMany({
      where: { userId, workspaceId, platform: "SHOPIFY_PAYMENTS" },
    });
    revalidatePath("/settings/integrations");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Falha ao desconectar Shopify Payments." };
  }
}
