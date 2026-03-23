"use client";

import React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  XAxis,
  ResponsiveContainer,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

// Dados mockados reproduzindo a sua referência
const chartData = [
  { day: "Dom", sales: 250, percentage: "28.8%" },
  { day: "Seg", sales: 92, percentage: "10.6%" },
  { day: "Ter", sales: 184, percentage: "21.2%" },
  { day: "Qua", sales: 66, percentage: "7.6%" },
  { day: "Qui", sales: 105, percentage: "12.1%" },
  { day: "Sex", sales: 145, percentage: "16.7%" },
  { day: "Sab", sales: 26, percentage: "3.0%" },
];

const chartConfig = {
  sales: {
    label: "Total de vendas",
    color: "#1d4ed8", // Azul principal da referência
  },
} satisfies ChartConfig;

export default function SalesByDayChart() {
  return (
    <div className="flex-1 w-full h-full min-h-[200px] mt-2">
      <ChartContainer config={chartConfig} className="w-full h-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 25, right: 0, left: 0, bottom: 0 }}
          >
            {/* Linhas horizontais sutis ao fundo */}
            <CartesianGrid
              vertical={false}
              stroke="#cccccc"
              strokeDasharray="3 3"
              opacity={0.4}
            />

            <XAxis
              dataKey="day"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            />

            {/* Tooltip padrão do Shadcn, que já mostra a coluna destacada no fundo */}
            <ChartTooltip
              cursor={{ fill: "hsl(var(--accent))", opacity: 0.4 }}
              content={<ChartTooltipContent indicator="dot" className="w-40" />}
            />

            <Bar
              dataKey="sales"
              fill="var(--color-sales)"
              radius={[2, 2, 0, 0]}
            >
              {/* O percentual no topo de cada coluna */}
              <LabelList
                dataKey="percentage"
                position="top"
                offset={8}
                className="fill-muted-foreground text-[11px] font-medium"
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
}
