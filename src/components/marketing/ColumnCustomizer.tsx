"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Settings, Search, GripVertical, Lock } from "lucide-react"; // Adicionei Lock
import { cn } from "@/lib/utils";
import { AVAILABLE_METRICS, MetricDefinition } from "@/constants/meta-metrics";

// GRIDSTACK IMPORTS
import { GridStack, GridStackElement } from "gridstack";
import "gridstack/dist/gridstack.min.css";

interface ColumnCustomizerProps {
  currentColumns: string[];
  onSave: (newOrder: string[]) => void;
}

export function ColumnCustomizer({
  currentColumns,
  onSave,
}: ColumnCustomizerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const gridRef = useRef<HTMLDivElement>(null);
  const gridInstance = useRef<GridStack | null>(null);

  // 1. Inicialização
  useEffect(() => {
    if (open) {
      // Garante que 'name' (Campanha) esteja na lista se não estiver
      let initialCols = [...currentColumns];
      if (!initialCols.includes("name")) {
        initialCols = ["name", ...initialCols];
      }
      // Remove 'status' e 'select' se vierem do pai, pois são fixos lá fora
      initialCols = initialCols.filter(
        (id) => id !== "status" && id !== "select",
      );

      setSelectedIds(initialCols);
      setSearch("");

      setTimeout(() => {
        initGrid(initialCols);
      }, 300);
    } else {
      if (gridInstance.current) {
        gridInstance.current.destroy(false);
        gridInstance.current = null;
      }
    }
  }, [open]);

  // 2. Gridstack Init
  const initGrid = (itemsId: string[]) => {
    if (!gridRef.current) return;

    if (gridInstance.current) {
      gridInstance.current.destroy(false);
    }

    gridInstance.current = GridStack.init(
      {
        column: 1,
        cellHeight: 54,
        minRow: 1,
        margin: 0, // 🔥 CONTROLAMOS NO CSS
        disableResize: true,
        float: false,
        acceptWidgets: false,
        animate: true,
      },
      gridRef.current,
    );

    // Garante que 'name' seja o primeiro a ser renderizado
    const sortedItems = itemsId.sort((a, b) => {
      if (a === "name") return -1;
      if (b === "name") return 1;
      return 0;
    });

    sortedItems.forEach((id) => {
      const metric = AVAILABLE_METRICS.find((m) => m.id === id);
      if (metric) addWidgetToGrid(metric);
    });
  };

  // 3. ADICIONAR WIDGET
  const addWidgetToGrid = (metric: MetricDefinition) => {
    if (!gridInstance.current) return;

    const isFixed = metric.id === "name"; // Verifica se é a coluna fixa (Campanha)

    // Conteúdo HTML
    // Se for fixo: Borda diferente, Ícone de Cadeado, Sem cursor de move
    const contentHtml = `
      <div class="w-full h-full flex items-center justify-between px-4 py-2 rounded border 
        ${isFixed ? "border-blue-500/30 bg-blue-500/5 cursor-default" : "border-border bg-card cursor-grab active:cursor-grabbing hover:border-primary/50 hover:shadow-md"} 
        shadow-sm group select-none relative transition-all">
        
        <div class="flex items-center gap-3 overflow-hidden pointer-events-none">
          <span class="${isFixed ? "text-blue-500" : "text-muted-foreground group-hover:text-primary"}">
            ${
              isFixed
                ? `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-lock"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`
                : `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-grip-vertical"><circle cx="9" cy="12" r="1"/><circle cx="9" cy="5" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="19" r="1"/></svg>`
            }
          </span>
          <span class="text-sm font-medium ${isFixed ? "text-blue-500" : "text-foreground"} truncate">
            ${metric.label}
          </span>
        </div>

        ${
          !isFixed
            ? `
          <div class="delete-trigger absolute right-2 top-1/2 -translate-y-1/2 p-2 cursor-pointer text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity z-50 hover:bg-red-500/10 rounded">
             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash-2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
          </div>
        `
            : ""
        }
      </div>
    `;

    // 1. Cria o widget
    const widgetEl = gridInstance.current.addWidget({
      w: 1,
      h: 1,
      id: metric.id,
      noResize: true,
      locked: isFixed, // 🔥 TRAVA O ITEM SE FOR 'NAME'
      noMove: isFixed, // 🔥 IMPEDE MOVER
    });

    // 2. Injeta o HTML
    if (widgetEl) {
      const contentEl = widgetEl.querySelector(".grid-stack-item-content");
      if (contentEl) {
        contentEl.innerHTML = contentHtml;
      }
    }

    // 3. Listeners do botão X (Apenas se não for fixo)
    if (!isFixed) {
      setTimeout(() => {
        const el = gridRef.current?.querySelector(
          `.grid-stack-item[gs-id="${metric.id}"]`,
        );
        const btn = el?.querySelector(".delete-trigger");

        if (btn) {
          const newBtn = btn.cloneNode(true);
          btn.parentNode?.replaceChild(newBtn, btn);

          newBtn.addEventListener("mousedown", (e) => e.stopPropagation());
          newBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            e.preventDefault();
            handleRemove(metric.id);
          });
        }
      }, 50);
    }
  };

  // 4. Toggle
  const toggleMetric = (metric: MetricDefinition) => {
    const isSelected = selectedIds.includes(metric.id);
    if (isSelected) {
      handleRemove(metric.id);
    } else {
      setSelectedIds((prev) => [...prev, metric.id]);
      addWidgetToGrid(metric);
    }
  };

  // 5. Remove
  const handleRemove = (id: string) => {
    // Não permite remover 'name'
    if (id === "name") return;

    setSelectedIds((prev) => prev.filter((item) => item !== id));

    if (gridInstance.current) {
      const el = gridRef.current?.querySelector(
        `.grid-stack-item[gs-id="${id}"]`,
      ) as GridStackElement;
      if (el) {
        gridInstance.current.removeWidget(el);
      }
    }
  };

  // 6. Save
  const handleSave = () => {
    if (!gridInstance.current) return;

    const gridItems = gridInstance.current.getGridItems();

    const sortedItems = gridItems.sort((a, b) => {
      const yA = parseInt(a.getAttribute("gs-y") || "0", 10);
      const yB = parseInt(b.getAttribute("gs-y") || "0", 10);
      return yA - yB;
    });

    const newOrder = sortedItems
      .map((el) => el.getAttribute("gs-id"))
      .filter((id) => id !== null) as string[];

    onSave(newOrder);
    setOpen(false);
  };

  // Filtra métricas para a esquerda: Remove 'name' (pois é fixo na direita)
  const filteredMetrics = AVAILABLE_METRICS.filter(
    (m) =>
      m.label.toLowerCase().includes(search.toLowerCase()) && m.id !== "name",
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="h-8 w-8 flex items-center justify-center rounded-md border border-border bg-background hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground hover:border-border/60">
          <Settings size={16} />
        </button>
      </DialogTrigger>

      <DialogContent className="w-full md:max-w-5xl h-[800px] max-h-[90vh] flex flex-col p-0 bg-background border-border gap-0 overflow-hidden shadow-2xl">
        {/* 🔥 CSS DO ESPAÇAMENTO REAL:
            - bottom: 14px -> Cria o buraco visual em baixo de cada item.
            - height: auto -> Garante que o conteúdo não estique.
            - inset: 0 (exceto bottom) -> Alinha perfeitamente.
        */}
        <style jsx global>{`
          .grid-stack {
            background: transparent !important;
            min-height: 100px;
            display: block;
          }
          .grid-stack-item-content {
            inset: 0px !important;
            bottom: 8px !important;
            width: 100% !important;
            left: 0 !important;
            overflow: hidden !important;
          }
        `}</style>

        <DialogHeader className="px-6 py-5 border-b border-border shrink-0 bg-background">
          <DialogTitle className="text-xl font-semibold">
            Personalize as colunas
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Escolha e organize as colunas que deseja visualizar na tabela.
          </p>
        </DialogHeader>

        <div className="flex flex-1 min-h-0 bg-background">
          {/* ESQUERDA */}
          <div className="w-[350px] border-r border-border flex flex-col min-h-0 bg-muted/10">
            <div className="p-4 border-b border-border bg-background">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por coluna..."
                  className="pl-9 bg-background border-input h-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
              <div className="flex flex-col gap-1 px-1">
                {filteredMetrics.map((metric) => (
                  <div
                    key={metric.id}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-md transition-colors cursor-pointer border border-transparent select-none",
                      "hover:bg-muted/80",
                      selectedIds.includes(metric.id)
                        ? "bg-primary/5 border-primary/20"
                        : "text-muted-foreground",
                    )}
                    onClick={() => toggleMetric(metric)}
                  >
                    <Checkbox
                      checked={selectedIds.includes(metric.id)}
                      className="data-[state=checked]:bg-primary border-muted-foreground/30"
                    />
                    <span
                      className={cn(
                        "text-sm",
                        selectedIds.includes(metric.id)
                          ? "text-primary font-medium"
                          : "text-foreground",
                      )}
                    >
                      {metric.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* DIREITA */}
          <div className="flex-1 flex flex-col min-h-0 bg-background">
            <div className="px-6 py-4 border-b border-border bg-muted/5 flex justify-between items-center h-[69px] shrink-0">
              <span className="text-xs font-bold uppercase text-muted-foreground tracking-wider flex items-center gap-2">
                Colunas Selecionadas
                <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-[11px] border border-primary/20">
                  {selectedIds.length}
                </span>
              </span>
              <span className="text-[11px] text-muted-foreground flex items-center gap-1.5 opacity-70">
                <GripVertical size={12} />
                Arraste para reordenar
              </span>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4 bg-muted/5 dark:bg-black/20 custom-scrollbar">
              <div className="w-full relative min-h-[400px]">
                <div className="grid-stack w-full" ref={gridRef}></div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="p-4 border-t border-border bg-background shrink-0 gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700 text-white min-w-[140px]"
          >
            Salvar Alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
