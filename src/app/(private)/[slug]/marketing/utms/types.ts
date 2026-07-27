export interface UtmRow {
  id: string;
  // Campos de Agrupamento (Strings)
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_content: string;
  utm_term: string;
  src: string;
  keyword: string;
  
  // Métricas (Numbers)
  sales: number;
  cpa: number;
  spent: number;
  revenue: number;
  profit: number;
  roas: number;
  margin: number;
  roi: number;
  ic: number;      // Initiate Checkout
  cpi: number;     // Cost per Checkout
  cpc: number;
  ctr: number;
  cpm: number;
  impressions: number;
  clicks: number;
  page_views: number;
  cpv: number;
}