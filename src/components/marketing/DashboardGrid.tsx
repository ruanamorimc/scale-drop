"use client";

import React, { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import { MetricCard, MetricListItem } from "./MetricCard";
import { ALL_METRICS } from "@/constants/metrics";
import { cn } from "@/lib/utils";
import { DEFAULT_LAYOUT } from "@/constants/dashboard-layout";

import { GridStack, type GridStackNode } from "gridstack";
import "gridstack/dist/gridstack.min.css";

// 🔥 IMPORT DOS ELEMENTOS DO SHADCN PARA O NOSSO NOVO SELECT
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import SalesPaymentChart from "@/components/chart/SalesPaymentChart";
import ConversionFunnelChart from "@/components/chart/ConversionFunnelChart";
import SalesByCountryMap from "@/components/chart/SalesByCountryMap";
import SalesByDayChart from "@/components/chart/SalesByDayChart";
import SalesByHourChart from "@/components/chart/SalesByHourChart";
import ProfitByHourChart from "@/components/chart/ProfitByHourChart";
import AccumulatedMetricsChart from "@/components/chart/AccumulatedMetricsChart";

export const getGridConstraints = (id: string) => {
  const config = DEFAULT_LAYOUT.find((item: any) => item.id === id);
  if (config) {
    return {
      w: config.w || 3,
      h: config.h || 2,
      minW: config.minW || 3,
      maxW: config.maxW || 12,
      minH: config.minH || 3,
      maxH: config.maxH || 12,
    };
  }
  return { w: 3, h: 2, minW: 3, maxW: 12, minH: 3, maxH: 12 };
};

// ============================================================================
// 📊 GUIA DE FORMATOS E CORES PARA A FASE DE API (BACK-END)
// ============================================================================
// Esta função dita as regras de como cada card aparece. Quando a API chegar,
// basta injetar os dados dinâmicos aqui seguindo os seguintes padrões:
//
// 1. COMO MUDAR OS FORMATOS DOS NÚMEROS:
//    - Dinheiro: Mande como string formatada -> Ex: "R$ 404,21"
//    - Porcentagem: Mande como string com o % -> Ex: "18.5%"
//    - Multiplicador (ROAS/ROI): Mande apenas o número decimal -> Ex: "1.41"
//
// 2. COMO MUDAR AS CORES (Propriedade 'trend'):
//    - "positive" = Deixa Título, Número e Ícone VERDES.
//    - "negative" = Deixa Título, Número e Ícone VERMELHOS.
//    - "neutral"  = Deixa nas cores brancas/cinzas padrão.
//
// OBS: Deixamos as cores "positive" apenas em ROAS, ROI, Lucro e Margem,
// como você pediu. Se quiser que um deles fique vermelho no futuro,
// é só fazer um IF: trend: lucroReal > 0 ? "positive" : "negative"
// ============================================================================

const getRawData = (id: string) => {
  let data: any = {
    value: "R$ 0,00",
    desc: "Métrica em análise.",
    trend: "neutral",
  };

  switch (id) {
    // --- NEUTROS ---
    case "faturamento_bruto":
      data = {
        value: "R$ 2.512,48",
        desc: "Faturamento Bruto das Vendas Aprovadas \n\n Fat.Bruto = Venda - Taxa do gateway de pagamentos - Taxas de coprodutores e afiliados",
        trend: "neutral",
      };
      break;
    case "gastos":
      data = {
        value: "R$ 1.776,51",
        desc: "Valor investido em anúncios.",
        trend: "neutral",
      };
      break;
    case "cpa":
      data = {
        value: "R$ 25,02",
        desc: "Custo por Aquisição Médio \n\n Gastos Totais/Vendas",
        trend: "neutral",
      };
      break;
    case "arpu":
      data = {
        value: "R$ 48,46",
        desc: "Ticket Médio por Usuário \n\n ARPU = Faturamento Líquido/Clientes Distintos",
        trend: "neutral",
      };
      break;
    case "faturamento_liquido":
      data = {
        value: "R$ 2.180,72",
        desc: "Faturamento Líquido das Vendas Aprovadas \n\n Fat.Líquido = Vendas - Taxa do gateway de pagamentos - Taxas de coprodutores e afiliados - Taxa - Imposto total - Custo de Produtos",
        trend: "neutral",
      };
      break;
    case "chargeback":
      data = {
        value: "0%",
        desc: "Taxa de Chargeback \n\n (Calculada sobre o faturamento)",
        trend: "neutral",
      };
      break;
    case "reembolso_perc":
      data = {
        value: "0%",
        desc: "Taxa de Reembolso \n\n (Calculada sobre a quantidade de pedidos)",
        trend: "neutral",
      };
      break;
    // 🔥 DADOS DO FUNIL (COM QUEBRA DE LINHA NO TOOLTIP)
    case "funil":
      data = {
        value: undefined, // O funil não tem um "número gigante" no topo
        trend: "neutral",
        desc: "O funil de conversão analisa as métricas de cada etapa do seu funil. Sendo elas:\n\n• Cliques;\n• Visualizações de Página;\n• Adição ao Carrinho;\n• Início de Finalização de Compra;\n• Vendas Iniciadas;\n• Vendas Aprovadas.\n\nAs métricas de cliques, vis. de página e ICs são advindas do Meta. Para maior assertividade, é necessário que o pixel esteja configurado corretamente.\n\nEsse gráfico considera apenas os dados da Meta.",
      };
      break;
    // --- OS 4 CARDS COM CORES DINÂMICAS (VERDE/VERMELHO) ---
    case "lucro":
      // Formato: DINHEIRO
      data = {
        value: "R$ 404,21",
        desc: "Lucro Calculado \n\n Lucro = Faturamento Líquido - Gastos com anúncios - Despesas adicionais",
        trend: "positive",
      };
      break;
    case "margem":
      // Formato: PORCENTAGEM
      data = {
        value: "18.5%",
        desc: "Equivale ao percentual do faturamento que é lucro \n\n Margem = Lucro/Faturamento Líquido",
        trend: "positive",
      };
      break;
    case "roi":
      // Formato: MULTIPLICADOR CRU
      data = {
        value: "1.23",
        desc: "Retorno sobre o investimento \n \n ROI = Faturamento Líquido/Gastos Totais",
        trend: "positive",
      };
      break;
    case "roas":
      // Formato: MULTIPLICADOR CRU
      data = {
        value: "1.41",
        desc: "Retorno sobre o investimento em anúncios\n \n ROAS = Faturamento Bruto/Gastos com anúncios",
        trend: "positive",
      };
      break;
    // --- LISTAS COM SUBTÍTULOS ---
    case "vendas_produto":
      data = {
        desc: "Total de unidades vendidas \n\n Uma venda pode incluir várias unidades",
        subtitle: "(deslize a tela ↓)",
        listItems: [
          {
            label: "Financeiro Produtivo",
            value: 28,
            percentage: 39.4,
            color: "#3b82f6",
          },
          {
            label: "Atualizações e Novos",
            value: 14,
            percentage: 19.7,
            color: "#3b82f6",
          },
          {
            label: "Jogo do Texto",
            value: 8,
            percentage: 11.3,
            color: "#3b82f6",
          },
          { label: "Mounjaro", value: 8, percentage: 11.3, color: "#3b82f6" },
          {
            label: "Plano Família",
            value: 3,
            percentage: 4.2,
            color: "#3b82f6",
          },
        ],
      };
      break;
    case "faturamento_produto":
      data = {
        desc: "Faturamento total separado por produto.",
        subtitle: "(deslize a tela ↓)",
        listItems: [
          {
            label: "Financeiro Produtivo",
            value: "R$ 1.102,41",
            percentage: 43.9,
            color: "#3b82f6",
          },
          {
            label: "Atualizações e Novos",
            value: "R$ 278,60",
            percentage: 11.1,
            color: "#3b82f6",
          },
          {
            label: "Jogo do Texto",
            value: "R$ 268,87",
            percentage: 10.7,
            color: "#3b82f6",
          },

          {
            label: "Mounjaro",
            value: "R$ 249,20",
            percentage: 9.9,
            color: "#3b82f6",
          },
        ],
      };
      break;
    case "vendas_posicionamento":
      data = {
        desc: "Locais onde as conversões ocorreram.",
        subtitle: "(deslize a tela ↓)",
        listItems: [
          { label: "N/A", value: 15, percentage: 21.1, color: "#8b5cf6" },
          {
            label: "FB_Mobile_Reels",
            value: 11,
            percentage: 15.5,
            color: "#8b5cf6",
          },
          { label: "IG_Reels", value: 11, percentage: 15.5, color: "#8b5cf6" },
          {
            label: "IG_Stories",
            value: 10,
            percentage: 14.1,
            color: "#8b5cf6",
          },
        ],
      };
      break;
    case "vendas_src":
      data = {
        desc: "Origem das vendas rastreadas \n\n 'N/A' = Vendas com parâmetro vazio\n Outros = Vendas pelo nome do parâmetro",
        subtitle: "(deslize a tela ↓)",
        listItems: [
          { label: "N/A", value: 69, percentage: 97.2, color: "#10b981" },
          { label: "google", value: 2, percentage: 2.8, color: "#10b981" },
        ],
      };
      break;
    case "vendas_fonte":
      data = {
        desc: "Plataformas que geraram vendas.",
        subtitle: "(deslize a tela ↓)",
        listItems: [
          { label: "MetaAds", value: 54, percentage: 76.1, color: "#3b82f6" },
          { label: "N/A", value: 9, percentage: 12.7, color: "#3b82f6" },
          { label: "organic", value: 4, percentage: 5.6, color: "#3b82f6" },
        ],
      };
      break;
    case "taxa_aprovacao":
      data = {
        desc: "Aprovação por método de pagamento.",
        listItems: [
          { label: "Cartão", percentage: 65.5, color: "#3b82f6" },
          { label: "Pix", percentage: 63.4, color: "#3b82f6" },
          { label: "Boleto", percentage: 0, color: "#3b82f6" },
        ],
      };
      break;
    // 🔥 DADOS DO MAPA ADICIONADOS AQUI:
    case "vendas_pais":
      data = {
        desc: "Distribuição global das vendas.",
        listItems: [
          { label: "Brazil", value: 66, percentage: 93.0, color: "#2563eb" },
          { label: "N/A", value: 5, percentage: 7.0, color: "#475569" },
        ],
      };
      break;
  }
  return data;
};

const chartCardIds = [
  "funil",
  "vendas_dia",
  "vendas_horario",
  "lucro_horario",
  "vendas_pagamento",
  "fat_inv_lucro_hora",
];

const listCardIds = [
  "taxa_aprovacao",
  "vendas_fonte",
  "vendas_posicionamento",
  "vendas_produto",
  "faturamento_produto",
  "vendas_src",
  "vendas_pais",
];

interface DashboardGridProps {
  layout: any[];
  isEditing: boolean;
  onChangeLayout: (newLayout: any[]) => void;
  showValues?: boolean;
}

export default function DashboardGrid({
  layout,
  isEditing,
  onChangeLayout,
  showValues,
}: DashboardGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<GridStack | null>(null);

  const layoutRef = useRef(layout);
  const isReactUpdating = useRef(false);

  // 🔥 O CÉREBRO: Os estados dos botões ficam no Grid agora!
  const [lucroHorarioMode, setLucroHorarioMode] = useState("liquido");
  const [fatInvLucroMode, setFatInvLucroMode] = useState("liquido");
  // 🔥 ESTADO DO BOTÃO VIP DO MAPA (Ranking | Mapa)
  const [countryMode, setCountryMode] = useState<"ranking" | "mapa">("mapa");

  useEffect(() => {
    layoutRef.current = layout;
  }, [layout]);

  useEffect(() => {
    if (!containerRef.current) return;
    if (gridRef.current) return;

    gridRef.current = GridStack.init(
      {
        column: 12,
        cellHeight: 40,
        margin: 14,
        float: false,
        staticGrid: !isEditing,
        resizable: { handles: "se" },
        acceptWidgets: ".sidebar-draggable",
      },
      containerRef.current,
    );

    const grid = gridRef.current;

    grid.on("added", (event: Event, items: GridStackNode[]) => {
      if (isReactUpdating.current) return;
      let currentLayout = [...layoutRef.current];
      let hasChanges = false;

      items.forEach((item) => {
        const el = item.el as HTMLElement;
        if (!el) return;

        const id =
          item.id || el.getAttribute("gs-id") || el.getAttribute("data-gs-id");

        if (!id || currentLayout.some((l) => l.id === id)) {
          grid.removeWidget(el, true, false);
          return;
        }

        const c = getGridConstraints(id as string);
        const w = Number.isFinite(item.w) ? item.w : c.w;
        const h = Number.isFinite(item.h) ? item.h : c.h;
        const x = Number.isFinite(item.x) ? item.x : 0;
        const y = Number.isFinite(item.y) ? item.y : 0;

        hasChanges = true;
        currentLayout.push({ id: id as string, x, y, w, h });

        grid.removeWidget(el, true, false);
      });

      if (hasChanges) setTimeout(() => onChangeLayout(currentLayout), 0);
    });

    grid.on("change", (event: Event, items: GridStackNode[]) => {
      if (isReactUpdating.current) return;
      if (!items || items.length === 0) return;

      const currentLayout = [...layoutRef.current];
      let hasChanges = false;

      const newLayout = currentLayout.map((itemState) => {
        const changedNode = items.find(
          (i) =>
            String(i.id) === itemState.id ||
            i.el?.getAttribute("gs-id") === itemState.id,
        );
        if (changedNode) {
          const newX = Number.isFinite(changedNode.x)
            ? changedNode.x
            : itemState.x;
          const newY = Number.isFinite(changedNode.y)
            ? changedNode.y
            : itemState.y;
          const newW = Number.isFinite(changedNode.w)
            ? changedNode.w
            : itemState.w;
          const newH = Number.isFinite(changedNode.h)
            ? changedNode.h
            : itemState.h;

          if (
            newX !== itemState.x ||
            newY !== itemState.y ||
            newW !== itemState.w ||
            newH !== itemState.h
          ) {
            hasChanges = true;
            return { ...itemState, x: newX, y: newY, w: newW, h: newH };
          }
        }
        return itemState;
      });

      if (hasChanges) setTimeout(() => onChangeLayout(newLayout), 0);
    });

    return () => {
      grid.destroy(false);
      gridRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid || !containerRef.current) return;

    isReactUpdating.current = true;

    const timer = setTimeout(() => {
      const newElements = containerRef.current!.querySelectorAll(
        ".grid-stack-item:not(.gs-initialized)",
      );
      newElements.forEach((el) => {
        grid.makeWidget(el as HTMLElement);
        el.classList.add("gs-initialized");
      });

      layout.forEach((item) => {
        const el = document.getElementById(`gs-${item.id}`);
        if (el && el.classList.contains("gs-initialized")) {
          const c = getGridConstraints(item.id);
          grid.update(el, {
            x: item.x,
            y: item.y,
            w: item.w,
            h: item.h,
            minW: c.minW,
            maxW: c.maxW,
            minH: c.minH,
            maxH: c.maxH,
          });
        }
      });

      setTimeout(() => {
        isReactUpdating.current = false;
      }, 50);
    }, 10);

    return () => clearTimeout(timer);
  }, [layout]);

  useEffect(() => {
    if (gridRef.current) {
      gridRef.current.setStatic(!isEditing);
    }
  }, [isEditing]);

  const handleRemove = (id: string) => {
    const grid = gridRef.current;
    const el = document.getElementById(`gs-${id}`);
    if (grid && el) grid.removeWidget(el, false);
    onChangeLayout(layout.filter((l) => l.id !== id));
  };

  return (
    <div className="w-full min-h-[500px] pb-16">
      <style>{`
        .grid-stack-placeholder > .placeholder-content {
          background-color: rgba(59, 130, 246, 0.1) !important;
          border: 2px dashed rgba(59, 130, 246, 0.5) !important;
          border-radius: 0.75rem !important;
        }
      `}</style>

      <div ref={containerRef} className="grid-stack -mx-[14px]">
        {layout.map((item) => {
          const metricDef = ALL_METRICS.find((m) => m.id === item.id);
          const title = metricDef?.label || item.id;
          const rawData = getRawData(item.id);

          const isChart = chartCardIds.includes(item.id);
          const isList = listCardIds.includes(item.id);

          // 🔥 O mapa não pode ter barra de rolagem!
          const isMapActive =
            item.id === "vendas_pais" && countryMode === "mapa";
          const overflowClass =
            isChart || isMapActive
              ? "overflow-hidden"
              : "overflow-y-auto overflow-x-hidden custom-scrollbar pr-1";

          const displayValue = !isList && !isChart ? rawData.value : undefined;

          // ====================================================================
          // 👁️ MODO PRIVACIDADE: REGRAS DE BLUR (COMO ALTERAR NO FUTURO)
          // ====================================================================

          // 1. Cards que NUNCA terão os valores borrados (adicione o ID deles aqui)
          // Você pediu: ROAS, ROI, Margem, Reembolso, Chargeback, Leads, Conversas.
          const NEVER_BLUR_CARDS = [
            "roas",
            "roi",
            "margem",
            "reembolso_perc",
            "chargeback",
            "leads",
            "conversas",
            "reembolso",
          ];

          // 2. Cards de LISTA onde você quer que APENAS O NOME (Label) seja borrado
          const BLUR_LABEL_ONLY_CARDS = [
            "vendas_produto",
            "faturamento_produto",
          ];

          // A LÓGICA MESTRA:
          // Se o olho estiver aberto (showValues), mostra tudo.
          // Se estiver fechado E o card for VIP (NEVER_BLUR_CARDS), mostra também!
          const displayMainValue =
            showValues || NEVER_BLUR_CARDS.includes(item.id);

          // Lógica exclusiva para as Listas:
          let blurListLabel = false;
          let blurListValue = false;

          if (!showValues) {
            if (BLUR_LABEL_ONLY_CARDS.includes(item.id)) {
              blurListLabel = true; // Borra o nome do produto (Ex: "Financeiro Produtivo")
              blurListValue = false; // Deixa o valor intacto (Ex: R$ 1.102,41)
            } else {
              // Conforme você pediu, as outras listas (Vendas por Fonte, etc) não borram NADA.
              blurListLabel = false;
              blurListValue = false;
            }
          }
          // ====================================================================

          // Injetor de botões VIP no cabeçalho
          let customHeaderAction = undefined;
          if (item.id === "lucro_horario") {
            customHeaderAction = (
              <Select
                value={lucroHorarioMode}
                onValueChange={setLucroHorarioMode}
              >
                <SelectTrigger className="h-6 w-[80px] text-[10px] bg-background border-border focus:ring-0 px-2 py-0">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    value="liquido"
                    className="text-[10px] cursor-pointer"
                  >
                    Líquido
                  </SelectItem>
                  <SelectItem
                    value="bruto"
                    className="text-[10px] cursor-pointer"
                  >
                    Bruto
                  </SelectItem>
                </SelectContent>
              </Select>
            );
          } else if (item.id === "fat_inv_lucro_hora") {
            customHeaderAction = (
              <Select
                value={fatInvLucroMode}
                onValueChange={setFatInvLucroMode}
              >
                <SelectTrigger className="h-6 w-[80px] text-[10px] bg-background border-border focus:ring-0 px-2 py-0">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    value="liquido"
                    className="text-[10px] cursor-pointer"
                  >
                    Líquido
                  </SelectItem>
                  <SelectItem
                    value="bruto"
                    className="text-[10px] cursor-pointer"
                  >
                    Bruto
                  </SelectItem>
                </SelectContent>
              </Select>
            );
          } else if (item.id === "vendas_pais") {
            // 🔥 O BOTÃO VIP DO MAPA (RANKING | MAPA) FOI CONSTRUÍDO AQUI
            customHeaderAction = (
              <div className="flex items-center gap-2.5 text-[11px] font-semibold tracking-wide bg-background/50 px-2 py-1 rounded-md border border-border/40 backdrop-blur-sm">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setCountryMode("ranking");
                  }}
                  className={cn(
                    "transition-colors",
                    countryMode === "ranking"
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground/80",
                  )}
                >
                  Ranking
                </button>
                <span className="text-border">|</span>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setCountryMode("mapa");
                  }}
                  className={cn(
                    "transition-colors",
                    countryMode === "mapa"
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground/80",
                  )}
                >
                  Mapa
                </button>
              </div>
            );
          }

          return (
            <div
              key={item.id}
              id={`gs-${item.id}`}
              className="grid-stack-item group/gs"
              gs-id={item.id}
              gs-x={item.x}
              gs-y={item.y}
              gs-w={item.w}
              gs-h={item.h}
            >
              <div
                className={cn(
                  "grid-stack-item-content bg-card rounded-xl flex flex-col transition-all",
                  isEditing
                    ? "!overflow-visible border-2 border-blue-500/80 shadow-[0_0_15px_rgba(59,130,246,0.15)]"
                    : "border border-border shadow-sm",
                )}
              >
                <MetricCard
                  title={title}
                  subtitle={rawData.subtitle}
                  trend={rawData.trend}
                  value={displayValue}
                  description={rawData.desc}
                  headerAction={customHeaderAction}
                  isEditing={isEditing}
                  // 🔥 Tratamento especial do padding para o mapa encostar nas bordas!
                  /*                   innerPadding={
                    item.id === "funil" || isMapActive
                      ? "pt-[21px] px-0 pb-0"
                      : "p-[21px]"
                  } */
                  showValues={displayMainValue}
                  contentClassName={cn(
                    "flex-1 flex flex-col h-full w-full min-h-0",
                    isList && !isMapActive
                      ? "!justify-start"
                      : "justify-center",
                    overflowClass,
                    item.id === "funil" && "p-4",
                    isMapActive && "mt-0",
                  )}
                >
                  {isChart && (
                    <div className="flex-1 w-full h-full flex flex-col">
                      {item.id === "vendas_pagamento" && <SalesPaymentChart />}
                      {item.id === "funil" && <ConversionFunnelChart />}
                      {item.id === "vendas_dia" && <SalesByDayChart />}
                      {item.id === "vendas_horario" && <SalesByHourChart />}
                      {item.id === "lucro_horario" && (
                        <ProfitByHourChart viewMode={lucroHorarioMode} />
                      )}
                      {item.id === "fat_inv_lucro_hora" && (
                        <AccumulatedMetricsChart viewMode={fatInvLucroMode} />
                      )}
                    </div>
                  )}

                  {/* 🔥 LÓGICA EXCLUSIVA DO MAPA (Vendas por País) */}
                  {item.id === "vendas_pais" && (
                    <div className="flex-1 w-full h-full flex flex-col">
                      {countryMode === "mapa" ? (
                        <SalesByCountryMap showValues={displayMainValue} />
                      ) : (
                        <div className="flex flex-col w-full pt-1 px-[21px]">
                          {rawData.listItems?.map(
                            (listItem: any, idx: number) => (
                              <MetricListItem
                                key={idx}
                                label={listItem.label}
                                value={listItem.value}
                                percentage={listItem.percentage}
                                color={listItem.color}
                                blurLabel={blurListLabel}
                                blurValue={blurListValue}
                              />
                            ),
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Lógica das listas normais (ignorando o mapa pra não duplicar) */}
                  {isList && item.id !== "vendas_pais" && rawData.listItems && (
                    <div className="flex flex-col w-full pt-1">
                      {rawData.listItems.map((listItem: any, idx: number) => (
                        <MetricListItem
                          key={idx}
                          label={listItem.label}
                          value={listItem.value}
                          percentage={listItem.percentage}
                          color={listItem.color}
                          blurLabel={blurListLabel}
                          blurValue={blurListValue}
                        />
                      ))}
                    </div>
                  )}
                </MetricCard>

                {isEditing && (
                  <div
                    className="absolute -top-2 -right-2 z-[999] cursor-pointer bg-red-500 text-white p-1 rounded-full shadow-lg hover:scale-110 transition-transform flex items-center justify-center pointer-events-auto"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleRemove(item.id);
                    }}
                    onTouchStart={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleRemove(item.id);
                    }}
                  >
                    <X size={14} strokeWidth={3} />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {layout.length === 0 && (
        <div className="w-full h-[400px] border-2 border-dashed border-border/50 rounded-xl flex items-center justify-center text-muted-foreground bg-muted/5 absolute top-0 left-0 -z-10 pointer-events-none">
          Arraste as métricas da barra lateral para cá
        </div>
      )}
    </div>
  );
}
