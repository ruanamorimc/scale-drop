"use client";

import { useState } from "react";
import {
  Package,
  Truck,
  Clock,
  AlertCircle,
  Search,
  Filter,
  ChevronRight,
  MapPin,
  MessageSquare,
  Download,
  Copy,
  X,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PremiumCard } from "@/components/cards/PremiumCard";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { toast } from "sonner";

// ==========================================
// FUNÇÕES TRADUTORAS (Mapeia o Banco para o Visual)
// ==========================================
const getStatusConfig = (status: string) => {
  switch (status) {
    case "PENDING":
    case "PROCESSING":
    case "CONFIRMED":
      return {
        label: "Pendente",
        icon: Clock,
        color: "text-amber-500",
        bg: "bg-amber-500/10",
        border: "border-amber-500/20",
      };
    case "PREPARING":
      return {
        label: "Preparando",
        icon: Package,
        color: "text-zinc-400",
        bg: "bg-zinc-500/10",
        border: "border-zinc-500/20",
      };
    case "SHIPPED":
      return {
        label: "A Caminho",
        icon: Truck,
        color: "text-blue-500",
        bg: "bg-blue-500/10",
        border: "border-blue-500/20",
      };
    case "CUSTOMS":
      return {
        label: "Na Fronteira",
        icon: MapPin,
        color: "text-purple-500",
        bg: "bg-purple-500/10",
        border: "border-purple-500/20",
      };
    case "DELIVERED":
      return {
        label: "Entregue",
        icon: CheckCircle2,
        color: "text-emerald-500",
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/20",
      };
    case "CANCELLED":
    case "RETURNED":
      return {
        label: "Cancelado",
        icon: AlertCircle,
        color: "text-red-500",
        bg: "bg-red-500/10",
        border: "border-red-500/20",
      };
    default:
      return {
        label: status || "Pendente",
        icon: MapPin,
        color: "text-gray-500",
        bg: "bg-gray-500/10",
        border: "border-gray-500/20",
      };
  }
};

