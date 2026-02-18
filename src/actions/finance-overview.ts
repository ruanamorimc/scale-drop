"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import {
  startOfDay,
  endOfDay,
  subDays,
  differenceInDays,
  getHours,
} from "date-fns";

export async function getFinanceMetrics(from?: Date, to?: Date) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) return null;
  const userId = session.user.id;

  // Períodos
  const startDate = from || subDays(new Date(), 30);
  const endDate = to || new Date();
  const daysDiff = differenceInDays(endDate, startDate) || 1;
  const prevEndDate = subDays(startDate, 1);
  const prevStartDate = subDays(prevEndDate, daysDiff);

  try {
    const [currentData, prevData] = await Promise.all([
      fetchPeriodData(userId, startDate, endDate),
      fetchPeriodData(userId, prevStartDate, prevEndDate),
    ]);

    // Função de Cálculo de Porcentagem
    const calcTrend = (curr: number, prev: number) => {
      if (prev === 0) return curr > 0 ? 100 : 0;
      return ((curr - prev) / prev) * 100;
    };

    // Cálculos Auxiliares para CAC
    const currCPA =
      currentData.countPaid > 0
        ? currentData.adSpend / currentData.countPaid
        : 0;
    const prevCPA =
      prevData.countPaid > 0 ? prevData.adSpend / prevData.countPaid : 0;

    // --- OBJETO DE TRENDS COMPLETO ---
    const trends = {
      // Financeiro Básico
      revenue: calcTrend(currentData.totalPaid, prevData.totalPaid),
      profit: calcTrend(currentData.netProfit, prevData.netProfit),
      cost: calcTrend(currentData.totalCostOfGoods, prevData.totalCostOfGoods),
      marketing: calcTrend(currentData.adSpend, prevData.adSpend),
      tax: calcTrend(currentData.totalTaxAmount, prevData.totalTaxAmount),

      // Novas Métricas para CardMetrics
      orders: calcTrend(currentData.countPaid, prevData.countPaid),
      ticket: calcTrend(currentData.ticketAverage, prevData.ticketAverage),
      margin: calcTrend(currentData.margin, prevData.margin),
      roi: calcTrend(currentData.roi, prevData.roi),
      cac: calcTrend(currCPA, prevCPA),
    };

    return { ...currentData, trends };
  } catch (error) {
    console.error("Erro Action Finance:", error);
    return null;
  }
}

// ... (Mantenha a função fetchPeriodData igual à versão anterior que enviei, com o fixedExpensesList) ...
// Vou resumir a fetchPeriodData aqui para garantir que você tenha o arquivo completo se copiar tudo:

