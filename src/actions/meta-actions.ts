"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { PLAN_LIMITS } from "@/config/plans";

type JsonValue = string | number | boolean | null | JsonObject | JsonArray;
interface JsonObject {
  [key: string]: JsonValue;
}
type JsonArray = Array<JsonValue>;

type PixelData = {
  id?: string;
  name: string;
  pixelIds: string[];
  type: string;
  status: string;
  rules: JsonObject;
};

type MetaCreativeData = {
  url_tags?: string;
  ad_creative_link_data?: {
    tracking_url_type?: string;
  };
};

type MetaAdData = {
  id: string;
  name: string;
  creative?: MetaCreativeData;
};

type MetaAdsResponse = {
  data?: MetaAdData[];
};

interface MetaAction {
  action_type: string;
  value: string;
}

interface MetaInsightData {
  spend?: string;
  clicks?: string;
  impressions?: string;
  actions?: MetaAction[];
}

interface MetaItem {
  id: string;
  name: string;
  status: string;
  daily_budget?: string;
  lifetime_budget?: string;
  data?: MetaInsightData[];
  bid_info?: Record<string, string | number>;
  insights?: {
    data?: MetaInsightData[];
  };
}

// 1. BUSCAR TODOS OS PIXELS DO USUÁRIO
export async function getMetaPixels(userId: string) {
  try {
    const pixels = await prisma.metaPixel.findMany({
      where: { userId: userId },
      orderBy: { createdAt: "desc" },
    });
    return { success: true, data: pixels };
  } catch (error) {
    console.error("Erro ao buscar pixels:", error);
    return { success: false, error: "Falha ao buscar os pixels do Meta." };
  }
}

// 2. CRIAR OU EDITAR UM PIXEL
export async function saveMetaPixel(userId: string, data: PixelData) {
  try {
    const isEditing = data.id && !data.id.includes(".");

    if (isEditing) {
      const updatedPixel = await prisma.metaPixel.update({
        where: { id: data.id, userId: userId },
        data: {
          name: data.name,
          pixelIds: data.pixelIds,
          type: data.type,
          status: data.status,
          rules: data.rules as JsonObject,
        },
      });
      revalidatePath("/settings/integrations");
      return { success: true, data: updatedPixel };
    } else {
      const newPixel = await prisma.metaPixel.create({
        data: {
          userId: userId,
          name: data.name,
          pixelIds: data.pixelIds,
          type: data.type,
          status: data.status,
          rules: data.rules as JsonObject,
        },
      });
      revalidatePath("/settings/integrations");
      return { success: true, data: newPixel };
    }
  } catch (error) {
    console.error("Erro ao salvar pixel:", error);
    return {
      success: false,
      error: "Falha ao salvar as configurações do pixel.",
    };
  }
}

// 3. DELETAR UM PIXEL
export async function deleteMetaPixel(userId: string, pixelId: string) {
  try {
    await prisma.metaPixel.delete({
      where: { id: pixelId, userId: userId },
    });
    revalidatePath("/settings/integrations");
    return { success: true };
  } catch (error) {
    console.error("Erro ao deletar pixel:", error);
    return { success: false, error: "Falha ao deletar o pixel." };
  }
}

// 4. ATIVAR/DESATIVAR PIXEL
export async function toggleMetaPixelStatus(
  userId: string,
  pixelId: string,
  newStatus: string,
) {
  try {
    const updatedPixel = await prisma.metaPixel.update({
      where: { id: pixelId, userId: userId },
      data: { status: newStatus },
    });
    revalidatePath("/settings/integrations");
    return { success: true, data: updatedPixel };
  } catch (error) {
    console.error("Erro ao alterar status do pixel:", error);
    return { success: false, error: "Falha ao alterar o status do pixel." };
  }
}

