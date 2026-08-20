"use server";

import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { PLAN_LIMITS, type PlanType } from "@/config/plans";
import { revalidatePath } from "next/cache";

// ==========================================
// TIPAGENS (INTERFACES)
// ==========================================

// Tipagem para as condições da regra
export interface RuleCondition {
  metric: string; // Ex: "CPA", "ROAS", "SPEND"
  operator: string; // Ex: ">", "<", ">=", "<="
  value: number; // Ex: 50.00
}

// Tipagem para os dados de entrada da criação de regra
export interface CreateRuleInput {
  workspaceId: string;
  userId?: string;
  name: string;
  product?: string | null;
  adAccounts?: string[];
  applyTo: string;
  filterByName?: string | null;

  action: string;
  actionValue?: number | null;
  actionUnit?: string | null;
  budgetLimit?: number | null;

  metricsLevel: string;
  conditions: RuleCondition[];
  evaluationPeriod: string;
  frequency: string;
  executionWindow?: string | null;
  dailyLimit?: string | number | null;
}

// ==========================================
// SERVER ACTIONS
// ==========================================

/**
 * Cria uma nova regra de automação no banco de dados.
 * Inclui validação de limite do plano no lado do servidor.
 */
export async function createRuleAction(
  data: CreateRuleInput & { id?: string },
) {
  try {
    // 1. Validação básica de IDs
    if (!data.workspaceId || !data.userId) {
      return {
        success: false,
        error: "Identificador de workspace ou usuário ausente.",
      };
    }

    // 2. Resolve o Workspace real no banco (aceita tanto o ID quanto o Slug "teste-4076")
    const workspace = await prisma.workspace.findFirst({
      where: {
        OR: [{ id: data.workspaceId }, { slug: data.workspaceId }],
      },
      select: { id: true },
    });

    if (!workspace) {
      return {
        success: false,
        error: "Workspace não encontrado no banco de dados.",
      };
    }

    // 3. Identifica se é Edição ou Criação
    const isEditing = Boolean(data.id);

    // 4. Validação do plano do usuário (Apenas para NOVAS regras)
    if (!isEditing) {
      const user = await prisma.user.findUnique({
        where: { id: data.userId },
        select: { plan: true, role: true },
      });

      const userPlan = (
        user?.role === "admin" ? "PRO" : user?.plan?.toUpperCase() || "START"
      ) as PlanType;

      const maxRules = PLAN_LIMITS[userPlan]?.rules ?? 0;

      const currentRuleCount = await prisma.rule.count({
        where: { workspaceId: workspace.id },
      });

      if (currentRuleCount >= maxRules) {
        return {
          success: false,
          error: `Seu plano (${userPlan}) atingiu o limite máximo de ${maxRules} regras.`,
        };
      }
    }

    // 5. Estrutura dos dados a serem salvos
    const rulePayload = {
      workspaceId: workspace.id,
      userId: data.userId,
      name: data.name,
      product: data.product ?? null,
      adAccounts: data.adAccounts || [],
      applyTo: data.applyTo,
      filterByName: data.filterByName ?? null,

      action: data.action,
      actionValue: data.actionValue ?? null,
      actionUnit: data.actionUnit ?? null,
      budgetLimit: data.budgetLimit ?? null,

      metricsLevel: data.metricsLevel,
      conditions: data.conditions as unknown as Prisma.InputJsonValue, // 🟢 Compatibilidade com campo Json
      evaluationPeriod: data.evaluationPeriod,
      frequency: data.frequency,
      executionWindow: data.executionWindow ?? null,
      dailyLimit: data.dailyLimit ? Number(data.dailyLimit) : null,
    };

    let rule;

    if (isEditing && data.id) {
      // 🔄 EDITA A REGRA EXISTENTE
      rule = await prisma.rule.update({
        where: { id: data.id },
        data: rulePayload,
      });
    } else {
      // ➕ CRIA UMA NOVA REGRA
      rule = await prisma.rule.create({
        data: {
          ...rulePayload,
          status: true,
        },
      });
    }

    revalidatePath("/[workspaceSlug]/marketing/rules", "page");

    // Converte 'conditions' para envio ao front-end
    const formattedRule = {
      ...rule,
      conditions:
        typeof rule.conditions === "string"
          ? JSON.parse(rule.conditions)
          : rule.conditions,
    };

    return { success: true, rule: formattedRule };
  } catch (error: unknown) {
    console.error("Erro ao salvar regra no banco:", error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Falha ao salvar a regra no banco.";

    return { success: false, error: errorMessage };
  }
}

// Alternar status (Ativar / Desativar)
export async function toggleRuleStatusAction(
  ruleId: string,
  currentStatus: boolean,
) {
  try {
    await prisma.rule.update({
      where: { id: ruleId },
      data: { status: !currentStatus },
    });

    revalidatePath("/[workspaceSlug]/marketing/rules", "page");
    return { success: true };
  } catch (error: unknown) {
    console.error("Erro ao alterar status da regra:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Falha ao alterar status.";

    return { success: false, error: errorMessage };
  }
}

// Deletar regra
export async function deleteRuleAction(ruleId: string) {
  try {
    await prisma.rule.delete({
      where: { id: ruleId },
    });

    revalidatePath("/[workspaceSlug]/marketing/rules", "page");
    return { success: true };
  } catch (error: unknown) {
    console.error("Erro ao deletar regra:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Falha ao remover regra.";

    return { success: false, error: errorMessage };
  }
}

export async function getWorkspaceOptionsAction(workspaceId: string) {
  try {
    // 1. Localiza o workspace e o ID do usuário proprietário
    const workspace = await prisma.workspace.findFirst({
      where: {
        OR: [{ id: workspaceId }, { slug: workspaceId }],
      },
      select: { id: true, userId: true },
    });

    if (!workspace) {
      return { success: false, products: [], adAccounts: [] };
    }

    // 2. Busca os produtos do workspace
    const products = await prisma.product.findMany({
      where: { workspaceId: workspace.id },
      select: { id: true, name: true },
    });

    // 3. Busca as contas de anúncio da Meta do usuário que estão ativas
    const adAccounts = await prisma.metaAccount.findMany({
      where: {
        userId: workspace.userId,
        isActive: true,
      },
      select: { id: true, name: true, accountId: true },
    });

    return {
      success: true,
      products: products.map((p) => ({ id: p.id, name: p.name })),
      adAccounts: adAccounts.map((acc) => ({
        id: acc.id,
        name: acc.name || acc.accountId,
      })),
    };
  } catch (error) {
    console.error("Erro ao carregar opções do workspace:", error);
    return { success: false, products: [], adAccounts: [] };
  }
}

export async function getRulesAction(workspaceId: string) {
  try {
    const workspace = await prisma.workspace.findFirst({
      where: {
        OR: [{ id: workspaceId }, { slug: workspaceId }],
      },
      select: { id: true },
    });

    if (!workspace) {
      return { success: false, rules: [] };
    }

    const rules = await prisma.rule.findMany({
      where: {
        workspaceId: workspace.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // 🟢 Trata o campo conditions para o frontend receber o array/objeto limpo
    const formattedRules = rules.map((rule) => {
      let parsedConditions = rule.conditions;
      if (typeof rule.conditions === "string") {
        try {
          parsedConditions = JSON.parse(rule.conditions);
        } catch {
          parsedConditions = rule.conditions; // String legada antiga do banco
        }
      }
      return {
        ...rule,
        conditions: parsedConditions,
      };
    });

    return {
      success: true,
      rules: formattedRules,
    };
  } catch (error) {
    console.error("Erro ao buscar regras:", error);
    return {
      success: false,
      rules: [],
      error: "Erro ao buscar regras no banco.",
    };
  }
}
