"use client";

import { useState, useEffect } from "react";
import {
  Copy,
  Loader2,
  CheckCircle2,
  KeyRound,
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
  connectPagarme,
  disconnectPagarmeIntegration,
} from "@/actions/pagarme-actions";
import Image from "next/image";

interface PagarmeSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingUrl?: string | null;
  userId: string; // 🔥 Adicionado o userId para repassar pra action
  workspaceId: string; // 🔥 Adicionado o workspaceId na interface
}

export function PagarmeSheet({
  open,
  onOpenChange,
  existingUrl,
  userId,
  workspaceId, // 🔥 Recebendo a prop
}: PagarmeSheetProps) {
  const [secretKey, setSecretKey] = useState("");
  const [publicKey, setPublicKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        if (existingUrl) {
          setGeneratedUrl(existingUrl);
        } else {
          setGeneratedUrl(null);
          setSecretKey("");
          setPublicKey("");
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
    if (!secretKey || !publicKey)
      return toast.error("Preencha ambas as chaves da API.");

    setIsLoading(true);
    // 🔥 Repassando o userId e o workspaceId para a Action
    const res = await connectPagarme(userId, workspaceId, {
      secretKey,
      publicKey,
    });

    if (res?.success) {
      toast.success("Pagar.me conectada com sucesso!");
      // Se a action retornou a webhookUrl, atualiza a tela
      if (res.webhookUrl) {
        setGeneratedUrl(res.webhookUrl);
      } else {
        onOpenChange(false);
      }
    } else {
      toast.error(res?.error || "Erro ao conectar integração.");
    }
    setIsLoading(false);
  };

  // ==========================================
  // LÓGICA DE DESCONECTAR
  // ==========================================
  const handleDisconnect = async () => {
    setIsLoading(true);
    // 🔥 Repassando o userId e o workspaceId para a Action
    const res = await disconnectPagarmeIntegration(userId, workspaceId);

    if (res.success) {
      toast.info("Pagar.me desconectada com sucesso.");
      setGeneratedUrl(null);
      setSecretKey("");
      setPublicKey("");
      onOpenChange(false);
    } else {
      toast.error("Erro ao desconectar Pagar.me.");
    }
    setIsLoading(false);
  };

  const copyToClipboard = () => {
    if (generatedUrl) {
      navigator.clipboard.writeText(generatedUrl);
      toast.success("URL copiada com sucesso!");
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[570px] w-full p-0 flex flex-col bg-background border-l border-border/50 shadow-2xl">
        <SheetHeader className="p-6 border-b border-border/40 bg-muted/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white dark:bg-zinc-900 border border-border/50 rounded-lg flex items-center justify-center shrink-0 shadow-sm overflow-hidden">
              <Image
                src="/logos/pagar-me.png"
                alt="Pagar.me"
                width={26}
                height={26}
                className="object-contain"
              />
            </div>
            <div className="text-left">
              <SheetTitle className="text-xl">Integração Pagar.me</SheetTitle>
              <SheetDescription>
                Configure suas chaves de API para processar pagamentos.
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6">
          {!generatedUrl ? (
            <form id="pagarmeForm" onSubmit={handleSave} className="space-y-6">
              <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl">
                <p className="text-sm text-amber-500 font-medium flex items-center gap-2">
                  <KeyRound size={16} /> Onde encontro as chaves?
                </p>
                <p className="text-xs text-amber-500/80 mt-1 leading-relaxed">
                  Acesse o painel da Pagar.me, vá em{" "}
                  <strong>Configurações &gt; Chaves de API</strong>. Copie a
                  Secret Key e a Public Key do seu ambiente e cole abaixo.
                  (Certifique-se de usar a <strong>Versão V5</strong>).
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-foreground mb-1.5 block uppercase tracking-wider">
                    Secret Key (sk_)
                  </label>
                  <input
                    value={secretKey}
                    onChange={(e) => setSecretKey(e.target.value)}
                    placeholder="sk_test_..."
                    className="flex h-10 w-full rounded-md border border-border/60 bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground mb-1.5 block uppercase tracking-wider">
                    Public Key (pk_)
                  </label>
                  <input
                    value={publicKey}
                    onChange={(e) => setPublicKey(e.target.value)}
                    placeholder="pk_test_..."
                    className="flex h-10 w-full rounded-md border border-border/60 bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                    required
                  />
                </div>

                <div className="space-y-2 pt-2">
                  <label className="text-xs font-semibold text-foreground block uppercase tracking-wider text-left">
                    Eventos de Webhook (Pós-conexão)
                  </label>
                  <div className="grid grid-cols-1 gap-2 text-[11px] text-muted-foreground bg-muted/20 border border-border/50 p-4 rounded-lg">
                    <p>
                      Após salvar estas chaves, você receberá a sua URL
                      Exclusiva. Copie-a e crie um Webhook na Pagar.me
                      selecionando os eventos: <strong>order.created</strong>,{" "}
                      <strong>order.paid</strong>,{" "}
                      <strong>order.payment_failed</strong>,{" "}
                      <strong>order.canceled</strong> e{" "}
                      <strong>charge.refunded</strong>.
                    </p>
                  </div>
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
                  Integração Ativa!
                </h3>
                <p className="text-sm text-muted-foreground">
                  Sua loja já pode processar pagamentos. Agora copie o link
                  abaixo e cadastre nos Webhooks da Pagar.me.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground block uppercase tracking-wider">
                  Sua URL de Webhook
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

        {!generatedUrl && (
          <div className="p-6 border-t border-border/40 bg-muted/10 shrink-0 flex justify-end gap-3 cursor-pointer">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button
              type="submit"
              form="pagarmeForm"
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
