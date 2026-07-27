"use client";

import { ColumnDef } from "@tanstack/react-table";
import { UtmRow } from "./types";

// --- FORMATADORES ---
const toBRL = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    value || 0,
  );
const toPercent = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "percent",
    minimumFractionDigits: 2,
  }).format((value || 0) / 100);
const toNumber = (value: number) =>
  new Intl.NumberFormat("pt-BR").format(value || 0);

// --- DEFINIÇÃO DAS COLUNAS ---
export const getColumns = (groupBy: string): ColumnDef<UtmRow>[] => {
  // Nome dinâmico da primeira coluna
  const firstColTitle =
    {
      utm_campaign: "Campanha",
      utm_medium: "Meio",
      utm_source: "Origem",
      utm_content: "Conteúdo",
      utm_term: "Termo",
      src: "SRC",
      keyword: "Palavra-Chave",
    }[groupBy] || "Nome";

  return [
    // 1. COLUNA PRINCIPAL (Fixa)
    {
      accessorKey: groupBy,
      id: groupBy,
      header: firstColTitle,
      cell: ({ row }) => (
        <div
          className="font-medium text-foreground truncate max-w-[250px]"
          title={row.getValue(groupBy) as string}
        >
          {row.getValue(groupBy) || "-"}
        </div>
      ),
      size: 250,
      enableHiding: false,
    },

    // --- BLOCO 1: GERAIS / STATUS ---
    {
      accessorKey: "budget",
      header: "Orçamento",
      cell: ({ row }) => (
        <div className="text-center">{toBRL(row.getValue("budget"))}</div>
      ),
      size: 100,
    },
    {
      accessorKey: "bid_cap",
      header: "Bid Cap",
      cell: ({ row }) => (
        <div className="text-center">{toBRL(row.getValue("bid_cap"))}</div>
      ),
      size: 90,
    },
    { accessorKey: "status", header: "Status da Conta", size: 100 },
    { accessorKey: "cycle", header: "Ciclo", size: 80 },
    { accessorKey: "card", header: "Cartão", size: 80 },
    { accessorKey: "ids", header: "[ID] - IDs", size: 120 },
    { accessorKey: "last_updated", header: "Última Atualização", size: 120 },
    {
      accessorKey: "taxes",
      header: "Impostos Meta Ads",
      cell: ({ row }) => (
        <div className="text-center">{toBRL(row.getValue("taxes"))}</div>
      ),
      size: 110,
    },

    // --- BLOCO 2: FINANCEIRO (DEFAULT) ---
    {
      accessorKey: "spent",
      header: "Valor Gasto",
      cell: ({ row }) => (
        <div className="text-center text-red-500 font-medium">
          {toBRL(row.getValue("spent"))}
        </div>
      ),
      size: 110,
    },
    // Se "Total Gasto" for diferente de Valor Gasto, adicione lógica aqui. Assumindo igual para o mock.
    {
      accessorKey: "total_spent",
      header: "Total Gasto",
      cell: ({ row }) => (
        <div className="text-center text-red-500 font-medium">
          {toBRL(row.getValue("spent"))}
        </div>
      ),
      size: 110,
    },
    {
      accessorKey: "revenue",
      header: "Faturamento (Receita)",
      cell: ({ row }) => (
        <div className="text-center text-emerald-500 font-medium">
          {toBRL(row.getValue("revenue"))}
        </div>
      ),
      size: 140,
    },
    {
      accessorKey: "gross_revenue",
      header: "Faturamento bruto",
      cell: ({ row }) => (
        <div className="text-center">
          {toBRL(row.getValue("gross_revenue"))}
        </div>
      ),
      size: 120,
    },
    {
      accessorKey: "pending_revenue",
      header: "Faturamento pendente",
      cell: ({ row }) => (
        <div className="text-center">
          {toBRL(row.getValue("pending_revenue"))}
        </div>
      ),
      size: 120,
    },
    {
      accessorKey: "refund_revenue",
      header: "[Fat. Reemb.] Reembolsado",
      cell: ({ row }) => (
        <div className="text-center">
          {toBRL(row.getValue("refund_revenue"))}
        </div>
      ),
      size: 120,
    },

    {
      accessorKey: "profit",
      header: "Lucro",
      cell: ({ row }) => {
        const val = row.getValue<number>("profit");
        return (
          <div
            className={`text-center font-bold ${val >= 0 ? "text-emerald-500" : "text-red-500"}`}
          >
            {toBRL(val)}
          </div>
        );
      },
      size: 110,
    },

    // --- BLOCO 3: INDICADORES (ROAS, ROI, MARGEM) ---
    {
      accessorKey: "roas",
      header: "ROAS",
      cell: ({ row }) => (
        <div className="flex justify-center">
          <span className="bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded text-xs font-bold border border-emerald-500/20">
            {row.getValue<number>("roas")?.toFixed(2)}
          </span>
        </div>
      ),
      size: 80,
    },
    {
      accessorKey: "roi",
      header: "ROI",
      cell: ({ row }) => (
        <div className="flex justify-center">
          <span className="bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded text-xs font-bold border border-emerald-500/20">
            {row.getValue<number>("roi")?.toFixed(2)}
          </span>
        </div>
      ),
      size: 80,
    },
    {
      accessorKey: "margin",
      header: "Margem (%)",
      cell: ({ row }) => (
        <div className="text-center">{toPercent(row.getValue("margin"))}</div>
      ),
      size: 90,
    },
    {
      accessorKey: "arpu",
      header: "[ARPU] Receita/Usuário",
      cell: ({ row }) => (
        <div className="text-center">{toBRL(row.getValue("arpu"))}</div>
      ),
      size: 110,
    },

    // --- BLOCO 4: CUSTOS (CPA, CPC, CPM, ETC) ---
    {
      accessorKey: "cpa",
      header: "CPA (Custo por Ação)",
      cell: ({ row }) => (
        <div className="text-center">{toBRL(row.getValue("cpa"))}</div>
      ),
      size: 110,
    },
    {
      accessorKey: "cpc",
      header: "CPC (Custo por Clique)",
      cell: ({ row }) => (
        <div className="text-center">{toBRL(row.getValue("cpc"))}</div>
      ),
      size: 110,
    },
    {
      accessorKey: "cpm",
      header: "CPM (Custo por Mil)",
      cell: ({ row }) => (
        <div className="text-center">{toBRL(row.getValue("cpm"))}</div>
      ),
      size: 110,
    },
    {
      accessorKey: "cpp",
      header: "[CPP] Custo Vendas Pend.",
      cell: ({ row }) => (
        <div className="text-center">{toBRL(row.getValue("cpp"))}</div>
      ),
      size: 110,
    },
    {
      accessorKey: "cpt",
      header: "[CPT] Custo Vendas Totais",
      cell: ({ row }) => (
        <div className="text-center">{toBRL(row.getValue("cpt"))}</div>
      ),
      size: 110,
    },
    {
      accessorKey: "cpl",
      header: "[CPL] Custo por Cadastro",
      cell: ({ row }) => (
        <div className="text-center">{toBRL(row.getValue("cpl"))}</div>
      ),
      size: 110,
    },
    {
      accessorKey: "cpi",
      header: "[CPI] Custo Checkout",
      cell: ({ row }) => (
        <div className="text-center">{toBRL(row.getValue("cpi"))}</div>
      ),
      size: 110,
    },
    {
      accessorKey: "cost_per_convo",
      header: "Custo / Conversa",
      cell: ({ row }) => (
        <div className="text-center">
          {toBRL(row.getValue("cost_per_convo"))}
        </div>
      ),
      size: 110,
    },
    {
      accessorKey: "cpv",
      header: "[CPV] Custo Vis. Pág.",
      cell: ({ row }) => (
        <div className="text-center">{toBRL(row.getValue("cpv"))}</div>
      ),
      size: 110,
    },
    {
      accessorKey: "cps",
      header: "[CPS] Custo por Seguidor",
      cell: ({ row }) => (
        <div className="text-center">{toBRL(row.getValue("cps"))}</div>
      ),
      size: 110,
    },

    // --- BLOCO 5: VENDAS E CONVERSÕES ---
    {
      accessorKey: "sales",
      header: "Vendas (Compras)",
      cell: ({ row }) => (
        <div className="text-center">{toNumber(row.getValue("sales"))}</div>
      ),
      size: 90,
    },
    {
      accessorKey: "sales_pending",
      header: "Vendas Pendentes",
      cell: ({ row }) => (
        <div className="text-center">
          {toNumber(row.getValue("sales_pending"))}
        </div>
      ),
      size: 90,
    },
    {
      accessorKey: "sales_total",
      header: "Vendas Totais",
      cell: ({ row }) => (
        <div className="text-center">
          {toNumber(row.getValue("sales_total"))}
        </div>
      ),
      size: 90,
    },
    {
      accessorKey: "sales_refunded",
      header: "[Vendas Reemb.]",
      cell: ({ row }) => (
        <div className="text-center">
          {toNumber(row.getValue("sales_refunded"))}
        </div>
      ),
      size: 90,
    },

    {
      accessorKey: "ic",
      header: "[IC] Checkout Iniciado",
      cell: ({ row }) => (
        <div className="text-center">{toNumber(row.getValue("ic"))}</div>
      ),
      size: 90,
    },
    {
      accessorKey: "icr",
      header: "[ICR] Taxa de ICs (%)",
      cell: ({ row }) => (
        <div className="text-center">{toPercent(row.getValue("icr"))}</div>
      ),
      size: 90,
    },
    {
      accessorKey: "atc",
      header: "Add to Cart (ATC)",
      cell: ({ row }) => (
        <div className="text-center">{toNumber(row.getValue("atc"))}</div>
      ),
      size: 90,
    },
    {
      accessorKey: "conversations",
      header: "[Conversas] Iniciadas",
      cell: ({ row }) => (
        <div className="text-center">
          {toNumber(row.getValue("conversations"))}
        </div>
      ),
      size: 90,
    },
    {
      accessorKey: "leads",
      header: "Cadastros",
      cell: ({ row }) => (
        <div className="text-center">{toNumber(row.getValue("leads"))}</div>
      ),
      size: 90,
    },
    {
      accessorKey: "conversion_rate",
      header: "[Conversão] Vendas/Vis (%)",
      cell: ({ row }) => (
        <div className="text-center">
          {toPercent(row.getValue("conversion_rate"))}
        </div>
      ),
      size: 90,
    },

    // --- BLOCO 6: TRÁFEGO ---
    {
      accessorKey: "clicks",
      header: "Cliques no Link",
      cell: ({ row }) => (
        <div className="text-center">{toNumber(row.getValue("clicks"))}</div>
      ),
      size: 90,
    },
    {
      accessorKey: "ctr",
      header: "CTR (Taxa de Clique)",
      cell: ({ row }) => (
        <div className="text-center">{toPercent(row.getValue("ctr"))}</div>
      ),
      size: 90,
    },
    {
      accessorKey: "impressions",
      header: "Impressões",
      cell: ({ row }) => (
        <div className="text-center">
          {toNumber(row.getValue("impressions"))}
        </div>
      ),
      size: 100,
    },
    {
      accessorKey: "frequency",
      header: "Frequência",
      cell: ({ row }) => (
        <div className="text-center">
          {row.getValue<number>("frequency")?.toFixed(2)}
        </div>
      ),
      size: 80,
    },
    {
      accessorKey: "page_views",
      header: "[Vis. de pág.]",
      cell: ({ row }) => (
        <div className="text-center">
          {toNumber(row.getValue("page_views"))}
        </div>
      ),
      size: 90,
    },
    {
      accessorKey: "con_rate",
      header: "[CON] Taxa de Conexão",
      cell: ({ row }) => (
        <div className="text-center">{toPercent(row.getValue("con_rate"))}</div>
      ),
      size: 90,
    },

    // --- BLOCO 7: VÍDEO E ENGAJAMENTO ---
    {
      accessorKey: "video_retention",
      header: "[Retenção] Vídeo 3s (%)",
      cell: ({ row }) => (
        <div className="text-center">
          {toPercent(row.getValue("video_retention"))}
        </div>
      ),
      size: 100,
    },
    {
      accessorKey: "hook_rate",
      header: "[Hook] Vídeo 3s/Imp (%)",
      cell: ({ row }) => (
        <div className="text-center">
          {toPercent(row.getValue("hook_rate"))}
        </div>
      ),
      size: 100,
    },
    {
      accessorKey: "hold_rate",
      header: "[Hold Rate] Vídeo 75% (%)",
      cell: ({ row }) => (
        <div className="text-center">
          {toPercent(row.getValue("hold_rate"))}
        </div>
      ),
      size: 100,
    },
    {
      accessorKey: "followers",
      header: "[Seguidores] Instagram",
      cell: ({ row }) => (
        <div className="text-center">{toNumber(row.getValue("followers"))}</div>
      ),
      size: 100,
    },

    // --- OUTROS ---
    {
      accessorKey: "product_costs",
      header: "Custos de Produto",
      cell: ({ row }) => (
        <div className="text-center">
          {toBRL(row.getValue("product_costs"))}
        </div>
      ),
      size: 110,
    },
    { accessorKey: "ad_account", header: "[CA] Conta de Anúncio", size: 120 },
    { accessorKey: "creation_date", header: "Criação", size: 100 },
    { accessorKey: "delivery_status", header: "Veiculação", size: 100 },
  ];
};
