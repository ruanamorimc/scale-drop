"use client";

import React, { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import { MetricCard, MetricListItem } from "./MetricCard";
import { ALL_METRICS } from "@/constants/metrics";
import { cn } from "@/lib/utils";
import { CARD_SIZES } from "@/constants/dashboard-layout";

import { GridStack, type GridStackNode } from "gridstack";
// @ts-ignore
import "gridstack/dist/gridstack.css";

// 🔥 IMPORT DOS ELEMENTOS DO SHADCN PARA O NOSSO NOVO SELECT
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import SalesPaymentChart from "@/components/chart/SalesByPaymentChart";
import ConversionFunnelChart from "@/components/chart/ConversionFunnelChart";
import SalesByCountryMap from "@/components/chart/SalesByCountryMap";
import SalesByDayChart from "@/components/chart/SalesByDayChart";
import SalesByHourChart from "@/components/chart/SalesByHourChart";
import ProfitByHourChart from "@/components/chart/ProfitByHourChart";
import AccumulatedMetricsChart from "@/components/chart/AccumulatedMetricsChart";

export const getGridConstraints = (id: string) => {
  // 1. Agora sim! Buscamos as regras no dicionário oficial de todos os cards
  const config = CARD_SIZES[id];

  if (config) {
    return {
      w: config.w || 3,
      h: config.h || 3,
      minW: config.minW || 3,
      maxW: config.maxW || 12,
      minH: config.minH || 3,
      maxH: config.maxH || 12,
    };
  }

  // 2. Trava Inteligente para Gráficos Novos (Caso esqueça de adicionar no CARD_SIZES)
  const isChart =
    id.includes("horario") ||
    id.includes("hora") ||
    id.includes("dia") ||
    id.includes("funil");
  if (isChart) {
    return { w: 12, h: 9, minW: 4, maxW: 12, minH: 9, maxH: 18 };
  }

  // 3. Fallback de Segurança
  return { w: 3, h: 3, minW: 2, maxW: 4, minH: 3, maxH: 4 };
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

// 1. Passamos o 'data' como segundo parâmetro para resolver o escopo do TypeScript
const getRawData = (id: string, apiData: Record<string, unknown> | null) => {
  // Tela de carregamento enquanto o banco processa
  if (!apiData) {
    return { value: "...", desc: "Calculando dados...", trend: "neutral" };
  }

  // Formatadores Nativos
  const formatMoney = (val: unknown) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(Number(val) || 0);
  const formatDec = (val: unknown) => Number(val || 0).toFixed(2);
  const formatPerc = (val: unknown) => `${Number(val || 0).toFixed(1)}%`;

  // Captura os valores numéricos para a lógica de cores (trend)
  const lucroValue = Number(apiData.netProfit || 0);
  const margemValue = Number(apiData.profitMargin || 0);
  const roasValue = Number(apiData.roas || 0);
  const roiValue = Number(apiData.roi || 0);

  // Lógica dinâmica para a Taxa de Aprovação baseada nos métodos de pagamento reais
  const methods = (apiData.paymentMethods as Record<string, number>) || {
    credit_card: 0,
    pix: 0,
    boleto: 0,
    outros: 0,
  };
  const totalMethods =
    methods.credit_card + methods.pix + methods.boleto + (methods.outros || 0);
  const percCartao =
    totalMethods > 0 ? (methods.credit_card / totalMethods) * 100 : 0;
  const percPix = totalMethods > 0 ? (methods.pix / totalMethods) * 100 : 0;
  const percBoleto =
    totalMethods > 0 ? (methods.boleto / totalMethods) * 100 : 0;
  const percOutros =
    totalMethods > 0 ? ((methods.outros || 0) / totalMethods) * 100 : 0;

  // Variável que vai guardar o objeto final
  let cardData: Record<string, unknown> = {};

  switch (id) {
    // --- NEUTROS ---
    case "faturamento_bruto":
      cardData = {
        value: formatMoney(apiData.grossRevenue),
        desc: "Faturamento Bruto das Vendas Aprovadas \n\n Fat.Bruto = Venda - Taxa do gateway de pagamentos - Taxas de coprodutores e afiliados",
        trend: "neutral",
      };
      break;
    case "gastos":
      cardData = {
        value: formatMoney(apiData.adSpend),
        desc: "Valor investido em anúncios.",
        trend: "neutral",
      };
      break;
    case "cpa": {
      // Puxamos o gasto com anúncios como "sensor"
      const adSpend = Number(apiData?.adSpend || 0);

      cardData = {
        // 🔥 Se o gasto em anúncios for 0, mostra N/A. Senão, mostra o valor em dinheiro!
        value: adSpend === 0 ? "N/A" : formatMoney(apiData?.cpa || 0),
        desc: "Custo por aquisição de cliente",
        trend: "neutral",
      };
      break;
    }
    case "arpu": {
      // 🔥 Abrimos a chave para isolar o escopo
      // Puxamos o faturamento para verificar se houve vendas no período
      const grossRev = Number(apiData?.grossRevenue || 0);

      cardData = {
        // 🔥 Se não houver vendas, mostra N/A. Senão, calcula o ARPU normalmente!
        value: grossRev === 0 ? "N/A" : formatMoney(apiData?.arpu),
        desc: "Ticket Médio por Usuário \n\n ARPU = Faturamento Líquido/Clientes Distintos",
        trend: "neutral",
      };
      break;
    } // 🔥 Fechamos a chave
    case "faturamento_liquido":
      cardData = {
        value: formatMoney(apiData.netRevenue),
        desc: "Faturamento Líquido das Vendas Aprovadas \n\n Fat.Líquido = Vendas - Taxa do gateway de pagamentos - Taxas de coprodutores e afiliados - Taxa - Imposto total - Custo de Produtos",
        trend: "neutral",
      };
      break;
    case "chargeback":
      cardData = {
        value: formatPerc(0), // Mantido 0% até integrarmos o webhook de chargeback
        desc: "Taxa de Chargeback \n\n (Calculada sobre o faturamento)",
        trend: "neutral",
      };
      break;
    case "reembolso_perc":
      cardData = {
        value: formatPerc(apiData.refundRate),
        desc: "Taxa de Reembolso \n\n (Calculada sobre a quantidade de pedidos)",
        trend: "neutral",
      };
      break;
    case "reembolso_val": // ID para valor financeiro do reembolso
      cardData = {
        value: formatMoney(apiData.refundedRevenue),
        desc: "Valor total reembolsado",
        trend: "neutral",
      };
      break;
    case "taxas":
      cardData = {
        value: formatMoney(0), // Ficará 0 até integrarmos as taxas dos gateways
        desc: "Taxas de processamento e gateway",
        trend: "neutral",
      };
      break;
    case "vendas_pendentes":
      cardData = {
        value: formatMoney(apiData.pendingRevenue),
        desc: "Aguardando pagamento (Boleto/Pix não confirmados)",
        trend: "neutral",
      };
      break;
    case "imposto":
      cardData = {
        value: formatMoney(apiData.totalTaxes),
        desc: "Impostos calculados",
        trend: "neutral",
      };
      break;
    case "vendas_pagamento":
      cardData = {
        value: undefined, // O gráfico já calcula o número gigante do meio sozinho
        desc: "Distribuição das vendas aprovadas separadas por método de pagamento (Cartão, Pix, Boleto e Outros).",
        trend: "neutral",
      };
      break;

    case "vendas_chargeback":
      cardData = {
        value: formatMoney(0), // Ficará zerado até integrarmos o webhook de disputas do gateway
        desc: "Valor retido por contestações de compra (Chargebacks) abertas pelos clientes no cartão de crédito.",
        trend: "neutral",
      };
      break;

    case "vendas_devolvidas":
      cardData = {
        value: formatMoney(apiData.refundedRevenue), // Já puxando os reembolsos que mapeamos no motor!
        desc: "Valor total de vendas que foram canceladas ou reembolsadas.",
        trend: "neutral",
      };
      break;

    case "custos_produto": // Verifique se o ID no seu layout está no plural ou singular
      cardData = {
        value: formatMoney(apiData.productCosts),
        desc: "Custo de Mercadoria Vendida (CMV) total dos produtos cujos pedidos foram aprovados no período selecionado.",
        trend: "neutral",
      };
      break;

    case "gastos_adicionais":
      cardData = {
        value: formatMoney(apiData.extraExpenses),
        desc: "Total de despesas operacionais, custos fixos e variáveis cadastrados no módulo financeiro dentro do período selecionado.",
        trend: "neutral",
      };
      break;

    case "conversas":
      cardData = {
        value: apiData.conversations?.toString() || "0", // Exibe em número inteiro
        desc: "Total de conversas iniciadas em aplicativos de mensagens (WhatsApp, Direct, Messenger) rastreadas pelas campanhas.",
        trend: "neutral",
      };
      break;

    case "custo_conversa": {
      // Puxamos o gasto e as conversas para saber se existe métrica a ser calculada
      const adSpend = Number(apiData?.adSpend || 0);
      const conversations = Number(apiData?.conversations || 0);

      cardData = {
        // 🔥 Se não gastou nada OU não teve conversas, mostra N/A. Senão, formata em Moeda!
        value:
          adSpend === 0 || conversations === 0
            ? "N/A"
            : formatMoney(apiData?.costPerConversation || 0),
        desc: "Custo por cada conversa iniciada",
        trend: "neutral",
      };
      break;
    }

    case "leads":
      cardData = {
        value: apiData.leads?.toString() || "0", // Exibe em número inteiro
        desc: "Quantidade total de Leads captados através das campanhas de anúncios.",
        trend: "neutral",
      };
      break;

    case "custo_lead":
      cardData = {
        value: formatMoney(apiData.costPerLead), // Exibe em R$
        desc: "Custo por Lead / CPL (Total gasto em Anúncios ÷ Quantidade de Leads captados).",
        trend: "neutral",
      };
      break;

    // --- GRUPO DE IMPOSTOS ---
    case "imposto_vendas":
      cardData = {
        value: formatMoney(apiData.salesTaxes),
        desc: "Impostos calculados sobre o faturamento (Líquido/Bruto) geral de todas as vendas.",
        trend: "neutral",
      };
      break;

    case "imposto_meta_ads":
      cardData = {
        value: formatMoney(apiData.metaAdsTaxes),
        desc: "Impostos incidentes especificamente sobre o faturamento de vendas oriundas de anúncios da Meta.",
        trend: "neutral",
      };
      break;

    case "imposto_total": // Lembre-se de checar se o seu ID atual não está apenas como "imposto"
      cardData = {
        value: formatMoney(apiData.totalTaxes),
        desc: "Soma de todos os impostos retidos (Imposto sobre Vendas + Imposto Meta Ads).",
        trend: "neutral",
      };
      break;

    // 🔥 DADOS DO FUNIL (COM QUEBRA DE LINHA NO TOOLTIP)
    case "funil":
      cardData = {
        value: undefined,
        trend: "neutral",
        desc: "O funil de conversão analisa as métricas de cada etapa do seu funil. Sendo elas:\n\n• Cliques;\n• Visualizações de Página;\n• Adição ao Carrinho;\n• Início de Finalização de Compra;\n• Vendas Iniciadas;\n• Vendas Aprovadas.\n\nAs métricas de cliques, vis. de página e ICs são advindas do Meta. Para maior assertividade, é necessário que o pixel esteja configurado corretamente.\n\nEsse gráfico considera apenas os dados da Meta.",
      };
      break;

    // --- OS 4 CARDS COM CORES DINÂMICAS (VERDE/VERMELHO) ---
    case "lucro":
      cardData = {
        value: formatMoney(apiData.netProfit),
        desc: "Lucro Calculado \n\n Lucro = Faturamento Líquido - Gastos com anúncios - Despesas adicionais",
        trend:
          lucroValue > 0 ? "positive" : lucroValue < 0 ? "negative" : "neutral",
      };
      break;
    case "margem": {
      // 🔥 ABRA A CHAVE AQUI
      // Puxamos o faturamento para saber se houve vendas
      const grossRev = Number(apiData?.grossRevenue || 0);

      cardData = {
        // Se não tem venda, N/A. Se tem, usa o seu formatador original!
        value: grossRev === 0 ? "N/A" : formatPerc(apiData?.profitMargin),
        desc: "Equivale ao percentual do faturamento que é lucro \n\n Margem = Lucro/Faturamento Líquido",
        // Se não tem venda, fica neutro (cinza). Se tem, usa a sua lógica original!
        trend:
          grossRev === 0
            ? "neutral"
            : margemValue > 0
              ? "positive"
              : margemValue < 0
                ? "negative"
                : "neutral",
      };
      break;
    }
    case "roas":
      // Verifica se houve algum gasto para poder calcular o ROAS
      const temGastoRoas = Number(apiData.adSpend) > 0;

      cardData = {
        value: temGastoRoas ? formatDec(apiData.roas) : "N/A",
        desc: "Retorno sobre o investimento em anúncios\n \n ROAS = Faturamento Bruto/Gastos com anúncios",
        // Se tem gasto, aplica a regra de cores. Se não tem, fica neutro (cinza)
        trend: temGastoRoas
          ? roasValue >= 1
            ? "positive"
            : "negative"
          : "neutral",
      };
      break;

    case "roi":
      // Verifica se houve algum gasto para justificar o cálculo de ROI
      const temGastoRoi = Number(apiData.adSpend) > 0;

      cardData = {
        value: temGastoRoi ? formatDec(apiData.roi) : "N/A",
        desc: "Retorno sobre o investimento \n \n ROI = Faturamento Líquido/Gastos Totais",
        trend: temGastoRoi
          ? roiValue >= 0
            ? "positive"
            : "negative"
          : "neutral",
      };
      break;

    // --- LISTAS COM SUBTÍTULOS ---
    // Nota: Estas listas continuam com a estrutura visual estática pois as actions
    // de produtos e origens serão construídas no futuro.
    case "vendas_produto": {
      // Puxa os dados com segurança
      const pCount = (apiData.productsCount as Record<string, number>) || {};
      const totalUnits = Object.values(pCount).reduce(
        (acc, val) => acc + val,
        0,
      );

      // Mapeia, calcula a porcentagem e ordena do maior para o menor
      const productListItems = Object.entries(pCount)
        .map(([name, qty]) => ({
          label: name,
          value: qty,
          percentage:
            totalUnits > 0 ? Number(((qty / totalUnits) * 100).toFixed(1)) : 0,
          color: "#3b82f6",
        }))
        .sort((a, b) => b.value - a.value);

      cardData = {
        desc: "Total de unidades vendidas \n\n Uma venda pode incluir várias unidades",
        subtitle: "(deslize a tela ↓)",
        listItems: productListItems.length > 0 ? productListItems : [],
      };
      break;
    }
    case "faturamento_produto": {
      // Puxa os dados de dinheiro que acabamos de criar no backend
      const pRev = (apiData.productsRevenue as Record<string, number>) || {};
      const totalRev = Object.values(pRev).reduce((acc, val) => acc + val, 0);

      const revListItems = Object.entries(pRev)
        .map(([name, money]) => ({
          label: name,
          value: formatMoney(money), // Usa o seu formatador nativo!
          percentage:
            totalRev > 0 ? Number(((money / totalRev) * 100).toFixed(1)) : 0,
          color: "#3b82f6",
        }))
        .sort((a, b) => {
          // Ordena usando o valor numérico real, não a string formatada em R$
          const valA = pRev[a.label] || 0;
          const valB = pRev[b.label] || 0;
          return valB - valA;
        });

      cardData = {
        desc: "Faturamento total separado por produto.",
        subtitle: "(deslize a tela ↓)",
        listItems: revListItems.length > 0 ? revListItems : [],
      };
      break;
    }
    case "vendas_posicionamento": {
      const dataObj =
        (apiData.salesByPlacement as Record<string, number>) || {};
      const total = Object.values(dataObj).reduce((acc, val) => acc + val, 0);

      const listItems = Object.entries(dataObj)
        .map(([name, qty]) => ({
          label: name,
          value: qty,
          percentage: total > 0 ? Number(((qty / total) * 100).toFixed(1)) : 0,
          color: "#8b5cf6", // Roxo
        }))
        .sort((a, b) => Number(b.value) - Number(a.value));

      cardData = {
        desc: "Locais onde as conversões ocorreram.",
        subtitle: "(deslize a tela ↓)",
        listItems: listItems.length > 0 ? listItems : [],
      };
      break;
    }
    case "vendas_src": {
      const dataObj = (apiData.salesBySrc as Record<string, number>) || {};
      const total = Object.values(dataObj).reduce((acc, val) => acc + val, 0);

      const listItems = Object.entries(dataObj)
        .map(([name, qty]) => ({
          label: name,
          value: qty,
          percentage: total > 0 ? Number(((qty / total) * 100).toFixed(1)) : 0,
          color: "#10b981", // Verde
        }))
        .sort((a, b) => Number(b.value) - Number(a.value));

      cardData = {
        desc: "Origem das vendas rastreadas \n\n 'N/A' = Vendas sem parâmetro rastreado",
        subtitle: "(deslize a tela ↓)",
        listItems: listItems.length > 0 ? listItems : [],
      };
      break;
    }
    case "vendas_fonte": {
      const dataObj = (apiData.salesBySource as Record<string, number>) || {};
      const total = Object.values(dataObj).reduce((acc, val) => acc + val, 0);

      const listItems = Object.entries(dataObj)
        .map(([name, qty]) => ({
          label: name,
          value: qty,
          percentage: total > 0 ? Number(((qty / total) * 100).toFixed(1)) : 0,
          color: "#3b82f6", // Azul
        }))
        .sort((a, b) => Number(b.value) - Number(a.value));

      cardData = {
        desc: "Plataformas que geraram vendas.",
        subtitle: "(deslize a tela ↓)",
        listItems: listItems.length > 0 ? listItems : [],
      };
      break;
    }
    case "taxa_aprovacao":
      cardData = {
        desc: "Porcentagem de pagamentos aprovados por método de pagamento.",
        listItems: [
          // Calculado com dados reais do banco
          {
            label: "Cartão",
            percentage: Number(percCartao.toFixed(1)),
            color: "#3b82f6",
          },
          {
            label: "Pix",
            percentage: Number(percPix.toFixed(1)),
            color: "#3b82f6",
          },
          {
            label: "Boleto",
            percentage: Number(percBoleto.toFixed(1)),
            color: "#3b82f6",
          },
          {
            label: "Outros",
            percentage: Number(percOutros.toFixed(1)),
            color: "#3b82f6",
          },
        ],
      };
      break;
    // 🔥 DADOS DO MAPA ADICIONADOS AQUI:
    case "vendas_pais": {
      // 1. Pegamos os dados reais que vieram do backend
      const countryData = Array.isArray(apiData?.salesByCountry)
        ? apiData.salesByCountry
        : [];

      // 2. Descobrimos o total para calcular as porcentagens dinamicamente
      const totalCountrySales = countryData.reduce(
        (acc: number, curr: Record<string, unknown>) =>
          acc + (Number(curr.count) || 0),
        0,
      );

      // 🔥 3. TRADUTOR AUTOMÁTICO: Converte siglas do banco para nomes bonitos
      const countryTranslator: Record<string, string> = {
        BR: "Brasil",
        Brazil: "Brasil",
        US: "Estados Unidos",
        USA: "Estados Unidos",
        PT: "Portugal",
        // Você pode adicionar mais siglas aqui no futuro se começar a vender pra fora!
      };

      // 4. Montamos a lista real
      const mappedCountries = countryData.map(
        (item: Record<string, unknown>) => {
          const count = Number(item.count) || 0;
          const perc =
            totalCountrySales > 0 ? (count / totalCountrySales) * 100 : 0;

          // Pega o nome cru que veio do banco (ex: "BR")
          const rawCountry = String(item.country || "N/A").trim();

          // 🔥 Traduz o país se estiver no nosso dicionário, senão usa o original
          const countryName = countryTranslator[rawCountry] || rawCountry;

          // Regra do N/A
          const isNA =
            !item.country ||
            rawCountry === "N/A" ||
            rawCountry === "Sem país" ||
            rawCountry === "undefined";
          const color = isNA ? "#475569" : "#2563eb";

          return {
            label: isNA ? "N/A" : countryName, // Vai enviar "Brasil" limpinho!
            value: count,
            percentage: Number(perc.toFixed(1)),
            color: color,
          };
        },
      );

      cardData = {
        desc: "Distribuição global das vendas.",
        listItems: mappedCountries,
      };
      break;
    }
    case "vendas_dia":
      cardData = {
        value: undefined, // O valor é desenhado pelo próprio gráfico
        desc: "Percentual de vendas para cada dia da semana",
        trend: "neutral",
      };
      break;
    case "lucro_horario":
      cardData = {
        value: undefined,
        desc: "Lucro por hora no período selecionado (máx. 31 dias).",
        trend: "neutral",
      };
      break;
    case "vendas_horario":
      cardData = {
        value: undefined,
        desc: "Distribuição percentual e quantitativa do volume de vendas por horário ao longo de 24 horas.",
        trend: "neutral",
      };
      break;
    case "fat_inv_lucro_hora":
      cardData = {
        value: undefined,
        desc: "Comparativo de Faturamento, Investimento e Lucro por hora (máx. 31 dias).",
        trend: "neutral",
      };
      break;

    default:
      cardData = {
        value: "N/A",
        desc: "Métrica em análise.",
        trend: "neutral",
      };
      break;
  }

  return cardData;
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
  layout: Record<string, unknown>[]; // Ou 'LayoutItem[]' se importar o tipo correto
  isEditing: boolean;
  onChangeLayout: (layout: Record<string, unknown>[]) => void;
  showValues: boolean;
  data: Record<string, unknown> | null; // Recebemos os dados reais aqui
}

export default function DashboardGrid({
  layout,
  isEditing,
  onChangeLayout,
  showValues,
  data,
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
      const currentLayout = [...layoutRef.current];
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

      (
        layout as Array<{
          id: string;
          x?: number;
          y?: number;
          w?: number;
          h?: number;
        }>
      ).forEach((item) => {
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
    // 1. ATUALIZA A MEMÓRIA IMEDIATAMENTE (O Segredo!)
    // Remove o card da referência antes do GridStack agir. Assim, se o GridStack
    // mover outros cards para cima e disparar o 'change', ele não vai ressuscitar este card.
    layoutRef.current = layoutRef.current.filter((l) => l.id !== id);

    // 2. Remove do GridStack
    const grid = gridRef.current;
    const el = document.getElementById(`gs-${id}`);
    if (grid && el) grid.removeWidget(el, false);

    // 3. Atualiza o estado oficial do React no pai
    onChangeLayout(layoutRef.current);
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
        {(
          layout as Array<{
            id: string;
            x?: number;
            y?: number;
            w?: number;
            h?: number;
          }>
        ).map((item) => {
          const metricDef = ALL_METRICS.find((m) => m.id === item.id);
          const title = metricDef?.label || item.id;
          const rawData = getRawData(item.id, data);

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
                  title={title as string}
                  subtitle={rawData.subtitle as string}
                  trend={rawData.trend as "neutral" | "positive" | "negative"}
                  value={displayValue as string | number}
                  description={rawData.desc as string}
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
                      {item.id === "vendas_pagamento" && (
                        <SalesPaymentChart
                          paymentData={
                            data?.paymentMethods as Record<string, number>
                          }
                        />
                      )}
                      {item.id === "funil" && (
                        <ConversionFunnelChart
                          funnelData={data?.funnel as Record<string, number>}
                        />
                      )}
                      {item.id === "vendas_dia" && (
                        <SalesByDayChart
                          salesData={data?.salesByDay as Record<number, number>}
                        />
                      )}
                      {item.id === "vendas_horario" && (
                        <div className="flex flex-col w-full h-full">
                          <SalesByHourChart
                            chartData={
                              data?.profitByHour as {
                                hour: string;
                                salesCount: number;
                              }[]
                            }
                          />
                        </div>
                      )}
                      {item.id === "lucro_horario" && (
                        <div className="flex flex-col w-full h-full pb-1">
                          {/* 🔥 LÓGICA DE EXIBIÇÃO OU BLOQUEIO */}
                          {data?.isOver31Days ? (
                            <div className="flex-1 flex flex-col items-center justify-center min-h-[180px] w-full bg-muted/20 rounded-md border border-dashed border-muted">
                              <span className="text-sm text-muted-foreground/70 font-medium text-center px-4">
                                O período selecionado ultrapassa o limite de
                                processamento.
                              </span>
                              <span className="text-xs text-muted-foreground/50 mt-1">
                                Selecione um intervalo de até 31 dias.
                              </span>
                            </div>
                          ) : (
                            <div className="flex-1 min-h-[180px] w-full relative">
                              <ProfitByHourChart
                                viewMode={lucroHorarioMode}
                                chartData={
                                  data?.profitByHour as {
                                    hour: string;
                                    grossProfit: number;
                                    netProfit: number;
                                  }[]
                                }
                              />
                            </div>
                          )}

                          {/* O shrink-0 impede que o gráfico empurre e esconda o aviso vermelho */}
                          <p className="text-[#ef4444] text-[10px] text-center mt-2 font-medium shrink-0">
                            Para o gráfico &quot;Lucro por Horário&quot;,
                            consideramos no máximo 1 mês de dados (31 dias).
                          </p>
                        </div>
                      )}
                      {item.id === "fat_inv_lucro_hora" && (
                        <div className="flex flex-col w-full h-full pb-1">
                          {data?.isOver31Days ? (
                            <div className="flex-1 flex flex-col items-center justify-center min-h-[180px] w-full bg-muted/20 rounded-md border border-dashed border-muted">
                              <span className="text-sm text-muted-foreground/70 font-medium text-center px-4">
                                O período selecionado ultrapassa o limite de
                                processamento.
                              </span>
                              <span className="text-xs text-muted-foreground/50 mt-1">
                                Selecione um intervalo de até 31 dias.
                              </span>
                            </div>
                          ) : (
                            <div className="flex-1 min-h-[180px] w-full relative">
                              {/* Substitua "fatInvLucroMode" pela variável exata que controla o botão Bruto/Líquido deste card */}
                              <AccumulatedMetricsChart
                                viewMode={fatInvLucroMode}
                                chartData={
                                  data?.profitByHour as React.ComponentProps<
                                    typeof AccumulatedMetricsChart
                                  >["chartData"]
                                }
                              />
                            </div>
                          )}

                          <p className="text-[#ef4444] text-[10px] text-center mt-2 font-medium shrink-0">
                            Para o gráfico &quot;Faturamento x Investimento x
                            Lucro&quot;, consideramos no máximo 1 mês de dados
                            (31 dias).
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 🔥 LÓGICA EXCLUSIVA DO MAPA (Vendas por País) */}
                  {item.id === "vendas_pais" && (
                    <div className="flex w-full h-full flex-col">
                      {countryMode === "mapa" ? (
                        // 🔥 AQUI INJETAMOS OS DADOS REAIS E TIPADOS CORRETAMENTE
                        <SalesByCountryMap
                          showValues={displayMainValue}
                          chartData={
                            Array.isArray(rawData?.listItems)
                              ? rawData.listItems.map(
                                  (listItem: Record<string, unknown>) => ({
                                    // 🔥 Traduz o Brazil com Z para Brasil com S automaticamente!
                                    country:
                                      listItem.label === "Brazil"
                                        ? "Brasil"
                                        : String(listItem.label || ""),
                                    count: Number(listItem.value) || 0,
                                  }),
                                )
                              : []
                          }
                        />
                      ) : (
                        <div className="flex flex-col w-full pt-1 px-[21px]">
                          {Array.isArray(rawData.listItems) &&
                          rawData.listItems.length > 0 ? (
                            rawData.listItems.map(
                              (
                                listItem: Record<string, unknown>,
                                idx: number,
                              ) => (
                                <MetricListItem
                                  key={idx}
                                  label={listItem.label as string}
                                  value={listItem.value as string | number}
                                  percentage={listItem.percentage as number}
                                  color={listItem.color as string}
                                  blurLabel={blurListLabel}
                                  blurValue={blurListValue}
                                />
                              ),
                            )
                          ) : (
                            <div className="flex flex-1 items-center justify-center h-full min-h-[150px] pb-6">
                              <span className="text-sm text-muted-foreground/70 font-medium">
                                Nenhuma venda por aqui
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                  {/* 🔥 LÓGICA DAS LISTAS NORMAIS (Ignorando o mapa pra não duplicar) */}
                  {isList &&
                    item.id !== "vendas_pais" &&
                    Array.isArray(rawData.listItems) && (
                      <div className="flex flex-col w-full pt-1">
                        {rawData.listItems.length > 0 ? (
                          rawData.listItems.map(
                            (
                              listItem: Record<string, unknown>,
                              idx: number,
                            ) => (
                              <MetricListItem
                                key={idx}
                                label={listItem.label as string}
                                value={listItem.value as string | number}
                                percentage={listItem.percentage as number}
                                color={listItem.color as string}
                                blurLabel={blurListLabel}
                                blurValue={blurListValue}
                              />
                            ),
                          )
                        ) : (
                          <div className="flex flex-1 items-center justify-center h-full min-h-[150px] pb-6">
                            <span className="text-sm text-muted-foreground/70 font-medium">
                              Nenhuma venda por aqui
                            </span>
                          </div>
                        )}
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
