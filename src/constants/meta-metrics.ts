export type MetricDefinition = {
  id: string;
  label: string;
  category:
    | "Campanha"
    | "Desempenho"
    | "Conversão"
    | "Engajamento"
    | "Configuração"
    | "Outros"; // Adicionei novas categorias se necessário
};

export const AVAILABLE_METRICS: MetricDefinition[] = [
  // --- CAMPANHA & CONFIGURAÇÃO ---
  { id: "name", label: "Campanha", category: "Campanha" },
  //{ id: "status", label: "Status", category: "Campanha" }, // Se não for fixo
  { id: "budget", label: "Orçamento", category: "Campanha" },
  {
    id: "bid_cap",
    label: "Bid Cap (limite de lance)",
    category: "Configuração",
  },
  { id: "account_status", label: "Status da Conta", category: "Configuração" },
  { id: "cycle", label: "Ciclo", category: "Configuração" },
  { id: "card", label: "Cartão", category: "Configuração" },
  {
    id: "id",
    label: "[ID] - IDs de Campanhas, Conjuntos, Anúncios e Contas",
    category: "Configuração",
  },
  { id: "last_update", label: "Última Atualização", category: "Configuração" },
  { id: "meta_tax", label: "Impostos Meta Ads", category: "Configuração" },

  // --- FINANCEIRO & PERFORMANCE ---
  { id: "spent", label: "Valor Gasto", category: "Desempenho" },
  { id: "total_spent", label: "Total Gasto", category: "Desempenho" },
  { id: "revenue", label: "Faturamento (Receita)", category: "Desempenho" },
  { id: "gross_revenue", label: "Faturamento bruto", category: "Desempenho" },
  {
    id: "pending_revenue",
    label: "Faturamento pendente",
    category: "Desempenho",
  },
  {
    id: "refunded_revenue",
    label: "[Faturamento Reemb.] - Faturamento Reembolsadas",
    category: "Desempenho",
  },
  { id: "profit", label: "Lucro", category: "Desempenho" },
  { id: "roas", label: "ROAS", category: "Desempenho" },
  { id: "roi", label: "ROI", category: "Desempenho" },
  { id: "margin", label: "Margem (%)", category: "Desempenho" },
  {
    id: "arpu",
    label: "[ARPU] - Receita gerada por usuário",
    category: "Desempenho",
  },

  // --- CUSTOS ---
  { id: "cpa", label: "CPA (Custo por Ação)", category: "Desempenho" },
  { id: "cpc", label: "CPC (Custo por Clique)", category: "Desempenho" },
  { id: "cpm", label: "CPM (Custo por Mil)", category: "Desempenho" },
  {
    id: "cpp",
    label: "[CPP] - Custo por vendas pendentes",
    category: "Desempenho",
  },
  {
    id: "cpt",
    label: "[CPT] - Custo por vendas totais",
    category: "Desempenho",
  },
  { id: "cpl", label: "[CPL] - Custo por Cadastro", category: "Desempenho" },
  {
    id: "cpi",
    label: "[CPI] - Custo por finalização de compra iniciada",
    category: "Desempenho",
  }, // Check se é Initiated Checkout ou Purchase
  {
    id: "cost_per_ic",
    label: "[Custo / Conversa] - Custo por Conversa Iniciada",
    category: "Desempenho",
  }, // Verifique se o label está correto para o ID
  {
    id: "cost_per_purchase_init",
    label: "Custo por finalização de compra iniciada",
    category: "Desempenho",
  }, // Pode ser duplicado com CPI acima, verifique
  {
    id: "cpv",
    label: "[CPV] - Custo por visualização de página",
    category: "Desempenho",
  },
  {
    id: "cps",
    label: "[CPS] - Custo por Seguidor no Instagram",
    category: "Desempenho",
  },

  // --- CONVERSÕES (VENDAS & CHECKOUT) ---
  { id: "sales", label: "Vendas (Compras)", category: "Conversão" },
  { id: "sales_pending", label: "Vendas Pendentes", category: "Conversão" },
  { id: "sales_total", label: "Vendas Totais", category: "Conversão" },
  { id: "sales_rejected", label: "Vendas Recusadas", category: "Conversão" },
  {
    id: "sales_refunded",
    label: "[Vendas Reemb.] - Vendas Reembolsadas",
    category: "Conversão",
  },
  {
    id: "purchase_init",
    label: "[IC] - Finalização de compra iniciada",
    category: "Conversão",
  }, // Initiate Checkout
  {
    id: "ic_rate",
    label: "[ICR] - Taxa de ICs = ICs / vis. de pág. (%)",
    category: "Conversão",
  }, // Initiate Checkout Rate
  { id: "atc", label: "Add to Cart (ATC)", category: "Conversão" },
  {
    id: "conversations_started",
    label: "[Conversas] - Conversas Iniciadas",
    category: "Conversão",
  },
  { id: "leads", label: "Cadastros", category: "Conversão" },
  {
    id: "checkout_conversion",
    label: "[Conv. Check.] - Conversão do Checkout",
    category: "Conversão",
  },
  {
    id: "click_conversion",
    label: "[Conv. Cliques] - Conversão de Cliques",
    category: "Conversão",
  },
  {
    id: "purchase_conversion",
    label: "[Conversão] - Vendas / vis. de pág. (%)",
    category: "Conversão",
  },

  // --- ENGAJAMENTO & VISUALIZAÇÃO ---
  { id: "clicks", label: "Cliques no Link", category: "Engajamento" }, // Pode ser apenas "Cliques"
  { id: "ctr", label: "CTR (Taxa de Clique)", category: "Engajamento" },
  { id: "impressions", label: "Impressões", category: "Engajamento" },
  { id: "frequency", label: "Frequência", category: "Engajamento" },
  {
    id: "page_views",
    label: "[Vis. de pág.] - Visualizações de página",
    category: "Engajamento",
  },
  {
    id: "page_view_rate",
    label: "Taxa de ICs = ICs / vis. de pág. (%)",
    category: "Engajamento",
  }, // Duplicado com IC Rate?
  {
    id: "connection_rate",
    label: "[CON] - Taxa de conexão = Vis. de pág. / cliques (%)",
    category: "Engajamento",
  },
  {
    id: "sales_per_page_view",
    label: "Vendas / vis. de pág. (%)",
    category: "Engajamento",
  }, // Duplicado com Purchase Conversion?

  // --- VÍDEO & CRIATIVO ---
  {
    id: "video_retention_3s",
    label: "[Retenção] - Vídeos assistidos 3 seg / vídeos iniciados (%)",
    category: "Engajamento",
  },
  {
    id: "video_hook",
    label: "[Hook] - Vídeos assistidos 3 seg / impressões (%)",
    category: "Engajamento",
  },
  {
    id: "video_hold_rate",
    label: "[Hold Rate] - Vídeos assistidos 75% / impressões (%)",
    category: "Engajamento",
  },
  {
    id: "video_body_conversion",
    label: "[Conversão do Body] - (Compras / Vídeos assistidos 75%) (%)",
    category: "Engajamento",
  },
  {
    id: "video_body_retention",
    label: "[Retenção do Body] - Vídeos assistidos 75% / Vídeos iniciados (%)",
    category: "Engajamento",
  },
  {
    id: "video_cta",
    label: "[CTA] - (Cliques no Link / Vídeos assistidos 75%) (%)",
    category: "Engajamento",
  },
  {
    id: "video_play_rate_hook",
    label: "[Play Rate do Hook] - Vídeos iniciados / Impressões (%)",
    category: "Engajamento",
  },
  {
    id: "video_retention_75",
    label: "[Retenção de Vídeo (75%)] - Taxa de Retenção de Vídeo (75%)",
    category: "Engajamento",
  },

  // --- OUTROS ---
  {
    id: "followers",
    label: "[Seguidores] - Seguidores no Instagram",
    category: "Outros",
  },
  { id: "product_costs", label: "Custos de Produto", category: "Outros" },
  { id: "ca", label: "[CA] - Conta de anúncio", category: "Outros" },
  { id: "creation_date", label: "Criação", category: "Outros" },
  { id: "delivery_status", label: "Veiculação", category: "Outros" }, // Status de entrega
];
