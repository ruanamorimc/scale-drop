// src/hooks/usePlanLimits.ts
import { PLAN_LIMITS, PlanType } from "@/config/plans";

export function usePlanLimits(userPlan: string = "START") {
  // Garante que o plano passado existe. Se vier algo errado ou vazio, cai pro START por segurança.
  const safePlan = (userPlan?.toUpperCase() in PLAN_LIMITS) 
    ? userPlan.toUpperCase() as PlanType 
    : "START";
    
  const limits = PLAN_LIMITS[safePlan];

  // 1. Verifica se a funcionalidade está habilitada (Ex: regras no START é 0, então retorna false)
  const isFeatureEnabled = (feature: keyof typeof limits) => {
    const limit = limits[feature];
    if (typeof limit === "number") {
      return limit > 0;
    }
    return true; 
  };

  // 2. Verifica se o usuário estourou o limite (Ex: tem 10 regras no Scale, e tenta criar a 11ª)
  const hasReachedLimit = (feature: keyof typeof limits, currentUsage: number) => {
    const limit = limits[feature];
    if (typeof limit === "number") {
      return currentUsage >= limit;
    }
    return false;
  };

  // 3. Retorna o valor do limite (útil para mostrar na tela "10 de 50 usados")
  const getLimitValue = (feature: keyof typeof limits) => {
    return limits[feature];
  };

  return { limits, isFeatureEnabled, hasReachedLimit, getLimitValue, currentPlan: safePlan };
}