"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

// 👇 Importamos o formulário que acabamos de separar
import { EditUserForm } from "./EditUserForm";

interface EditUserProps {
  user?: {
    name?: string | null;
    email?: string | null;
    phoneNumber?: string | null;
  } | null;
}

const EditUser = ({ user }: EditUserProps) => {
  // 1. Estado do modal
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      {/* 2. O Botão Gatilho fica aqui, garantindo o estilo original */}
      <SheetTrigger asChild>
        <Button>Editar Usuário</Button>
      </SheetTrigger>

      {/* 3. O Conteúdo do Modal */}
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="mb-4">Editar Usuário</SheetTitle>
          <SheetDescription asChild>
            {/* Renderizamos o formulário e passamos a função para fechar */}
            <EditUserForm user={user} onSuccess={() => setOpen(false)} />
          </SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
};

export default EditUser;
