export const PLAN_LIMITS = {
  BASIC: {
    stores: 1,
    adAccounts: 1,
    pixels: 1,
    products: 50, // Exemplo: limite de produtos também
  },
  PRO: {
    stores: 3,
    adAccounts: 3,
    pixels: 3,
    products: 500,
  },
  ENTERPRISE: {
    stores: 10,
    adAccounts: 10,
    pixels: 10,
    products: 99999, // "Ilimitado"
  },
};

export type PlanType = keyof typeof PLAN_LIMITS;
