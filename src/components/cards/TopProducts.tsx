"use client";

import {
  Headphones,
  Watch,
  Camera,
  Smartphone,
  MoreVertical,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Mock Data
const topProducts = [
  {
    id: "BH-001",
    name: "Bluetooth Headphones",
    sales: 85,
    revenue: 340000,
    icon: Headphones,
    color: "text-cyan-400",
    bg: "bg-cyan-400/10",
  },
  {
    id: "SW-002",
    name: "Smartwatch",
    sales: 72,
    revenue: 576000,
    icon: Watch,
    color: "text-purple-400",
    bg: "bg-purple-400/10",
  },
  {
    id: "MC-003",
    name: "Mirrorless Camera",
    sales: 54,
    revenue: 162000,
    icon: Camera,
    color: "text-blue-400",
    bg: "bg-blue-400/10",
  },
  {
    id: "SP-004",
    name: "Smartphone",
    sales: 67,
    revenue: 134000,
    icon: Smartphone,
    color: "text-indigo-400",
    bg: "bg-indigo-400/10",
  },
  // 👇 Adicionei mais itens para testar o scroll (pode remover depois)
  {
    id: "GM-005",
    name: "Gaming Mouse",
    sales: 45,
    revenue: 90000,
    icon: Smartphone,
    color: "text-green-400",
    bg: "bg-green-400/10",
  },
  {
    id: "KB-006",
    name: "Mechanical Keyboard",
    sales: 30,
    revenue: 120000,
    icon: Smartphone,
    color: "text-orange-400",
    bg: "bg-orange-400/10",
  },
];

export function TopProducts() {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      //maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Card className="h-full flex flex-col">
      {" "}
      {/* flex-col para o header ficar fixo e o content esticar se precisar */}
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div className="space-y-1">
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            Produtos mais vendidos
          </CardTitle>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="flex-1">
        {" "}
        {/* flex-1 ocupa o espaço restante */}
        {/* 👇 AQUI ESTÁ O SEGREDO DO SCROLL 👇 */}
        <div className="space-y-4 max-h-[328px] overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-neutral-800 [&::-webkit-scrollbar-thumb]:rounded-full">
          {topProducts.map((product) => (
            <div
              key={product.id}
              className="flex flex-col gap-3 rounded-xl border border-neutral-800 bg-neutral-900/50 p-3 shadow-sm transition-all hover:bg-neutral-900"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg ${product.bg}`}
                  >
                    <product.icon className={`h-5 w-5 ${product.color}`} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold leading-none text-white">
                      {product.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Item:{" "}
                      <span className="text-neutral-400">#{product.id}</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-neutral-800 pt-3">
                <div className="flex flex-col">
                  <span className="text-[10px] text-muted-foreground uppercase">
                    Sales
                  </span>
                  <span className="text-sm font-medium text-white">
                    {product.sales}
                  </span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] text-muted-foreground uppercase">
                    Revenue
                  </span>
                  <span className="text-sm font-medium text-white">
                    {formatCurrency(product.revenue)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
