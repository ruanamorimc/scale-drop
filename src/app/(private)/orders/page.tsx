"use client";

import { columns, Order } from "./columns";
import { DataTable } from "@/components/data-table/DataTable";
import { OrderDetails } from "@/components/orders/OrderDetails";
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
import { subDays } from "date-fns";
import { DateRange } from "react-day-picker";
import { toast } from "sonner";
import { DatePickerWithRange } from "@/components/date-range-picker";

// --- DADOS MOCK ---
const MOCK_DATA: Order[] = [
  {
    id: "1",
    invoiceId: "#INV-1001",
    customer: { name: "Ruan Amorim", email: "ruan@test.com", avatar: "" },
    date: "21/10/2024",
    time: "14:30",
    paymentStatus: "paid",
    paymentMethod: "Cartão de Crédito",
    amount: 250,
    cmv: 120,
    tax: 15,
    marketing: 50,
    netProfit: 65,
    status: "delivered",
    items: [],
  },
  {
    id: "2",
    invoiceId: "#INV-8923",
    customer: { name: "Daniel", email: "daniel@test.com", avatar: "" },
    date: "31/10/2024",
    time: "09:15",
    paymentStatus: "paid",
    paymentMethod: "Pix",
    amount: 99,
    cmv: 40,
    tax: 5,
    marketing: 20,
    netProfit: 34,
    status: "pending",
    items: [],
  },
  // Gerando mais dados para preencher a tela
  ...Array.from({ length: 15 }).map((_, i) => ({
    id: `${i + 3}`,
    invoiceId: `#INV-${2000 + i}`,
    customer: {
      name: `Cliente Teste ${i}`,
      email: `cliente${i}@test.com`,
      avatar: "",
    },
    date: "05/11/2024",
    time: "10:00",
    paymentStatus: "paid" as const,
    paymentMethod: "Pix" as const,
    amount: Math.floor(Math.random() * 500) + 50,
    status: "delivered",
    items: [],
  })),
];

export default function OrdersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [date, setDate] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // --- LÓGICA DE FILTRAGEM ---
  const filteredData = useMemo(() => {
    return MOCK_DATA.filter((order) => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        order.invoiceId.toLowerCase().includes(searchLower) ||
        order.customer.name.toLowerCase().includes(searchLower) ||
        order.customer.email.toLowerCase().includes(searchLower);

      return matchesSearch;
    });
  }, [searchTerm, date]);

  // --- ACTIONS ---
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success("Lista atualizada", {
        description: "Os pedidos foram sincronizados com sucesso.",
      });
    }, 1000);
  };

  return (
    <div className="flex flex-col h-full w-full p-8 space-y-8">
      {/* 1. CABEÇALHO */}
      <div className="flex items-center justify-between">
        <div>
          {/* CORRIGIDO: text-foreground */}
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Pedidos
          </h2>
          <p className="text-muted-foreground">
            Gerencie e acompanhe todos os pedidos da sua loja.
          </p>
        </div>

        <Button
          onClick={handleRefresh}
          className="text-white bg-blue-600 transition-all duration-300 hover:bg-blue-700 hover:shadow-[0_0_10px_1px_rgba(37,99,235,0.6)] hover:-translate-y-0.5"
        >
          <RotateCcw
            className={cn("h-4 w-4", isRefreshing && "animate-spin")}
          />
          Atualizar Pedidos
        </Button>
      </div>

      {/* 2. BARRA DE FERRAMENTAS */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-72 group">
            {/* CORRIGIDO: Cores do ícone de busca */}
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-foreground transition-colors" />
            <Input
              placeholder="Buscar por nome, SKU ou tag..."
              // CORRIGIDO: Cores do Input (bg-muted/40, border-border, text-foreground)
              className="pl-9 h-10 bg-muted/40 border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-blue-500/20 focus-visible:border-blue-500/50 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="w-full sm:w-auto">
            <DatePickerWithRange date={date} setDate={setDate} />
          </div>

          <Button
            variant="outline"
            // CORRIGIDO: Cores do Botão Filtro
            className="h-10 px-4 bg-muted/40 border-border text-muted-foreground hover:text-foreground hover:bg-accent gap-2"
          >
            <Filter className="h-4 w-4" />
            <span>Filtros</span>
          </Button>
        </div>
      </div>

      {/* 3. TABELA */}
      <div className="flex-1 overflow-hidden">
        <DataTable
          columns={columns}
          data={filteredData}
          onRowClick={(row) => setSelectedOrder(row)}
        />
      </div>

      {/* 4. SHEET DETALHES (FLUTUANTE) */}
      <Sheet
        open={!!selectedOrder}
        onOpenChange={(open) => !open && setSelectedOrder(null)}
      >
        <SheetContent
          className={cn(
            // CORRIGIDO: bg-background (para branco/preto correto) e border-border
            "w-[400px] sm:w-[540px] bg-background p-0 shadow-2xl",
            "border border-border", // Borda adaptável
            "mt-4 mr-4 mb-4",
            "h-[calc(100vh-32px)]",
            "rounded-2xl",
            "focus:outline-none",
          )}
        >
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
