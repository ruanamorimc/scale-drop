"use client";

import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-table/DataTable";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { columns, Tax } from "./columns";
import { TaxFormSheet } from "@/components/finance/TaxFormSheet";
import { getTaxes, saveTax, deleteTax } from "@/actions/taxes";

export default function TaxesPage() {
  const [taxes, setTaxes] = useState<Tax[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [editingTax, setEditingTax] = useState<Tax | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const [deletingTax, setDeletingTax] = useState<Tax | null>(null);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    const data = await getTaxes();
    setTaxes(data as Tax[]);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async (data: any) => {
    const result = await saveTax({ ...data, id: editingTax?.id });
    if (result.success) {
      toast.success("Imposto salvo!");
      setIsSheetOpen(false);
      loadData();
    } else {
      toast.error("Erro: " + result.error);
    }
  };

  const confirmDelete = async () => {
    if (!deletingTax) return;
    const res = await deleteTax(deletingTax.id);
    if (res.success) {
      toast.success("Imposto removido");
      loadData();
    }
    setIsDeleteAlertOpen(false);
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Impostos
          </h2>
          <p className="text-muted-foreground">
            Configure alíquotas de impostos e custos de anúncios (Ads).
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingTax(null);
            setIsSheetOpen(true);
          }}
          className="gap-2 text-white bg-blue-600 transition-all duration-300 hover:bg-blue-700 hover:shadow-[0_0_10px_1px_rgba(37,99,235,0.6)] hover:-translate-y-0.5"
        >
          <Plus size={16} /> Adicionar Imposto
        </Button>
      </div>

      <div className="">
        <DataTable
          columns={columns}
          data={taxes}
          meta={{
            onEdit: (tax: Tax) => {
              setEditingTax(tax);
              setIsSheetOpen(true);
            },
            onDelete: (tax: Tax) => {
              setDeletingTax(tax);
              setIsDeleteAlertOpen(true);
            },
          }}
        />
      </div>

      <TaxFormSheet
        isOpen={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        onSave={handleSave}
        initialData={editingTax}
      />

      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Imposto?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover{" "}
              <span className="font-bold text-foreground">
                {deletingTax?.name}
              </span>
              ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="text-white bg-destructive hover:bg-destructive/80 hover:shadow-[0_0_10px_1px_rgba(239,68,68,0.6)]"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
