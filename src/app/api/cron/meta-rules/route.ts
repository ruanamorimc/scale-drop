import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// --- TIPAGENS DO META ADS ---
interface MetaAction {
  action_type: string;
  value?: string;
}

interface MetaInsightItem {
  campaign_id: string;
  campaign_name: string;
  spend?: string;
  impressions?: string;
  clicks?: string;
  actions?: MetaAction[];
  action_values?: MetaAction[];
}

interface Condition {
  metric: string;
  operator: string;
  value: number;
}

interface CustomRuleFields {
  actionValue?: number;
  evaluationPeriod?: string;
  adAccounts?: string[];
}

const META_DATE_PRESETS: Record<string, string> = {
  today: "today",
  hoje: "today",
  yesterday: "yesterday",
  ontem: "yesterday",
  last_3d: "last_3d",
  last_7d: "last_7d",
  last_14d: "last_14d",
  last_30d: "last_30d",
};

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const activeRules = await prisma.rule.findMany({
      where: {
        status: true,
      },
    });

    if (activeRules.length === 0) {
      return NextResponse.json({
        message: "Nenhuma regra ativa para processar.",
      });
    }

    const executionResults = [];

    for (const rule of activeRules) {
      try {
        const currentRule = rule as typeof rule & CustomRuleFields;
        const datePreset =
          META_DATE_PRESETS[currentRule.evaluationPeriod || "today"] || "today";

        // --- BUSCA AS CONTAS E SEUS RESPECTIVOS TOKENS DE USUÁRIO ---
        const rawAdAccounts = (currentRule.adAccounts as string[]) || [];

        let dbAccounts = [];
        if (rawAdAccounts.includes("todas") || rawAdAccounts.length === 0) {
          dbAccounts = await prisma.metaAccount.findMany({
            where: { isActive: true },
            select: {
              accountId: true,
              user: {
                select: { metaAccessToken: true },
              },
            },
          });
        } else {
          dbAccounts = await prisma.metaAccount.findMany({
            where: {
              accountId: { in: rawAdAccounts },
            },
            select: {
              accountId: true,
              user: {
                select: { metaAccessToken: true },
              },
            },
          });
        }

        // Loop principal sobre as contas de anúncios
        for (const targetAccount of dbAccounts) {
          // Pega o token do usuário dono da conta ou usa a env global como fallback
          const accessToken =
            targetAccount.user?.metaAccessToken ||
            process.env.META_ACCESS_TOKEN;

          if (!accessToken) {
            console.warn(
              `[META CRON] Nenhum token encontrado para a conta: ${targetAccount.accountId}`,
            );
            continue;
          }

          const formattedAccountId = targetAccount.accountId.startsWith("act_")
            ? targetAccount.accountId
            : `act_${targetAccount.accountId}`;

          const insightsUrl = `https://graph.facebook.com/v19.0/${formattedAccountId}/insights?level=campaign&date_preset=${datePreset}&fields=campaign_id,campaign_name,spend,impressions,clicks,actions,action_values&access_token=${accessToken}`;

          const res = await fetch(insightsUrl);
          const insightsData = await res.json();

          console.log(`--- Processando Regra: ${rule.name} ---`);
          console.log("Conta em processamento:", formattedAccountId);
          console.log("Resposta da Meta API:", insightsData);

          if (!insightsData.data) continue;

          for (const item of insightsData.data as MetaInsightItem[]) {
            const spend = parseFloat(item.spend || "0");
            const clicks = parseInt(item.clicks || "0", 10);
            const impressions = parseInt(item.impressions || "0", 10);

            const purchasesAction = item.actions?.find(
              (a: MetaAction) =>
                a.action_type === "purchase" ||
                a.action_type === "offsite_conversion.fb_pixel_purchase",
            );
            const sales = purchasesAction
              ? parseFloat(purchasesAction.value || "0")
              : 0;

            const purchaseValueAction = item.action_values?.find(
              (a: MetaAction) =>
                a.action_type === "purchase" ||
                a.action_type === "offsite_conversion.fb_pixel_purchase",
            );
            const purchaseValue = purchaseValueAction
              ? parseFloat(purchaseValueAction.value || "0")
              : 0;

            const cpa = sales > 0 ? spend / sales : 0;
            const roas = spend > 0 ? purchaseValue / spend : 0;

            const currentMetrics: Record<string, number> = {
              spend,
              vendas: sales,
              sales,
              cpa,
              roi: roas,
              roas,
              clicks,
              impressions,
            };

            let rawConditions = rule.conditions;
            if (typeof rawConditions === "string") {
              try {
                rawConditions = JSON.parse(rawConditions);
              } catch {
                rawConditions = [];
              }
            }

            const ruleConditions =
              (rawConditions as unknown as Condition[]) || [];

            const allConditionsMet = ruleConditions.every((cond) => {
              const metricKey = cond.metric.toLowerCase();
              const currentValue = currentMetrics[metricKey] ?? 0;
              const targetValue = cond.value;

              switch (cond.operator) {
                case ">":
                case "gt":
                  return currentValue > targetValue;
                case ">=":
                case "gte":
                  return currentValue >= targetValue;
                case "<":
                case "lt":
                  return currentValue < targetValue;
                case "<=":
                case "lte":
                  return currentValue <= targetValue;
                case "=":
                case "==":
                case "eq":
                  return currentValue === targetValue;
                case "!=":
                case "neq":
                  return currentValue !== targetValue;
                default:
                  return false;
              }
            });

            if (allConditionsMet && ruleConditions.length > 0) {
              const campaignId = item.campaign_id;

              if (rule.action === "pause" || rule.action === "pausar") {
                await fetch(
                  `https://graph.facebook.com/v19.0/${campaignId}?access_token=${accessToken}`,
                  {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ status: "PAUSED" }),
                  },
                );
              } else if (
                rule.action === "increase_budget" ||
                rule.action === "aumentar_orcamento"
              ) {
                const campRes = await fetch(
                  `https://graph.facebook.com/v19.0/${campaignId}?fields=daily_budget&access_token=${accessToken}`,
                );
                const campData = await campRes.json();
                const currentBudget = parseFloat(campData.daily_budget || "0");

                if (currentBudget > 0) {
                  const percent = (currentRule.actionValue ?? 10) / 100;
                  const newBudget = Math.round(currentBudget * (1 + percent));

                  await fetch(
                    `https://graph.facebook.com/v19.0/${campaignId}?access_token=${accessToken}`,
                    {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ daily_budget: newBudget }),
                    },
                  );
                }
              } else if (
                rule.action === "decrease_budget" ||
                rule.action === "diminuir_orcamento"
              ) {
                const campRes = await fetch(
                  `https://graph.facebook.com/v19.0/${campaignId}?fields=daily_budget&access_token=${accessToken}`,
                );
                const campData = await campRes.json();
                const currentBudget = parseFloat(campData.daily_budget || "0");

                if (currentBudget > 0) {
                  const percent = (currentRule.actionValue ?? 10) / 100;
                  const newBudget = Math.round(currentBudget * (1 - percent));

                  await fetch(
                    `https://graph.facebook.com/v19.0/${campaignId}?access_token=${accessToken}`,
                    {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ daily_budget: newBudget }),
                    },
                  );
                }
              }

              executionResults.push({
                ruleId: rule.id,
                campaignId,
                campaignName: item.campaign_name,
                actionExecuted: rule.action,
                executedAt: new Date().toISOString(),
              });
            }
          }
        }
      } catch (ruleError) {
        console.error(`Erro ao processar regra ${rule.id}:`, ruleError);
      }
    }

    return NextResponse.json({
      success: true,
      processedRulesCount: activeRules.length,
      actionsTaken: executionResults,
    });
  } catch (error) {
    console.error("Erro no Cron de Regras do Meta:", error);
    return NextResponse.json(
      { error: "Erro interno no processamento de regras." },
      { status: 500 },
    );
  }
}
