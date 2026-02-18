"use client";

import { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { PremiumCard } from "@/components/cards/PremiumCard";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

// --- CORES ---
const COLORS = {
  revenue: "#3b82f6", // Azul
  profit: "#10b981", // Verde
  tax: "#f59e0b", // Laranja
  marketing: "#a855f7", // Roxo
  productcost: "#ef4444", // Vermelho
};

const LABELS = {
  revenue: "Receita Líquida",
  profit: "Lucro Líquido",
  tax: "Taxas e Impostos",
  marketing: "Marketing (Ads)",
  productcost: "Custo de Produto",
};

// --- GERADORES DE DADOS (MOCK) ---
const getRandom = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min) + min);

const generate24hData = () => {
  return Array.from({ length: 24 }, (_, i) => ({
    name: `${i}h`,
    revenue: 0, // Será calculado no front ou backend
    profit: getRandom(500, 1500),
    tax: getRandom(100, 300),
    marketing: getRandom(200, 500),
    productcost: getRandom(400, 1000),
  }));
};

const generateWeekData = () => {
  const days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  return days.map((day) => ({
    name: day,
    revenue: 0,
    profit: getRandom(3000, 8000),
    tax: getRandom(1000, 2000),
    marketing: getRandom(1500, 4000),
    productcost: getRandom(2000, 5000),
  }));
};

const generateRegionData = () => {
  const regions = ["Sul", "Sudeste", "Centro-Oeste", "Nordeste", "Norte"];
  return regions.map((reg) => ({
    name: reg,
    revenue: 0,
    profit: getRandom(10000, 25000),
    tax: getRandom(3000, 8000),
    marketing: getRandom(5000, 12000),
    productcost: getRandom(8000, 15000),
  }));
};

const generateTurnoData = () => {
  const turnos = ["Manhã", "Tarde", "Noite", "Madrugada"];
  return turnos.map((t) => ({
    name: t,
    revenue: 0,
    profit: getRandom(5000, 12000),
    tax: getRandom(1500, 3000),
    marketing: getRandom(2000, 6000),
    productcost: getRandom(4000, 8000),
  }));
};

interface ChartsAreaProps {
  data?: any[];
}

