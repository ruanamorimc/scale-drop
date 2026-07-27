"use client";

import { useState, useEffect } from "react";
import {
  Copy,
  Key,
  ShoppingBag,
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
  saveYampiIntegration,
  disconnectYampiIntegration,
} from "@/actions/yampi-actions";
import Image from "next/image";

interface YampiSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  workspaceId: string; // 🔥 Adicionado o workspaceId
  existingUrl?: string | null;
}

export function YampiSheet({
  open,
  onOpenChange,
  userId,
  workspaceId, // 🔥 Recebendo a prop
  existingUrl,
}: YampiSheetProps) {
  const [name, setName] = useState("Minha Loja Yampi");
  const [secretToken, setSecretToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        if (existingUrl) {
          setGeneratedUrl(existingUrl);
        } else {
          setGeneratedUrl(null);
          setName("Minha Loja Yampi");
          setSecretToken("");
        }
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [open, existingUrl]);

  // ==========================================
  // LÓGICA DE CONECTAR
  // ==========================================
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !secretToken) return toast.error("Preencha os dados.");

    setIsLoading(true);
    // 🔥 Passando o workspaceId para a Action
    const res = await saveYampiIntegration(userId, workspaceId, {
      name,
      secretToken,
    });

    if (res.success && res.webhookUrl) {
      setGeneratedUrl(res.webhookUrl);
      toast.success("Webhook criado com sucesso!");
    } else {
      toast.error(res.error || "Erro ao gerar webhook.");
    }
    setIsLoading(false);
  };

  // ==========================================
  // LÓGICA DE DESCONECTAR
  // ==========================================
  const handleDisconnect = async () => {
    setIsLoading(true);
    // 🔥 Passando o workspaceId para a Action de Desconectar
    const res = await disconnectYampiIntegration(userId, workspaceId);

    if (res.success) {
      toast.info("Yampi desconectada com sucesso.");
      setGeneratedUrl(null);
      setSecretToken("");
      onOpenChange(false);
    } else {
      toast.error("Erro ao desconectar Yampi.");
    }
    setIsLoading(false);
  };

  const copyToClipboard = () => {
    if (generatedUrl) {
      navigator.clipboard.writeText(generatedUrl);
      toast.success("URL copiada!");
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[570px] w-full p-0 flex flex-col bg-background border-l border-border/50 shadow-2xl">
        <SheetHeader className="p-6 border-b border-border/40 bg-muted/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white dark:bg-zinc-900 border border-border/50 rounded-lg flex items-center justify-center shrink-0 shadow-sm overflow-hidden">
              <Image
                src="/logos/yampi.svg"
                alt="Yampi"
                width={26}
                height={26}
                className="object-contain"
              />
            </div>
            <div className="text-left">
              <SheetTitle className="text-xl">Integração Yampi</SheetTitle>
              <SheetDescription>
                Configure o Webhook para rastreio de vendas.
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6">
          {!generatedUrl ? (
            <form id="yampiForm" onSubmit={handleSave} className="space-y-6">
              <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl">
                <p className="text-sm text-amber-500 font-medium flex items-center gap-2">
                  <ShieldCheck size={16} /> Configuração via Webhook
                </p>
                <p className="text-xs text-amber-500/80 mt-1">
                  Vá na Yampi em Configurações {">"} Webhooks {">"} Adicionar
                  Novo. Copie a &quot;Chave Secreta&quot; que eles fornecem e
                  cole abaixo.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-foreground mb-1.5 block uppercase tracking-wider">
                    Nome da Integração
                  </label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Loja Principal"
                    className="flex h-10 w-full rounded-md border border-border/60 bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground mb-1.5 block uppercase tracking-wider">
                    Token do Webhook (Chave Secreta)
                  </label>
                  <input
                    value={secretToken}
                    onChange={(e) => setSecretToken(e.target.value)}
                    placeholder="wh_hG9vRY..."
                    className="flex h-10 w-full rounded-md border border-border/60 bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                    required
                  />
                </div>
              </div>
            </form>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div className="flex flex-col items-center justify-center text-center space-y-2 py-4">
                <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mb-2">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="text-lg font-bold text-foreground">
                  {existingUrl === generatedUrl
                    ? "Seu Webhook da Yampi"
                    : "Webhook gerado com sucesso!"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {existingUrl === generatedUrl
                    ? "Copie o link abaixo se precisar cadastrar novamente."
                    : "Agora basta cadastrar o link abaixo lá na Yampi."}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground block uppercase tracking-wider">
                  Sua URL Exclusiva
                </label>
                <div className="relative group">
                  <input
                    readOnly
                    value={generatedUrl}
                    className="flex h-10 w-full rounded-md border border-border/60 bg-muted/30 px-3 py-2 text-[13px] font-mono text-muted-foreground pr-10 outline-none cursor-pointer"
                    onClick={copyToClipboard}
                  />
                  <button
                    type="button"
                    onClick={copyToClipboard}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-muted transition-colors"
                  >
                    <Copy size={16} />
                  </button>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleDisconnect}
                  disabled={isLoading}
                  className="flex-1 border-red-500/20 text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
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
                  className="group relative overflow-hidden flex-1 gap-2 justify-center font-medium text-xs rounded-lg shadow-sm border border-blue-500/50 bg-gradient-to-tr from-blue-600 to-blue-500 hover:scale-100 active:scale-95 transition-all duration-300 ease-out hover:border-blue-400 text-white cursor-pointer"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></div>
                  Fechar
                </Button>
              </div>
            </div>
          )}
        </div>

        {!generatedUrl && (
          <div className="p-6 border-t border-border/40 bg-muted/10 shrink-0 flex justify-end gap-3 cursor-pointer">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button
              type="submit"
              form="yampiForm"
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
