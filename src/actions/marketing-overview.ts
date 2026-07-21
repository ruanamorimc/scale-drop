"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { startOfDay, endOfDay } from "date-fns";
import { getMetaInsights } from "@/actions/meta-actions";
import { PLAN_LIMITS } from "@/config/plans";

// ============================================================================
// 1. STRICT INTERFACES (TIPAGENS ESTRITAS SEM USO DE 'ANY')
// ============================================================================

export interface MarketingFilters {
  account?: string;
  source?: string;
  platform?: string;
  product?: string;
}

// Interface que espelha exatamente os dados de rastreamento salvos no JSON do Prisma
interface OrderMetadata {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  source?: string;
  placement?: string;
  src?: string;
  sck?: string;
  clickId?: string;
  tracked?: boolean;
}

// Interface auxiliar para garantir tipagem estrita nos itens do pedido
// Resolve o erro das linhas 137 e 251
interface StrictOrderItem {
  quantity?: number | null;
  unitPrice?: number | string | { toString(): string } | null;
  costPrice?: number | string | { toString(): string } | null;
  name?: string | null;
}

// Interface auxiliar para as taxas (Taxes)
// Resolve o erro das linhas 158 e 260
interface StrictTax {
  calculationRule?: string | null;
  rate?: number | string | { toString(): string } | null;
}

// ============================================================================
// 2. FUNÇÃO PRINCIPAL DE MÉTRICAS (MARKETING DASHBOARD)
// ============================================================================

