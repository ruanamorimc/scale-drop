// lib/export-utils.ts

// 1. Dicionário de tradução (Pode adicionar mais campos se precisar depois)
const COLUMN_HEADERS_PT: Record<string, string> = {
  // Agrupamentos
  utm_campaign: "Campanha",
  utm_medium: "Meio",
  utm_source: "Origem",
  utm_content: "Conteúdo",
  utm_term: "Termo",
  src: "SRC",
  keyword: "Palavra-chave",

  // Métricas
  sales: "Vendas (Compras)",
  revenue: "Faturamento (Receita)",
  profit: "Lucro",
  spent: "Valor Gasto",
  cpa: "CPA (Custo por Ação)",
  roas: "ROAS",
  margin: "Margem (%)",
  roi: "ROI",
  clicks: "Cliques no Link",
  cpc: "CPC (Custo por Clique)",
  cpm: "CPM (Custo por Mil Impressões)",
  ctr: "CTR (%)",
  page_views: "Visualizações de Página",
  leads: "Leads",
  video_retention: "Retenção de Vídeo",
  hook_rate: "Hook Rate (%)",
  hold_rate: "Hold Rate (%)",
};

/**
 * Exporta dados para CSV usando apenas as colunas visíveis e nomes amigáveis.
 *
 * @param data O array de dados filtrados da tabela
 * @param activeColumnKeys As chaves das colunas que estão ativas na tela
 * @param filename O nome do arquivo (sem a data, a função adiciona a data sozinha)
 */
export function exportToCsv<T>(
  data: T[],
  activeColumnKeys: string[],
  filename: string,
) {
  if (!data || data.length === 0) return false;

  // 1. Cria o cabeçalho usando o dicionário (se não achar, usa a chave original)
  const headers = activeColumnKeys.map((key) => COLUMN_HEADERS_PT[key] || key);

  // 2. Mapeia os valores linha por linha, pegando apenas o que tá no activeColumnKeys
  const rows = data.map((row) => {
    return activeColumnKeys
      .map((key) => {
        let value = (row as any)[key];

        if (value === null || value === undefined) value = "";

        // Se for número, formata para não quebrar no Excel (opcionalmente troca . por , se preferir o padrão BR no excel)
        if (typeof value === "number") {
          value = value.toFixed(2).replace(".", ",");
        }

        // Se for texto com vírgula, envelopa em aspas para não quebrar a coluna do CSV
        if (typeof value === "string" && value.includes(",")) {
          value = `"${value}"`;
        }

        return value;
      })
      .join(";"); // Usamos ponto e vírgula (;) porque é o padrão do Excel em português
  });

  // 3. Monta o arquivo e força o download
  const csvContent = [headers.join(";"), ...rows].join("\n");

  // Adiciona BOM (\uFEFF) para o Excel reconhecer os acentos do português corretamente (UTF-8)
  const blob = new Blob(["\uFEFF" + csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;

  const dateStr = new Date().toISOString().split("T")[0];
  link.setAttribute("download", `${filename}_${dateStr}.csv`);

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return true;
}
