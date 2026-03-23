"use client";

import React from "react";
import {
  Line,
  LineChart,
  CartesianGrid,
  XAxis,
  ResponsiveContainer,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

const dataLiquido = [
  { hour: "00:00", inv: 0, fat: 0, luc: 0 },
  { hour: "04:00", inv: 0, fat: 0, luc: 0 },
  { hour: "05:00", inv: 15.5, fat: 59.98, luc: 44.48 },
  { hour: "06:00", inv: 25.0, fat: 59.98, luc: 34.98 },
  { hour: "08:00", inv: 40.0, fat: 120.0, luc: 80.0 },
  { hour: "10:00", inv: 65.0, fat: 240.0, luc: 175.0 },
  { hour: "14:00", inv: 110.0, fat: 380.0, luc: 270.0 },
  { hour: "18:00", inv: 150.0, fat: 510.0, luc: 360.0 },
  { hour: "23:00", inv: 180.0, fat: 650.0, luc: 470.0 },
];

const dataBruto = [
  { hour: "00:00", inv: 0, fat: 0, luc: 0 },
  { hour: "04:00", inv: 0, fat: 0, luc: 0 },
  { hour: "05:00", inv: 15.5, fat: 80.0, luc: 64.5 },
  { hour: "06:00", inv: 25.0, fat: 80.0, luc: 55.0 },
  { hour: "08:00", inv: 40.0, fat: 160.0, luc: 120.0 },
  { hour: "10:00", inv: 65.0, fat: 300.0, luc: 235.0 },
  { hour: "14:00", inv: 110.0, fat: 450.0, luc: 340.0 },
  { hour: "18:00", inv: 150.0, fat: 600.0, luc: 450.0 },
  { hour: "23:00", inv: 180.0, fat: 800.0, luc: 620.0 },
];

const chartConfig = {
  inv: { label: "Investimento", color: "#f59e0b" },
  fat: { label: "Faturamento", color: "#3b82f6" },
  luc: { label: "Lucro", color: "#10b981" },
} satisfies ChartConfig;

// 🔥 NOVO: Agora o gráfico SÓ recebe a ordem
export default function AccumulatedMetricsChart({
  viewMode = "liquido",
}: {
  viewMode?: string;
}) {
  const currentData = viewMode === "liquido" ? dataLiquido : dataBruto;

  return (
    <div className="flex-1 w-full h-full min-h-[200px] flex flex-col relative">
      <ChartContainer config={chartConfig} className="w-full h-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={currentData}
            margin={{ top: 25, right: 10, left: 10, bottom: 0 }}
          >
            <CartesianGrid
              vertical={false}
              stroke="#cccccc"
              strokeDasharray="3 3"
              opacity={0.2}
            />
            <XAxis
              dataKey="hour"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
              interval="preserveStartEnd"
            />
            <ChartTooltip
              cursor={{
                stroke: "hsl(var(--accent))",
                strokeWidth: 2,
                strokeDasharray: "3 3",
              }}
              content={
                <ChartTooltipContent
                  className="w-[220px]"
                  formatter={(value: any, name: any) => {
                    const key = name as keyof typeof chartConfig;
                    const label = chartConfig[key]?.label || name;
                    const color =
                      chartConfig[key]?.color || "hsl(var(--primary))";

                    return (
                      <div className="flex w-full justify-between items-center gap-2">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2.5 h-2.5 rounded-[2px]"
                            style={{ backgroundColor: color }}
                          />
                          <span className="text-muted-foreground">{label}</span>
                        </div>
                        <span className="font-mono font-medium tabular-nums text-foreground">
                          R$ {Number(value).toFixed(2).replace(".", ",")}
                        </span>
                      </div>
                    );
                  }}
                />
              }
            />
            <Line
              type="monotone"
              dataKey="inv"
              stroke="var(--color-inv)"
              strokeWidth={2}
              dot={{ r: 4, fill: "var(--color-inv)" }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="fat"
              stroke="var(--color-fat)"
              strokeWidth={2}
              dot={{ r: 4, fill: "var(--color-fat)" }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="luc"
              stroke="var(--color-luc)"
              strokeWidth={2}
              dot={{ r: 4, fill: "var(--color-luc)" }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
}
