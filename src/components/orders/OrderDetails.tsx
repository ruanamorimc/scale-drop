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
    // 1. WRAPPER: Centraliza e anima a entrada
    <div className="h-full flex items-center justify-end p-4 animate-in slide-in-from-right duration-500 fade-in">
      {/* 2. CARD PREMIUM FLUTUANTE */}
      <div className="w-[400px] h-full max-h-[95vh] bg-card border border-border/50 rounded-2xl shadow-2xl flex flex-col overflow-hidden relative">
        {/* --- HEADER (Limpo e Transparente) --- */}
        <div className="p-6 pb-2 flex flex-col gap-4 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-foreground tracking-tight">
                Pedido {order.invoiceId}
              </h2>
              <button
                onClick={() => navigator.clipboard.writeText(order.invoiceId)}
                className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-md hover:bg-muted"
                title="Copiar ID"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 text-muted-foreground hover:text-red-500/80 hover:bg-muted rounded-full "
            >
              <X className="h-4 w-4 " />
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <StatusBadge status={order.status} />
            <span className="text-xs text-muted-foreground font-medium">
              {order.date} • {order.time}
            </span>
          </div>
        </div>

        {/* --- CONTEÚDO (Scrollável) --- */}
        <ScrollArea className="flex-1 -mr-3 pr-3">
          {" "}
          {/* Ajuste para scrollbar não colar na borda */}
          <div className="p-6 pt-2 space-y-8">
            {/* SEÇÃO CLIENTE */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Cliente
                </h3>
                <a
                  href="#"
                  className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 font-medium transition-colors"
                >
                  Ver perfil <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="flex items-center gap-4 p-3 rounded-xl border border-border/50 bg-muted/20">
                <Avatar className="h-12 w-12 border border-border">
                  <AvatarImage src={order.customer.avatar} />
                  <AvatarFallback className="bg-background text-foreground text-sm font-bold">
                    {order.customer.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="font-semibold text-sm text-foreground">
                    {order.customer.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {order.customer.email}
                  </span>
                </div>
              </div>
            </div>

            <Separator className="bg-border/50" />

            {/* SEÇÃO ITENS */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Itens ({order.items?.length || 0})
                </h3>
              </div>

              <div className="space-y-3">
                {order.items?.map((item, index) => (
                  <div key={index} className="flex gap-4 items-start group">
                    <div className="h-14 w-14 bg-muted/30 rounded-lg border border-border/50 flex items-center justify-center shrink-0 overflow-hidden p-2">
                      {item.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <Package className="w-6 h-6 text-muted-foreground/50" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0 py-0.5 space-y-1">
                      <p className="text-sm font-medium text-foreground line-clamp-2 leading-tight">
                        {item.name}
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded border border-border/30">
                          Qtd: {item.quantity}
                        </span>
                        <span className="text-sm font-semibold text-foreground">
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
                  <div className="flex flex-col items-center justify-center py-8 text-muted-foreground border border-dashed border-border/60 rounded-xl bg-muted/10">
                    <Package className="w-8 h-8 mb-2 opacity-40" />
                    <p className="text-xs font-medium">
                      Nenhum item neste pedido
                    </p>
                  </div>
                )}
              </div>
            </div>

            <Separator className="bg-border/50" />

            {/* SEÇÃO FINANCEIRA */}
            <div className="space-y-4">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Pagamento
              </h3>
              <div className="bg-muted/20 p-5 rounded-xl border border-border/50 space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Método</span>
                  <div className="flex items-center gap-2 text-foreground font-medium">
                    <CreditCard className="w-4 h-4 text-muted-foreground" />
                    {order.paymentMethod}
                  </div>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Status</span>
                  <PaymentStatusBadge status={order.paymentStatus} />
                </div>

                <Separator className="bg-border/50" />

                <div className="flex justify-between items-end">
                  <span className="text-sm text-muted-foreground pb-0.5">
                    Total Pago
                  </span>
                  <span className="text-xl font-bold text-foreground tracking-tight">
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(order.amount)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* --- FOOTER (Limpo e Sem Fundo) --- */}
        <div className="p-6 pt-2 grid grid-cols-4 gap-3 bg-gradient-to-t from-card to-transparent">
          <Button
            variant="outline"
            className="col-span-2 border-border/60 hover:bg-muted hover:text-foreground h-11 rounded-xl gap-2 transition-all hover:border-border"
          >
            <MapPin className="w-4 h-4" />
            <span className="text-xs font-semibold">Rastrear</span>
          </Button>

          <Button
            variant="outline"
            className="col-span-1 border-border/60 hover:bg-muted hover:text-foreground h-11 rounded-xl px-0"
            title="Reembolso"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>

          <Button
            variant="outline"
            className="col-span-1 border-border/60 hover:bg-muted hover:text-foreground h-11 rounded-xl px-0"
            title="Mais opções"
          >
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
