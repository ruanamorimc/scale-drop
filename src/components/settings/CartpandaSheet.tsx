"use client";

import { useState, useEffect } from "react";
import { Copy, ShoppingCart, Loader2, CheckCircle2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { saveCartpandaIntegration } from "@/actions/cartpanda-actions";

interface CartpandaSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  existingUrl?: string | null;
}

export function CartpandaSheet({
  open,
  onOpenChange,
  userId,
  existingUrl,
}: CartpandaSheetProps) {
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setGeneratedUrl(existingUrl || null);
      setName("");
    }
  }, [open, existingUrl]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return toast.error("Dê um nome para este webhook.");

    setIsLoading(true);
    const res = await saveCartpandaIntegration(userId, { name });

    if (res.success && res.webhookUrl) {
      setGeneratedUrl(res.webhookUrl);
      toast.success("Webhook gerado com sucesso!");
    } else {
      toast.error(res.error || "Erro ao gerar webhook.");
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
      <SheetContent className="sm:max-w-[550px] w-full p-0 flex flex-col bg-background border-l border-border/50">
        <SheetHeader className="p-6 border-b border-border/40 bg-muted/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20">
              <ShoppingCart size={24} className="text-white" />
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
              <div className="space-y-4">
                <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
                  Nome do Webhook
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: ScaleDrop Cartpanda"
                  className="flex h-12 w-full rounded-md border border-border/60 bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  required
                />
              </div>
            </form>
          ) : (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
              <div className="bg-emerald-500/5 border border-emerald-500/10 p-4 rounded-xl flex gap-3 items-center">
                <CheckCircle2 className="text-emerald-500 shrink-0" size={20} />
                <p className="text-sm text-emerald-600 font-medium text-left">
                  Webhook criado! Agora basta cadastrar os links abaixo na
                  Cartpanda.
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
                    className="flex h-10 flex-1 rounded-md border border-border/60 bg-muted/30 px-3 py-2 text-[11px] font-mono outline-none"
                  />
                  <Button
                    size="icon"
                    variant="secondary"
                    onClick={() => copy(urls.full || "")}
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
                    value={urls.noAffiliate}
                    className="flex h-10 flex-1 rounded-md border border-border/60 bg-muted/30 px-3 py-2 text-[11px] font-mono outline-none"
                  />
                  <Button
                    size="icon"
                    variant="secondary"
                    onClick={() => copy(urls.noAffiliate)}
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
                    value={urls.s2s}
                    className="flex h-10 flex-1 rounded-md border border-border/60 bg-muted/30 px-3 py-2 text-[11px] font-mono outline-none"
                  />
                  <Button
                    size="icon"
                    variant="secondary"
                    onClick={() => copy(urls.s2s)}
                  >
                    <Copy size={14} />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-border/40 bg-muted/10 flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
          {!generatedUrl ? (
            <Button
              type="submit"
              form="cpForm"
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white min-w-[120px]"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" />
              ) : (
                "Criar Webhook"
              )}
            </Button>
          ) : (
            <Button
              onClick={() => onOpenChange(false)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Finalizar
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
