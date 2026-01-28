"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

const chartData = [
  {
    month: "January",
    revenue: 186,
    profit: 80,
    tax: 40,
    marketing: 200,
    productcost: 120,
  },
  {
    month: "February",
    revenue: 305,
    profit: 200,
    tax: 40,
    marketing: 200,
    productcost: 120,
  },
  {
    month: "March",
    revenue: 237,
    profit: 120,
    tax: 40,
    marketing: 200,
    productcost: 120,
  },
  {
    month: "April",
    revenue: 73,
    profit: 190,
    tax: 40,
    marketing: 200,
    productcost: 120,
  },
  {
    month: "May",
    revenue: 209,
    profit: 130,
    tax: 40,
    marketing: 200,
    productcost: 120,
  },
  {
    month: "June",
    revenue: 214,
    profit: 140,
    tax: 40,
    marketing: 200,
    productcost: 120,
  },
];

const chartConfig = {
  revenue: {
    label: "Receita Líquida",
    color: "var(--chart-1)",
  },
  profit: {
    label: "Lucro Líquido",
    color: "var(--chart-2)",
  },
  tax: {
    label: "Taxas e Impostos",
    color: "var(--chart-3)",
  },
  marketing: {
    label: "Marketing",
    color: "var(--chart-4)",
  },
  productcost: {
    label: "Custro de Produto",
    color: "var(--chart-5)",
  },
} satisfies ChartConfig;

export function ChartBarStacked() {
  return (
    <div className="space-y-4">
      {/* 1. O GRÁFICO GRANDE */}
      <Card className="min-h-[400px]">
        <CardHeader>
          <CardTitle>Resumo Financeiro</CardTitle>
          <CardDescription>Acompanhe o resumo financeiro.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-70 lg:h-120 w-full">
            <BarChart accessibilityLayer data={chartData}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => value.slice(0, 3)}
              />
              <ChartTooltip content={<ChartTooltipContent hideLabel />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar dataKey="revenue" stackId="a" fill="var(--color-revenue)" />
              <Bar dataKey="profit" stackId="a" fill="var(--color-profit)" />
              <Bar dataKey="tax" stackId="a" fill="var(--color-tax)" />
              <Bar
                dataKey="marketing"
                stackId="a"
                fill="var(--color-marketing)"
              />
              <Bar
                dataKey="productcost"
                stackId="a"
                fill="var(--color-productcost)"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