// 5. BUSCAR CONTAS INTEGRADAS (USADO CONFIGURAÇÕES GERAIS)
export async function getMetaAccounts(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { metaAccessToken: true, plan: true },
    });

    let profileName = "Sua Conta Meta";
    let profileInitials = "ME";

    if (user?.metaAccessToken) {
      try {
        const profileRes = await fetch(
          `https://graph.facebook.com/v19.0/me?fields=name&access_token=${user.metaAccessToken}`,
        );
        const profileData = await profileRes.json();

        if (profileData.name) {
          profileName = profileData.name;
          profileInitials = profileData.name.substring(0, 2).toUpperCase();
        }
      } catch (e) {
        console.error("Falha ao buscar nome no Meta", e);
      }
    }

    const accounts = await prisma.metaAccount.findMany({
      where: { userId: userId },
      orderBy: { name: "asc" },
    });

    return {
      success: true,
      data: accounts,
      profileName,
      profileInitials,
      userPlan: user?.plan || "FREE",
    };
  } catch (error) {
    console.error("Erro ao buscar contas:", error);
    return { success: false, error: "Falha ao buscar as contas do Meta." };
  }
}

// 6. ALTERAR STATUS ATIVO/INATIVO DA CONTA NO SWITCH DO PAINEL
export async function toggleMetaAccountStatus(
  userId: string,
  id: string,
  isActive: boolean,
) {
  try {
    const updatedAccount = await prisma.metaAccount.update({
      where: { id: id, userId: userId },
      data: { isActive },
    });
    revalidatePath("/settings/integrations");
    return { success: true, data: updatedAccount };
  } catch (error) {
    console.error("Erro ao alterar status da conta:", error);
    return { success: false, error: "Falha ao alterar o status da conta." };
  }
}

// 7. BUSCAR CONTAS ATIVAS (PARA ALIMENTAR OS FILTROS DO GERENCIADOR)
export async function getActiveMetaAccounts(userId: string) {
  if (!userId) return [];

  try {
    // 1. Busca o plano real do usuário direto no banco de dados
    // Nota: Assumindo que você tenha um campo 'plan' ou similar no modelo User.
    // Se o seu Prisma usar outro nome (ex: 'stripePlan'), basta alterar no select abaixo.
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { plan: true }, // Altere 'plan' se o nome da sua coluna for diferente
    });

    // 2. Define o plano com fallback seguro para "START" caso esteja nulo/vazio
    const userPlan = (user?.plan || "START") as keyof typeof PLAN_LIMITS;

    // 3. Puxa o limite exato do arquivo de configurações central
    const limit = PLAN_LIMITS[userPlan]?.adAccounts || 1;

    // 4. Busca as contas respeitando estritamente a trava comercial do SaaS
    const accounts = await prisma.metaAccount.findMany({
      where: {
        userId: userId,
        isActive: true,
      },
      orderBy: { createdAt: "asc" }, // Garante a ordem cronológica
      take: limit, // Trava aplicada: o Prisma corta o excedente direto no banco
    });

    return accounts;
  } catch (error) {
    console.error("Erro ao buscar contas ativas do Meta:", error);
    return [];
  }
}

// =====================================================================
// 🔥 NÚCLEO AVANÇADO DE INSIGHTS DETALHADOS (CAMPANHAS, CONJUNTOS, ANÚNCIOS)
// =====================================================================

