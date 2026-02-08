"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { Product } from "@/app/(private)/products/columns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  ExternalLink,
  Package,
  DollarSign,
  Link as LinkIcon,
} from "lucide-react";
import { CurrencyInput } from "@/components/ui/currency-input";

interface ProductEditSheetProps {
  product: Product | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updatedProduct: Product) => void;
}

export function ProductEditSheet({
  product,
  isOpen,
  onOpenChange,
  onSave,
}: ProductEditSheetProps) {
  const form = useForm<Product>({
    defaultValues: {
      name: "",
      salePrice: 0,
      costPrice: 0,
      stock: 0,
      status: "active",
      image: "",
      sku: "",
      store: "",
      supplierUrl: "", // Valor padrão inicial
    },
  });

  // 🔄 EFEITO DE RESET PODEROSO
  useEffect(() => {
    if (product) {
      form.reset({
        ...product,
        // 👇 A MÁGICA: Se vier null do banco, transforma em "" pro input não bugar
        supplierUrl: product.supplierUrl || "",
        sku: product.sku || "",
        image: product.image || "",
      });
    }
  }, [product, form]);

  const watchedSalePrice = form.watch("salePrice");
  const watchedCostPrice = form.watch("costPrice");

  const profitStats = useMemo(() => {
    const price = watchedSalePrice || 0;
    const cost = watchedCostPrice || 0;
    const grossProfit = price - cost;
    const margin = price > 0 ? (grossProfit / price) * 100 : 0;
    return { grossProfit, margin };
  }, [watchedSalePrice, watchedCostPrice]);

  const onSubmit = (data: Product) => {
    // Passa para o Pai resolver (não fecha modal aqui)
    onSave(data);
  };

  const handleOpenStore = () => toast.info("Abrindo link da loja...");

  // Função segura para abrir link
  const handleOpenSupplier = () => {
    const link = form.getValues("supplierUrl");
    if (link && link.startsWith("http")) {
      window.open(link, "_blank");
    } else {
      toast.error("Link inválido ou não preenchido");
    }
  };

  if (!product) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg w-full flex flex-col h-full bg-card border-l border-border p-0 gap-0">
        <SheetHeader className="p-6 border-b border-border bg-muted/10">
          <SheetTitle>Editar Produto</SheetTitle>
          <SheetDescription>
            Faça alterações rápidas no produto.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Header Visual do Produto */}
          <div className="flex gap-4 p-4 rounded-xl bg-muted/30 border border-border items-start">
            <div className="h-16 w-16 rounded-lg border border-border bg-background flex items-center justify-center overflow-hidden shrink-0">
              {product.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={product.image}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="text-xs text-muted-foreground">Sem ft</div>
              )}
            </div>
            <div className="flex flex-col min-w-0 gap-1 flex-1">
              <h3 className="font-semibold text-sm line-clamp-2 text-foreground leading-tight">
                {product.name}
              </h3>
              <div className="flex items-center gap-3 mt-1.5">
                <span className="text-[10px] font-mono bg-background border border-border px-1.5 py-0.5 rounded text-muted-foreground">
                  {product.sku || "SEM-SKU"}
                </span>
                <button
                  type="button"
                  onClick={handleOpenStore}
                  className="text-xs text-primary flex items-center gap-1 hover:underline font-medium transition-colors"
                >
                  Ver na Loja <ExternalLink size={10} />
                </button>
              </div>
            </div>
          </div>

          <form
            id="product-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-8"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium flex items-center gap-2 text-foreground">
                  <div className="p-1.5 rounded-md bg-primary/10 text-green-500">
                    <DollarSign size={14} />
                  </div>
                  Financeiro
                </h4>

                {(watchedSalePrice || 0) > 0 && (
                  <div
                    className={`text-xs font-medium px-2 py-1 rounded border ${profitStats.grossProfit > 0 ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-red-500/10 text-red-600 border-red-500/20"}`}
                  >
                    Margem: {profitStats.margin.toFixed(0)}% (R${" "}
                    {profitStats.grossProfit.toFixed(2)})
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="salePrice"
                    className="text-xs font-medium text-muted-foreground"
                  >
                    Preço Venda
                  </Label>
                  <CurrencyInput
                    id="salePrice"
                    value={form.watch("salePrice") || 0}
                    onValueChange={(val) =>
                      form.setValue("salePrice", val || 0)
                    }
                    placeholder="R$ 0,00"
                    className="h-10 bg-background"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="costPrice"
                    className="text-xs font-medium text-muted-foreground"
                  >
                    Custo (CMV)
                  </Label>
                  <CurrencyInput
                    id="costPrice"
                    value={form.watch("costPrice") || 0}
                    onValueChange={(val) =>
                      form.setValue("costPrice", val || 0)
                    }
                    placeholder="R$ 0,00"
                    className="h-10 bg-background"
                  />
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h4 className="text-sm font-medium flex items-center gap-2 text-foreground">
                <div className="p-1.5 rounded-md bg-orange-500/10 text-orange-500">
                  <Package size={14} />
                </div>
                Logística
              </h4>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="stock"
                    className="text-xs font-medium text-muted-foreground"
                  >
                    Estoque Atual
                  </Label>
                  <Input
                    id="stock"
                    type="number"
                    className="h-10 bg-background"
                    {...form.register("stock", { valueAsNumber: true })}
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="status"
                    className="text-xs font-medium text-muted-foreground"
                  >
                    Status
                  </Label>
                  <Select
                    value={form.watch("status")}
                    onValueChange={(val) =>
                      form.setValue("status", val as "active" | "paused")
                    }
                  >
                    <SelectTrigger className="h-10 bg-background">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Ativo</SelectItem>
                      <SelectItem value="paused">Pausado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  {/* Correção de HTML: Removido aninhamento inválido e classes duplicadas */}
                  <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    Link do Fornecedor <LinkIcon size={12} />
                  </Label>
                  <button
                    type="button"
                    onClick={handleOpenSupplier}
                    className="text-[10px] text-primary hover:underline cursor-pointer"
                  >
                    Abrir link ↗
                  </button>
                </div>
                <Input
                  placeholder="https://..."
                  className="h-10 bg-background text-sm"
                  {...form.register("supplierUrl")}
                />
              </div>
            </div>
          </form>
        </div>

        <SheetFooter className="p-6 border-t border-border sm:justify-between gap-3 bg-muted/10">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            form="product-form"
            className="w-full sm:w-auto min-w-30"
          >
            Salvar Alterações
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
