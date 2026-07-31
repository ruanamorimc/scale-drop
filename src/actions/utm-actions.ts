"use server";

import prisma from "@/lib/prisma";

export type UtmGroupBy =
  | "utm_campaign"
  | "utm_medium"
  | "utm_source"
  | "utm_content"
  | "utm_term"
  | "src"
  | "keyword";

// ============================================================================
// 1. TIPAGENS ESTRITAS E COMPLEXAS
// ============================================================================
interface ReportItem {
  name: string;
  sales: number;
  revenue: number;
  sales_pending: number;
  pending_revenue: number;
  sales_refunded: number;
  refund_revenue: number;
  sales_total: number;
  gross_revenue: number;
  spent: number;
  clicks: number;
  impressions: number;
  atc: number;
  ic: number;
  page_views: number;
  leads: number;
  conversations: number;
  video3s: number;
  video75: number;
  video100: number;
}

interface MetaAction {
  action_type: string;
  value: string;
}

// ============================================================================
// 1. ATUALIZAÇÃO DA INTERFACE (Adicionando Adset e Ad)
// ============================================================================
interface MetaInsight {
  spend?: string;
  clicks?: string;
  impressions?: string;
  actions?: MetaAction[];
  video_3_sec_watched_actions?: MetaAction[];
  video_p75_watched_actions?: MetaAction[];
  video_p100_watched_actions?: MetaAction[];
  campaign_name?: string;
  adset_name?: string; // 🔥 Novo
  ad_name?: string; // 🔥 Novo
}

// ============================================================================
// 2. BUSCA NO META ADS (BUSCA DINÂMICA E COM DADOS DE VÍDEO)
// ============================================================================
async function fetchMetaInsights(
  accessToken: string,
  startDate: Date,
  endDate: Date,
  groupBy: UtmGroupBy, // 🔥 Recebe o parâmetro para saber o que pedir ao Face
  targetAccountIds?: string[],
): Promise<MetaInsight[]> {
  try {
    const since = startDate.toISOString().split("T")[0];
    const until = endDate.toISOString().split("T")[0];

    const accountsRes = await fetch(
      `https://graph.facebook.com/v19.0/me/adaccounts?fields=account_id&access_token=${accessToken}`,
    );

    if (!accountsRes.ok) return [];
    const accountsData = await accountsRes.json();
    if (!accountsData.data || accountsData.data.length === 0) return [];

    const allInsights: MetaInsight[] = [];

    // 🔥 Lógica Dinâmica de Nível (Campaign, Adset ou Ad)
    let level = "campaign";
    let nameField = "campaign_name";

    if (groupBy === "utm_term") {
      level = "adset";
      nameField = "adset_name";
    } else if (groupBy === "utm_content") {
      level = "ad";
      nameField = "ad_name";
    }

    for (const acc of accountsData.data) {
      if (
        targetAccountIds &&
        targetAccountIds.length > 0 &&
        !targetAccountIds.includes("all") &&
        !targetAccountIds.includes(acc.account_id)
      ) {
        continue;
      }

      // 🔥 Request blindada com o nível correto baseado no filtro da tela
      const insightsRes = await fetch(
        `https://graph.facebook.com/v19.0/act_${acc.account_id}/insights?level=${level}&fields=${nameField},spend,clicks,impressions,actions,video_3_sec_watched_actions,video_p75_watched_actions,video_p100_watched_actions&time_range={'since':'${since}','until':'${until}'}&access_token=${accessToken}`,
      );

      if (insightsRes.ok) {
        const insightsData = await insightsRes.json();
        if (insightsData.data) {
          allInsights.push(...insightsData.data);
        }
      }
    }
    return allInsights;
  } catch (error) {
    console.error("Erro Crítico ao buscar dados do Meta Ads:", error);
    return [];
  }
}

