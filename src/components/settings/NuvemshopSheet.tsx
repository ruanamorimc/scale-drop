"use client";

import { useState } from "react";
import { Loader2, CheckCircle2, Cloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { initiateNuvemshopAuth } from "@/actions/nuvemshop-actions";
import Image from "next/image";

interface NuvemshopSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isConnected?: boolean;
  storeName?: string | null;
}

export function NuvemshopSheet({
  open,
  onOpenChange,
  isConnected = false,
  storeName,
}: NuvemshopSheetProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Evita o recarregamento da página
    setIsLoading(true);

    try {
      const res = await initiateNuvemshopAuth();
      if (res.success && res.url) {
        // Abre uma janela estilo pop-up centralizada (típico de OAuth)
        const width = 600;
        const height = 700;
        const left = (window.innerWidth - width) / 2;
        const top = (window.innerHeight - height) / 2;

        window.open(
          res.url,
          "NuvemshopAuth",
          `width=${width},height=${height},top=${top},left=${left}`,
        );
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[500px] w-full p-0 flex flex-col bg-background border-l border-border/50">
        <SheetHeader className="p-6 border-b border-border/40 bg-muted/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white dark:bg-zinc-900 border border-border/50 rounded-lg flex items-center justify-center shrink-0 shadow-sm overflow-hidden">
              <Image
                src="/logos/nuvemshop.jpg"
                alt="Nuvemshop"
                width={26}
                height={26}
                className="object-contain"
              />
            </div>
            <div className="text-left">
              <SheetTitle className="text-xl">Integração Nuvemshop</SheetTitle>
              <SheetDescription>
                Conecte sua loja para sincronizar pedidos automaticamente.
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6">
          {!isConnected ? (
            <form
              id="nuvemshopForm"
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              {/* Caixa de Atenção/Instruções - Usando a paleta Blue para combinar com a Nuvemshop */}
              <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl">
                <p className="text-sm text-blue-600 dark:text-blue-500 font-medium flex items-center gap-2">
                  <Cloud size={16} /> Instalação em 1-Clique
                </p>
                <p className="text-xs text-blue-600/80 dark:text-blue-500/80 mt-1 leading-relaxed">
                  Diferente de outras plataformas, a integração com a Nuvemshop
                  não exige configuração de chaves. Ao clicar em conectar, você
                  será redirecionado para autorizar o aplicativo. Nós
                  configuraremos os <strong>Webhooks automaticamente</strong>{" "}
                  para você.
                </p>
              </div>

              <div className="space-y-2 pt-2">
                <label className="text-xs font-semibold text-foreground block uppercase tracking-wider text-left">
                  Permissões Solicitadas
                </label>
                <div className="grid grid-cols-1 gap-2 text-[11px] text-muted-foreground bg-muted/20 border border-border/50 p-4 rounded-lg">
                  <ul className="list-disc list-inside space-y-1">
                    <li>Ler dados básicos da loja e produtos.</li>
                    <li>Ler histórico de pedidos e atualizações de status.</li>
                    <li>
                      O Scale Drop <strong>nunca</strong> fará alterações não
                      autorizadas na sua loja.
                    </li>
                  </ul>
                </div>
              </div>
            </form>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div className="flex flex-col items-center justify-center text-center space-y-2 py-4">
                <div className="w-16 h-16 bg-blue-500/10 text-blue-500 rounded-full flex items-center justify-center mb-2">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="text-lg font-bold text-foreground">
                  Loja Conectada!
                </h3>
                <p className="text-sm text-muted-foreground">
                  A sua loja{" "}
                  <strong className="text-foreground">
                    {storeName || "Nuvemshop"}
                  </strong>{" "}
                  está sincronizada. Os webhooks já estão rodando em background
                  capturando seus pedidos.
                </p>
              </div>

              <div className="pt-4">
                <Button
                  onClick={() => onOpenChange(false)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Fechar
                </Button>
              </div>
            </div>
          )}
        </div>

        {!isConnected && (
          <div className="p-6 border-t border-border/40 bg-muted/10 shrink-0 flex justify-end gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button
              type="submit"
              form="nuvemshopForm"
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white min-w-[140px]"
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin mr-2" />
                  Redirecionando...
                </>
              ) : (
                "Conectar Loja"
              )}
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
