import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  CreditCard,
  RotateCcw,
  MoreHorizontal,
  Package,
  X,
  MapPin,
  Copy,
  ExternalLink,
} from "lucide-react";
import { Order } from "@/app/(private)/orders/columns";
import { StatusBadge } from "@/components/data-table/StatusBadge";
import { PaymentStatusBadge } from "@/components/data-table/PaymentStatusBadge";

interface OrderDetailsProps {
  order: Order | null;
  onClose: () => void;
}

export function OrderDetails({ order, onClose }: OrderDetailsProps) {
  if (!order) return null;

  return (
    // 1. WRAPPER: Centraliza e dá margem externa para o card flutuar
    <div className="h-full flex items-center justify-end p-4 animate-in slide-in-from-right duration-300">
      {/* 2. O CARD: Usando cores semânticas (bg-card, border-border) */}
      <div className="w-[380px] h-full bg-card border border-border rounded-xl shadow-2xl flex flex-col overflow-hidden p-4">
        {/* --- HEADER --- */}
        {/* Usando bg-muted/40 para um contraste sutil no header */}
        <div className="border-b border-border bg-muted/40 flex flex-col gap-4">
          {/* LINHA 1: ID e Botão Fechar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* text-foreground se adapta ao tema */}
              <h2 className="text-lg font-bold text-foreground tracking-tight">
                Pedido {order.invoiceId}
              </h2>
              <button
                onClick={() => navigator.clipboard.writeText(order.invoiceId)}
                className="text-muted-foreground hover:text-foreground transition-colors p-1"
                title="Copiar ID"
              >
                <Copy className="w-3 h-3" />
              </button>
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 -mr-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* LINHA 2: Status e Data */}
          <div className="mb-2 flex items-center gap-2">
            <StatusBadge status={order.status} />

            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-mono">
              <span>{order.date}</span>
              {order.time && (
                <>
                  <span className="opacity-50">•</span>
                  <span>{order.time}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* --- CONTEÚDO --- */}
        {/* Removido bg-color fixo */}
        <ScrollArea className="flex-1">
          <div className="p-5 space-y-6">
            {/* Seção Cliente */}
            <div>
              <div className="flex items-center justify-between mb-3 pt-2">
                <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Cliente
                </h3>
                <Button
                  variant="link"
                  className="h-auto p-0 text-[10px] text-primary hover:underline flex items-center gap-1"
                >
                  Ver perfil <ExternalLink className="w-3 h-3" />
                </Button>
              </div>

              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border border-border">
                  <AvatarImage src={order.customer.avatar} />
                  <AvatarFallback className="bg-muted text-muted-foreground text-xs font-bold">
                    {order.customer.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="font-medium text-sm text-foreground line-clamp-1">
                    {order.customer.name}
                  </span>
                  <span className="text-xs text-muted-foreground line-clamp-1">
                    {order.customer.email}
                  </span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Seção Itens */}
            <div>
              <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-3">
                Itens ({order.items?.length || 0})
              </h3>

              <div className="space-y-3">
                {order.items?.map((item, index) => (
                  <div key={index} className="flex gap-3 items-start group">
                    {/* Fundo da imagem neutro (bg-muted) */}
                    <div className="h-12 w-12 min-w-[3rem] min-h-[3rem] bg-muted/50 rounded-lg border border-border flex items-center justify-center shrink-0 overflow-hidden p-2 relative">
                      {item.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.image}
                          alt={item.name}
                          // Removido mix-blend-multiply que quebra no modo claro
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <Package className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0 pt-0.5">
                      <p className="text-xs font-medium text-foreground line-clamp-2 leading-snug">
                        {item.name}
                      </p>
                      <div className="flex justify-between items-center mt-1.5">
                        <div className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded border border-border">
                          x{item.quantity}
                        </div>
                        <span className="text-xs font-semibold text-foreground">
                          {new Intl.NumberFormat("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          }).format(item.price)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}

                {(!order.items || order.items.length === 0) && (
                  <div className="flex flex-col items-center justify-center py-6 text-muted-foreground border border-dashed border-border rounded-lg bg-muted/20">
                    <Package className="w-6 h-6 mb-2 opacity-50" />
                    <p className="text-xs">Nenhum item neste pedido</p>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Seção Financeira */}
            {/* Usando bg-muted/30 para o bloco financeiro */}
            <div className="bg-muted/30 p-4 rounded-xl border border-border space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground flex items-center gap-2">
                  Método
                </span>
                {/* Badge de método de pagamento adaptável */}
                <div className="flex items-center gap-1.5 text-foreground font-medium bg-background px-2 py-1 rounded border border-border">
                  <CreditCard className="w-3 h-3" /> {order.paymentMethod}
                </div>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Status</span>
                <div className="scale-90 origin-right">
                  <PaymentStatusBadge status={order.paymentStatus} />
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-border flex justify-between items-end">
                <span className="text-xs text-muted-foreground pb-0.5">
                  Total Pago
                </span>
                <span className="text-lg font-bold text-foreground tracking-tight">
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(order.amount)}
                </span>
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* --- FOOTER (Ações) --- */}
        {/* Usando bg-muted/40 para o footer */}
        <div className="p-4 mt-4 border-t border-border bg-muted/40 grid grid-cols-3 gap-2">
          <Button
            variant="outline"
            className="border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground h-10 flex flex-col gap-0 rounded-lg group"
          >
            <span className="text-[10px] font-medium flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 transition-colors" /> Rastrear
            </span>
          </Button>
          <Button
            variant="outline"
            className="border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground h-10 flex flex-col gap-0 rounded-lg group"
          >
            <span className="text-[10px] font-medium flex items-center gap-1.5">
              <RotateCcw className="w-3.5 h-3.5 transition-colors" /> Reembolso
            </span>
          </Button>
          <Button
            variant="outline"
            className="border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground h-10 flex items-center justify-center rounded-lg"
          >
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
