export interface MetaCampaign {
  id: string;
  name: string;
  status: string;
  budget?: number;
  spend?: number;
  roas?: number;
  impressions?: number;
  clicks?: number;
  cpc?: number;
  ctr?: number;
  conversions?: number;
  costPerConversion?: number;
  // A linha abaixo garante que qualquer outro dado que a tabela pedir não quebre o build
  [key: string]: string | number | boolean | undefined | null;
}
