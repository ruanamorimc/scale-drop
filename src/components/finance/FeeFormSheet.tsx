"use client";

import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { NumericFormat } from "react-number-format"; 
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

const paymentMethods = [
  { id: "pix", label: "Pix" },
  { id: "boleto", label: "Boleto" },
  { id: "card_1x", label: "Cartão (À vista)" },
  ...Array.from({ length: 11 }, (_, i) => ({ id: `card_${i + 2}x`, label: `Cartão (${i + 2}x)` }))
];

export function FeeFormSheet({ isOpen, onOpenChange, onSave, initialData }: any) {
  const form = useForm({
    defaultValues: {
      id: null,
      name: "",
      calculationRule: "faturamento",
      feeType: "percentage",
      value: 0,
      methods: [] as string[]
    }
  });

  // Carrega dados quando abre para edição
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        form.reset({
          id: initialData.id,
          name: initialData.name,
          calculationRule: initialData.calculationRule || "faturamento",
          feeType: initialData.type === "PERCENTAGE" ? "percentage" : "fixed",
          value: Number(initialData.value),
          methods: initialData.paymentMethod || []
        });
      } else {
        form.reset({ id: null, name: "", calculationRule: "faturamento", feeType: "percentage", value: 0, methods: [] });
      }
    }
  }, [initialData, isOpen, form]);

  const feeType = useWatch({ control: form.control, name: "feeType" });

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg overflow-y-auto p-4">
        <SheetHeader>
          <SheetTitle>{initialData ? "Editar Taxa" : "Adicionar Taxa"}</SheetTitle>
          <SheetDescription>Configure as taxas que impactam seu lucro líquido.</SheetDescription>
        </SheetHeader>

        <form onSubmit={form.handleSubmit(onSave)} className="space-y-6 mt-6">
          <div className="space-y-2">
            <Label>Nome</Label>
            <Input placeholder="Ex: Taxa de Parcelamento" {...form.register("name")} />
          </div>

          {feeType === "percentage" && (
            <div className="space-y-2 animate-in fade-in">
              <Label>Regra de Cálculo</Label>
              <Select value={form.watch("calculationRule")} onValueChange={(v) => form.setValue("calculationRule", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="faturamento">Valor de Faturamento</SelectItem>
                  <SelectItem value="venda">Valor de Venda</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={form.watch("feeType")} onValueChange={(v: any) => form.setValue("feeType", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentual (%)</SelectItem>
                  <SelectItem value="fixed">Valor Fixo (R$)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Valor</Label>
              <NumericFormat
                customInput={Input}
                prefix={feeType === "fixed" ? "R$ " : ""}
                suffix={feeType === "percentage" ? "%" : ""}
                thousandSeparator="."
                decimalSeparator=","
                decimalScale={2}
                fixedDecimalScale
                value={form.watch("value")}
                onValueChange={(values) => form.setValue("value", values.floatValue || 0)}
              />
            </div>
          </div>

          <div className="space-y-3">
             <Label>Forma de Pagamento</Label>
             <div className="grid grid-cols-2 gap-2 border rounded-lg p-4 bg-muted/20 h-48 overflow-y-auto">
                {paymentMethods.map((method) => (
                   <div key={method.id} className="flex items-center space-x-2 font-medium">
                      <Checkbox 
                        id={method.id} 
                        checked={form.watch("methods")?.includes(method.id)}
                        onCheckedChange={(checked) => {
                          const current = form.getValues("methods") || [];
                          if (checked) form.setValue("methods", [...current, method.id]);
                          else form.setValue("methods", current.filter(id => id !== method.id));
                        }}
                      />
                      <label htmlFor={method.id} className="text-xs cursor-pointer">{method.label}</label>
                   </div>
                ))}
             </div>
          </div>

          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white">Salvar Taxa</Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}