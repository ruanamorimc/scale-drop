"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Building2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Importe a action que acabamos de criar
import { createWorkspaceAction } from "@/actions/workspace-actions";

export default function CreateWorkspacePage() {
  const [workspaceName, setWorkspaceName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!workspaceName.trim()) {
      toast.error("O nome do workspace é obrigatório.");
      return;
    }

    setIsLoading(true);

    try {
      const result = await createWorkspaceAction(workspaceName);

      if (result.success && result.slug) {
        toast.success("Workspace criado com sucesso!");
        // A mágica acontece aqui: redireciona direto para o dashboard da loja nova!
        router.push(`/${result.slug}/dashboard`);
      } else {
        toast.error(result.error || "Erro ao criar workspace.");
      }
    } catch (error) {
      toast.error("Erro inesperado ao criar o workspace.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 animate-in fade-in duration-500">
      {/* Container Principal Centralizado */}
      <div className="w-full max-w-md space-y-6">
        {/* Header Visual */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 bg-blue-500/10 text-blue-500 rounded-xl flex items-center justify-center mb-4 border border-blue-500/20 shadow-sm">
            <Building2 size={24} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Criar Novo Workspace
          </h1>
          <p className="text-sm text-muted-foreground">
            Crie um ambiente isolado para gerenciar uma nova loja ou operação.
          </p>
        </div>

        {/* Card do Formulário */}
        <Card className="border-border/50 shadow-md">
          <form onSubmit={handleCreateWorkspace}>
            <CardHeader>
              <CardTitle className="text-lg">Detalhes do Workspace</CardTitle>
              <CardDescription>
                Escolha um nome descritivo. Você poderá alterá-lo depois nas
                configurações.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label
                  htmlFor="workspace-name"
                  className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  Nome da Loja / Operação
                </Label>
                <Input
                  id="workspace-name"
                  placeholder="Ex: Operação Dropshipping 2026"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  disabled={isLoading}
                  className="h-11 bg-muted/30 focus-visible:ring-blue-500"
                  autoFocus
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t border-border/40 bg-muted/10 p-6">
              <Button
                type="button"
                variant="ghost"
                onClick={() => router.back()}
                disabled={isLoading}
                className="text-muted-foreground hover:text-foreground"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white min-w-[140px] shadow-sm transition-all"
              >
                {isLoading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <>
                    Criar Workspace <ArrowRight size={16} className="ml-2" />
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
