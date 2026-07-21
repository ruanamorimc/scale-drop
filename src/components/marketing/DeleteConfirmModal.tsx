"use client";

import React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function DeleteConfirmModal({
  isOpen,
  onOpenChange,
  onConfirm,
}: DeleteConfirmModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] bg-[#111317] border-zinc-800 text-zinc-200 p-6">
        <div className="flex flex-col items-center text-center gap-4">
          <h2 className="text-xl font-semibold text-white">
            Quer realmente excluir os objetos selecionados?
          </h2>
          <p className="text-sm text-zinc-400">
            Você não poderá reverter essa ação depois de executada.
          </p>

          <div className="flex flex-col w-full gap-3 mt-4">
            <Button
              onClick={() => onOpenChange(false)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium h-10"
            >
              Não quero mais excluir
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                onConfirm();
                onOpenChange(false);
              }}
              className="w-full bg-transparent border border-red-500/50 text-red-500 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500 font-medium h-10"
            >
              Quero mesmo excluir
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
