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
  addDays,
  addMonths,
  startOfMonth,
  format,
} from "date-fns";

export async function getFinanceMetrics(
  from?: Date,
  to?: Date,
  productId?: string,
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) return null;
  const userId = session.user.id;

  const startDate = from || new Date();
  const endDate = to || new Date();
  const daysDiff = differenceInDays(endDate, startDate);

  const prevEndDate = subDays(startDate, 1);
  const prevStartDate = subDays(prevEndDate, daysDiff);

  try {
    const [currentData, prevData] = await Promise.all([
      fetchPeriodData(userId, startDate, endDate, productId),
      fetchPeriodData(userId, prevStartDate, prevEndDate, productId),
    ]);

    const calcTrend = (curr: number, prev: number) => {
      if (prev === 0) return curr > 0 ? 100 : 0;
      return ((curr - prev) / prev) * 100;
    };

    const currCPA =
      currentData.countPaid > 0
        ? currentData.adSpend / currentData.countPaid
        : 0;
    const prevCPA =
      prevData.countPaid > 0 ? prevData.adSpend / prevData.countPaid : 0;

    const trends = {
      revenue: calcTrend(currentData.totalPaid, prevData.totalPaid),
      profit: calcTrend(currentData.netProfit, prevData.netProfit),
      cost: calcTrend(currentData.totalCostOfGoods, prevData.totalCostOfGoods),
      marketing: calcTrend(currentData.adSpend, prevData.adSpend),
      tax: calcTrend(currentData.totalTaxAmount, prevData.totalTaxAmount),
      orders: calcTrend(currentData.countPaid, prevData.countPaid),
      ticket: calcTrend(currentData.ticketAverage, prevData.ticketAverage),
      margin: calcTrend(currentData.margin, prevData.margin),
      roi: calcTrend(currentData.roi, prevData.roi),
      cac: calcTrend(currCPA, prevCPA),
    };

    return { ...currentData, trends };
  } catch (error) {
    console.error("❌ Erro Crítico na Action Finance:", error);
    return null;
  }
}