// ============================================================================
// 3. ROTA PRINCIPAL E CÁLCULO DE BI
// ============================================================================
export async function getUtmReport(
  workspaceId: string,
  groupBy: UtmGroupBy,
  startDate?: Date,
  endDate?: Date,
  productIds?: string[],
  accountIds?: string[],
  platforms: ("meta" | "google")[] = ["meta", "google"],
) {
  try {
    const start =
      startDate || new Date(new Date().setDate(new Date().getDate() - 30));
    const end = endDate || new Date();
    const reportMap = new Map<string, ReportItem>();

    const normalizeKey = (key: string | null | undefined) => {
      if (!key || key.trim() === "") return "sem_rastreio";
      return key.trim().toLowerCase();
    };

    // 🔥 Funções auxiliares para identificar a origem da venda
    const isMetaSource = (source: string | null) => {
      if (!source) return false;
      return ["facebook", "fb", "instagram", "ig", "meta"].includes(
        source.toLowerCase(),
      );
    };

    const isGoogleSource = (source: string | null) => {
      if (!source) return false;
      return ["google", "youtube", "gads"].includes(source.toLowerCase());
    };

    // ------------------------------------------------------------------------
    // ETAPA 1: BANCO DE DADOS | O PRISMA AGORA PUXA TODOS OS STATUS E COLUNAS NATIVAS DE ALTA PERFORMANCE
    // ------------------------------------------------------------------------
    const orders = await prisma.order.findMany({
      where: {
        workspaceId,
        createdAt: { gte: start, lte: end },
        ...(productIds && productIds.length > 0 && !productIds.includes("all")
          ? { productId: { in: productIds } }
          : {}),
      },
      select: {
        total: true,
        status: true,
        utmCampaign: true,
        utmSource: true,
        utmMedium: true,
        utmContent: true,
        utmTerm: true,
        src: true,
        keyword: true,
      },
    });

    orders.forEach((order) => {
      // 🔥 O FILTRO DOS BOTÕES APLICADO NO BANCO DE DADOS
      if (!platforms.includes("meta") && isMetaSource(order.utmSource)) return;
      if (!platforms.includes("google") && isGoogleSource(order.utmSource))
        return;

      // 🔥 Como o webhook já salvou no lugar certo, puxamos direto da coluna nativa!
      let rawKey = order.utmCampaign;
      if (groupBy === "utm_source") rawKey = order.utmSource;
      if (groupBy === "utm_medium") rawKey = order.utmMedium;
      if (groupBy === "utm_content") rawKey = order.utmContent;
      if (groupBy === "utm_term") rawKey = order.utmTerm;
      if (groupBy === "src") rawKey = order.src;
      if (groupBy === "keyword") rawKey = order.keyword;

      const normalizedKey = normalizeKey(rawKey);
      const displayKey =
        rawKey && rawKey.trim() !== "" ? rawKey.trim() : "Sem Rastreio";

      if (!reportMap.has(normalizedKey)) {
        reportMap.set(normalizedKey, {
          name: displayKey,
          sales: 0,
          revenue: 0,
          sales_pending: 0,
          pending_revenue: 0,
          sales_refunded: 0,
          refund_revenue: 0,
          sales_total: 0,
          gross_revenue: 0,
          spent: 0,
          clicks: 0,
          impressions: 0,
          atc: 0,
          ic: 0,
          page_views: 0,
          leads: 0,
          conversations: 0,
          video3s: 0,
          video75: 0,
          video100: 0,
        });
      }

      const current = reportMap.get(normalizedKey)!;
      const orderTotal = Number(order.total) || 0;
      const status = order.status || "";

      current.sales_total += 1;
      current.gross_revenue += orderTotal;

      if (
        [
          "CONFIRMED",
          "PROCESSING",
          "PREPARING",
          "SHIPPED",
          "DELIVERED",
        ].includes(status)
      ) {
        current.sales += 1;
        current.revenue += orderTotal;
      } else if (["PENDING"].includes(status)) {
        current.sales_pending += 1;
        current.pending_revenue += orderTotal;
      } else if (
        ["RETURNED", "CANCELLED", "REFUNDED", "FAILED"].includes(status)
      ) {
        current.sales_refunded += 1;
        current.refund_revenue += orderTotal;
      }
    });

    // ------------------------------------------------------------------------
    // ETAPA 2: META ADS (Extraindo Tráfego, Funil e Vídeos)
    // ------------------------------------------------------------------------
    if (platforms.includes("meta")) {
      // A TRAVA PARA TOGGLE SOURCE
      const workspace = await prisma.workspace.findUnique({
        where: { id: workspaceId },
        select: { user: { select: { metaAccessToken: true } } },
      });

      const metaToken = workspace?.user?.metaAccessToken;

      if (metaToken) {
        // 🔥 Passamos o groupBy para a função saber o que buscar!
        const metaInsights = await fetchMetaInsights(
          metaToken,
          start,
          end,
          groupBy,
          accountIds,
        );

        metaInsights.forEach((insight: MetaInsight) => {
          const spent = parseFloat(insight.spend || "0");
          const clicks = parseInt(insight.clicks || "0", 10);
          const impressions = parseInt(insight.impressions || "0", 10);

          // 🔥 Cruzamento dinâmico: encontra a métrica exata de acordo com a seleção!
          let insightRawKey = insight.campaign_name;

          if (groupBy === "utm_term") insightRawKey = insight.adset_name;
          if (groupBy === "utm_content") insightRawKey = insight.ad_name;
          if (groupBy === "utm_source") insightRawKey = "facebook";
          if (groupBy === "utm_medium") insightRawKey = "cpc";

          const normalizedKey = normalizeKey(insightRawKey);

          if (!reportMap.has(normalizedKey)) {
            reportMap.set(normalizedKey, {
              name: insightRawKey || "Sem Identificação (Meta)",
              sales: 0,
              revenue: 0,
              sales_pending: 0,
              pending_revenue: 0,
              sales_refunded: 0,
              refund_revenue: 0,
              sales_total: 0,
              gross_revenue: 0,
              spent: 0,
              clicks: 0,
              impressions: 0,
              atc: 0,
              ic: 0,
              page_views: 0,
              leads: 0,
              conversations: 0,
              video3s: 0,
              video75: 0,
              video100: 0,
            });
          }

          const current = reportMap.get(normalizedKey)!;
          current.spent += spent;
          current.clicks += clicks;
          current.impressions += impressions;

          if (insight.actions) {
            insight.actions.forEach((act) => {
              const val = Number(act.value || 0);
              if (act.action_type === "add_to_cart") current.atc += val;
              if (act.action_type === "initiate_checkout") current.ic += val;
              if (
                act.action_type === "landing_page_view" ||
                act.action_type === "view_content"
              )
                current.page_views += val;
              if (act.action_type === "lead") current.leads += val;
              if (
                act.action_type ===
                  "onsite_conversion.messaging_conversation_started_7d" ||
                act.action_type === "contact" ||
                act.action_type === "message_replies"
              )
                current.conversations += val;
            });
          }

          // 🔥 Extrai dados de retenção de vídeo
          if (insight.video_3_sec_watched_actions)
            current.video3s += Number(
              insight.video_3_sec_watched_actions[0]?.value || 0,
            );
          if (insight.video_p75_watched_actions)
            current.video75 += Number(
              insight.video_p75_watched_actions[0]?.value || 0,
            );
          if (insight.video_p100_watched_actions)
            current.video100 += Number(
              insight.video_p100_watched_actions[0]?.value || 0,
            );
        });
      }
    }

    // TODO No futuro, a integração do Google Ads vai entrar logo aqui embaixo!

    // ------------------------------------------------------------------------
    // ETAPA 3: O GRANDE MOTOR DE CÁLCULO
    // ------------------------------------------------------------------------
    const finalReport = Array.from(reportMap.values()).map((item) => {
      const profit = item.revenue - item.spent;
      const taxes = item.spent * 0.03; // Impostos de 3% sobre o gasto
      const product_costs = item.sales * 15; // R$ 15 de custo fixo por produto

      return {
        ...item,
        profit,
        total_spent: item.spent,
        roas: item.spent > 0 ? item.revenue / item.spent : 0,
        roi: item.spent > 0 ? profit / item.spent : 0,
        margin: item.revenue > 0 ? (profit / item.revenue) * 100 : 0,
        arpu: item.sales > 0 ? item.revenue / item.sales : 0,

        cpa: item.sales > 0 ? item.spent / item.sales : 0,
        cpc: item.clicks > 0 ? item.spent / item.clicks : 0,
        cpm: item.impressions > 0 ? (item.spent / item.impressions) * 1000 : 0,
        cpp: item.sales_pending > 0 ? item.spent / item.sales_pending : 0,
        cpt: item.sales_total > 0 ? item.spent / item.sales_total : 0,
        cpl: item.leads > 0 ? item.spent / item.leads : 0,
        cpi: item.ic > 0 ? item.spent / item.ic : 0,
        cost_per_convo:
          item.conversations > 0 ? item.spent / item.conversations : 0,
        cpv: item.page_views > 0 ? item.spent / item.page_views : 0,

        icr: item.page_views > 0 ? (item.ic / item.page_views) * 100 : 0,
        conversion_rate:
          item.page_views > 0 ? (item.sales / item.page_views) * 100 : 0,
        ctr: item.impressions > 0 ? (item.clicks / item.impressions) * 100 : 0,
        frequency:
          item.impressions > 0 && item.clicks > 0
            ? item.impressions / item.clicks
            : 1,
        con_rate: item.clicks > 0 ? (item.page_views / item.clicks) * 100 : 0,

        // 🔥 Matemática de Retenção de Vídeo aplicada
        hook_rate:
          item.impressions > 0 ? (item.video3s / item.impressions) * 100 : 0,
        hold_rate:
          item.impressions > 0 ? (item.video75 / item.impressions) * 100 : 0,
        video_retention:
          item.impressions > 0 ? (item.video100 / item.impressions) * 100 : 0,

        taxes,
        product_costs,
      };
    });

    finalReport.sort((a, b) => {
      if (b.profit !== a.profit) return b.profit - a.profit;
      if (b.revenue !== a.revenue) return b.revenue - a.revenue;
      return b.spent - a.spent;
    });

    return { success: true, data: finalReport };
  } catch (error) {
    console.error("Erro crítico na geração do Relatório de UTMs:", error);
    return { success: false, data: [] };
  }
}
