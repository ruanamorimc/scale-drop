"use client";

import { Package } from "lucide-react";
import { PremiumCard } from "@/components/cards/PremiumCard";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function TopProducts({ data }: { data: any }) {
  // Pega a lista retornada pela Action ou array vazio
  const products = data?.topProducts || [];

  return (
    <PremiumCard className="h-full flex flex-col min-h-[450px]">
      <div className="p-6 flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-1 rounded-full bg-gray-100 dark:bg-gray-800/50">
              <div className="p-1.5 rounded-full bg-blue-600 text-white shadow-sm">
                <Package size={18} />
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-lg text-foreground leading-none">
                Produtos mais vendidos
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Top performance em vendas.
              </p>
            </div>
          </div>
          <Link href="/products">
            <Button variant="ghost" size="sm" className="text-xs h-8 px-3">
              Ver tudo
            </Button>
          </Link>
        </div>

        <div className="h-px w-full bg-border/40 mb-2" />

        {/* Lista Real */}
        <div className="space-y-1">
          {products.length === 0 ? (
            <div className="text-center text-muted-foreground text-sm py-10">
              Nenhum produto vendido hoje.
            </div>
          ) : (
            products.map((product: any, idx: number) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-4">
                  {/* Placeholder de imagem (ou <img> se tiver url) */}
                  <div className="h-10 w-10 rounded-md flex items-center justify-center overflow-hidden shrink-0 border border-white/5 bg-blue-500/10 text-blue-500">
                    <Package size={18} />
                  </div>
                  <div className="flex flex-col">
                    <span
                      className="text-sm font-medium text-foreground truncate max-w-[120px]"
                      title={product.name}
                    >
                      {product.name}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      Ranking #{idx + 1}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-foreground">
                    {product.revenue.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </p>
                  <p className="text-[10px] text-muted-foreground font-medium">
                    {product.sales} vendas
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </PremiumCard>
  );
}
