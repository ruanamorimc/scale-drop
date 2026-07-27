"use server";

import prisma from "@/lib/prisma"
import { Order } from "@/app/(private)/[slug]/orders/columns";

export async function getRecentOrders(
  workspaceId: string,
  from?: Date,
  to?: Date,
  productId?: string,
): Promise<Order[]> {
  try {
    // 🔥 1. ISOLAMENTO DAS TAXAS: Busca apenas as taxas desta loja específica
    const taxesConfig = await prisma.tax.findMany({
      where: { workspaceId: workspaceId },
    });

    const revenueTaxConfig = taxesConfig.find(
      (t) => t.calculationRule === "Sobre Faturamento",
    );
    const revenueTaxRate = revenueTaxConfig
      ? Number(revenueTaxConfig.rate) / 100
      : 0;

    const metaTaxConfig = taxesConfig.find(
      (t) => t.calculationRule === "Ad Spend" || t.name.includes("Meta"),
    );
    const metaTaxRate = metaTaxConfig ? Number(metaTaxConfig.rate) / 100 : 0;

    // 🔥 2. ISOLAMENTO DOS PEDIDOS: Filtra os pedidos pelo workspaceId
    const orders = await prisma.order.findMany({
      where: {
        workspaceId: workspaceId, // <-- O isolamento principal entra aqui!
        ...(from || to
          ? {
              createdAt: {
                ...(from && { gte: from }),
                ...(to && { lte: to }),
              },
            }
          : {}),
        // Se houver um productId, busca pedidos cujos items contenham esse produto
        ...(productId
          ? {
              items: {
                some: {
                  productId: productId,
                },
              },
            }
          : {}),
      },
      orderBy: { createdAt: "desc" },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    const formattedOrders: Order[] = orders.map((order) => {
      const totalAmount = Number(order.total) || 0;

      const totalCmv =
        order.items?.reduce((acc, item) => {
          const unitCost = Number(item.product?.costPrice) || 0;
          return acc + unitCost * Number(item.quantity);
        }, 0) || 0;

      let gatewayFee = Number(order.gatewayFee) || 0;
      if (gatewayFee === 0) {
        gatewayFee = totalAmount * 0.0499 + 1.0;
      }

      const marketingCost = Number(order.marketingCost) || 0;
      const taxOnRevenue = totalAmount * revenueTaxRate;
      const taxOnAdSpend = marketingCost * metaTaxRate;
      const totalTaxes = taxOnRevenue + taxOnAdSpend;

      const totalDeductions =
        totalCmv + gatewayFee + totalTaxes + marketingCost;
      const netProfit = totalAmount - totalDeductions;

      const orderDate = new Date(order.createdAt);
      const dateFormatted = new Intl.DateTimeFormat("pt-BR").format(orderDate);
      const timeFormatted = new Intl.DateTimeFormat("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      }).format(orderDate);

      const rawPaymentMethod = (order.paymentMethod || "").toLowerCase();
      let displayMethod: "Cartão de Crédito" | "Pix" | "Boleto" =
        "Cartão de Crédito";

      if (rawPaymentMethod.includes("pix")) {
        displayMethod = "Pix";
      } else if (
        rawPaymentMethod.includes("boleto") ||
        rawPaymentMethod.includes("billet")
      ) {
        displayMethod = "Boleto";
      }

      const rawPaymentStatus = order.paymentStatus?.toLowerCase() || "pending";
      const finalPaymentStatus =
        rawPaymentStatus === "failed" ? "cancelled" : rawPaymentStatus;
      const rawOrderStatus = order.status?.toLowerCase() || "pending";

      return {
        id: order.id,
        invoiceId: order.orderNumber
          ? String(order.orderNumber)
          : `INV-${order.id.slice(0, 4).toUpperCase()}`,
        customer: {
          name: order.customerName || "Cliente Desconhecido",
          email: order.customerEmail || "sem@email.com",
          avatar: "",
        },
        date: dateFormatted,
        time: timeFormatted,

        paymentStatus: finalPaymentStatus as
          | "paid"
          | "pending"
          | "cancelled"
          | "refunded",
        paymentMethod: displayMethod,

        amount: totalAmount,
        cmv: totalCmv,
        tax: totalTaxes + gatewayFee,
        marketing: marketingCost,
        netProfit: netProfit,

        status: rawOrderStatus as
          | "pending"
          | "processing"
          | "confirmed"
          | "preparing"
          | "shipped"
          | "delivered"
          | "cancelled"
          | "returned",

        items:
          order.items?.map((item) => ({
            name: item.name || "Produto",
            price: Number(item.unitPrice) || 0,
            image: item.product?.images?.[0] || "",
            quantity: item.quantity || 1,
          })) || [],
      } as Order;
    });

    return formattedOrders;
  } catch (error) {
    console.error("Erro ao buscar pedidos recentes:", error);
    return [];
  }
}
