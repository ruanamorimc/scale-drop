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

// Dados mockados das 24 horas (idêntico à sua referência)
const chartData = [
  { hour: "00:00", sales: 15, perc: "1.5%" },
  { hour: "01:00", sales: 0, perc: "" },
  { hour: "02:00", sales: 0, perc: "" },
  { hour: "03:00", sales: 0, perc: "" },
  { hour: "04:00", sales: 0, perc: "" },
  { hour: "05:00", sales: 15, perc: "1.5%" },
  { hour: "06:00", sales: 0, perc: "" },
  { hour: "07:00", sales: 76, perc: "7.6%" },
  { hour: "08:00", sales: 15, perc: "1.5%" },
  { hour: "09:00", sales: 61, perc: "6.1%" },
  { hour: "10:00", sales: 0, perc: "" },
  { hour: "11:00", sales: 45, perc: "4.5%" },
  { hour: "12:00", sales: 106, perc: "10.6%" },
  { hour: "13:00", sales: 273, perc: "27.3%" },
  { hour: "14:00", sales: 15, perc: "1.5%" },
  { hour: "15:00", sales: 91, perc: "9.1%" },
  { hour: "16:00", sales: 15, perc: "1.5%" },
  { hour: "17:00", sales: 15, perc: "1.5%" },
  { hour: "18:00", sales: 45, perc: "4.5%" },
  { hour: "19:00", sales: 30, perc: "3.0%" },
  { hour: "20:00", sales: 30, perc: "3.0%" },
  { hour: "21:00", sales: 91, perc: "9.1%" },
  { hour: "22:00", sales: 45, perc: "4.5%" },
  { hour: "23:00", sales: 15, perc: "1.5%" },
];

const chartConfig = {
  sales: {
    label: "Total de vendas",
    color: "#1d4ed8",
  },
} satisfies ChartConfig;

export default function SalesByHourChart() {
  return (
    <div className="flex-1 w-full h-full min-h-[200px] mt-2">
      <ChartContainer config={chartConfig} className="w-full h-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 25, right: 0, left: 0, bottom: 0 }}
          >
            <CartesianGrid
              vertical={false}
              stroke="#cccccc"
              strokeDasharray="3 3"
              opacity={0.4}
            />

            <XAxis
              dataKey="hour"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              // Fonte um pouquinho menor para caber as 24 horas sem encavalar
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
              interval="preserveStartEnd"
            />

            <ChartTooltip
              cursor={{ fill: "hsl(var(--accent))", opacity: 0.4 }}
              content={<ChartTooltipContent indicator="dot" className="w-40" />}
            />

            <Bar
              dataKey="sales"
              fill="var(--color-sales)"
              radius={[2, 2, 0, 0]}
            >
              <LabelList
                dataKey="perc"
                position="top"
                offset={8}
                className="fill-muted-foreground text-[9px] font-medium"
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
}