export async function getMetaDashboardData(
  userId: string,
  level: "contas" | "campanhas" | "conjuntos" | "anuncios",
  from: Date,
  to: Date,
  selectedAccountIds: string[],
) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { metaAccessToken: true },
    });

    if (!user?.metaAccessToken) return [];

    // Determina quais contas varrer (específicas ou todas as ativas do banco)
    const accountsWhere: {
      userId: string;
      isActive: boolean;
      accountId?: { in: string[] };
    } = { userId, isActive: true };
    if (selectedAccountIds.length > 0 && !selectedAccountIds.includes("all")) {
      accountsWhere.accountId = { in: selectedAccountIds };
    }

    const accounts = await prisma.metaAccount.findMany({
      where: accountsWhere,
    });
    if (accounts.length === 0) return [];

    const timeRange = {
      since: from.toISOString().split("T")[0],
      until: to.toISOString().split("T")[0],
    };

    const consolidatedRows: Record<
      string,
      string | number | null | undefined
    >[] = [];

    for (const account of accounts) {
      let url = "";

      if (level === "contas") {
        url = `https://graph.facebook.com/v19.0/${account.accountId}/insights?fields=spend,clicks,impressions,actions,cpc,ctr,cpm&time_range=${JSON.stringify(timeRange)}&access_token=${user.metaAccessToken}`;
      } else if (level === "campanhas") {
        url = `https://graph.facebook.com/v19.0/${account.accountId}/campaigns?fields=id,name,status,daily_budget,lifetime_budget,insights.time_range(${JSON.stringify(timeRange)}){spend,clicks,impressions,actions,cpc,ctr,cpm}&access_token=${user.metaAccessToken}`;
      } else if (level === "conjuntos") {
        url = `https://graph.facebook.com/v19.0/${account.accountId}/adsets?fields=id,name,status,daily_budget,lifetime_budget,insights.time_range(${JSON.stringify(timeRange)}){spend,clicks,impressions,actions,cpc,ctr,cpm}&access_token=${user.metaAccessToken}`;
      } else if (level === "anuncios") {
        url = `https://graph.facebook.com/v19.0/${account.accountId}/ads?fields=id,name,status,insights.time_range(${JSON.stringify(timeRange)}){spend,clicks,impressions,actions,cpc,ctr,cpm}&access_token=${user.metaAccessToken}`;
      }

      const res = await fetch(url);
      const resJson = await res.json();

      if (!resJson.data) continue;

      const items = level === "contas" ? [resJson] : resJson.data;

      items.forEach((item: MetaItem) => {
        let insights = item.insights?.data?.[0] || null;
        if (level === "contas") insights = item.data?.[0] || null;

        const spent = Number(insights?.spend || 0);
        const clicks = Number(insights?.clicks || 0);
        const impressions = Number(insights?.impressions || 0);

        let sales = 0;
        let revenue = 0;
        let atc = 0;
        let ic = 0;
        let page_views = 0;
        let leads = 0;
        let conversations_started = 0;

        if (insights?.actions) {
          insights.actions.forEach((act: MetaAction) => {
            if (
              act.action_type === "purchase" ||
              act.action_type === "offsite_conversion.fb_pixel_purchase"
            ) {
              sales += Number(act.value || 0);
            }
            if (
              act.action_type === "omni_purchase_value" ||
              act.action_type === "offsite_conversion.fb_pixel_purchase_value"
            ) {
              revenue += Number(act.value || 0);
            }
            if (act.action_type === "add_to_cart")
              atc += Number(act.value || 0);
            if (act.action_type === "initiate_checkout")
              ic += Number(act.value || 0);
            if (
              act.action_type === "landing_page_view" ||
              act.action_type === "view_content"
            )
              page_views += Number(act.value || 0);
            if (act.action_type === "lead") leads += Number(act.value || 0);
            if (
              act.action_type ===
              "onsite_conversion.messaging_conversation_started_7d"
            )
              conversations_started += Number(act.value || 0);
          });
        }

        const budget = item.daily_budget
          ? Number(item.daily_budget) / 100
          : item.lifetime_budget
            ? Number(item.lifetime_budget) / 100
            : null;
        const cpa = sales > 0 ? spent / sales : 0;
        const profit = revenue - spent;
        const roas = spent > 0 ? revenue / spent : 0;
        const roi = spent > 0 ? profit / spent : 0;
        const margin = revenue > 0 ? (profit / revenue) * 100 : 0;
        const cpc = clicks > 0 ? spent / clicks : 0;
        const cpm = impressions > 0 ? (spent / impressions) * 1000 : 0;
        const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
        const cpv = page_views > 0 ? spent / page_views : 0;
        const cpi = ic > 0 ? spent / ic : 0;

        consolidatedRows.push({
          id: item.id || account.accountId,
          status: item.status || "ACTIVE",
          name: item.name || account.name,
          budget,
          sales,
          cpa,
          spent,
          revenue,
          profit,
          roas,
          margin,
          roi,
          atc,
          ic,
          cpi,
          cpc,
          ctr,
          cpm,
          page_views,
          cpv,
          impressions,
          leads,
          conversations_started,
          bid_cap: item.bid_info ? Object.values(item.bid_info)[0] : null,
          account_status: "ACTIVE",
          cycle: "-",
          card: "-",
          last_update: new Date().toLocaleDateString("pt-BR"),
          meta_tax: spent * 0.03,
          gross_revenue: revenue,
          pending_revenue: revenue * 0.2,
          refunded_revenue: revenue * 0.05,
          arpu: sales > 0 ? revenue / sales : 0,
          cpp: ic > 0 ? spent / ic : 0,
          cpt: sales > 0 ? spent / sales : 0,
          cpl: leads > 0 ? spent / leads : 0,
          cost_per_ic: ic > 0 ? spent / ic : 0,
          cost_per_purchase_init: ic > 0 ? spent / ic : 0,
          cps: 0,
          sales_pending: Math.floor(sales * 0.2),
          sales_total: Math.floor(sales * 1.2),
          sales_rejected: Math.floor(sales * 0.05),
          sales_refunded: Math.floor(sales * 0.03),
          ic_rate: page_views > 0 ? (ic / page_views) * 100 : 0,
          checkout_conversion: ic > 0 ? (sales / ic) * 100 : 0,
          click_conversion: clicks > 0 ? (sales / clicks) * 100 : 0,
          purchase_conversion: page_views > 0 ? (sales / page_views) * 100 : 0,
          page_view_rate: clicks > 0 ? (page_views / clicks) * 100 : 0,
          connection_rate: clicks > 0 ? (page_views / clicks) * 100 : 0,
          sales_per_page_view: page_views > 0 ? (sales / page_views) * 100 : 0,
          frequency: impressions > 0 && clicks > 0 ? impressions / clicks : 1,
          followers: 0,
          product_costs: sales * 15,
          ca: account.name,
          creation_date: "-",
          delivery_status: item.status || "ACTIVE",
        });
      });
    }

    return consolidatedRows;
  } catch (error) {
    console.error("Erro em getMetaDashboardData:", error);
    return [];
  }
}

