"use client";

import { useState, useEffect } from "react";
import {
  Copy,
  ShoppingCart,
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
  saveCartpandaIntegration,
  disconnectCartpandaIntegration, // 🔥 Função de desconectar importada
} from "@/actions/cartpanda-actions";
import Image from "next/image";

interface CartpandaSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  workspaceId: string; // 🔥 Adicionado o workspaceId
  existingUrl?: string | null;
}

export function CartpandaSheet({
  open,
  onOpenChange,
  userId,
  workspaceId, // 🔥 Recebendo a prop
  existingUrl,
}: CartpandaSheetProps) {
  const [name, setName] = useState("ScaleDrop Cartpanda");
  const [isLoading, setIsLoading] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);

  // 🔥 FIX DO ERRO: Utiliza setTimeout para sincronia do estado
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        if (existingUrl) {
          setGeneratedUrl(existingUrl);
        } else {
          setGeneratedUrl(null);
          setName("ScaleDrop Cartpanda");
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
    if (!name) return toast.error("Dê um nome para este webhook.");

    setIsLoading(true);
    // 🔥 Passando o workspaceId para a Action
    const res = await saveCartpandaIntegration(userId, workspaceId, { name });

    if (res.success && res.webhookUrl) {
      setGeneratedUrl(res.webhookUrl);
      toast.success("Webhook gerado com sucesso!");
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
    const res = await disconnectCartpandaIntegration(userId, workspaceId);

    if (res.success) {
      toast.info("Cartpanda desconectada.");
      setGeneratedUrl(null);
      onOpenChange(false);
    } else {
      toast.error("Erro ao desconectar Cartpanda.");
    }
    setIsLoading(false);
  };

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Link copiado!");
  };

  const urls = {
    full: generatedUrl,
    noAffiliate: generatedUrl ? `${generatedUrl}&type=no_affiliate` : "",
    s2s: generatedUrl
      ? `${generatedUrl}&type=s2s&cid={cid}&orderId={order_id}&commission={amount_affiliate}&totalPrice={total_price}&utmSource={utm_source}&utmCampaign={utm_campaign}&utmMedium={utm_medium}&utmContent={utm_content}&utmTerm={utm_term}&email={email}&orderType={order_type}&productName={product_name}&productId={product_id}&currency={currency}&firstName={first_name}&lastName={last_name}&phoneNumber={phone_number}&country={country}&upsellNo={upsell_no}&dateTime={datetime_full}`
      : "",
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[570px] w-full p-0 flex flex-col bg-background border-l border-border/50 shadow-2xl">
        <SheetHeader className="p-6 border-b border-border/40 bg-muted/10 shrink-0">
          <div className="flex items-center gap-3">
            {/* Logo com fundo branco para contraste */}
            <div className="w-10 h-10 bg-white dark:bg-zinc-900 border border-border/50 rounded-lg flex items-center justify-center shrink-0 shadow-sm overflow-hidden">
              <Image
                src="/logos/cartpanda.png"
                alt="Cartpanda"
                width={26}
                height={26}
                className="object-contain rounded-sm"
              />
            </div>
            <div className="text-left">
              <SheetTitle className="text-xl">Integração Cartpanda</SheetTitle>
              <SheetDescription>
                Gere seus links de postback e webhooks.
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6">
          {!generatedUrl ? (
            <form id="cpForm" onSubmit={handleSave} className="space-y-6">
              {/* Estilo Padrão Ouro: Aviso Amarelo */}
              <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl">
                <p className="text-sm text-amber-500 font-medium flex items-center gap-2">
                  <ShieldCheck size={16} /> Configuração de Postback/Webhook
                </p>
                <p className="text-xs text-amber-500/80 mt-1">
                  Vá na Cartpanda em Loja {">"} Aplicativos {">"} Webhooks e
                  Postbacks. Copie as URLs geradas abaixo e cadastre de acordo
                  com o tipo de envio desejado.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-foreground mb-1.5 block uppercase tracking-wider">
                    Nome do Webhook
                  </label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: ScaleDrop Cartpanda"
                    className="flex h-10 w-full rounded-md border border-border/60 bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    required
                  />
                </div>
              </div>
            </form>
          ) : (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
              <div className="flex flex-col items-center justify-center text-center space-y-2 py-4">
                <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mb-2">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="text-lg font-bold text-foreground">
                  Webhook gerado!
                </h3>
                <p className="text-sm text-muted-foreground">
                  Agora basta cadastrar os links abaixo na Cartpanda.
                </p>
              </div>

              {/* URL 1 */}
              <div className="space-y-2 text-left">
                <label className="text-[11px] font-bold text-muted-foreground uppercase flex items-center gap-2">
                  URL de produtor, incluindo vendas de afiliados
                </label>
                <div className="relative group flex gap-2">
                  <input
                    readOnly
                    value={urls.full || ""}
                    className="flex h-10 flex-1 rounded-md border border-border/60 bg-muted/30 px-3 py-2 text-[11px] font-mono outline-none cursor-pointer"
                    onClick={() => copy(urls.full || "")}
                  />
                  <Button
                    size="icon"
                    variant="secondary"
                    onClick={() => copy(urls.full || "")}
                    className="shrink-0"
                  >
                    <Copy size={14} />
                  </Button>
                </div>
              </div>

              {/* URL 2 */}
              <div className="space-y-2 text-left">
                <label className="text-[11px] font-bold text-muted-foreground uppercase">
                  URL de produtor, excluindo vendas de afiliados
                </label>
                <div className="relative group flex gap-2">
                  <input
                    readOnly
                    value={urls.noAffiliate || ""}
                    className="flex h-10 flex-1 rounded-md border border-border/60 bg-muted/30 px-3 py-2 text-[11px] font-mono outline-none cursor-pointer"
                    onClick={() => copy(urls.noAffiliate || "")}
                  />
                  <Button
                    size="icon"
                    variant="secondary"
                    onClick={() => copy(urls.noAffiliate || "")}
                    className="shrink-0"
                  >
                    <Copy size={14} />
                  </Button>
                </div>
              </div>

              {/* URL 3 */}
              <div className="space-y-2 text-left">
                <label className="text-[11px] font-bold text-muted-foreground uppercase">
                  URL de afiliado (S2S)
                </label>
                <div className="relative group flex gap-2">
                  <input
                    readOnly
                    value={urls.s2s || ""}
                    className="flex h-10 flex-1 rounded-md border border-border/60 bg-muted/30 px-3 py-2 text-[11px] font-mono outline-none cursor-pointer"
                    onClick={() => copy(urls.s2s || "")}
                  />
                  <Button
                    size="icon"
                    variant="secondary"
                    onClick={() => copy(urls.s2s || "")}
                    className="shrink-0"
                  >
                    <Copy size={14} />
                  </Button>
                </div>
              </div>

              {/* Botões de Gerenciamento Embutidos */}
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
              form="cpForm"
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
