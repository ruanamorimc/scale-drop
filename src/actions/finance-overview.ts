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

// ============================================================================
// 1. FUNÇÃO PRINCIPAL: GET FINANCE METRICS (Exportada para a Dashboard)
// Responsável por orquestrar a busca de dados atuais, passados e calcular as tendências.
// ============================================================================
export async function getFinanceMetrics(from?: Date, to?: Date) {
  // 1.1 - Autenticação de Segurança (Garante que só o dono da loja veja isso)
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) return null;
  const userId = session.user.id;

  // 1.2 - Cálculo de Períodos (Para comparar o "Hoje" com o "Ontem" ou "Mês Passado")
  const startDate = from || subDays(new Date(), 30); // Padrão: últimos 30 dias
  const endDate = to || new Date();
  const daysDiff = differenceInDays(endDate, startDate) || 1;

  // Calcula o período exatamente igual, mas no passado, para a % de crescimento
  const prevEndDate = subDays(startDate, 1);
  const prevStartDate = subDays(prevEndDate, daysDiff);

  try {
    // 1.3 - Busca Paralela (Alta performance: busca o atual e o passado ao mesmo tempo)
    const [currentData, prevData] = await Promise.all([
      fetchPeriodData(userId, startDate, endDate),
      fetchPeriodData(userId, prevStartDate, prevEndDate),
    ]);

    // 1.4 - Função Matemática de Tendência (Ex: Cresceu 20% ou Caiu 10%)
    const calcTrend = (curr: number, prev: number) => {
      // Se não tinha vendas antes e agora tem, cresceu 100%
      if (prev === 0) return curr > 0 ? 100 : 0;
      return ((curr - prev) / prev) * 100;
    };

    // 1.5 - Cálculo de CAC (Custo de Aquisição por Cliente)
    const currCPA =
      currentData.countPaid > 0
        ? currentData.adSpend / currentData.countPaid
        : 0;
    const prevCPA =
      prevData.countPaid > 0 ? prevData.adSpend / prevData.countPaid : 0;

    // 1.6 - Montagem do Objeto de Tendências (% que aparece nos Cards)
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

    // Retorna todos os dados atuais + as porcentagens de crescimento
    return { ...currentData, trends };
  } catch (error) {
    console.error("❌ Erro Crítico na Action Finance:", error);
    return null;
  }
}