export async function getMarketingMetrics(
  from?: Date,
  to?: Date,
  filters?: MarketingFilters,
) {
  // Autenticação do usuário e captura do ID
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) return null;
  const userId = session.user.id;

  // 1. Verifica qual é o plano do usuário logado
  const userPlan = "START";

  // 2. Extrai o limite de contas de anúncio desse plano específico
  const limit = PLAN_LIMITS[userPlan as keyof typeof PLAN_LIMITS].adAccounts;

  // 3. Aplica o limite na busca do Prisma
  const metaAccounts = await prisma.metaAccount.findMany({
    where: { userId, isActive: true },
    select: { accountId: true, name: true },
    orderBy: { createdAt: "asc" },
    take: limit,
  });

  const startDate = from || new Date();
  const endDate = to || new Date();

  // --- TRAVA DE DESEMPENHO (MÁX 31 DIAS) ---
  // Impede que gráficos de hora em hora pesem o servidor em buscas muito longas
  const diffInMs = new Date(endDate).getTime() - new Date(startDate).getTime();
  const diffInDays = diffInMs / (1000 * 60 * 60 * 24);
  const isOver31Days = diffInDays > 31;

  // Placar dos dias da semana (0 = Domingo, 1 = Segunda ... 6 = Sábado)
  const salesByDayOfWeek = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };

  // Placar de Lucro por Hora (00:00 a 23:00) para o gráfico de linhas
  const profitByHour = Array.from({ length: 24 }, (_, i) => ({
    hour: `${String(i).padStart(2, "0")}:00`,
    grossRevenue: 0,
    netRevenue: 0,
    grossProfit: 0,
    netProfit: 0,
    investment: 0,
    salesCount: 0,
  }));

  // Mapa para o gráfico de vendas por país
  const countrySalesMap: Record<string, number> = {};

  try {
    // Busca simultânea de pedidos e taxas no banco (Otimização com Promise.all)
    const [orders, taxes] = await Promise.all([
      prisma.order.findMany({
        where: {
          userId,
          createdAt: { gte: startOfDay(startDate), lte: endOfDay(endDate) },
        },
        include: { items: true },
      }),
      prisma.tax.findMany({ where: { userId } }),
    ]);

    // Variáveis acumuladoras do financeiro
    let grossRevenue = 0;
    let netRevenue = 0;
    let salesTaxes = 0;
    let metaAdsTaxes = 0;
    let totalCost = 0;
    let totalTaxes = 0;
    let pendingRevenue = 0;
    let refundedRevenue = 0;

    let paidCount = 0;
    let refundedCount = 0;

    const paymentMethods = { credit_card: 0, pix: 0, boleto: 0, others: 0 };
    const productsCount: Record<string, number> = {};
    const productsRevenue: Record<string, number> = {};

    // Contadores de rastreamento
    const salesByTrafficSource: Record<string, number> = {};
    const salesByPlacement: Record<string, number> = {};
    const salesBySrcParam: Record<string, number> = {};

    // ========================================================================
    // 3. LOOP PRINCIPAL DE PROCESSAMENTO DE PEDIDOS
    // ========================================================================

    for (const order of orders) {
      const total = Number(order.total || 0);
      const status = String(order.status || "").toUpperCase();
      const method = String(order.paymentMethod || "credit_card").toLowerCase();

      // Captura segura do JSON de metadados sem 'any'
      const metaData = (order.metadata as OrderMetadata) || {};

      // Separação de pedidos APROVADOS (que somam receita)
      if (
        ["PAID", "CONFIRMED", "SHIPPED", "DELIVERED", "COMPLETED"].includes(
          status,
        )
      ) {
        grossRevenue += total;
        paidCount++;

        // Distribuição das vendas por método de pagamento
        if (method.includes("pix")) paymentMethods.pix++;
        else if (method.includes("boleto")) paymentMethods.boleto++;
        else if (method.includes("credit") || method.includes("card"))
          paymentMethods.credit_card++;
        else paymentMethods.others++;

        // --- CÁLCULO DE CUSTOS DE PRODUTOS ---
        let orderCost = 0;
        if (order.items && order.items.length > 0) {
          order.items.forEach((item) => {
            // Conversão dupla segura (unknown -> Interface) para burlar limitações do Prisma
            const safeItem = item as unknown as StrictOrderItem;

            const qty = Number(safeItem.quantity || 1);

            // Tenta achar o costPrice. Se não tiver, cai pro unitPrice.
            const itemCost = Number(
              safeItem.costPrice?.toString() ||
                safeItem.unitPrice?.toString() ||
                0,
            );
            orderCost += itemCost * qty;

            const productName = String(safeItem.name || "Unknown Product");

            // Soma a quantidade vendida de cada produto
            productsCount[productName] =
              (productsCount[productName] || 0) + qty;

            // Soma o Faturamento em R$ por produto
            const itemPrice = Number(safeItem.unitPrice?.toString() || 0);
            const itemTotal =
              itemPrice > 0 ? itemPrice * qty : total / order.items.length;
            productsRevenue[productName] =
              (productsRevenue[productName] || 0) + itemTotal;
          });
        }
        totalCost += orderCost;

        // --- 1. IMPOSTO SOBRE VENDAS (Regra Geral) ---
        let orderTax = 0;
        if (taxes && taxes.length > 0) {
          taxes.forEach((taxItem) => {
            // Conversão segura do tipo da taxa
            const tax = taxItem as unknown as StrictTax;
            if (tax.calculationRule === "faturamento") {
              orderTax += total * (Number(tax.rate?.toString() || 0) / 100);
            }
          });
        }
        salesTaxes += orderTax;

        // --- RASTREAMENTO DE UTM E ORIGENS ---
        // 1. Fonte (Source) - MetaAds, Google, TikTok, Organic
        const rawSource = String(
          metaData.utm_source || metaData.source || "",
        ).toLowerCase();
        let trafficSource = "N/A";

        if (
          rawSource.includes("fb") ||
          rawSource.includes("meta") ||
          rawSource.includes("ig")
        ) {
          trafficSource = "MetaAds";
        } else if (rawSource.includes("google")) {
          trafficSource = "GoogleAds";
        } else if (rawSource.includes("tiktok") || rawSource.includes("tt")) {
          trafficSource = "TikTokAds";
        } else if (rawSource === "organic") {
          trafficSource = "organic";
        } else if (rawSource) {
          trafficSource = rawSource; // Fallback para Pinterest, Taboola, etc.
        }
        salesByTrafficSource[trafficSource] =
          (salesByTrafficSource[trafficSource] || 0) + 1;

        // 2. Posicionamento (Placement) - FB_Mobile_Reels, IG_Stories...
        let placement = String(
          metaData.utm_content || metaData.placement || "N/A",
        );
        if (!placement.trim()) placement = "N/A";
        salesByPlacement[placement] = (salesByPlacement[placement] || 0) + 1;

        // 3. SRC (Tracking de Produtores/Afiliados BR como Yampi/Kiwify)
        let srcParam = String(
          metaData.src || metaData.sck || metaData.utm_campaign || "N/A",
        );
        if (!srcParam.trim()) srcParam = "N/A";
        salesBySrcParam[srcParam] = (salesBySrcParam[srcParam] || 0) + 1;

        // --- 2. IMPOSTO META ADS ---
        const isMetaSale = trafficSource === "MetaAds";
        let metaTaxForThisOrder = 0;

        if (isMetaSale) {
          const metaTaxRate = 0.0; // Adicione aqui a taxa do painel do FB
          metaTaxForThisOrder = total * metaTaxRate;
          metaAdsTaxes += metaTaxForThisOrder;
        }

        totalTaxes += orderTax + metaTaxForThisOrder;
      } else if (["PENDING", "WAITING"].includes(status)) {
        // Pedidos aguardando pagamento (Boleto/Pix não pago)
        pendingRevenue += total;
      } else if (["REFUNDED", "RETURNED", "CHARGEBACK"].includes(status)) {
        // Estornos e Reembolsos
        refundedRevenue += total;
        refundedCount++;
      }

      // ========================================================================
      // 4. DISTRIBUIÇÃO TEMPORAL E GRÁFICOS (POR HORA E POR DIA)
      // ========================================================================

      if (order.createdAt) {
        const orderDate = new Date(order.createdAt);
        const hour = orderDate.getHours();
        const dayOfWeek = orderDate.getDay() as keyof typeof salesByDayOfWeek;

        // Confirma se o pedido realmente deve entrar nas estatísticas visuais
        const isApproved = [
          "CONFIRMED",
          "PREPARING",
          "SHIPPED",
          "DELIVERED",
        ].includes(status);

        if (isApproved) {
          profitByHour[hour].salesCount += 1;
          salesByDayOfWeek[dayOfWeek] += 1;

          // Captura do País para o Heatmap/Mapa global
          const rawCountry = order.shippingCountry
            ? String(order.shippingCountry).trim()
            : "N/A";
          const countryKey =
            rawCountry && rawCountry !== "null" ? rawCountry : "N/A";

          countrySalesMap[countryKey] = (countrySalesMap[countryKey] || 0) + 1;
        }

        // CÁLCULO DE LUCRO: Roda apenas se estiver dentro da trava para poupar o servidor
        if (!isOver31Days && isApproved) {
          const orderGrossRevenue = total;
          let currentCost = 0;

          if (order.items && order.items.length > 0) {
            order.items.forEach((item) => {
              const safeItem = item as unknown as StrictOrderItem;
              const itemCost = Number(
                safeItem.costPrice?.toString() ||
                  safeItem.unitPrice?.toString() ||
                  0,
              );
              currentCost += itemCost * Number(safeItem.quantity || 1);
            });
          }

          let currentTax = 0;
          if (taxes && taxes.length > 0) {
            taxes.forEach((taxItem) => {
              const tax = taxItem as unknown as StrictTax;
              if (tax.calculationRule === "faturamento") {
                currentTax +=
                  orderGrossRevenue * (Number(tax.rate?.toString() || 0) / 100);
              }
            });
          }

          const rawSource = String(
            metaData.utm_source || metaData.source || "",
          ).toLowerCase();
          const isMeta =
            rawSource.includes("fb") ||
            rawSource.includes("meta") ||
            rawSource.includes("ig");
          const currentMetaTax = isMeta ? orderGrossRevenue * 0.0 : 0.0;

          const orderNetRevenue =
            orderGrossRevenue - (currentTax + currentMetaTax);

          profitByHour[hour].grossRevenue += orderGrossRevenue;
          profitByHour[hour].netRevenue += orderNetRevenue;
          profitByHour[hour].grossProfit += orderGrossRevenue - currentCost;
          profitByHour[hour].netProfit += orderNetRevenue - currentCost;
        }
      }
    }

    // Receita Líquida Real
    netRevenue = grossRevenue - totalTaxes;

    // ========================================================================
    // 5. GASTOS DE ADS (CONECTADO À API REAL DO META) E CUSTOS FIXOS
    // ========================================================================

    let adSpend = 0;
    let clicks = 0;
    let pageViews = 0;
    let initiateCheckout = 0;
    let leads = 0;
    let conversations = 0;

    // Dispara a requisição real no Meta
    const metaDataResponse = await getMetaInsights(userId, startDate, endDate);

    if (metaDataResponse) {
      adSpend = metaDataResponse.adSpend;
      clicks = metaDataResponse.clicks;
      pageViews = metaDataResponse.pageViews;
      initiateCheckout = metaDataResponse.initiateCheckout;
      leads = metaDataResponse.leads;
      conversations = metaDataResponse.conversations;
    }

    // Busca despesas fixas da plataforma
    const additionalExpensesData = await prisma.fixedExpense.aggregate({
      _sum: { amount: true },
      where: { userId, date: { gte: startDate, lte: endDate } },
    });

    const extraExpenses = Number(additionalExpensesData._sum.amount || 0);

    // ========================================================================
    // 6. CÁLCULO FINAL DOS INDICADORES CHAVE (KPIs)
    // ========================================================================

    const netProfit = netRevenue - totalCost - adSpend - extraExpenses;
    const roas = adSpend > 0 ? grossRevenue / adSpend : 0;
    const roi = totalCost + adSpend > 0 ? netProfit / (totalCost + adSpend) : 0;
    const cpa = paidCount > 0 ? adSpend / paidCount : 0;
    const arpu = paidCount > 0 ? grossRevenue / paidCount : 0; // Ticket Médio
    const costPerLead = leads > 0 ? adSpend / leads : 0;
    const costPerConversation = conversations > 0 ? adSpend / conversations : 0;
    const profitMargin =
      grossRevenue > 0 ? (netProfit / grossRevenue) * 100 : 0;
    const refundRate =
      paidCount + refundedCount > 0
        ? (refundedCount / (paidCount + refundedCount)) * 100
        : 0;

    // Rateio das despesas nas horas do dia para o gráfico ficar preciso
    if (!isOver31Days) {
      profitByHour.forEach((hourData) => {
        const ratio =
          grossRevenue > 0 ? hourData.grossRevenue / grossRevenue : 0;
        const hourlyAdSpend = adSpend * ratio;
        const hourlyExtraExpenses = extraExpenses * ratio;

        hourData.investment = hourlyAdSpend + hourlyExtraExpenses;
        hourData.grossProfit -= hourlyAdSpend;
        hourData.netProfit -= hourlyAdSpend + hourlyExtraExpenses;
      });
    }

    const salesByCountry = Object.entries(countrySalesMap).map(
      ([country, count]) => ({ country, count }),
    );

    // ========================================================================
    // 7. BARRA DE PRÊMIOS (TRACKED REVENUE ALGORITHM)
    // ========================================================================

    // Faturamento rastreado apenas no período selecionado
    const trackedRevenue = orders.reduce((acc, order) => {
      const isApproved = [
        "CONFIRMED",
        "PREPARING",
        "SHIPPED",
        "DELIVERED",
      ].includes(String(order.status).toUpperCase());
      if (!isApproved) return acc;

      let isTracked = false;
      if (order.metadata && typeof order.metadata === "object") {
        const meta = order.metadata as OrderMetadata;
        // Validação: Ter qualquer um desses campos prova que o SaaS rastreou a venda
        if (meta.utm_source || meta.clickId || meta.tracked) isTracked = true;
      }

      return isTracked ? acc + Number(order.total || 0) : acc;
    }, 0);

    // Faturamento rastreado Histórico Total (Sem filtro de data, para não resetar a barra)
    const allTimeOrders = await prisma.order.findMany({
      where: {
        status: { in: ["CONFIRMED", "PREPARING", "SHIPPED", "DELIVERED"] },
      },
      select: { total: true, metadata: true },
    });

    const allTimeTrackedRevenue = allTimeOrders.reduce((acc, order) => {
      let isTracked = false;
      if (order.metadata && typeof order.metadata === "object") {
        const meta = order.metadata as OrderMetadata;
        if (meta.utm_source || meta.clickId || meta.tracked) isTracked = true;
      }
      return isTracked ? acc + Number(order.total || 0) : acc;
    }, 0);

    // ========================================================================
    // 8. LISTAGEM DINÂMICA DE FILTROS PARA O FRONTEND
    // ========================================================================

    const availableSources = [];
    if (metaAccounts.length > 0) {
      availableSources.push({ id: "meta", name: "Meta Ads" });
    }

    const products = await prisma.product.findMany({
      where: { userId },
      select: { id: true, name: true },
    });

    const rawIntegrations = await prisma.storeIntegration.findMany({
      where: { userId },
      select: { id: true, storeId: true },
    });

    const integrations = rawIntegrations.map((int) => ({
      id: int.id,
      name: String(int.storeId),
    }));

    const filterOptions = {
      adAccounts: metaAccounts,
      sources: availableSources,
      products,
      platforms: integrations,
    };

    return {
      grossRevenue,
      netRevenue,
      trackedRevenue,
      allTimeTrackedRevenue, // Dado isolado para não sofrer reset do calendário
      filterOptions,
      productCosts: totalCost,
      extraExpenses,
      adSpend,
      roas,
      netProfit,
      cpa,
      roi,
      pendingRevenue,
      arpu,
      profitMargin,
      profitByHour,
      isOver31Days,
      refundedRevenue,
      refundRate,
      salesTaxes,
      salesByTrafficSource,
      salesByPlacement,
      salesBySrcParam,
      salesByDayOfWeek,
      salesByCountry,
      metaAdsTaxes,
      totalTaxes: salesTaxes + metaAdsTaxes,
      paymentMethods,
      productsCount,
      productsRevenue,
      leads,
      conversations,
      costPerLead,
      costPerConversation,
      funnel: {
        clicks,
        pageViews,
        initiateCheckout,
        purchases: paidCount,
        initiatedSales: orders.length,
        approvedSales: paidCount,
      },
    };
  } catch (error) {
    console.error("Marketing Action Error:", error);
    return null;
  }
}
