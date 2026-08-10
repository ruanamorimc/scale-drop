"use client";

import React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

// 1. Tipagem rigorosa para os dados que chegam do backend
interface ProfitData {
  hour: string;
  grossProfit: number;
  netProfit: number;
}

// 2. Tipagem das Propriedades do Componente
interface ProfitByHourChartProps {
  chartData?: ProfitData[];
  viewMode?: string;
}

const chartConfig = {
  lucro: { label: "Lucro", color: "#1d4ed8" },
  prejuizo: { label: "Prejuízo", color: "#ef4444" },
} satisfies ChartConfig;

export default function ProfitByHourChart({
  chartData = [], // Inicia vazio para não quebrar a tela enquanto carrega
  viewMode = "liquido",
}: ProfitByHourChartProps) {
  // 3. O motor dinâmico que escolhe qual coluna do banco de dados exibir
  const currentData = chartData.map((item) => ({
    hour: item.hour,
    profit: viewMode === "liquido" ? item.netProfit : item.grossProfit,
  }));

  return (
    <div className="flex-1 w-full h-full min-h-[200px] flex flex-col relative">
      <ChartContainer config={chartConfig} className="w-full h-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={currentData}
            margin={{ top: 25, right: 10, left: 10, bottom: 10 }}
          >
            <CartesianGrid
              vertical={false}
              stroke="#cccccc"
              strokeDasharray="3 3"
              opacity={0.2}
            />

            <YAxis hide padding={{ top: 30, bottom: 40 }} />

            <XAxis
              dataKey="hour"
              tickLine={false}
              tickMargin={12}
              axisLine={false}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              interval="preserveStartEnd"
            />

            <ChartTooltip
              cursor={{ fill: "hsl(var(--accent))", opacity: 0.4 }}
              content={
                <ChartTooltipContent
                  className="w-45"
                  // 4. Fim do "any"! Tipagem nativa do Recharts para o valor
                  formatter={(value) => {
                    const numericValue = Number(value);
                    const isNegative = numericValue < 0;
                    return (
                      <div className="flex w-full items-center justify-between gap-2">
                        <div className="flex items-center gap-2 shrink-0">
                          <div
                            className={`w-2.5 h-2.5 rounded-sm ${
                              isNegative ? "bg-red-500" : "bg-blue-600"
                            }`}
                          />
                          <span className="text-muted-foreground whitespace-nowrap">
                            {isNegative ? "Prejuízo" : "Lucro"}
                          </span>
                        </div>
                        <span className="font-bold whitespace-nowrap tabular-nums">
                          R${" "}
                          {Math.abs(numericValue).toFixed(2).replace(".", ",")}
                        </span>
                      </div>
                    );
                  }}
                />
              }
            />

            <Bar dataKey="profit" radius={[2, 2, 0, 0]}>
              <LabelList
                dataKey="profit"
                position="top"
                offset={10}
                className="fill-foreground text-[10px] font-bold"
                formatter={(value: number) =>
                  value === 0 ? "" : `R$ ${value.toFixed(2).replace(".", ",")}`
                }
              />
              {currentData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    entry.profit >= 0
                      ? chartConfig.lucro.color
                      : chartConfig.prejuizo.color
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
}