async function fetchPeriodData(userId: string, start: Date, end: Date) {
  const [orders, fees, taxes, fixedExpenses] = await Promise.all([
    prisma.order.findMany({
      where: {
        userId,
        createdAt: { gte: startOfDay(start), lte: endOfDay(end) },
      },
      include: { items: true },
    }),
    prisma.fee.findMany({ where: { userId } }),
    prisma.tax.findMany({ where: { userId } }),
    prisma.fixedExpense.findMany({
      where: { userId, date: { gte: startOfDay(start), lte: endOfDay(end) } },
      orderBy: { date: "desc" },
    }),
  ]);

  let totalPaid = 0;
  let countPaid = 0;
  let totalGenerated = 0;
  let countGenerated = orders.length;
  let totalPending = 0;
  let countPending = 0;
  let totalCostOfGoods = 0;
  let totalGatewayFees = 0;
  let totalTaxAmount = 0;
  let abandonedCount = 0;
  let abandonedValue = 0;

  const metrics = {
    card: {
      paid: 0,
      paidCount: 0,
      pending: 0,
      pendingCount: 0,
      refused: 0,
      refusedCount: 0,
    },
    pix: {
      paid: 0,
      paidCount: 0,
      pending: 0,
      pendingCount: 0,
      refused: 0,
      refusedCount: 0,
    },
    boleto: {
      paid: 0,
      paidCount: 0,
      pending: 0,
      pendingCount: 0,
      refused: 0,
      refusedCount: 0,
    },
  };

  const chartData = Array.from({ length: 24 }, (_, i) => ({
    name: `${i}h`,
    revenue: 0,
    profit: 0,
    tax: 0,
    marketing: 0,
    productcost: 0,
  }));
  const productMap = new Map();

  for (const order of orders) {
    const orderTotal = Number(order.total || 0);
    totalGenerated += orderTotal;
    const status = (order.status || "").toUpperCase();
    const methodRaw =
      (order as any).paymentMethod?.toLowerCase() || "credit_card";
    let methodType: "card" | "pix" | "boleto" = "card";
    if (methodRaw.includes("pix")) methodType = "pix";
    else if (methodRaw.includes("boleto")) methodType = "boleto";

    const isPaid = [
      "PAID",
      "CONFIRMED",
      "PROCESSING",
      "SHIPPED",
      "DELIVERED",
      "COMPLETED",
    ].includes(status);
    const isPending = ["PENDING", "PREPARING", "WAITING"].includes(status);
    const isRefused = [
      "CANCELED",
      "REFUSED",
      "DECLINED",
      "FAILED",
      "ABANDONED",
    ].includes(status);

    if (isRefused) {
      abandonedCount++;
      abandonedValue += orderTotal;
    }

    if (isPaid) {
      totalPaid += orderTotal;
      countPaid++;
      metrics[methodType].paid += orderTotal;
      metrics[methodType].paidCount++;

      let orderCost = 0;
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach((item: any) => {
          const cost = Number(item.costPrice || 0) * item.quantity;
          orderCost += cost;
          totalCostOfGoods += cost;
          const prodName = item.name || "Item";
          const current = productMap.get(prodName) || {
            name: prodName,
            sales: 0,
            revenue: 0,
          };
          current.sales += item.quantity;
          current.revenue += Number(item.price || 0) * item.quantity;
          productMap.set(prodName, current);
        });
      }

      let orderFees = 0;
      fees.forEach((fee) => {
        if (fee.type === "PERCENTAGE")
          orderFees += orderTotal * (Number(fee.value) / 100);
        else orderFees += Number(fee.value);
      });
      totalGatewayFees += orderFees;

      let orderTax = 0;
      taxes.forEach((tax) => {
        if (!tax.calculationRule || tax.calculationRule === "faturamento")
          orderTax += orderTotal * (Number(tax.rate) / 100);
      });
      totalTaxAmount += orderTax;

      const hour = getHours(order.createdAt);
      if (chartData[hour]) {
        chartData[hour].revenue += orderTotal;
        chartData[hour].productcost += orderCost;
        chartData[hour].tax += orderTax;
        chartData[hour].profit += orderTotal - orderCost - orderTax - orderFees;
      }
    } else if (isPending) {
      totalPending += orderTotal;
      countPending++;
      metrics[methodType].pending += orderTotal;
      metrics[methodType].pendingCount++;
    } else if (isRefused) {
      metrics[methodType].refused += orderTotal;
      metrics[methodType].refusedCount++;
    }
  }

  let totalFixedExpenses = 0;
  fixedExpenses.forEach(
    (exp) => (totalFixedExpenses += Number(exp.amount || 0)),
  );
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
  const topProducts = Array.from(productMap.values())
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 4);

  return {
    totalPaid,
    countPaid,
    totalGenerated,
    countGenerated,
    totalPending,
    countPending,
    netProfit,
    margin,
    roi,
    ticketAverage,
    totalCostOfGoods,
    totalGatewayFees,
    totalTaxAmount,
    totalFixedExpenses,
    totalExpenses,
    adSpend,
    abandonedCount,
    abandonedValue,
    fixedExpensesList: fixedExpenses.map((f) => ({
      ...f,
      amount: Number(f.amount),
    })),
    metrics,
    chartData,
    topProducts,
    cardPaidValue: metrics.card.paid,
    cardPaidCount: metrics.card.paidCount,
    pixPaidValue: metrics.pix.paid,
    pixPaidCount: metrics.pix.paidCount,
    boletoPaidValue: metrics.boleto.paid,
    boletoPaidCount: metrics.boleto.paidCount,
  };
}
