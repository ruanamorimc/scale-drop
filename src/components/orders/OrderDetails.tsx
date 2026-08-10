import { useState, useTransition } from "react";
import { toast } from "sonner";
import { cancelOrder } from "@/actions/cancel-order";
import { syncOrderWithGateway } from "@/actions/sync-order";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  CreditCard,
  RefreshCw,
  MoreHorizontal,
  Package,
  MapPin,
  Copy,
  ExternalLink,
  X,
  Printer,
  Trash2,
} from "lucide-react";
import { Order } from "@/app/(private)/[slug]/orders/columns";
import { StatusBadge } from "@/components/data-table/StatusBadge";
import { PaymentStatusBadge } from "@/components/data-table/PaymentStatusBadge";
import { PremiumCard } from "@/components/cards/PremiumCard";

interface OrderDetailsProps {
  order: Order | null;
  onClose: () => void;
}

export function OrderDetails({ order, onClose }: OrderDetailsProps) {
  const [isPending, startTransition] = useTransition();
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  if (!order) return null;

  const handleTrackOrder = () => {
    // 1. Caso o pedido não tenha código de rastreio ainda
    if (!order.trackingNumber) {
      toast.warning("Pedido não postado", {
        description:
          "Este pedido ainda não possui um código de rastreio associado.",
      });
      return;
    }

    // 2. Caso possua, monta a URL externa (Exemplo usando o Link&Track, excelente para o mercado brasileiro)
    const trackingUrl = `https://linketrack.com/track?codigo=${order.trackingNumber}`;

    // Abre em uma nova aba de forma segura
    if (typeof window !== "undefined") {
      window.open(trackingUrl, "_blank", "noopener,noreferrer");
    }
  };

  const handleRefreshOrder = () => {
    startTransition(async () => {
      // Dispara o Toast informativo inicial de "carregando"
      const syncToast = toast.loading("Sincronizando...", {
        description: "Buscando status atualizado na plataforma original.",
      });

      const response = await syncOrderWithGateway(order.id);

      // Remove o toast de loading para dar lugar ao resultado final
      toast.dismiss(syncToast);

      if (response.success) {
        if (response.changed) {
          toast.success("Dados atualizados!", {
            description:
              "O pedido foi atualizado com as informações mais recentes da loja.",
          });
        } else {
          toast.info("Tudo atualizado", {
            description:
              "O pedido já está em sincronia com a plataforma original.",
          });
        }
      } else {
        toast.error("Erro na sincronização", {
          description: response.error,
        });
      }
    });
  };

  const handleViewInStore = () => {
    // Agora o TypeScript já conhece essa propriedade!
    const originalStoreUrl = order.storeUrl;

    if (originalStoreUrl) {
      window.open(originalStoreUrl, "_blank"); // Abre a loja em nova aba real
    } else {
      toast.info("Link indisponível", {
        description: "Não foi possível encontrar a URL deste pedido.",
      });
    }
  };

  const handleCancelOrder = () => {
    startTransition(async () => {
      const response = await cancelOrder(order.id);

      if (response.success) {
        // Sintaxe correta do Sonner para Sucesso
        toast.success("Pedido cancelado", {
          description: "O status do pedido foi atualizado com sucesso.",
        });
        setIsCancelModalOpen(false);
      } else {
        // Sintaxe correta do Sonner para Erro
        toast.error("Falha ao cancelar", {
          description: response.error,
        });
      }
    });
  };

  return (
    <div id="printable-receipt-area" className="flex flex-col w-full">
      {/* --- HEADER --- */}
      <div className="p-6 pb-4 flex flex-col gap-4 border-b border-border/10">
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

          {/* 🔥 BOTÃO DE FECHAR CUSTOMIZADO RESTAURADO */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-muted/50 rounded-full transition-colors print:hidden"
          >
            <X className="h-4 w-4" />
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
      <ScrollArea className="flex-1 px-6">
        <div className="py-6 space-y-8">
          {/* SEÇÃO CLIENTE */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Cliente
              </h3>
              {/* ======================================================================
  TODO: [FEATURE FUTURA] - PÁGINA DE PERFIL DO CLIENTE (CRM)
  ======================================================================
  Botão "Ver perfil" oculto temporariamente porque a rota de detalhes 
  do cliente ainda não foi criada na versão atual do sistema.
  
  Motivo da utilidade futura: 
  Levará o lojista para uma tela específica do cliente (ex: /customers/{id}) 
  onde ele poderá visualizar o LTV (Lifetime Value), histórico de pedidos 
  anteriores, tickets de suporte e análise de risco de fraude.
  
  Descomentar e adicionar o <Link href={`/customers/${customer.id}`}> 
  quando o módulo de CRM estiver pronto.
  ======================================================================  */}
              {/*       <a
                href="#"
                className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 font-medium transition-colors"
              >
                Ver perfil <ExternalLink className="w-3 h-3" />
              </a> */}
            </div>

            {/* 🔥 SEU PREMIUM CARD APLICADO */}
            <PremiumCard contentClassName="p-4 flex items-center gap-4">
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
            </PremiumCard>
          </div>

          <Separator className="bg-border/50" />

          {/* SEÇÃO ITENS */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Itens ({order.items?.length || 0})
            </h3>
            <div className="space-y-3">
              {order.items && order.items.length > 0 ? (
                order.items.map((item, index) => (
                  <div key={index} className="flex gap-4 items-start group">
                    {/* (Lógica dos itens mantida...) */}
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground border border-dashed border-border/40 rounded-xl bg-muted/5">
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

            {/* 🔥 SEU PREMIUM CARD APLICADO */}
            <PremiumCard contentClassName="p-5 space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Método</span>
                <span className="flex items-center gap-2 text-foreground font-medium">
                  <CreditCard className="w-4 h-4 text-muted-foreground" />
                  {order.paymentMethod}
                </span>
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
            </PremiumCard>
          </div>
        </div>
      </ScrollArea>

      {/* --- FOOTER --- */}
      <div className="p-6 pt-4 grid grid-cols-4 gap-3 border-t border-border/10 bg-background print:hidden">
        {/* BOTÃO PRIMÁRIO (Destaque total) */}
        <Button
          onClick={handleTrackOrder}
          className="col-span-2 h-11 rounded-xl gap-2 shadow-sm transition-all hover:-translate-y-0.5"
        >
          <MapPin className="w-4 h-4" />
          <span className="text-xs font-semibold">Rastrear</span>
        </Button>

        {/* BOTÃO SECUNDÁRIO (Refresh) */}
        <Button
          variant="outline"
          onClick={handleRefreshOrder}
          className="col-span-1 border-border/60 hover:bg-blue-500/10 hover:text-blue-500 hover:border-blue-500/50 h-11 rounded-xl px-0 transition-colors"
          title="Sincronizar Pedido"
        >
          <RefreshCw className={`h-4 w-4 ${isPending ? "animate-spin" : ""}`} />
        </Button>

        {/* MENU DE OPÇÕES (Dropdown) */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="col-span-1 border-border/60 hover:bg-muted hover:text-foreground h-11 rounded-xl px-0 transition-colors"
            >
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 rounded-xl">
            <DropdownMenuItem
              className="gap-2 cursor-pointer text-xs font-medium"
              onClick={handleViewInStore}
            >
              <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
              Ver na loja
            </DropdownMenuItem>
            <DropdownMenuItem
              className="gap-2 cursor-pointer text-xs font-medium"
              onClick={() => window.print()}
            >
              <Printer className="w-3.5 h-3.5 text-muted-foreground" />
              Imprimir recibo
            </DropdownMenuItem>
            <Separator className="my-1 bg-border/50" />
            <AlertDialog
              open={isCancelModalOpen}
              onOpenChange={setIsCancelModalOpen}
            >
              <AlertDialogTrigger asChild>
                <DropdownMenuItem
                  onSelect={(e) => e.preventDefault()} // CRÍTICO: Impede que o Dropdown feche e cancele o modal
                  className="text-red-600 cursor-pointer focus:text-red-600 focus:bg-red-50"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Cancelar pedido
                </DropdownMenuItem>
              </AlertDialogTrigger>

              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação é irreversível. O pedido será cancelado no sistema
                    e, se aplicável, na loja de origem.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isPending}>
                    Voltar
                  </AlertDialogCancel>

                  {/* O onClick agora chama a função com transition para estado de loading */}
                  <AlertDialogAction
                    onClick={handleCancelOrder}
                    disabled={isPending}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    {isPending ? "Cancelando..." : "Sim, cancelar"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
