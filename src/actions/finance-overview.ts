"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { startOfDay, endOfDay } from "date-fns";

export async function getFinanceMetrics(from?: Date, to?: Date) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) return null;
  const userId = session.user.id;

  // Se não vier data, pega os últimos 30 dias
  const startDate =
    from || new Date(new Date().setDate(new Date().getDate() - 30));
  const endDate = to || new Date();

  try {
    const [orders, fees, taxes, fixedExpenses] = await Promise.all([
      // 1. Busca Pedidos e Itens
      prisma.order.findMany({
        where: {
          userId,
          // Removemos o filtro de status aqui para pegar TUDO e filtrar no loop (evita erro de tipo)
          createdAt: { gte: startOfDay(startDate), lte: endOfDay(endDate) },
        },
        include: { items: true },
      }),
      // 2. Busca Configurações
      prisma.fee.findMany({ where: { userId } }),
      prisma.tax.findMany({ where: { userId } }),
      // 3. Busca Despesas Fixas (Tabela)
      prisma.fixedExpense.findMany({
        where: {
          userId,
          date: { gte: startOfDay(startDate), lte: endOfDay(endDate) },
        },
        orderBy: { date: "desc" },
      }),
    ]);

    // --- VARIÁVEIS ---
    let totalGenerated = 0;
    let countGenerated = orders.length;
    let totalPaid = 0;
    let countPaid = 0;
    let totalPending = 0;
    let countPending = 0;

    let cardPaidValue = 0;
    let cardPaidCount = 0;
    let pixPaidValue = 0;
    let pixPaidCount = 0;
    let boletoPaidValue = 0;
    let boletoPaidCount = 0;

    // Novas variáveis para Carrinhos Abandonados
    let abandonedCount = 0; // Inicializa com 0
    let abandonedValue = 0; // Inicializa com 0

    let totalCostOfGoods = 0;
    let totalGatewayFees = 0;
    let totalTaxAmount = 0;
    let totalShipping = 0;
    let totalDiscounts = 0;

    // --- LOOP ---
    for (const order of orders) {
      const orderTotal = Number(order.total || 0);
      totalGenerated += orderTotal;

      // Somar Frete e Desconto (se existirem no futuro)
      // totalShipping += Number(order.shipping || 0);
      // totalDiscounts += Number(order.discount || 0);

      // Normaliza o status para maiúsculo para evitar erros de digitação no banco
      const status = (order.status || "").toUpperCase();

      // Verifica se é pago (Ajuste a lista conforme seu banco)
      const isPaid = [
        "PAID",
        "CONFIRMED",
        "PROCESSING",
        "SHIPPED",
        "DELIVERED",
        "COMPLETED",
      ].includes(status);
      const isPending = ["PENDING", "PREPARING", "WAITING"].includes(status);

      // Lógica para Carrinhos Abandonados (Se tiver status 'ABANDONED' ou similar)
      const isAbandoned = ["ABANDONED", "CANCELED"].includes(status); // Ajuste conforme seus status reais

      if (isPaid) {
        totalPaid += orderTotal;
        countPaid++;

        // A. Custo dos Produtos (CMV) - O erro de "items" some aqui
        if (order.items && Array.isArray(order.items)) {
          order.items.forEach((item: any) => {
            totalCostOfGoods += Number(item.costPrice || 0) * item.quantity;
          });
        }

        // B. Método de Pagamento
        const method =
          (order as any).paymentMethod?.toLowerCase() || "credit_card";
        if (method.includes("pix")) {
          pixPaidValue += orderTotal;
          pixPaidCount++;
        } else if (method.includes("boleto")) {
          boletoPaidValue += orderTotal;
          boletoPaidCount++;
        } else {
          cardPaidValue += orderTotal;
          cardPaidCount++;
        }

        // C. Taxas Gateway
        fees.forEach((fee) => {
          if (fee.type === "PERCENTAGE") {
            totalGatewayFees += orderTotal * (Number(fee.value) / 100);
          } else {
            totalGatewayFees += Number(fee.value);
          }
        });

        // D. Impostos (Sobre Faturamento)
        taxes.forEach((tax) => {
          // Verifica se a regra é nula (padrão) ou explicitamente sobre faturamento
          if (
            !tax.calculationRule ||
            tax.calculationRule === "faturamento" ||
            tax.calculationRule === "Sobre Faturamento"
          ) {
            totalTaxAmount += orderTotal * (Number(tax.rate) / 100);
          }
        });
      } else if (isPending) {
        totalPending += orderTotal;
        countPending++;
      } else if (isAbandoned) {
        // Contabiliza abandonos
        abandonedCount++;
        abandonedValue += orderTotal;
      }
    }

    // --- CÁLCULO FINAL ---
    let totalFixedExpenses = 0;
    fixedExpenses.forEach((exp) => (totalFixedExpenses += Number(exp.amount)));

    // Marketing (Mockado = 0 por enquanto)
    const adSpend = 0;
    const totalExpenses =
      totalCostOfGoods +
      totalGatewayFees +
      totalTaxAmount +
      adSpend +
      totalFixedExpenses;
    const netProfit = totalPaid - totalExpenses;

    const margin = totalPaid > 0 ? (netProfit / totalPaid) * 100 : 0;
    const roi = totalExpenses > 0 ? (netProfit / totalExpenses) * 100 : 0;
    const ticketAverage = countPaid > 0 ? totalPaid / countPaid : 0;

    return {
      totalPaid,
      countPaid,
      totalGenerated,
      countGenerated,
      totalPending,
      countPending,
      cardPaidValue,
      cardPaidCount,
      pixPaidValue,
      pixPaidCount,
      boletoPaidValue,
      boletoPaidCount,
      netProfit,
      margin,
      roi,
      adSpend,
      totalCostOfGoods,
      totalGatewayFees,
      totalTaxAmount,
      totalFixedExpenses,
      fixedExpensesList: fixedExpenses.map((f) => ({
        ...f,
        amount: Number(f.amount),
      })),
      ticketAverage,
      totalShipping,
      totalDiscounts,
      abandonedCount, // Retorna a contagem
      abandonedValue, // Retorna o valor
    };
  } catch (error) {
    console.error("Erro Action Finance:", error);
    return null;
  }
}