// 8. ALTERAR STATUS EM LOTE NA GRAPH API DO FACEBOOK
export async function updateMetaEntityStatus(
  userId: string,
  level: "campanhas" | "conjuntos" | "anuncios",
  ids: string[],
  status: "ACTIVE" | "PAUSED",
) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { metaAccessToken: true },
    });
    if (!user?.metaAccessToken)
      return { success: false, error: "Token ausente" };

    for (const id of ids) {
      const url = `https://graph.facebook.com/v19.0/${id}?status=${status}&access_token=${user.metaAccessToken}`;
      await fetch(url, { method: "POST" });
    }

    return { success: true };
  } catch (error) {
    console.error("Erro ao alterar status na API do Meta:", error);
    return { success: false, error: "Falha na execução do comando." };
  }
}

// 9. ALTERAR ORÇAMENTO EM LOTE NA GRAPH API DO FACEBOOK
export async function updateMetaBudget(
  userId: string,
  level: "campanhas" | "conjuntos",
  ids: string[],
  newBudget: number,
) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { metaAccessToken: true },
    });
    if (!user?.metaAccessToken)
      return { success: false, error: "Token ausente" };

    const valueInCents = Math.round(newBudget * 100);

    for (const id of ids) {
      const url = `https://graph.facebook.com/v19.0/${id}?daily_budget=${valueInCents}&access_token=${user.metaAccessToken}`;
      await fetch(url, { method: "POST" });
    }

    return { success: true };
  } catch (error) {
    console.error("Erro ao atualizar orçamento na API do Meta:", error);
    return { success: false, error: "Falha ao alterar orçamento." };
  }
}

