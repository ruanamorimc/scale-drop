"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function saveShopifyIntegration(
  userId: string,
  data: { shopDomain: string; accessToken: string },
) {
  try {
    // 1. Limpeza do domínio
    const cleanDomain = data.shopDomain
      .replace(/^https?:\/\//, "")
      .replace(/\/$/, "")
      .trim();

    if (!data.accessToken.startsWith("shpat_")) {
      return { success: false, error: "O token deve começar com 'shpat_'" };
    }

    // 2. Salva no nosso Banco de Dados
    const existing = await prisma.storeIntegration.findFirst({
      where: { userId, platform: "SHOPIFY" },
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
      const created = await prisma.storeIntegration.create({
        data: {
          userId,
          platform: "SHOPIFY",
          storeName: cleanDomain,
          accessToken: data.accessToken,
          isConnected: true,
        },
      });
      integrationId = created.id;
    }

    // 3. A Mágica: Registrando os 4 Webhooks na Shopify via API
    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL || "https://seusite.ngrok.app";
    const webhookEndpoint = `${appUrl}/api/webhooks/shopify?id=${integrationId}`;

    // A lista de eventos que queremos ouvir da Shopify
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
          "Salvo no banco! Mas a Shopify recusou o registro automático dos webhooks (geralmente ocorre por usar 'localhost' no .env).",
        webhookUrl: webhookEndpoint,
      };
    }

    return { success: true, webhookUrl: webhookEndpoint };
  } catch (error) {
    console.error("Erro ao salvar Shopify:", error);
    return { success: false, error: "Falha interna ao salvar integração." };
  }
}

export async function disconnectShopifyIntegration(userId: string) {
  try {
    await prisma.storeIntegration.deleteMany({
      where: { userId, platform: "SHOPIFY" },
    });
    revalidatePath("/settings/integrations");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Falha ao desconectar Shopify." };
  }
}
