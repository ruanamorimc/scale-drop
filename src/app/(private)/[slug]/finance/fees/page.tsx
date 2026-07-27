"use client";

import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-table/DataTable"; // Sua DataTable existente
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

import { columns, Fee } from "./columns";
import { FeeFormSheet } from "@/components/finance/FeeFormSheet";
import { getFees, deleteFee, saveFee } from "@/actions/fees";

export default function FeesPage() {
  // --- ESTADOS ---
  const [fees, setFees] = useState<Fee[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Estados de Edição/Modal (Igual Produtos)
  const [editingFee, setEditingFee] = useState<Fee | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Estados de Delete (Igual Produtos)
  const [deletingFee, setDeletingFee] = useState<Fee | null>(null);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);

  // --- CARREGAMENTO DE DADOS ---
  const loadData = async () => {
    setIsLoading(true);
    const data = await getFees();
    setFees(data as Fee[]);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // --- HANDLERS (Ações da Tabela) ---
  // Quando clica no botão "+ Adicionar Taxa"
  const handleNewClick = () => {
    setEditingFee(null); // Garante que é criação
    setIsSheetOpen(true);
  };

  const handleEditClick = (fee: Fee) => {
    setEditingFee(fee); // Passa os dados para o formulário
    setIsSheetOpen(true);
  };

  const handleDeleteClick = (fee: Fee) => {
    setDeletingFee(fee);
    setIsDeleteAlertOpen(true); // Abre o Modal Destructive
  };

  // --- AÇÕES DO BANCO ---
  const handleSave = async (data: any) => {
    // Aqui você pode diferenciar criar vs editar se quiser passar o ID
    const result = await saveFee({ ...data, id: editingFee?.id });

    if (result.success) {
      toast.success("Taxa salva com sucesso!");
      setIsSheetOpen(false);
      setEditingFee(null); // Limpa edição
      loadData(); // Recarrega tabela para impactar financeiro
    } else {
      toast.error("Erro ao salvar: " + result.error);
    }
  };

  const confirmDelete = async () => {
    if (!deletingFee) return;

    try {
      const res = await deleteFee(deletingFee.id);
      if (res.success) {
        toast.success("Taxa removida com sucesso!");
        loadData();
      } else {
        toast.error("Erro ao remover taxa.");
      }
    } catch (error) {
      toast.error("Erro de conexão.");
    } finally {
      setIsDeleteAlertOpen(false);
      setDeletingFee(null);
    }
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Taxas e Tarifas
          </h2>
          <p className="text-muted-foreground">
            Gerencie as taxas de gateway e parcelamento.
          </p>
        </div>
        <Button
          onClick={handleNewClick}
          className="gap-2 text-white bg-blue-600 transition-all duration-300 hover:bg-blue-700 hover:shadow-[0_0_10px_1px_rgba(37,99,235,0.6)] hover:-translate-y-0.5"
        >
          <Plus size={16} /> Adicionar Taxa
        </Button>
      </div>

      <div className="">
        <DataTable
          columns={columns}
          data={fees}
          // Passamos as funções para as colunas aqui (Igual Produtos)
          meta={{
            onEdit: handleEditClick,
            onDelete: handleDeleteClick,
          }}
        />
      </div>

      {/* FORMULÁRIO (SHEET) */}
      <FeeFormSheet
        isOpen={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        onSave={handleSave}
        initialData={editingFee} // Precisaremos ajustar o Sheet para receber isso
      />

      {/* MODAL DE DELEÇÃO (Igual Produtos) */}
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza absoluta?</AlertDialogTitle>
            <AlertDialogDescription>
              Isso excluirá permanentemente a taxa{" "}
              <span className="font-bold text-foreground">
                {deletingFee?.name}
              </span>{" "}
              e afetará os cálculos futuros.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="text-white bg-destructive hover:bg-destructive/80 hover:shadow-[0_0_10px_1px_rgba(239,68,68,0.6)]"
            >
              Sim, excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
