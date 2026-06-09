"use server";

import prisma from "@/lib/prisma";
import { Order } from "@/app/(private)/orders/columns";

export async function getRecentOrders(): Promise<Order[]> {
  try {
    // 1. Busca as regras de impostos dinâmicos do banco
    const taxesConfig = await prisma.tax.findMany();

    // Busca o Simples Nacional (Sobre Faturamento)
    const revenueTaxConfig = taxesConfig.find(
      (t) => t.calculationRule === "Sobre Faturamento",
    );
    const revenueTaxRate = revenueTaxConfig
      ? Number(revenueTaxConfig.rate) / 100
      : 0;

    // Busca o imposto do Meta (Ad Spend)
    const metaTaxConfig = taxesConfig.find(
      (t) => t.calculationRule === "Ad Spend" || t.name.includes("Meta"),
    );
    const metaTaxRate = metaTaxConfig ? Number(metaTaxConfig.rate) / 100 : 0;

    // 2. Busca os pedidos incluindo Produtos para o CMV
    const orders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    const formattedOrders: Order[] = orders.map((order) => {
      // ==========================================
      // 1. FATURAMENTO
      // ==========================================
      const totalAmount = Number(order.total) || 0;

      // ==========================================
      // 2. CMV (CUSTO DO PRODUTO)
      // ==========================================
      const totalCmv = order.items.reduce((acc, item) => {
        const unitCost = Number(item.product?.costPrice) || 0;
        return acc + unitCost * item.quantity;
      }, 0);

      // ==========================================
      // 3. TAXAS DE GATEWAY (Com Fallback)
      // ==========================================
      // Lemos a coluna oficial que criamos no schema
      let gatewayFee = Number(order.gatewayFee) || 0;

      // Se o webhook da plataforma não enviou a taxa (veio 0), aplicamos a margem de segurança.
      // Exemplo: 4.99% do pedido + R$ 1,00 fixo. (Ajuste esses valores para a sua realidade)
      if (gatewayFee === 0) {
        gatewayFee = totalAmount * 0.0499 + 1.0;
      }

      // ==========================================
      // 4. CUSTO DE MARKETING (META ADS)
      // ==========================================
      const marketingCost = Number(order.marketingCost) || 0;

      // ==========================================
      // 5. CÁLCULO INTELIGENTE DE IMPOSTOS
      // ==========================================
      const taxOnRevenue = totalAmount * revenueTaxRate;

      // MÁGICA AQUI: Se marketingCost for 0, (0 * 12%) = 0.
      // O imposto do Meta SÓ é cobrado se o pedido teve Ad Spend!
      const taxOnAdSpend = marketingCost * metaTaxRate;

      const totalTaxes = taxOnRevenue + taxOnAdSpend;

      // ==========================================
      // 6. LUCRO LÍQUIDO FINAL
      // ==========================================
      const totalDeductions =
        totalCmv + gatewayFee + totalTaxes + marketingCost;
      const netProfit = totalAmount - totalDeductions;

      // --- RETORNO PERFEITO PARA A COLUNA DA TABELA ---
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

        date: new Intl.DateTimeFormat("pt-BR", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }).format(new Date(order.createdAt)),

        time: new Intl.DateTimeFormat("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        }).format(new Date(order.createdAt)),

        paymentStatus: order.paymentStatus
          ? String(order.paymentStatus).toLowerCase()
          : "pending",
        paymentMethod: order.paymentMethod
          ? String(order.paymentMethod)
          : "credit_card",
        status: order.status ? String(order.status).toLowerCase() : "pending",

        // Mapeia os itens corretamente para satisfazer o Type da tabela
        items: order.items.map((item) => ({
          name: item.name || "Produto",
          price: Number(item.unitPrice) || 0,
          image: item.product?.images?.[0] || "",
          quantity: item.quantity || 1,
        })),

        // Valores Financeiros
        amount: totalAmount,
        cmv: totalCmv,
        tax: totalTaxes + gatewayFee,
        marketing: marketingCost,
        netProfit: netProfit,
      } as Order;
    });

    return formattedOrders;
  } catch (error) {
    console.error("Erro ao buscar pedidos recentes:", error);
    return [];
  }
}
