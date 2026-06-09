"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

type IntegrationData = {
  accessToken?: string;
  storeUrl?: string;
  externalStoreId?: string;
  alias?: string;
  apiToken?: string;
};

export async function cancelOrder(orderId: string) {
  try {
    // 1. Busca os dados do pedido e a integração para o cancelamento externo
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { storeIntegration: true },
    });

    if (!order) {
      return { success: false, error: "Pedido não encontrado." };
    }

    // 2. Integração (Avançado) - Sincronização com a plataforma original
    // 2. Integração: Comunicação com a API da loja raiz
    const platform = order.storeIntegration?.platform;

    // ATENÇÃO: Verifique no seu schema.prisma os nomes exatos dessas propriedades
    const integration = order.storeIntegration as IntegrationData | null;

    // Executa apenas se tivermos a plataforma e o ID do pedido na loja original
    if (platform && order.externalOrderId && integration) {
      try {
        switch (String(platform).toUpperCase()) {
          case "SHOPIFY":
            if (integration.accessToken && integration.storeUrl) {
              const shopifyRes = await fetch(
                `https://${integration.storeUrl}/admin/api/2024-01/orders/${order.externalOrderId}/cancel.json`,
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    "X-Shopify-Access-Token": integration.accessToken,
                  },
                },
              );
              if (!shopifyRes.ok)
                console.error("Falha na Shopify:", await shopifyRes.text());
            }
            break;

          case "NUVEMSHOP":
            if (integration.accessToken && integration.externalStoreId) {
              const nuvemshopRes = await fetch(
                `https://api.nuvemshop.com.br/v1/${integration.externalStoreId}/orders/${order.externalOrderId}/cancel`,
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authentication: `bearer ${integration.accessToken}`,
                    "User-Agent": "ScaleDrop (contato@suaempresa.com.br)", // A Nuvemshop exige um User-Agent
                  },
                },
              );
              if (!nuvemshopRes.ok)
                console.error("Falha na Nuvemshop:", await nuvemshopRes.text());
            }
            break;

          case "MERCADOLIVRE":
            if (integration.accessToken) {
              // O ML geralmente usa um PUT para alterar o status do pedido
              const mlRes = await fetch(
                `https://api.mercadolibre.com/orders/${order.externalOrderId}`,
                {
                  method: "PUT",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${integration.accessToken}`,
                  },
                  body: JSON.stringify({ status: "cancelled" }),
                },
              );
              if (!mlRes.ok)
                console.error("Falha no Mercado Livre:", await mlRes.text());
            }
            break;

          case "YAMPI":
            if (integration.alias && integration.apiToken) {
              const yampiRes = await fetch(
                `https://api.yampi.io/api/v2/orders/${order.externalOrderId}/cancel`,
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Alias: integration.alias,
                    Token: integration.apiToken,
                  },
                },
              );
              if (!yampiRes.ok)
                console.error("Falha na Yampi:", await yampiRes.text());
            }
            break;

          case "CARTPANDA":
            if (integration.accessToken) {
              const cartpandaRes = await fetch(
                `https://api.cartpanda.com/v1/orders/${order.externalOrderId}/cancel`,
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${integration.accessToken}`,
                  },
                },
              );
              if (!cartpandaRes.ok)
                console.error("Falha no Cartpanda:", await cartpandaRes.text());
            }
            break;

          default:
            console.warn(
              `Plataforma ${platform} não mapeada para cancelamento automático.`,
            );
            break;
        }
      } catch (error) {
        // Apenas logamos o erro para não quebrar a tela do usuário caso a API externa caia
        console.error(
          `Erro de comunicação ao cancelar pedido na ${platform}:`,
          error,
        );
      }
    }

    // 3. Atualiza o status no banco de dados local (Prisma)
    await prisma.order.update({
      where: { id: orderId },
      data: { status: "CANCELLED" },
    });

    // 4. Invalida o cache da página de pedidos para forçar a atualização da tabela
    revalidatePath("/orders"); // Ajuste para a rota exata onde sua tabela fica

    return { success: true };
  } catch (error) {
    console.error("Erro ao cancelar o pedido:", error);
    return { success: false, error: "Ocorreu um erro interno ao cancelar." };
  }
}
