"use client";

import React, { useEffect } from "react";
import { cn } from "@/lib/utils";
import { GridStack } from "gridstack";

import { ALL_METRICS } from "@/constants/metrics";
import { getGridConstraints } from "./DashboardGrid";

type Props = {
  activeMetrics: string[];
};

export default function MetricsSidebar({ activeMetrics }: Props) {
  // O array vazio garante que o lag não volte nunca mais!
  useEffect(() => {
    const timer = setTimeout(() => {
      GridStack.setupDragIn(".sidebar-draggable", {
        helper: "clone",
        appendTo: "body",
      });
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="w-full h-[950px] max-h-[96vh] flex flex-col bg-card border-y border-r border-border rounded-r-3xl overflow-hidden shadow-2xl transition-colors duration-300">
      <div className="p-6 border-b border-border bg-muted/30 shrink-0">
        <h3 className="text-base font-semibold text-foreground tracking-tight">
          Métricas Disponíveis
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          Arraste para o painel de métricas
        </p>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden p-5 custom-scrollbar">
        <div className="flex flex-col gap-3 pb-8">
          {ALL_METRICS.map((metric) => {
            const constraints = getGridConstraints(metric.id);
            const isActive = activeMetrics.includes(metric.id);

            return (
              <div
                key={metric.id}
                gs-id={metric.id}
                data-gs-id={metric.id} // 🔥 BLINDAGEM: Garante que o card não perca a memória de quem ele é no voo!
                gs-w={constraints.w}
                gs-h={constraints.h}
                className={cn(
                  "select-none rounded-xl p-3.5 transition-colors border",
                  isActive
                    ? "bg-muted/50 border-border/40 text-muted-foreground/40 cursor-not-allowed shadow-none"
                    : "sidebar-draggable cursor-grab active:cursor-grabbing bg-background border-border text-muted-foreground hover:text-foreground hover:border-blue-500/50 hover:bg-blue-500/5 shadow-sm",
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[13px] font-medium leading-none">
                    {metric.label}
                  </span>
                  {isActive && (
                    <span className="text-[9px] uppercase font-bold tracking-wider text-blue-600 dark:text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded shrink-0">
                      Em uso
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
