"use client";

import React from "react";
import {
  Line,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

interface AccumulatedData {
  hour: string;
  grossRevenue: number;
  netRevenue: number;
  grossProfit: number;
  netProfit: number;
  investment: number;
}

interface AccumulatedMetricsChartProps {
  chartData?: AccumulatedData[];
  viewMode?: string;
}

const chartConfig = {
  investimento: { label: "Investimento", color: "#f59e0b" },
  faturamento: { label: "Faturamento", color: "#3b82f6" },
  lucro: { label: "Lucro", color: "#10b981" },
} satisfies ChartConfig;

export default function AccumulatedMetricsChart({
  chartData = [],
  viewMode = "liquido",
}: AccumulatedMetricsChartProps) {
  const processedData = chartData.map((item) => ({
    hour: item.hour,
    investimento: item.investment || 0,
    faturamento: viewMode === "liquido" ? item.netRevenue : item.grossRevenue,
    lucro: viewMode === "liquido" ? item.netProfit : item.grossProfit,
  }));

  return (
    <div className="flex-1 w-full h-full min-h-[200px] flex flex-col relative mt-2">
      {/* 🔥 PONTO 3: LEGENDA VISUAL IGUAL À REFERÊNCIA */}
      <div className="flex items-center justify-center gap-6 mb-3 shrink-0">
        {Object.entries(chartConfig).map(([key, config]) => (
          <div key={key} className="flex items-center gap-1.5">
            <div
              className="w-2.5 h-2.5 rounded-xs"
              style={{ backgroundColor: config.color }}
            />
            <span className="text-xs text-muted-foreground font-medium">
              {config.label}
            </span>
          </div>
        ))}
      </div>

      {/* 🔥 A MÁGICA ACONTECE AQUI: flex-1 e min-h-0 no lugar do h-full */}
      <ChartContainer config={chartConfig} className="w-full flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={processedData}
            margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
          >
            <CartesianGrid
              vertical={false}
              stroke="#cccccc"
              strokeDasharray="3 3"
              opacity={0.2}
            />

            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
              tickFormatter={(value: number) =>
                // 🔥 Usamos \u00A0 (non-breaking space) para impedir que o R$ separe do número
                `R$\u00A0${value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
              }
            />

            <XAxis
              dataKey="hour"
              tickLine={false}
              tickMargin={12}
              axisLine={false}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
              interval="preserveStartEnd"
            />

            <ChartTooltip
              cursor={{
                stroke: "hsl(var(--accent))",
                strokeWidth: 2,
                opacity: 0.4,
              }}
              content={
                <ChartTooltipContent
                  className="w-[200px]"
                  formatter={(value: string | number, name: string) => {
                    const numericValue = Number(value);

                    // 🔥 PONTO 2: Pegando a cor real do chartConfig dinamicamente!
                    const colorHex =
                      chartConfig[name as keyof typeof chartConfig]?.color ||
                      "#000";

                    return (
                      <div className="flex w-full items-center justify-between gap-2">
                        <div className="flex items-center gap-2 shrink-0">
                          <div
                            className="w-2.5 h-2.5 rounded-xs"
                            style={{ backgroundColor: colorHex }} // Aplica a cor aqui
                          />
                          <span className="text-muted-foreground whitespace-nowrap capitalize">
                            {name}
                          </span>
                        </div>
                        <span className="font-bold whitespace-nowrap tabular-nums">
                          R${" "}
                          {numericValue.toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                    );
                  }}
                />
              }
            />

            <Line
              type="monotone"
              dataKey="investimento"
              stroke="var(--color-investimento)"
              strokeWidth={2}
              dot={{ r: 3, fill: "var(--color-investimento)" }}
              activeDot={{ r: 5 }}
            />

            <Line
              type="monotone"
              dataKey="faturamento"
              stroke="var(--color-faturamento)"
              strokeWidth={2}
              dot={{ r: 3, fill: "var(--color-faturamento)" }}
              activeDot={{ r: 5 }}
            />

            <Line
              type="monotone"
              dataKey="lucro"
              stroke="var(--color-lucro)"
              strokeWidth={2}
              dot={{ r: 3, fill: "var(--color-lucro)" }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
}
