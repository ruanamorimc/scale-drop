"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { NumericFormat } from "react-number-format"; 
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle } from "lucide-react";

export function TaxFormSheet({ isOpen, onOpenChange, onSave, initialData }: any) {
  const form = useForm({
    defaultValues: {
      id: null,
      name: "",
      rate: 0,
      calculationRule: "faturamento",
      isSystem: false,
    }
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        form.reset({
          id: initialData.id,
          name: initialData.name,
          rate: Number(initialData.rate),
          calculationRule: initialData.calculationRule || "faturamento",
          isSystem: initialData.isSystem,
        });
      } else {
        // Reset limpo para evitar o crash
        form.reset({ id: null, name: "", rate: 0, calculationRule: "faturamento", isSystem: false });
      }
    }
  }, [initialData, isOpen, form]);

  const isSystem = form.watch("isSystem");

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg p-4">
        <SheetHeader>
          <SheetTitle>{initialData ? "Editar Imposto" : "Adicionar Imposto"}</SheetTitle>
          <SheetDescription>
            {isSystem 
              ? "Configure a alíquota aplicada aos anúncios da Meta." 
              : "Configure impostos e custos fixos percentuais."}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={form.handleSubmit(onSave)} className="space-y-6 mt-6">
          
          {/* CORREÇÃO DO CRASH: Verificamos se initialData existe antes de ler o nome */}
          {isSystem && initialData ? (
            <div className="rounded-md bg-muted p-4 border">
              <h4 className="font-semibold text-sm mb-1">{initialData.name}</h4>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                 <AlertCircle size={12} />
                 Calculado sobre o <strong>Gasto em Anúncios (Ad Spend)</strong>.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <Label>Nome do Imposto/Custo</Label>
              <Input placeholder="Ex: Simples Nacional" {...form.register("name")} />
            </div>
          )}

          {!isSystem && (
            <div className="space-y-2">
              <Label>Regra de Cálculo</Label>
              <Select 
                value={form.watch("calculationRule")} 
                onValueChange={(v) => form.setValue("calculationRule", v)}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="faturamento">Sobre o Faturamento</SelectItem>
                  <SelectItem value="comissao">Sobre a Comissão</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label>Alíquota (%)</Label>
            <NumericFormat
              customInput={Input}
              suffix="%"
              thousandSeparator="."
              decimalSeparator=","
              decimalScale={2}
              fixedDecimalScale
              value={form.watch("rate")}
              onValueChange={(values) => form.setValue("rate", values.floatValue || 0)}
              className="font-bold text-lg"
            />
            {isSystem && (
              <p className="text-[0.7rem] text-muted-foreground">
                Essa porcentagem será adicionada ao seu Custo de Marketing.
              </p>
            )}
          </div>

          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 font-bold text-white">
            {isSystem ? "Salvar Alíquota" : "Salvar Imposto"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}