// 10. DIAGNÓSTICO DE UTMS REAL DIRETAMENTE NA GRAPH API
export async function runMetaUtmDiagnostic(
  userId: string,
  accountIds: string[],
) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { metaAccessToken: true },
    });

    if (!user?.metaAccessToken) return { success: false, errorsCount: 0 };

    const accounts = await prisma.metaAccount.findMany({
      where: { userId, accountId: { in: accountIds } },
    });

    let untrackedAdsCount = 0;

    // A matriz de parâmetros obrigatórios que o seu SaaS exige para rastrear perfeitamente
    const requiredTrackingParams = [
      "utm_source={{site_source_name}}",
      "utm_campaign={{campaign.name}}",
      "utm_content={{ad.name}}", // ou ad.id dependendo da sua preferência
    ];

    for (const account of accounts) {
      const url = `https://graph.facebook.com/v19.0/${account.accountId}/ads?fields=id,name,creative{url_tags,ad_creative_link_data}&access_token=${user.metaAccessToken}`;

      const response = await fetch(url);
      const jsonResponse: MetaAdsResponse = await response.json();

      if (jsonResponse.data) {
        jsonResponse.data.forEach((ad) => {
          const urlTags = ad.creative?.url_tags || "";

          // Verifica se TODAS as tags obrigatórias estão presentes na URL de rastreamento do anúncio
          const isFullyTracked = requiredTrackingParams.every((param) =>
            urlTags.includes(param),
          );

          if (!isFullyTracked) {
            untrackedAdsCount++;
          }
        });
      }
    }

    return { success: true, errorsCount: untrackedAdsCount };
  } catch (error) {
    console.error("Diagnostic error:", error);
    return { success: false, errorsCount: 0 };
  }
}

// =========================================================
// AÇÕES DE INSIGHTS GERAIS (USADO PELO MARKETING OVERVIEW)
// =========================================================

export async function getMetaInsights(userId: string, from: Date, to: Date) {
  try {
    // 1. Puxa o token do usuário
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { metaAccessToken: true },
    });

    if (!user?.metaAccessToken) return null;

    // Buscamos apenas as contas que o usuário ativou no painel
    const accounts = await prisma.metaAccount.findMany({
      where: { userId, isActive: true },
    });

    if (accounts.length === 0) return null;

    // 2. Formata as datas para o padrão da API do Facebook (YYYY-MM-DD)
    const timeRange = {
      since: from.toISOString().split("T")[0],
      until: to.toISOString().split("T")[0],
    };

    // Variáveis que vão acumular os resultados de todas as contas
    let totalSpend = 0;
    let totalClicks = 0;
    let totalPageViews = 0;
    let totalInitiateCheckout = 0;
    let totalLeads = 0;
    let totalConversations = 0;

    // 3. Bate na API do Graph do Facebook para CADA conta de anúncio ativa
    for (const account of accounts) {
      // 🔥 Correção aplicada: account.accountId
      const url = `https://graph.facebook.com/v19.0/${account.accountId}/insights?fields=spend,clicks,actions&time_range=${JSON.stringify(timeRange)}&access_token=${user.metaAccessToken}`;

      const res = await fetch(url);
      const data = await res.json();

      if (data.data && data.data.length > 0) {
        const insights = data.data[0];

        totalSpend += Number(insights.spend || 0);
        totalClicks += Number(insights.clicks || 0);

        // 4. O Facebook retorna os eventos do Pixel dentro do array 'actions'
        if (insights.actions && Array.isArray(insights.actions)) {
          insights.actions.forEach((action: MetaAction) => {
            if (
              action.action_type === "landing_page_view" ||
              action.action_type === "view_content"
            ) {
              totalPageViews += Number(action.value || 0);
            }
            if (action.action_type === "initiate_checkout") {
              totalInitiateCheckout += Number(action.value || 0);
            }
            if (action.action_type === "lead") {
              totalLeads += Number(action.value || 0);
            }
            if (
              action.action_type ===
                "onsite_conversion.messaging_conversation_started_7d" ||
              action.action_type === "contact" ||
              action.action_type === "message_replies"
            ) {
              totalConversations += Number(action.value || 0);
            }
          });
        }
      }
    }

    // 5. Retorna o compilado geral de todas as contas para o Dashboard
    return {
      adSpend: totalSpend,
      clicks: totalClicks,
      pageViews: totalPageViews,
      initiateCheckout: totalInitiateCheckout,
      leads: totalLeads,
      conversations: totalConversations,
    };
  } catch (error) {
    console.error("Erro ao buscar insights do Meta:", error);
    return null;
  }
}

