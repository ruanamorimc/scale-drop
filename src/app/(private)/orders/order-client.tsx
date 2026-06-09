"use client";

import { columns, Order } from "./columns";
import { DataTable } from "@/components/data-table/DataTable";
import { OrderDetails } from "@/components/orders/OrderDetails";
import { OrderFilterSheet } from "@/components/orders/OrderFilterSheet";
import { useState, useMemo } from "react";
import { Search, RotateCcw, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";

export default function OrdersClient({
  initialOrders,
}: {
  initialOrders: Order[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Estados Visuais
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);

  // Lê o filtro de Produto da URL
  const productParam = searchParams.get("product")?.toLowerCase() || "";

  // Pesquisa Local
  const filteredData = useMemo(() => {
    return initialOrders.filter((order) => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        order.invoiceId?.toLowerCase().includes(searchLower) ||
        order.customer.name?.toLowerCase().includes(searchLower) ||
        order.customer.email?.toLowerCase().includes(searchLower);

      const matchesProduct = productParam
        ? order.items?.some((item) =>
            item.name.toLowerCase().includes(productParam),
          )
        : true;

      return matchesSearch && matchesProduct;
    });
  }, [searchTerm, initialOrders, productParam]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    router.refresh();
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success("Lista atualizada", {
        description: "Os pedidos mais recentes foram carregados.",
      });
    }, 1000);
  };

  return (
    <div className="flex flex-col h-full w-full p-8 space-y-6">
      {/* 1. CABEÇALHO */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Pedidos
          </h2>
          <p className="text-muted-foreground">
            Gerencie e acompanhe todos os pedidos da sua loja.
          </p>
        </div>

        <Button
          onClick={handleRefresh}
          className="group relative overflow-hidden px-5 py-2 rounded-lg border text-white border-blue-500/50 bg-gradient-to-tr from-blue-600 to-blue-500 shadow-lg hover:shadow-2xl hover:shadow-blue-500/40 hover:scale-105 active:scale-95 transition-all duration-300 ease-out hover:border-blue-400 flex items-center justify-center"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></div>
          <RotateCcw
            className={cn("h-4 w-4 mr-2", isRefreshing && "animate-spin")}
          />
          Atualizar Pedidos
        </Button>
      </div>

      {/* 2. BARRA DE PESQUISA E FILTROS */}
      <div className="flex flex-col sm:flex-row items-center justify-end gap-3 w-full">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-80 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-foreground transition-colors" />
            <Input
              placeholder="Buscar por nome, pedido ou email..."
              className="pl-9 h-10 bg-muted/40 border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-blue-500/20 focus-visible:border-blue-500/50 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* 🔥 BOTÃO COM O CONTADOR DE FILTROS */}
          {(() => {
            let activeFiltersCount = 0;
            if (searchParams.has("paymentStatus")) activeFiltersCount++;
            if (searchParams.has("status")) activeFiltersCount++;
            if (searchParams.has("method")) activeFiltersCount++;
            if (searchParams.has("product")) activeFiltersCount++;
            if (searchParams.has("from") || searchParams.has("to"))
              activeFiltersCount++;

            return (
              <Button
                variant="outline"
                className="h-10 px-4 bg-muted/40 border-border text-muted-foreground hover:text-foreground hover:bg-accent flex items-center gap-2 transition-all relative"
                onClick={() => setIsFilterSheetOpen(true)}
              >
                <Filter className="h-4 w-4" />
                <span className="hidden sm:inline">Filtros</span>

                {activeFiltersCount > 0 && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[11px] font-bold text-white shadow-sm">
                    {activeFiltersCount}
                  </span>
                )}
              </Button>
            );
          })()}
        </div>
      </div>

      {/* 3. TABELA */}
      <div className="flex-1 overflow-hidden border border-border rounded-xl">
        <DataTable
          columns={columns}
          data={filteredData}
          onRowClick={(row) => setSelectedOrder(row)}
        />
      </div>

      {/* 4. GAVETA DE FILTROS (Importada de fora) */}
      <OrderFilterSheet
        isOpen={isFilterSheetOpen}
        onOpenChange={setIsFilterSheetOpen}
      />

      {/* 5. GAVETA DE DETALHES */}
      <Sheet
        open={!!selectedOrder}
        onOpenChange={(open) => !open && setSelectedOrder(null)}
      >
        <SheetContent className="sm:max-w-[540px] bg-background p-0 shadow-2xl border-border mt-4 mr-4 mb-4 h-[calc(100vh-32px)] rounded-2xl focus:outline-none [&>button]:hidden">
          <SheetHeader className="sr-only">
            <SheetTitle>Detalhes do Pedido</SheetTitle>
          </SheetHeader>
          {selectedOrder && (
            <OrderDetails
              order={selectedOrder}
              onClose={() => setSelectedOrder(null)}
            />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
