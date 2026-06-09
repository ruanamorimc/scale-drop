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

export async function syncOrderWithGateway(orderId: string) {
  try {
    // 1. Busca o pedido e os dados da integração
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { storeIntegration: true },
    });

    if (!order || !order.externalOrderId) {
      return { success: false, error: "Pedido ou ID externo não encontrado." };
    }

    const platform = order.storeIntegration?.platform;
    const integration = order.storeIntegration as IntegrationData | null;

    if (!platform || !integration) {
      return { success: false, error: "Integração não configurada para este pedido." };
    }

    let updatedStatus = order.status;
    let updatedTrackingNumber = order.trackingNumber;

    // 2. Consulta a API da plataforma para buscar o status em tempo real
    switch (String(platform).toUpperCase()) {
      case "SHOPIFY":
        if (integration.accessToken && integration.storeUrl) {
          const res = await fetch(
            `https://${integration.storeUrl}/admin/api/2024-01/orders/${order.externalOrderId}.json`,
            {
              headers: { "X-Shopify-Access-Token": integration.accessToken },
            }
          );
          if (res.ok) {
            const data = await res.json();
            // Mapeamento de exemplo da Shopify (ajuste conforme sua regra de negócio)
            const financialStatus = data.order?.financial_status; // ex: "paid", "pending"
            if (financialStatus) updatedStatus = financialStatus;
          }
        }
        break;

      case "NUVEMSHOP":
        if (integration.accessToken && integration.externalStoreId) {
          const res = await fetch(
            `https://api.nuvemshop.com.br/v1/${integration.externalStoreId}/orders/${order.externalOrderId}`,
            {
              headers: { 
                Authorization: `bearer ${integration.accessToken}`,
                "User-Agent": "ScaleDrop (contato@suaempresa.com.br)"
              },
            }
          );
          if (res.ok) {
            const data = await res.json();
            // Mapeamento de exemplo da Nuvemshop
            if (data.payment_status) updatedStatus = data.payment_status; // ex: "paid"
            if (data.shipping_tracking_number) updatedTrackingNumber = data.shipping_tracking_number;
          }
        }
        break;

      case "MERCADOLIVRE":
        if (integration.accessToken) {
          const res = await fetch(`https://api.mercadolibre.com/orders/${order.externalOrderId}`, {
            headers: { Authorization: `Bearer ${integration.accessToken}` },
          });
          if (res.ok) {
            const data = await res.json();
            if (data.status) updatedStatus = data.status;
          }
        }
        break;

      case "YAMPI":
        if (integration.alias && integration.apiToken) {
          const res = await fetch(`https://api.yampi.io/api/v2/orders/${order.externalOrderId}`, {
            headers: { Alias: integration.alias, Token: integration.apiToken },
          });
          if (res.ok) {
            const data = await res.json();
            if (data.data?.status) updatedStatus = data.data.status;
          }
        }
        break;

      case "CARTPANDA":
        if (integration.accessToken) {
          const res = await fetch(`https://api.cartpanda.com/v1/orders/${order.externalOrderId}`, {
            headers: { Authorization: `Bearer ${integration.accessToken}` },
          });
          if (res.ok) {
            const data = await res.json();
            if (data.order?.status) updatedStatus = data.order.status;
          }
        }
        break;
    }

    // 3. Verifica se algo de fato mudou para evitar updates desnecessários no banco
    if (updatedStatus !== order.status || updatedTrackingNumber !== order.trackingNumber) {
      await prisma.order.update({
        where: { id: orderId },
        data: { 
          status: updatedStatus,
          trackingNumber: updatedTrackingNumber
        },
      });
      
      // Invalida o cache para atualizar a tabela visual na hora
      revalidatePath("/orders");
      return { success: true, changed: true };
    }

    return { success: true, changed: false };
  } catch (error) {
    console.error("Erro na sincronização do pedido:", error);
    return { success: false, error: "Falha interna ao sincronizar dados." };
  }
}