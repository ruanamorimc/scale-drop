// src/config/plans.ts

export const PLAN_LIMITS = {
  START: {
    sales: 500,          // Limite de vendas rastreadas
    stores: 1,           // Lojas conectadas
    integrations: 2,     // Integrações ativas
    adAccounts: 1,       // Contas de anúncio
    pixels: 1,           // Pixels de otimização
    utms: 5,             // Limite de UTMs
    rules: 0,            // Sem regras automatizadas
    reports: "basic",    // Nível do relatório
  },
  SCALE: {
    sales: 2500,         
    stores: 3,           
    integrations: 6,     
    adAccounts: 5,       
    pixels: 5,           
    utms: 50,            
    rules: 10,           
    reports: "complete", 
  },
  PRO: {
    sales: 999999,       // Usamos um número alto para "Ilimitado" para facilitar comparações matemáticas
    stores: 999999,      
    integrations: 999999,
    adAccounts: 999999,  
    pixels: 999999,      
    utms: 999999,        
    rules: 999999,       
    reports: "advanced", 
  },
} as const;

export type PlanType = keyof typeof PLAN_LIMITS;