// ============================================================================
// 2. MOTOR DE CÁLCULO: FETCH PERIOD DATA
// O "Coração" do sistema. Vai no banco, varre todos os pedidos e faz a matemática.
// ============================================================================
async function fetchPeriodData(userId: string, start: Date, end: Date) {
  // 2.1 - Consulta no Banco de Dados (Tudo em Paralelo para ser Rápido)
  const [orders, fees, taxes, fixedExpenses, integrations, userData] =
    await Promise.all([
      // Puxa os Pedidos com seus Itens
      prisma.order.findMany({
        where: {
          userId,
          createdAt: { gte: startOfDay(start), lte: endOfDay(end) },
        },
        include: { items: true },
      }),
      // Puxa as Taxas de Gateway (Ex: 5% da Appmax)
      prisma.fee.findMany({ where: { userId } }),
      // Puxa Impostos (Ex: 6% de Simples Nacional)
      prisma.tax.findMany({ where: { userId } }),
      // Puxa Custos Fixos (Ex: Mensalidade Shopify, Contabilidade)
      prisma.fixedExpense.findMany({
        where: { userId, date: { gte: startOfDay(start), lte: endOfDay(end) } },
        orderBy: { date: "desc" },
      }),
      // Puxa Lojas Conectadas (Yampi, Shopify)
      prisma.storeIntegration.findMany({ where: { userId } }),
      // Puxa o Token da Meta no perfil do usuário
      prisma.user.findUnique({
        where: { id: userId },
        select: { metaAccessToken: true },
      }),
    ]);

  // 2.2 - Inicialização das Variáveis Acumuladoras
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

  // Organiza pagamentos por método (Cartão, Pix, Boleto)
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

  // Prepara o Gráfico de 24h
  const chartData = Array.from({ length: 24 }, (_, i) => ({
    name: `${i}h`,
    revenue: 0,
    profit: 0,
    tax: 0,
    marketing: 0,
    productcost: 0,
  }));

  const productMap = new Map();

  // 2.3 - O GRANDE LOOP DE PEDIDOS (Processa cada venda)
  for (const order of orders) {
    const orderTotal = Number(order.total || 0);
    totalGenerated += orderTotal;
    const status = (order.status || "").toUpperCase();

    // Identifica Forma de Pagamento
    const methodRaw =
      (order as any).paymentMethod?.toLowerCase() || "credit_card";
    let methodType: "card" | "pix" | "boleto" = "card";
    if (methodRaw.includes("pix")) methodType = "pix";
    else if (methodRaw.includes("boleto")) methodType = "boleto";

    // Agrupa Status
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

    // === SE O PEDIDO FOI PAGO ===
    if (isPaid) {
      totalPaid += orderTotal;
      countPaid++;
      metrics[methodType].paid += orderTotal;
      metrics[methodType].paidCount++;

      // Calcula o custo dos produtos vendidos no pedido
      let orderCost = 0;
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach((item: any) => {
          const cost = Number(item.costPrice || 0) * item.quantity;
          orderCost += cost;
          totalCostOfGoods += cost;

          // Guarda produto para o ranking de Mais Vendidos
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

      // Calcula Taxas do Gateway para este pedido
      let orderFees = 0;
      fees.forEach((fee) => {
        if (fee.type === "PERCENTAGE")
          orderFees += orderTotal * (Number(fee.value) / 100);
        else orderFees += Number(fee.value);
      });
      totalGatewayFees += orderFees;

      // Calcula Impostos para este pedido
      let orderTax = 0;
      taxes.forEach((tax) => {
        if (!tax.calculationRule || tax.calculationRule === "faturamento")
          orderTax += orderTotal * (Number(tax.rate) / 100);
      });
      totalTaxAmount += orderTax;

      // Alimenta o Gráfico de 24h
      const hour = getHours(order.createdAt);
      if (chartData[hour]) {
        chartData[hour].revenue += orderTotal;
        chartData[hour].productcost += orderCost;
        chartData[hour].tax += orderTax;
        chartData[hour].profit += orderTotal - orderCost - orderTax - orderFees;
      }

      // === SE O PEDIDO ESTÁ PENDENTE (Pix gerado, aguardando pgto) ===
    } else if (isPending) {
      totalPending += orderTotal;
      countPending++;
      metrics[methodType].pending += orderTotal;
      metrics[methodType].pendingCount++;

      // === SE O PEDIDO FOI RECUSADO ===
    } else if (isRefused) {
      metrics[methodType].refused += orderTotal;
      metrics[methodType].refusedCount++;
    }
  }

  // 2.4 - FECHAMENTO DE CONTAS DO MÊS
  // Soma Despesas Fixas
  let totalFixedExpenses = 0;
  fixedExpenses.forEach(
    (exp) => (totalFixedExpenses += Number(exp.amount || 0)),
  );

  // Anúncios (Atualmente zerado, será alimentado pela API do Facebook futuramente)
  const adSpend = 0;

  // Fórmulas Vitais
  const totalExpenses =
    totalCostOfGoods +
    totalGatewayFees +
    totalTaxAmount +
    adSpend +
    totalFixedExpenses;
  const netProfit = totalPaid - totalExpenses;

  // Margem e ROI (Proteção contra divisão por zero)
  const margin = totalPaid > 0 ? (netProfit / totalPaid) * 100 : 0;
  const roi = totalExpenses > 0 ? (netProfit / totalExpenses) * 100 : 0;
  const ticketAverage = countPaid > 0 ? totalPaid / countPaid : 0;

  // Top 4 Produtos Mais Vendidos
  const topProducts = Array.from(productMap.values())
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 4);

  // 2.5 - VERIFICAÇÃO DE INTEGRAÇÕES DE MARKETING ATIVAS
  // Busca na tabela de StoreIntegration e filtra
  const rawAdPlatforms = integrations
    .map((int) => int.platform?.toLowerCase() || "")
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

  // Busca na Tabela de User pelo Token
  if (userData?.metaAccessToken) {
    rawAdPlatforms.push("facebook");
  }

  // Remove duplicatas (Evita mostrar o logo do Face duas vezes)
  const activeAdPlatforms = Array.from(new Set(rawAdPlatforms));

  // 2.6 - RETORNO MASSIVO DE DADOS PARA A TELA
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
    activeAdPlatforms, // Usado pelo Card de Marketing para mostrar os Ícones (Meta/Google/TikTok)
  };
}
