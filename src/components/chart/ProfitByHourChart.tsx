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

const dataLiquido = [
  { hour: "00:00", profit: 0 },
  { hour: "01:00", profit: 0 },
  { hour: "02:00", profit: 0 },
  { hour: "03:00", profit: 0 },
  { hour: "04:00", profit: 0 },
  { hour: "05:00", profit: 59.98 },
  { hour: "06:00", profit: -25.5 },
  { hour: "07:00", profit: 0 },
  { hour: "08:00", profit: 0 },
  { hour: "09:00", profit: 0 },
  { hour: "10:00", profit: 120.0 },
  { hour: "11:00", profit: 45.0 },
  { hour: "12:00", profit: 0 },
  { hour: "13:00", profit: -120.0 },
  { hour: "14:00", profit: 0 },
  { hour: "15:00", profit: 0 },
  { hour: "16:00", profit: 0 },
  { hour: "17:00", profit: 0 },
  { hour: "18:00", profit: 0 },
  { hour: "19:00", profit: 0 },
  { hour: "20:00", profit: 0 },
  { hour: "21:00", profit: 0 },
  { hour: "22:00", profit: 0 },
  { hour: "23:00", profit: 0 },
];

const dataBruto = [
  { hour: "00:00", profit: 0 },
  { hour: "01:00", profit: 0 },
  { hour: "02:00", profit: 0 },
  { hour: "03:00", profit: 0 },
  { hour: "04:00", profit: 0 },
  { hour: "05:00", profit: 80.0 },
  { hour: "06:00", profit: -10.0 },
  { hour: "07:00", profit: 0 },
  { hour: "08:00", profit: 0 },
  { hour: "09:00", profit: 0 },
  { hour: "10:00", profit: 150.0 },
  { hour: "11:00", profit: 60.0 },
  { hour: "12:00", profit: 0 },
  { hour: "13:00", profit: -90.0 },
  { hour: "14:00", profit: 0 },
  { hour: "15:00", profit: 0 },
  { hour: "16:00", profit: 0 },
  { hour: "17:00", profit: 0 },
  { hour: "18:00", profit: 0 },
  { hour: "19:00", profit: 0 },
  { hour: "20:00", profit: 0 },
  { hour: "21:00", profit: 0 },
  { hour: "22:00", profit: 0 },
  { hour: "23:00", profit: 0 },
];

const chartConfig = {
  lucro: { label: "Lucro", color: "#1d4ed8" },
  prejuizo: { label: "Prejuízo", color: "#ef4444" },
} satisfies ChartConfig;

// 🔥 NOVO: Agora o gráfico SÓ recebe a ordem de qual dado mostrar
export default function ProfitByHourChart({
  viewMode = "liquido",
}: {
  viewMode?: string;
}) {
  const currentData = viewMode === "liquido" ? dataLiquido : dataBruto;

  return (
    <div className="flex-1 w-full h-full min-h-[200px] flex flex-col relative">
      <ChartContainer config={chartConfig} className="w-full h-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={currentData}
            margin={{ top: 10, right: 0, left: 0, bottom: 20 }}
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
                  className="w-[180px]"
                  formatter={(value: any, name: any, item: any) => {
                    const isNegative = Number(value) < 0;
                    return (
                      <div className="flex w-full items-center justify-between gap-2">
                        <div className="flex items-center gap-2 shrink-0">
                          <div
                            className={`w-2.5 h-2.5 rounded-sm ${isNegative ? "bg-red-500" : "bg-blue-600"}`}
                          />
                          <span className="text-muted-foreground whitespace-nowrap">
                            {isNegative ? "Prejuízo" : "Lucro"}
                          </span>
                        </div>
                        <span className="font-bold whitespace-nowrap tabular-nums">
                          R${" "}
                          {Math.abs(Number(value)).toFixed(2).replace(".", ",")}
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
