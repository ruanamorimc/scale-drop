"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Loader2,
  CheckCircle2,
  ShieldCheck,
  Link as LinkIcon,
  Unplug,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

import {
  initiateNuvemshopAuth,
  disconnectNuvemshopIntegration,
} from "@/actions/nuvemshop-actions";
import Image from "next/image";

interface NuvemshopSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isConnected?: boolean;
  storeName?: string | null;
  userId: string;
  workspaceId: string; // 🔥 Adicionado o workspaceId na interface
}

export function NuvemshopSheet({
  open,
  onOpenChange,
  isConnected = false,
  storeName,
  userId,
  workspaceId, // 🔥 Recebendo a prop
}: NuvemshopSheetProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // ==========================================
  // OUVINTE DO POPUP OAUTH
  // ==========================================
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "NUVEMSHOP_OAUTH_SUCCESS") {
        toast.success("Nuvemshop conectada com sucesso!");
        setIsLoading(false);
        router.refresh();
      } else if (event.data?.type === "NUVEMSHOP_OAUTH_ERROR") {
        toast.error("Erro ao conectar com a Nuvemshop.");
        setIsLoading(false);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [router]);

  // ==========================================
  // LÓGICA DE CONECTAR (OAUTH)
  // ==========================================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 🔥 initiate não precisa de workspaceId, pois o auth só redireciona.
      // O salvamento vai acontecer na rota de callback da Nuvemshop!
      const res = await initiateNuvemshopAuth();
      if (res.success && res.url) {
        const width = 600;
        const height = 700;
        const left = window.innerWidth / 2 - width / 2 + window.screenX;
        const top = window.innerHeight / 2 - height / 2 + window.screenY;

        const popup = window.open(
          res.url,
          "NuvemshopAuth",
          `width=${width},height=${height},top=${top},left=${left}`,
        );

        const checkPopup = setInterval(() => {
          if (!popup || popup.closed || popup.closed === undefined) {
            clearInterval(checkPopup);
            setIsLoading(false);
          }
        }, 1000);
      } else {
        toast.error("Erro ao gerar link de autorização.");
        setIsLoading(false);
      }
    } catch (error) {
      console.error(error);
      toast.error("Ocorreu um erro interno.");
      setIsLoading(false);
    }
  };

  // ==========================================
  // LÓGICA DE DESCONECTAR
  // ==========================================
  const handleDisconnect = async () => {
    setIsLoading(true);
    // 🔥 Repassando o workspaceId para a Action de Desconectar
    const res = await disconnectNuvemshopIntegration(userId, workspaceId);

    if (res?.success) {
      toast.info("Nuvemshop desconectada com sucesso.");
      onOpenChange(false);
    } else {
      toast.error(res?.error || "Erro ao desconectar Nuvemshop.");
    }
    setIsLoading(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[570px] w-full p-0 flex flex-col bg-background border-l border-border/50 shadow-2xl">
        <SheetHeader className="p-6 border-b border-border/40 bg-muted/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white dark:bg-zinc-900 border border-border/50 rounded-lg flex items-center justify-center shrink-0 shadow-sm overflow-hidden">
              <Image
                src="/logos/nuvemshop.png"
                alt="Nuvemshop"
                width={26}
                height={26}
                className="object-contain rounded-sm"
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
              <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl">
                <p className="text-sm text-amber-500 font-medium flex items-center gap-2">
                  <ShieldCheck size={16} /> Instalação em 1-Clique
                </p>
                <p className="text-xs text-amber-500/80 mt-1 leading-relaxed">
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
                      O app <strong>nunca</strong> fará alterações não
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

              <div className="pt-4 flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleDisconnect}
                  disabled={isLoading}
                  className="flex-1 border-red-500/20 text-red-500 hover:bg-red-500/10 transition-colors"
                >
                  {isLoading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <>
                      <Unplug size={14} className="mr-2" /> Desconectar
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => onOpenChange(false)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Fechar
                </Button>
              </div>
            </div>
          )}
        </div>

        {!isConnected && (
          <div className="p-6 border-t border-border/40 bg-muted/10 shrink-0 flex justify-end gap-3 cursor-pointer">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button
              type="submit"
              form="nuvemshopForm"
              disabled={isLoading}
              className="group relative overflow-hidden gap-2 justify-center font-medium text-xs rounded-lg shadow-sm border border-blue-500/50 bg-gradient-to-tr from-blue-600 to-blue-500 hover:scale-100 active:scale-95 transition-all duration-300 ease-out hover:border-blue-400 text-white cursor-pointer min-w-[140px]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></div>
              <LinkIcon size={14} />
              {isLoading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                "Criar Webhook"
              )}
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