export function ChartBarStacked({ data }: ChartsAreaProps) {
  const [filter, setFilter] = useState("Visão Horária (24h)");

  // Inclui 'revenue' por padrão como você pediu
  const [activeMetrics, setActiveMetrics] = useState<string[]>([
    "revenue",
    "profit",
    "tax",
    "marketing",
    "productcost",
  ]);

  const toggleMetric = (key: string) => {
    setActiveMetrics((prev) =>
      prev.includes(key) ? prev.filter((m) => m !== key) : [...prev, key],
    );
  };

  const chartData = useMemo(() => {
    if (data && data.length > 0) return data;

    // Adicionei os casos que faltavam para os filtros funcionarem visualmente
    switch (filter) {
      case "Visão Horária (24h)":
        return generate24hData();
      case "Vendas por Hora":
        return generate24hData(); // Mesmo mock por enquanto
      case "Faturamento por Turno":
        return generateTurnoData();
      case "Vendas Dia da Semana":
        return generateWeekData();
      case "Vendas por Região":
        return generateRegionData();
      default:
        return generate24hData();
    }
  }, [filter, data]);

  // Calcula a Receita Total somando os componentes (para o gráfico ficar coerente no Mock)
  const processedData = useMemo(() => {
    return chartData.map((item: any) => {
      const calculatedRevenue =
        (item.profit || 0) +
        (item.tax || 0) +
        (item.marketing || 0) +
        (item.productcost || 0);
      return { ...item, revenue: calculatedRevenue };
    });
  }, [chartData]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      // Pega o valor da Receita (Total) se existir no payload, ou calcula
      const revenueItem = payload.find((p: any) => p.dataKey === "revenue");
      const totalValue = revenueItem ? revenueItem.value : 0;

      return (
        <div className="bg-[#09090b] border border-white/10 p-4 rounded-xl shadow-2xl min-w-[200px] z-50">
          <div className="mb-3 pb-2 border-b border-white/5 flex justify-between items-center">
            <p className="text-zinc-400 text-xs font-medium uppercase tracking-wider">
              Período: {label}
            </p>
          </div>
          <div className="space-y-2">
            {payload.map((entry: any) => {
              const key = entry.dataKey as keyof typeof LABELS;
              const name = LABELS[key];
              const color = COLORS[key];

              return (
                <div
                  key={entry.dataKey}
                  className="flex items-center justify-between gap-4 text-sm"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="block w-2 h-2 rounded-full shadow-[0_0_8px]"
                      style={{
                        backgroundColor: color,
                        boxShadow: `0 0 5px ${color}`,
                      }}
                    />
                    <span className="text-zinc-200 font-medium">{name}</span>
                  </div>
                  <span className="font-bold text-zinc-100">
                    {Number(entry.value).toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <PremiumCard className="w-full">
      <div className="p-6 flex flex-col gap-6">
        {/* === HEADER === */}
        <div className="flex flex-col xl:flex-row justify-between xl:items-start gap-4">
          <div className="min-w-[200px]">
            <h3 className="text-lg font-bold text-foreground">
              Resumo Financeiro
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Acompanhe a composição do seu resultado.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-wrap justify-end w-full">
            {/* DROPDOWN DE FILTRO (Restaurado para 5 itens) */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white/5 border-white/10 text-xs hover:bg-white/10 min-w-[160px] justify-between transition-all shrink-0"
                >
                  <span className="flex items-center gap-2 truncate">
                    <Filter size={12} className="opacity-70" /> {filter}
                  </span>
                  <ChevronDown size={12} className="opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="bg-[#09090b] border-border/40 min-w-[200px]"
              >
                <DropdownMenuItem onClick={() => setFilter("Faturamento")}>
                  Faturamento
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setFilter("Faturamento por Turno")}
                >
                  Faturamento por Turno
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter("Vendas por Hora")}>
                  Vendas por Hora
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setFilter("Vendas Dia da Semana")}
                >
                  Vendas Dia da Semana
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setFilter("Vendas por Região")}
                >
                  Vendas por Região
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* TOGGLES (Restaurado botão de Receita) */}
            <div className="flex flex-wrap items-center gap-2 bg-muted/20 p-1.5 rounded-lg border border-white/5">
              {Object.keys(LABELS).map((key) => {
                const k = key as keyof typeof LABELS;
                const isActive = activeMetrics.includes(k);
                return (
                  <button
                    key={k}
                    onClick={() => toggleMetric(k)}
                    className={cn(
                      "flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold transition-all duration-300 border shrink-0",
                      isActive
                        ? "bg-white/5 border-white/10 text-foreground shadow-inner"
                        : "border-transparent text-muted-foreground hover:text-foreground opacity-60 hover:opacity-100",
                    )}
                  >
                    <span
                      className={cn(
                        "w-2 h-2 rounded-full transition-all",
                        isActive ? "scale-110" : "scale-90",
                      )}
                      style={{
                        backgroundColor: COLORS[k],
                        boxShadow: isActive ? `0 0 8px ${COLORS[k]}` : "none",
                      }}
                    />
                    {LABELS[k]}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* === GRÁFICO === */}
        <div className="w-full h-[400px] mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={processedData}
              margin={{ top: 20, right: 0, left: 0, bottom: 0 }}
              barSize={20}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="rgba(255,255,255,0.05)"
              />

              <XAxis
                dataKey="name"
                stroke="#52525b"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                dy={10}
                interval="preserveStartEnd"
              />

              <YAxis
                stroke="#52525b"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                width={45}
                tickFormatter={(val) => `R$${val / 1000}k`}
              />

              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: "rgba(255,255,255,0.02)" }}
              />

              {/* BARRA DE RECEITA (STACK B) 
                  Só renderiza se estiver ativa no toggle.
                  Isso corrige o alinhamento: se você desativar a receita, o resto centraliza.
              */}
              {activeMetrics.includes("revenue") && (
                <Bar
                  dataKey="revenue"
                  stackId="a" // Separado para comparar (Lado a Lado)
                  fill={COLORS.revenue}
                  radius={[0, 0, 0, 0]}
                  //className="opacity-30 hover:opacity-100 transition-opacity"
                />
              )}

              {/* BARRAS DE COMPOSIÇÃO (STACK A) */}
              {activeMetrics.includes("profit") && (
                <Bar
                  dataKey="profit"
                  stackId="a"
                  fill={COLORS.profit}
                  radius={[0, 0, 0, 0]}
                  animationDuration={800}
                />
              )}
              {activeMetrics.includes("productcost") && (
                <Bar
                  dataKey="productcost"
                  stackId="a"
                  fill={COLORS.productcost}
                  radius={[0, 0, 0, 0]}
                  animationDuration={800}
                />
              )}
              {activeMetrics.includes("marketing") && (
                <Bar
                  dataKey="marketing"
                  stackId="a"
                  fill={COLORS.marketing}
                  radius={[0, 0, 0, 0]}
                  animationDuration={800}
                />
              )}
              {activeMetrics.includes("tax") && (
                <Bar
                  dataKey="tax"
                  stackId="a"
                  fill={COLORS.tax}
                  // Arredonda o topo apenas se for o último item da pilha
                  radius={[4, 4, 0, 0]}
                  animationDuration={800}
                />
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </PremiumCard>
  );
}
