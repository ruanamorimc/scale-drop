"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { NumericFormat } from "react-number-format"; 
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function FixedExpenseSheet({ isOpen, onOpenChange, onSave, initialData }: any) {
  const form = useForm({
    defaultValues: { id: null, description: "", category: "Ferramentas", amount: 0, date: new Date().toISOString().split('T')[0] }
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        form.reset({
            ...initialData,
            amount: Number(initialData.amount),
            date: new Date(initialData.date).toISOString().split('T')[0] 
        });
      } else {
        form.reset({ id: null, description: "", category: "Ferramentas", amount: 0, date: new Date().toISOString().split('T')[0] });
      }
    }
  }, [initialData, isOpen, form]);

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[400px]">
        <SheetHeader>
          <SheetTitle>{initialData ? "Editar Despesa" : "Nova Despesa"}</SheetTitle>
        </SheetHeader>
        <form onSubmit={form.handleSubmit(onSave)} className="space-y-4 mt-6">
          <div className="space-y-2">
            <Label>Descrição</Label>
            <Input placeholder="Ex: Shopify, Hospedagem" {...form.register("description")} />
          </div>
          <div className="space-y-2">
            <Label>Categoria</Label>
            <Select value={form.watch("category")} onValueChange={(v) => form.setValue("category", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Ferramentas">Ferramentas (SaaS)</SelectItem>
                <SelectItem value="Equipe">Equipe / Freelancers</SelectItem>
                <SelectItem value="Infra">Infraestrutura</SelectItem>
                <SelectItem value="Marketing">Agência / Criativos</SelectItem>
                <SelectItem value="Outros">Outros</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Data</Label>
            <Input type="date" {...form.register("date")} />
          </div>
          <div className="space-y-2">
            <Label>Valor (R$)</Label>
            <NumericFormat customInput={Input} prefix="R$ " thousandSeparator="." decimalSeparator="," decimalScale={2} fixedDecimalScale
              value={form.watch("amount")} onValueChange={(v) => form.setValue("amount", v.floatValue || 0)}
            />
          </div>
          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white">Salvar Despesa</Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}