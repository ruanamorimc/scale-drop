"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DatePickerWithRange } from "@/components/date-range-picker";
import { subDays, format } from "date-fns";
import { DateRange } from "react-day-picker";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface OrderFilterSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const PAYMENT_OPTIONS = [
  { label: "Aprovada", value: "paid" },
  { label: "Pendente", value: "pending" },
  { label: "Cancelada / Falha", value: "failed" },
  { label: "Estornada", value: "refunded" }
];

const STATUS_OPTIONS = [
  { label: "Aguardando Envio", value: "pending" },
  { label: "Em Processamento", value: "processing" },
  { label: "Enviado", value: "shipped" },
  { label: "Entregue", value: "delivered" },
  { label: "Cancelado", value: "cancelled" }
];

const METHOD_OPTIONS = [
  { label: "Pix", value: "Pix" },
  { label: "Cartão de Crédito", value: "Cartão de Crédito" },
  { label: "Boleto", value: "Boleto" }
];

export function OrderFilterSheet({ isOpen, onOpenChange }: OrderFilterSheetProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [localDate, setLocalDate] = useState<DateRange | undefined>();
  const [localProduct, setLocalProduct] = useState("");
  const [localPaymentStatus, setLocalPaymentStatus] = useState<string[]>([]);
  const [localStatus, setLocalStatus] = useState<string[]>([]);
  const [localMethod, setLocalMethod] = useState<string[]>([]);

  const parseSafeDate = (dateStr: string | null) => {
    if (!dateStr) return undefined;
    const [year, month, day] = dateStr.split('-');
    return new Date(Number(year), Number(month) - 1, Number(day));
  };

  useEffect(() => {
    if (isOpen) {
      // 🔥 Correção do Erro: setTimeout evita o "cascading render" no React
      const timer = setTimeout(() => {
        const fromParam = searchParams.get("from");
        const toParam = searchParams.get("to");
        setLocalDate({
          from: fromParam ? parseSafeDate(fromParam) : subDays(new Date(), 30),
          to: toParam ? parseSafeDate(toParam) : new Date(),
        });
        setLocalProduct(searchParams.get("product") || "");

        const pStatus = searchParams.get("paymentStatus");
        if (pStatus === "all") setLocalPaymentStatus([]);
        else if (pStatus) setLocalPaymentStatus(pStatus.split(","));
        else setLocalPaymentStatus(["paid", "pending"]);

        const sStatus = searchParams.get("status");
        setLocalStatus(sStatus ? sStatus.split(",") : []);

        const mMethod = searchParams.get("method");
        setLocalMethod(mMethod ? mMethod.split(",") : []);
      }, 0);

      // Limpa o timer se o componente desmontar
      return () => clearTimeout(timer);
    }
  }, [isOpen, searchParams]);

  const handleApplyFilters = () => {
    const params = new URLSearchParams(searchParams.toString());

    if (localDate?.from) params.set("from", format(localDate.from, "yyyy-MM-dd"));
    else params.delete("from");

    if (localDate?.to) params.set("to", format(localDate.to, "yyyy-MM-dd"));
    else params.delete("to");

    if (localProduct) params.set("product", localProduct);
    else params.delete("product");

    if (localPaymentStatus.length === 0) params.set("paymentStatus", "all");
    else params.set("paymentStatus", localPaymentStatus.join(","));

    if (localStatus.length === 0) params.delete("status");
    else params.set("status", localStatus.join(","));

    if (localMethod.length === 0) params.delete("method");
    else params.set("method", localMethod.join(","));

    router.push(`${pathname}?${params.toString()}`);
    onOpenChange(false);
  };

  const handleClearFilters = () => {
    setLocalDate({ from: subDays(new Date(), 30), to: new Date() });
    setLocalProduct("");
    setLocalPaymentStatus(["paid", "pending"]); 
    setLocalStatus([]);
    setLocalMethod([]);
    router.push(pathname);
    onOpenChange(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md bg-background border-border shadow-2xl flex flex-col p-0">
        <SheetHeader className="p-6 border-b border-border">
          <SheetTitle>Filtrar Pedidos</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="space-y-2 flex flex-col">
            <label className="text-sm font-medium text-foreground">Data da Venda</label>
            <DatePickerWithRange date={localDate} setDate={setLocalDate} />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Filtrar por Produto</label>
            <Input
              placeholder="Ex: Garrafa Térmica..."
              value={localProduct}
              onChange={(e) => setLocalProduct(e.target.value)}
              className="bg-background"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Status Financeiro</label>
            <FilterMultiSelect
              options={PAYMENT_OPTIONS}
              selected={localPaymentStatus}
              onChange={setLocalPaymentStatus}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Status de Envio</label>
            <FilterMultiSelect
              options={STATUS_OPTIONS}
              selected={localStatus}
              onChange={setLocalStatus}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Método de Pagamento</label>
            <FilterMultiSelect
              options={METHOD_OPTIONS}
              selected={localMethod}
              onChange={setLocalMethod}
            />
          </div>
        </div>

        <div className="p-6 border-t border-border bg-muted/20 flex items-center justify-between">
          <Button variant="ghost" onClick={handleClearFilters} className="text-muted-foreground hover:text-foreground">
            Limpar
          </Button>
          <Button onClick={handleApplyFilters} className="bg-blue-600 text-white hover:bg-blue-700 px-8">
            Aplicar filtros
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function FilterMultiSelect({
  options,
  selected,
  onChange,
}: {
  options: { label: string; value: string }[];
  selected: string[];
  onChange: (val: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredOptions = options.filter((o) =>
    o.label.toLowerCase().includes(search.toLowerCase())
  );
  
  const isAll = selected.length === 0;
  const displayValue = isAll
    ? "Todos"
    : options
        .filter((o) => selected.includes(o.value))
        .map((o) => o.label)
        .join(", ");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between font-normal bg-background px-3 hover:bg-background border-input text-foreground h-10"
        >
          <span className="truncate mr-2">{displayValue}</span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 border-border shadow-lg" align="start">
        <div className="p-2 border-b border-border flex items-center">
          <Search className="h-4 w-4 text-muted-foreground mr-2" />
          <input
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground text-foreground"
            placeholder="Buscar opções..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="max-h-60 overflow-auto p-1">
          <div
            className="flex items-center px-2 py-2 text-sm hover:bg-muted cursor-pointer rounded-sm text-foreground transition-colors"
            onClick={() => onChange([])}
          >
            <div
              className={cn(
                "mr-3 flex h-4 w-4 items-center justify-center rounded-[4px] border transition-all",
                isAll ? "bg-blue-600 border-blue-600" : "border-input"
              )}
            >
              {isAll && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
            </div>
            Todos
          </div>
          
          {filteredOptions.map((opt) => {
            const isChecked = selected.includes(opt.value);
            return (
              <div
                key={opt.value}
                className="flex items-center px-2 py-2 text-sm hover:bg-muted cursor-pointer rounded-sm text-foreground transition-colors"
                onClick={() => {
                  if (isChecked) {
                    onChange(selected.filter((v) => v !== opt.value));
                  } else {
                    onChange([...selected, opt.value]);
                  }
                }}
              >
                <div
                  className={cn(
                    "mr-3 flex h-4 w-4 items-center justify-center rounded-[4px] border transition-all",
                    isChecked ? "bg-blue-600 border-blue-600" : "border-input"
                  )}
                >
                  {isChecked && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
                </div>
                {opt.label}
              </div>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}