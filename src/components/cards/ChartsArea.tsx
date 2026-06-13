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
  revenue: "#3b82f6",
  profit: "#10b981",
  tax: "#f59e0b",
  marketing: "#a855f7",
  productcost: "#ef4444",
};

const LABELS = {
  revenue: "Receita Líquida",
  profit: "Lucro Líquido",
  tax: "Taxas e Impostos",
  marketing: "Marketing (Ads)",
  productcost: "Custo do Produto",
};

// ==========================================
// TIPAGENS PERFEITAS
// ==========================================
interface ChartDataItem {
  name: string;
  revenue?: number;
  profit?: number;
  tax?: number;
  marketing?: number;
  productcost?: number;
  productCost?: number;
}

interface ChartsAreaProps {
  data?: {
    chartData?: ChartDataItem[];
    timelineData?: ChartDataItem[];
    turnoData?: ChartDataItem[];
    weekData?: ChartDataItem[];
    regionData?: ChartDataItem[];
    [key: string]: unknown;
  };
}

interface TooltipPayload {
  dataKey: string;
  value: number;
  color: string;
  name: string;
  payload: Record<string, unknown>;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}

// --- TOOLTIP ---
const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#09090b] border border-white/10 p-4 rounded-xl shadow-2xl min-w-[200px] z-50">
        <div className="mb-3 pb-2 border-b border-white/5 flex justify-between items-center">
          <p className="text-zinc-400 text-xs font-medium uppercase tracking-wider">
            Período: {label}
          </p>
        </div>
        <div className="space-y-2">
          {payload.map((entry) => {
            const key = entry.dataKey as keyof typeof LABELS;
            const name = LABELS[key] || entry.name;
            const color = COLORS[key] || entry.color;

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

// --- FORMATAÇÃO DO EIXO Y ---
const formatYAxis = (val: number) => {
  if (val === 0) return "R$ 0";
  if (val < 1000) return `R$ ${val}`;
  const thousands = val / 1000;
  return Number.isInteger(thousands)
    ? `R$ ${thousands}k`
    : `R$ ${thousands.toFixed(1)}k`;
};

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================
export function ChartBarStacked({ data }: ChartsAreaProps) {
  const [activeMetrics, setActiveMetrics] = useState<string[]>([
    "revenue",
    "profit",
    "tax",
    "marketing",
    "productcost",
  ]);

  const [filter, setFilter] = useState("Faturamento");

  const toggleMetric = (key: string) => {
    setActiveMetrics((prev) =>
      prev.includes(key) ? prev.filter((m) => m !== key) : [...prev, key],
    );
  };

  // 🔥 Agora todos os filtros leem os dados reais do Banco de Dados
  const currentData = useMemo(() => {
    if (!data) return [];
    switch (filter) {
      case "Faturamento":
        return data.timelineData || [];
      case "Vendas por Hora":
        return data.chartData || [];
      case "Faturamento por Turno":
        return data.turnoData || [];
      case "Vendas Dia da Semana":
        return data.weekData || [];
      case "Vendas por Região":
        return data.regionData || [];
      default:
        return data.timelineData || [];
    }
  }, [filter, data]);

  // Corrige a diferença de C maiúsculo/minúsculo vinda do banco dinamicamente
  const mappedData = useMemo(() => {
    return currentData.map((item) => ({
      ...item,
      productcost:
        item.productcost !== undefined ? item.productcost : item.productCost,
    }));
  }, [currentData]);

  return (
    <PremiumCard className="w-full">
      <div className="p-6 flex flex-col gap-6">
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

        <div className="w-full h-[400px] mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={mappedData}
              margin={{ top: 20, right: 0, left: 0, bottom: 0 }}
              barSize={12}
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
                tickFormatter={formatYAxis}
              />

              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: "rgba(255,255,255,0.02)" }}
              />

              {activeMetrics.includes("revenue") && (
                <Bar
                  dataKey="revenue"
                  stackId="a"
                  fill={COLORS.revenue}
                  radius={[0, 0, 0, 0]}
                  animationDuration={800}
                />
              )}
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
