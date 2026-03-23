// Regras Gerais:
// - Cards Numéricos: minW: 3, maxW: 4, minH: 3, maxH: 3
// - Cards Numéricos Específicos (ROAS, ROI, Margem, Reembolso, CPA): minW: 2, maxW: 4, minH: 3, maxH: 3
// - Gráficos: minW: 4, maxW: 12, minH: 9, maxH: 18

// src/constants/dashboard-layout.ts

// 1. O LAYOUT INICIAL (O que aparece quando o usuário reseta a tela)
export const DEFAULT_LAYOUT = [
  {
    id: "faturamento_bruto",
    x: 0,
    y: 0,
    w: 4,
    h: 3,
    minW: 3,
    maxW: 4,
    minH: 3,
    maxH: 3,
  },
  { id: "gastos", x: 4, y: 0, w: 3, h: 3, minW: 3, maxW: 4, minH: 3, maxH: 3 },
  { id: "roas", x: 7, y: 0, w: 2, h: 3, minW: 2, maxW: 4, minH: 3, maxH: 3 },
  { id: "lucro", x: 9, y: 0, w: 3, h: 3, minW: 3, maxW: 4, minH: 3, maxH: 3 },
  {
    id: "faturamento_liquido",
    x: 0,
    y: 3,
    w: 4,
    h: 3,
    minW: 3,
    maxW: 4,
    minH: 3,
    maxH: 3,
  },
  { id: "cpa", x: 4, y: 3, w: 3, h: 3, minW: 2, maxW: 4, minH: 3, maxH: 3 },
  { id: "roi", x: 7, y: 3, w: 2, h: 3, minW: 2, maxW: 4, minH: 3, maxH: 3 },
  {
    id: "vendas_pendentes",
    x: 9,
    y: 3,
    w: 3,
    h: 3,
    minW: 3,
    maxW: 4,
    minH: 3,
    maxH: 3,
  },
  {
    id: "vendas_pagamento",
    x: 0,
    y: 6,
    w: 4,
    h: 12,
    minW: 4,
    maxW: 12,
    minH: 9,
    maxH: 18,
  },
  { id: "arpu", x: 4, y: 6, w: 3, h: 3, minW: 3, maxW: 4, minH: 3, maxH: 3 },
  { id: "margem", x: 7, y: 6, w: 2, h: 3, minW: 2, maxW: 4, minH: 3, maxH: 3 },
  { id: "imposto", x: 9, y: 6, w: 3, h: 3, minW: 3, maxW: 4, minH: 3, maxH: 3 },
  {
    id: "reembolso_val",
    x: 4,
    y: 9,
    w: 3,
    h: 3,
    minW: 3,
    maxW: 4,
    minH: 3,
    maxH: 3,
  },
  {
    id: "reembolso_perc",
    x: 7,
    y: 9,
    w: 2,
    h: 3,
    minW: 2,
    maxW: 4,
    minH: 3,
    maxH: 3,
  },
  { id: "taxas", x: 9, y: 9, w: 3, h: 3, minW: 3, maxW: 4, minH: 3, maxH: 3 },
  {
    id: "funil",
    x: 4,
    y: 12,
    w: 8,
    h: 9,
    minW: 4,
    maxW: 12,
    minH: 9,
    maxH: 18,
  },
  {
    id: "taxa_aprovacao",
    x: 0,
    y: 18,
    w: 4,
    h: 4,
    minW: 3,
    maxW: 4,
    minH: 3,
    maxH: 18,
  },
  {
    id: "vendas_dia",
    x: 4,
    y: 21,
    w: 8,
    h: 9,
    minW: 4,
    maxW: 12,
    minH: 9,
    maxH: 18,
  },
  {
    id: "vendas_fonte",
    x: 0,
    y: 22,
    w: 4,
    h: 4,
    minW: 3,
    maxW: 4,
    minH: 3,
    maxH: 18,
  },
  {
    id: "vendas_posicionamento",
    x: 0,
    y: 26,
    w: 4,
    h: 4,
    minW: 3,
    maxW: 4,
    minH: 3,
    maxH: 18,
  },
  {
    id: "vendas_horario",
    x: 0,
    y: 30,
    w: 12,
    h: 9,
    minW: 4,
    maxW: 12,
    minH: 9,
    maxH: 18,
  },
];

// 2. O DICIONÁRIO DE TAMANHOS (Para quando arrastar algo da Sidebar)
const sizeDinheiro = { w: 3, h: 3, minW: 3, maxW: 4, minH: 3, maxH: 3 };
const sizeEspecif = { w: 2, h: 3, minW: 2, maxW: 4, minH: 3, maxH: 3 };
const sizeLista = { w: 4, h: 4, minW: 3, maxW: 4, minH: 3, maxH: 18 };
const sizeGrafico = { w: 8, h: 9, minW: 4, maxW: 12, minH: 9, maxH: 18 };

export type CardSizeConfig = {
  w: number;
  h: number;
  minW: number;
  maxW: number;
  minH: number;
  maxH: number;
};

export const CARD_SIZES: Record<string, CardSizeConfig> = {
  // Dinheiro / Numéricos Padrão
  faturamento_bruto: sizeDinheiro,
  gastos: sizeDinheiro,
  lucro: sizeDinheiro,
  faturamento_liquido: sizeDinheiro,
  arpu: sizeDinheiro,
  reembolso_val: sizeDinheiro,
  imposto: sizeDinheiro,
  taxas: sizeDinheiro,
  vendas_pendentes: sizeDinheiro,
  despesas_adicionais: sizeDinheiro,
  custo_por_conversa: sizeDinheiro,
  custo_por_lead: sizeDinheiro,
  imposto_total: sizeDinheiro,
  custos_produto: sizeDinheiro,

  // Específicos (minW: 2)
  roas: sizeEspecif,
  roi: sizeEspecif,
  margem: sizeEspecif,
  reembolso_perc: sizeEspecif,
  cpa: sizeEspecif,
  conversas: sizeEspecif,
  leads: sizeEspecif,

  // Listas (Donuts)
  taxa_aprovacao: sizeLista,
  vendas_fonte: sizeLista,
  vendas_posicionamento: sizeLista,
  vendas_produto: sizeLista,
  faturamento_produto: sizeLista,
  vendas_src: sizeLista,
  vendas_pais: sizeLista,

  // Gráficos
  vendas_pagamento: sizeGrafico,
  funil: sizeGrafico,
  vendas_dia: sizeGrafico,
  vendas_horario: sizeGrafico,
  lucro_horario: sizeGrafico,
  fat_inv_lucro_hora: sizeGrafico,
};