async function fetchPeriodData(
  userId: string,
  start: Date,
  end: Date,
  productId?: string,
) {
  const [orders, fees, taxes, fixedExpenses, integrations, userData] =
    await Promise.all([
      prisma.order.findMany({
        where: {
          userId,
          createdAt: { gte: startOfDay(start), lte: endOfDay(end) },
          ...(productId ? { items: { some: { productId } } } : {}),
        },
        include: { items: true },
      }),
      prisma.fee.findMany({ where: { userId } }),
      prisma.tax.findMany({ where: { userId } }),
      prisma.fixedExpense.findMany({
        where: { userId, date: { gte: startOfDay(start), lte: endOfDay(end) } },
        orderBy: { date: "desc" },
      }),
      prisma.storeIntegration.findMany({ where: { userId } }),
      prisma.user.findUnique({
        where: { id: userId },
        select: { metaAccessToken: true },
      }),
    ]);

  let totalPaid = 0;
  let countPaid = 0;
  let totalGenerated = 0;
  const countGenerated = orders.length;
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

  // ==========================================
  // INICIALIZAÇÃO DOS 5 MAPAS DE GRÁFICO
  // ==========================================
  const chartData = Array.from({ length: 24 }, (_, i) => ({
    name: `${i}h`,
    revenue: 0,
    profit: 0,
    tax: 0,
    marketing: 0,
    productcost: 0,
  }));

  const totalDays = differenceInDays(endOfDay(end), startOfDay(start)) + 1;
  const isMonthly = totalDays > 31;
  const timelineMap = new Map();

  if (isMonthly) {
    let currentMonth = startOfMonth(start);
    while (currentMonth <= endOfDay(end)) {
      const dateKey = format(currentMonth, "yyyy-MM");
      timelineMap.set(dateKey, {
        name: format(currentMonth, "MM/yyyy"),
        revenue: 0,
        profit: 0,
        tax: 0,
        marketing: 0,
        productcost: 0,
      });
      currentMonth = addMonths(currentMonth, 1);
    }
  } else {
    for (let i = 0; i < totalDays; i++) {
      const currentDay = addDays(startOfDay(start), i);
      const dateKey = format(currentDay, "yyyy-MM-dd");
      timelineMap.set(dateKey, {
        name: format(currentDay, "dd/MM"),
        revenue: 0,
        profit: 0,
        tax: 0,
        marketing: 0,
        productcost: 0,
      });
    }
  }

  const turnoMap = new Map([
    [
      "Manhã",
      {
        name: "Manhã",
        revenue: 0,
        profit: 0,
        tax: 0,
        marketing: 0,
        productcost: 0,
      },
    ],
    [
      "Tarde",
      {
        name: "Tarde",
        revenue: 0,
        profit: 0,
        tax: 0,
        marketing: 0,
        productcost: 0,
      },
    ],
    [
      "Noite",
      {
        name: "Noite",
        revenue: 0,
        profit: 0,
        tax: 0,
        marketing: 0,
        productcost: 0,
      },
    ],
    [
      "Madrugada",
      {
        name: "Madrugada",
        revenue: 0,
        profit: 0,
        tax: 0,
        marketing: 0,
        productcost: 0,
      },
    ],
  ]);

  const weekMap = new Map([
    [
      "Dom",
      {
        name: "Dom",
        revenue: 0,
        profit: 0,
        tax: 0,
        marketing: 0,
        productcost: 0,
      },
    ],
    [
      "Seg",
      {
        name: "Seg",
        revenue: 0,
        profit: 0,
        tax: 0,
        marketing: 0,
        productcost: 0,
      },
    ],
    [
      "Ter",
      {
        name: "Ter",
        revenue: 0,
        profit: 0,
        tax: 0,
        marketing: 0,
        productcost: 0,
      },
    ],
    [
      "Qua",
      {
        name: "Qua",
        revenue: 0,
        profit: 0,
        tax: 0,
        marketing: 0,
        productcost: 0,
      },
    ],
    [
      "Qui",
      {
        name: "Qui",
        revenue: 0,
        profit: 0,
        tax: 0,
        marketing: 0,
        productcost: 0,
      },
    ],
    [
      "Sex",
      {
        name: "Sex",
        revenue: 0,
        profit: 0,
        tax: 0,
        marketing: 0,
        productcost: 0,
      },
    ],
    [
      "Sáb",
      {
        name: "Sáb",
        revenue: 0,
        profit: 0,
        tax: 0,
        marketing: 0,
        productcost: 0,
      },
    ],
  ]);

  const regionMap = new Map([
    [
      "Sul",
      {
        name: "Sul",
        revenue: 0,
        profit: 0,
        tax: 0,
        marketing: 0,
        productcost: 0,
      },
    ],
    [
      "Sudeste",
      {
        name: "Sudeste",
        revenue: 0,
        profit: 0,
        tax: 0,
        marketing: 0,
        productcost: 0,
      },
    ],
    [
      "Centro-Oeste",
      {
        name: "Centro-Oeste",
        revenue: 0,
        profit: 0,
        tax: 0,
        marketing: 0,
        productcost: 0,
      },
    ],
    [
      "Nordeste",
      {
        name: "Nordeste",
        revenue: 0,
        profit: 0,
        tax: 0,
        marketing: 0,
        productcost: 0,
      },
    ],
    [
      "Norte",
      {
        name: "Norte",
        revenue: 0,
        profit: 0,
        tax: 0,
        marketing: 0,
        productcost: 0,
      },
    ],
    [
      "Outros",
      {
        name: "Outros",
        revenue: 0,
        profit: 0,
        tax: 0,
        marketing: 0,
        productcost: 0,
      },
    ],
  ]);

  const productMap = new Map();

  for (const order of orders) {
    const orderTotal = Number(order.total || 0);
    totalGenerated += orderTotal;
    const status = (order.status || "").toUpperCase();

    const methodRaw = String(
      order.paymentMethod || "credit_card",
    ).toLowerCase();
    let methodType: "card" | "pix" | "boleto" = "card";

    if (methodRaw.includes("pix")) methodType = "pix";
    else if (methodRaw.includes("boleto") || methodRaw.includes("billet"))
      methodType = "boleto";

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
      "CANCELLED",
      "RETURNED",
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
        order.items.forEach((item) => {
          const rawCost = (item as { costPrice?: number | string | null })
            .costPrice;
          const cost = Number(rawCost || 0) * Number(item.quantity || 1);

          orderCost += cost;
          totalCostOfGoods += cost;

          const prodName = item.name || "Item";
          const current = productMap.get(prodName) || {
            name: prodName,
            sales: 0,
            revenue: 0,
          };
          current.sales += Number(item.quantity || 1);

          const rawPrice = item.unitPrice;
          current.revenue += Number(rawPrice || 0) * Number(item.quantity || 1);

          productMap.set(prodName, current);
        });
      }

      let orderFees = 0;
      fees.forEach((fee) => {
        if (fee.type === "PERCENTAGE") {
          orderFees += orderTotal * (Number(fee.value) / 100);
        } else {
          orderFees += Number(fee.value);
        }
      });
      totalGatewayFees += orderFees;

      let orderTax = 0;
      taxes.forEach((tax) => {
        if (tax.calculationRule === "faturamento") {
          orderTax += orderTotal * (Number(tax.rate) / 100);
        }
      });
      totalTaxAmount += orderTax;

      const currentProfit = orderTotal - orderCost - orderTax - orderFees;
      const orderDate = new Date(order.createdAt);
      const hour = orderDate.getHours();

      // 1. Array de 24h
      if (chartData[hour]) {
        chartData[hour].revenue += orderTotal;
        chartData[hour].productcost += orderCost; // Corrigido C minúsculo
        chartData[hour].tax += orderTax;
        chartData[hour].profit += currentProfit;
      }

      // 2. Array da Timeline
      const dateKey = isMonthly
        ? format(orderDate, "yyyy-MM")
        : format(orderDate, "yyyy-MM-dd");
      if (timelineMap.has(dateKey)) {
        const dayData = timelineMap.get(dateKey);
        dayData.revenue += orderTotal;
        dayData.productcost += orderCost; // Corrigido C minúsculo
        dayData.tax += orderTax;
        dayData.profit += currentProfit;
      }

      // 🔥 3. Array do Turno
      let turno = "Madrugada";
      if (hour >= 6 && hour < 12) turno = "Manhã";
      else if (hour >= 12 && hour < 18) turno = "Tarde";
      else if (hour >= 18 && hour <= 23) turno = "Noite";

      const tData = turnoMap.get(turno)!;
      tData.revenue += orderTotal;
      tData.productcost += orderCost; // Corrigido C minúsculo
      tData.tax += orderTax;
      tData.profit += currentProfit;

      // 🔥 4. Array da Semana
      const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
      const wData = weekMap.get(dayNames[orderDate.getDay()])!;
      wData.revenue += orderTotal;
      wData.productcost += orderCost; // Corrigido C minúsculo
      wData.tax += orderTax;
      wData.profit += currentProfit;

      // 🔥 5. Array de Região (Mapeando a UF)
      // Fim do erro de 'any': Ensinamos o TypeScript a esperar essas propriedades de forma segura
      const safeOrder = order as unknown as {
        customerState?: string | null;
        state?: string | null;
        shippingState?: string | null;
      };

      const uf = String(
        safeOrder.customerState ||
          safeOrder.state ||
          safeOrder.shippingState ||
          "",
      ).toUpperCase();

      let region = "Outros";
      if (["PR", "RS", "SC"].includes(uf)) region = "Sul";
      else if (["ES", "MG", "RJ", "SP"].includes(uf)) region = "Sudeste";
      else if (["DF", "GO", "MT", "MS"].includes(uf)) region = "Centro-Oeste";
      else if (
        ["AL", "BA", "CE", "MA", "PB", "PE", "PI", "RN", "SE"].includes(uf)
      )
        region = "Nordeste";
      else if (["AC", "AP", "AM", "PA", "RO", "RR", "TO"].includes(uf))
        region = "Norte";

      const rData = regionMap.get(region);
      if (rData) {
        rData.revenue += orderTotal;
        rData.productcost += orderCost; // Corrigido C minúsculo
        rData.tax += orderTax;
        rData.profit += currentProfit;
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
  fixedExpenses.forEach((exp) => {
    totalFixedExpenses += Number(exp.amount || 0);
  });

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

  const rawAdPlatforms = integrations
    .map((int) => (int.platform || "").toLowerCase())
    .filter(
      (p) =>
        p.includes("facebook") ||
        p.includes("meta") ||
        p.includes("google") ||
        p.includes("tiktok"),
    )
    .map((p) => {
      if (p.includes("facebook") || p.includes("meta")) return "facebook";
      if (p.includes("google")) return "google";
      if (p.includes("tiktok")) return "tiktok";
      return p;
    });

  if (userData?.metaAccessToken) rawAdPlatforms.push("facebook");

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
    timelineData: Array.from(timelineMap.values()),
    turnoData: Array.from(turnoMap.values()),
    weekData: Array.from(weekMap.values()),
    regionData: Array.from(regionMap.values()).filter(
      (r) => r.revenue > 0 || r.name !== "Outros",
    ),
    topProducts,
    cardPaidValue: metrics.card.paid,
    cardPaidCount: metrics.card.paidCount,
    pixPaidValue: metrics.pix.paid,
    pixPaidCount: metrics.pix.paidCount,
    boletoPaidValue: metrics.boleto.paid,
    boletoPaidCount: metrics.boleto.paidCount,
    activeAdPlatforms: Array.from(new Set(rawAdPlatforms)),
  };
}