const getPlatformConfig = (platform?: string) => {
  if (platform === "SHOPIFY")
    return { logo: "/logos/shopify.svg", name: "Shopify" };
  if (platform === "YAMPI") return { logo: "/logos/yampi.svg", name: "Yampi" };
  if (platform === "CARTPANDA")
    return { logo: "/logos/cartpanda.png", name: "Cartpanda" };
  if (platform === "MERCADO_LIVRE")
    return { logo: "/logos/mercadolivre.png", name: "Mercado Livre" };
  return { logo: "/logos/default.svg", name: platform || "Loja Externa" };
};

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================
export default function RastreioClient({
  initialOrders = [],
}: {
  initialOrders: any[];
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [platformFilter, setPlatformFilter] = useState("Todas");

  // Formatador de datas amigável (Evita erros de hidratação)
  const formatDate = (dateString: string) => {
    if (!dateString) return "Sem data";
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Lógica de Filtragem com Dados Reais
  const filteredOrders = initialOrders.filter((order) => {
    const orderIdStr = order.orderNumber || order.externalOrderId || order.id;
    const matchesSearch =
      orderIdStr.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.trackingNumber || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const mappedStatus = getStatusConfig(order.status).label;
    const matchesStatus =
      statusFilter === "Todos" || mappedStatus === statusFilter;

    const mappedPlatform = getPlatformConfig(
      order.storeIntegration?.platform,
    ).name;
    const matchesPlatform =
      platformFilter === "Todas" || mappedPlatform === platformFilter;

    return matchesSearch && matchesStatus && matchesPlatform;
  });

  // Cálculo Dinâmico para os Cards do Topo
  const calculateSummary = () => {
    const counts = {
      Pendente: 0,
      Preparando: 0,
      Caminho: 0,
      Fronteira: 0,
      Entregue: 0,
      Cancelado: 0,
    };
    initialOrders.forEach((o) => {
      const label = getStatusConfig(o.status).label;
      if (label === "Pendente") counts.Pendente++;
      if (label === "Preparando") counts.Preparando++;
      if (label === "A Caminho") counts.Caminho++;
      if (label === "Na Fronteira") counts.Fronteira++;
      if (label === "Entregue") counts.Entregue++;
      if (label === "Cancelado") counts.Cancelado++;
    });
    return counts;
  };
  const summary = calculateSummary();

  // Ações
  const copyToClipboard = (text: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(text);
    toast.success("Código copiado!");
  };

  const handleWhatsAppClick = (e: React.MouseEvent, order: any) => {
    e.stopPropagation();
    if (!order.customerPhone)
      return toast.error("Cliente não possui telefone cadastrado.");
    const tracking = order.trackingNumber
      ? `O código de rastreio é ${order.trackingNumber}.`
      : "";
    const text = encodeURIComponent(
      `Olá ${order.customerName}, o seu pedido está: ${getStatusConfig(order.status).label}. ${tracking}`,
    );
    window.open(
      `https://api.whatsapp.com/send?phone=${order.customerPhone}&text=${text}`,
      "_blank",
    );
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500 pb-10">
      {/* CARDS DINÂMICOS DO TOPO */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { count: summary.Pendente, ...getStatusConfig("PENDING") },
          { count: summary.Preparando, ...getStatusConfig("PREPARING") },
          { count: summary.Caminho, ...getStatusConfig("SHIPPED") },
          { count: summary.Fronteira, ...getStatusConfig("CUSTOMS") },
          { count: summary.Entregue, ...getStatusConfig("DELIVERED") },
          { count: summary.Cancelado, ...getStatusConfig("CANCELLED") },
        ].map((status) => (
          <PremiumCard
            key={status.label}
            className="group hover:-translate-y-1 transition-all duration-300 cursor-pointer h-full"
          >
            {/* 🔥 Movemos o onClick para a div interna para o TypeScript não reclamar */}
            <div
              onClick={() => {
                setStatusFilter(status.label);
                setShowFilters(true);
              }}
              className="p-5 flex flex-col gap-4 h-full w-full"
            >
              <div className="flex items-center justify-between">
                <div
                  className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border",
                    status.bg,
                    status.border,
                  )}
                >
                  <status.icon className={status.color} size={18} />
                </div>
                <h3 className="text-2xl font-black text-foreground tracking-tight">
                  {status.count}
                </h3>
              </div>
              <p className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider group-hover:text-foreground transition-colors">
                {status.label}
              </p>
            </div>
          </PremiumCard>
        ))}
      </div>

      {/* FILTROS E BUSCA */}
      <PremiumCard className="w-full">
        <div className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-[400px]">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
              size={16}
            />
            <input
              type="text"
              placeholder="Buscar por pedido, cliente ou rastreio..."
              className="w-full bg-muted/10 border border-border/50 rounded-md pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant={showFilters ? "default" : "outline"}
              className="gap-2 text-xs h-10 border-border/60"
            >
              <Filter size={14} /> Filtros
            </Button>
            <Button className="gap-2 text-xs h-10 bg-foreground text-background hover:bg-foreground/90 font-semibold shadow-sm">
              <Download size={14} /> Exportar
            </Button>
          </div>
        </div>

        {showFilters && (
          <div className="p-4 border-t border-border/40 bg-muted/5 flex gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 w-48 rounded-md border border-border/50 bg-background px-3 text-sm"
            >
              <option value="Todos">Todos os Status</option>
              <option value="Pendente">Pendente</option>
              <option value="Preparando">Preparando</option>
              <option value="A Caminho">A Caminho</option>
              <option value="Entregue">Entregue</option>
              <option value="Cancelado">Cancelado</option>
            </select>
            <select
              value={platformFilter}
              onChange={(e) => setPlatformFilter(e.target.value)}
              className="h-9 w-48 rounded-md border border-border/50 bg-background px-3 text-sm"
            >
              <option value="Todas">Todas as Plataformas</option>
              <option value="Shopify">Shopify</option>
              <option value="Mercado Livre">Mercado Livre</option>
              <option value="Yampi">Yampi</option>
            </select>
          </div>
        )}
      </PremiumCard>

      {/* TABELA DE PEDIDOS */}
      <PremiumCard className="overflow-hidden w-full">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/30 border-b border-border/40">
                <th className="px-6 py-4 text-[10px] font-bold uppercase text-muted-foreground tracking-widest whitespace-nowrap">
                  Pedido
                </th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase text-muted-foreground tracking-widest whitespace-nowrap">
                  Cliente
                </th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase text-muted-foreground tracking-widest whitespace-nowrap">
                  Origem
                </th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase text-muted-foreground tracking-widest whitespace-nowrap">
                  Rastreio
                </th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase text-muted-foreground tracking-widest whitespace-nowrap">
                  Status Atual
                </th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase text-muted-foreground tracking-widest text-right whitespace-nowrap">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 text-sm">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-muted-foreground"
                  >
                    Nenhum pedido encontrado.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const statusInfo = getStatusConfig(order.status);
                  const platformInfo = getPlatformConfig(
                    order.storeIntegration?.platform,
                  );
                  const orderIdLabel =
                    order.orderNumber || order.externalOrderId || "N/A";

                  return (
                    <tr
                      key={order.id}
                      onClick={() => setSelectedOrder(order)}
                      className="hover:bg-muted/20 transition-colors group cursor-pointer"
                    >
                      <td className="px-6 py-4">
                        <span className="font-bold text-foreground font-mono text-xs">
                          {orderIdLabel}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-foreground text-xs">
                            {order.customerName}
                          </span>
                          <span className="text-[11px] text-muted-foreground">
                            {order.customerEmail || "Sem email"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-white rounded-md flex items-center justify-center border shrink-0">
                            <Image
                              src={platformInfo.logo}
                              alt={platformInfo.name}
                              width={18}
                              height={18}
                            />
                          </div>
                          <span className="text-xs font-semibold text-muted-foreground">
                            {platformInfo.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {order.trackingNumber ? (
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs">
                              {order.trackingNumber}
                            </span>
                            <button
                              onClick={(e) =>
                                copyToClipboard(order.trackingNumber, e)
                              }
                              className="text-muted-foreground hover:text-emerald-500"
                            >
                              <Copy size={14} />
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">
                            Aguardando...
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div
                          className={cn(
                            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[10px] font-bold uppercase tracking-wider",
                            statusInfo.bg,
                            statusInfo.color,
                            statusInfo.border,
                          )}
                        >
                          <statusInfo.icon size={12} /> {statusInfo.label}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2 text-muted-foreground">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => handleWhatsAppClick(e, order)}
                            className="h-8 w-8 hover:text-emerald-500 hover:bg-emerald-500/10"
                          >
                            <MessageSquare size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:text-foreground hover:bg-muted/50"
                          >
                            <ChevronRight size={18} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </PremiumCard>

      {/* MODAL DE DETALHES DO PEDIDO */}
      {selectedOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl"
          >
            <PremiumCard className="w-full max-h-[85vh] flex flex-col bg-background overflow-hidden relative shadow-2xl">
              <div className="p-6 border-b border-border/40 bg-muted/10 flex justify-between items-start shrink-0">
                <div>
                  <h2 className="text-xl font-bold text-foreground mb-1">
                    {selectedOrder.orderNumber || selectedOrder.externalOrderId}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Comprador:{" "}
                    <span className="font-semibold text-foreground">
                      {selectedOrder.customerName}
                    </span>
                  </p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-muted-foreground hover:text-foreground p-2"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-1 space-y-8">
                {selectedOrder.trackingNumber && (
                  <div className="bg-muted/10 border border-border/50 rounded-xl p-5 flex flex-col sm:flex-row justify-between gap-4 items-center">
                    <div>
                      <p className="text-[10px] font-bold uppercase text-muted-foreground mb-1">
                        Rastreio
                      </p>
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-mono font-bold">
                          {selectedOrder.trackingNumber}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            copyToClipboard(selectedOrder.trackingNumber)
                          }
                          className="h-7 text-xs gap-1.5"
                        >
                          <Copy size={12} /> Copiar
                        </Button>
                      </div>
                    </div>
                    <Button
                      onClick={() =>
                        window.open(
                          `https://rastreamento.correios.com.br/app/index.php?codigo=${selectedOrder.trackingNumber}`,
                          "_blank",
                        )
                      }
                      className="gap-2 bg-foreground text-background"
                    >
                      Correios <ExternalLink size={12} />
                    </Button>
                  </div>
                )}

                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider mb-6">
                    Histórico de Atualizações
                  </h3>
                  <div className="relative border-l-2 border-muted ml-3 space-y-8">
                    {selectedOrder.trackingEvents &&
                    selectedOrder.trackingEvents.length > 0 ? (
                      selectedOrder.trackingEvents.map(
                        (event: any, index: number) => (
                          <div key={event.id} className="relative pl-6">
                            <div
                              className={cn(
                                "absolute -left-[17px] top-0 w-8 h-8 rounded-full border-4 border-background flex items-center justify-center",
                                index === 0
                                  ? "bg-emerald-500 text-white"
                                  : "bg-muted text-muted-foreground",
                              )}
                            >
                              <MapPin size={12} />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[11px] font-bold text-muted-foreground">
                                {formatDate(event.date)}
                              </span>
                              <span
                                className={cn(
                                  "text-base font-bold mt-1",
                                  index === 0
                                    ? "text-foreground"
                                    : "text-foreground/80",
                                )}
                              >
                                {event.status}
                              </span>
                              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                                {event.description}
                              </p>
                            </div>
                          </div>
                        ),
                      )
                    ) : (
                      <p className="pl-6 text-sm text-muted-foreground italic">
                        Nenhum evento logístico registrado ainda.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </PremiumCard>
          </div>
        </div>
      )}
    </div>
  );
}