// ============================================================================
// OP-ACTIONS: DUPLICATE, BID CAP, AND DELETE (GRAPH API INTEGRATION)
// ============================================================================

// Interface for API responses to avoid 'any'
interface GraphApiResponse {
  success: boolean;
  error?: string;
  data?: unknown;
}

/**
 * Duplicates a Campaign, AdSet, or Ad via Facebook Graph API.
 * Supports duplicating to the same account or a cross-account copy.
 */
export async function duplicateMetaEntity(
  userId: string,
  level: "campanhas" | "conjuntos" | "anuncios",
  ids: string[],
  copiesCount: number,
  targetAccountId?: string, // Optional: Provide if copying to a different Ad Account
): Promise<GraphApiResponse> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { metaAccessToken: true },
    });

    if (!user?.metaAccessToken)
      return { success: false, error: "Access token missing" };

    for (const id of ids) {
      // Graph API endpoint for duplication
      const url = `https://graph.facebook.com/v19.0/${id}/copies?access_token=${user.metaAccessToken}`;

      // Setup payload parameters
      const params = new URLSearchParams();
      // By default, FB creates 1 copy. If more, we must loop or pass execution options (depends on entity).
      // Standard Graph API allows 'target_id' for adsets/ads, or 'account_id' for cross-account campaigns.

      if (targetAccountId) {
        // Formats the target account ID if it comes as "act_123"
        const cleanAccountId = targetAccountId.replace("act_", "");
        params.append("account_id", cleanAccountId);
      }

      // If user wants multiple copies, we loop the POST request.
      // (Graph API /copies endpoint processes one duplication command at a time for campaigns)
      for (let i = 0; i < copiesCount; i++) {
        await fetch(url, {
          method: "POST",
          body: params,
        });
      }
    }

    return { success: true };
  } catch (error) {
    console.error("Duplicate Entity Error:", error);
    return { success: false, error: "Failed to duplicate entities." };
  }
}

/**
 * Updates the Bid Cap (Limite de Lance) for AdSets.
 * Note: Facebook usually applies Bid Caps at the AdSet level or CBO Campaigns.
 */
export async function updateMetaBidCap(
  userId: string,
  level: "campanhas" | "conjuntos",
  ids: string[],
  bidAmount: number,
): Promise<GraphApiResponse> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { metaAccessToken: true },
    });

    if (!user?.metaAccessToken)
      return { success: false, error: "Access token missing" };

    // Facebook API expects values in cents (e.g., R$ 10.50 = 1050)
    const bidAmountInCents = Math.round(bidAmount * 100);

    for (const id of ids) {
      // The parameter for bid cap is 'bid_amount' on adsets
      const url = `https://graph.facebook.com/v19.0/${id}?bid_amount=${bidAmountInCents}&access_token=${user.metaAccessToken}`;
      await fetch(url, { method: "POST" });
    }

    return { success: true };
  } catch (error) {
    console.error("Update Bid Cap Error:", error);
    return { success: false, error: "Failed to update Bid Cap." };
  }
}

/**
 * Permanently deletes a Campaign, AdSet, or Ad via Facebook Graph API.
 * WARNING: This action cannot be undone on Facebook.
 */
export async function deleteMetaEntity(
  userId: string,
  level: "campanhas" | "conjuntos" | "anuncios",
  ids: string[],
): Promise<GraphApiResponse> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { metaAccessToken: true },
    });

    if (!user?.metaAccessToken)
      return { success: false, error: "Access token missing" };

    for (const id of ids) {
      // Sending a DELETE request to the entity's ID permanently deletes it
      const url = `https://graph.facebook.com/v19.0/${id}?access_token=${user.metaAccessToken}`;
      await fetch(url, { method: "DELETE" });
    }

    return { success: true };
  } catch (error) {
    console.error("Delete Entity Error:", error);
    return { success: false, error: "Failed to delete entities." };
  }
}
