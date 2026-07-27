import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import OrdersClient from "./order-client";
import { Order } from "./columns";

// ==========================================
// 🔥 TIPAGEM LOCAL ESTRITA (Zero 'any')
// ==========================================
type LocalPaymentStatus = "PENDING" | "PAID" | "PARTIAL" | "REFUNDED" | "FAILED";
type LocalOrderStatus = "PENDING" | "PROCESSING" | "CONFIRMED" | "PREPARING" | "SHIPPED" | "DELIVERED" | "CANCELLED" | "RETURNED";

// O TRUQUE: Extraímos o tipo exato do 'where' da sua própria instância do Prisma.
type OrderWhereInput = NonNullable<Parameters<typeof prisma.order.findMany>[0]>["where"];

export const dynamic = "force-dynamic";

export default async function OrdersPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }> | { [key: string]: string | string[] | undefined };
}) {
  const searchParams = await props.searchParams;
  const { status, paymentStatus, method, from, to } = searchParams || {};

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return <div>Utilizador não autenticado.</div>;
  }

  const taxesConfig = await prisma.tax.findMany();
  const revenueTaxConfig = taxesConfig.find((t) => t.calculationRule === "Sobre Faturamento");
  const revenueTaxRate = revenueTaxConfig ? Number(revenueTaxConfig.rate) / 100 : 0;
  const metaTaxConfig = taxesConfig.find((t) => t.calculationRule === "Ad Spend" || t.name.includes("Meta"));
  const metaTaxRate = metaTaxConfig ? Number(metaTaxConfig.rate) / 100 : 0;

  // ==========================================
  // FILTROS 100% TIPADOS
  // ==========================================
  
  const whereClause: OrderWhereInput = {
    userId: session.user.id,
  };

  // Status Financeiro
  if (paymentStatus && paymentStatus !== "all") {
    const statuses = String(paymentStatus).split(",");
    whereClause.paymentStatus = {
      in: statuses.map((s) => {
        const up = s.toUpperCase();
        return (up === 'FAILED' || up === 'CANCELLED' ? 'FAILED' : up) as LocalPaymentStatus;
      }),
    };
  }

  // Status de Envio
  if (status) {
    const statuses = String(status).split(",");
    whereClause.status = {
      in: statuses.map((s) => s.toUpperCase() as LocalOrderStatus),
    };
  }

  // Métodos de Pagamento (Or customizado)
  if (method) {
    const methods = String(method).split(",");
    whereClause.OR = methods.map((m) => {
      const trimmed = m.trim();
      const searchVal = trimmed === "Cartão de Crédito" ? "credit" : trimmed === "Boleto" ? "billet" : trimmed;
      return { paymentMethod: { contains: searchVal, mode: "insensitive" } };
    });
  }

  // Datas
  if (from || to) {
    whereClause.createdAt = {
      ...(from && { gte: new Date(String(from)) }),
      ...(to && { lte: new Date(new Date(String(to)).setHours(23, 59, 59, 999)) }),
    };
  }

  const dbOrders = await prisma.order.findMany({
    where: whereClause,
    orderBy: { createdAt: "desc" },
    include: {
      storeIntegration: true,
      items: { include: { product: true } },
    },
  });

  const realOrders: Order[] = dbOrders.map((order) => {
    const orderDate = new Date(order.createdAt);
    const dateFormatted = new Intl.DateTimeFormat("pt-BR").format(orderDate);
    const timeFormatted = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" }).format(orderDate);

    let storeUrl: string | undefined = undefined;
    const platform = order.storeIntegration?.platform;
    const domain = (order.storeIntegration as { domain?: string })?.domain || "sua-loja.com";
    if (platform && order.externalOrderId) {
      switch (String(platform).toUpperCase()) {
        case "SHOPIFY":
        case "NUVEMSHOP":
          storeUrl = `https://${domain}/admin/orders/${order.externalOrderId}`;
          break;
        case "YAMPI":
          storeUrl = `https://dashboard.yampi.com.br/orders/${order.externalOrderId}`;
          break;
      }
    }

    const orderData = order as typeof order & { gatewayFee?: number | null; marketingCost?: number | null; };
    const totalAmount = Number(order.total) || 0;
    const totalCmv = order.items?.reduce((acc, item) => acc + (Number(item.product?.costPrice) || 0) * Number(item.quantity), 0) || 0;
    let gatewayFee = Number(orderData.gatewayFee) || 0;
    if (gatewayFee === 0) gatewayFee = totalAmount * 0.0499 + 1.0;
    const marketingCost = Number(orderData.marketingCost) || 0;
    const totalTaxes = (totalAmount * revenueTaxRate) + (marketingCost * metaTaxRate);
    const netProfit = totalAmount - (totalCmv + gatewayFee + totalTaxes + marketingCost);

    const rawPaymentStatus = order.paymentStatus?.toLowerCase() || "pending";
    const rawOrderStatus = order.status?.toLowerCase() || "pending";

    // ==========================================
    // 🔥 TRADUTOR DO MÉTODO DE PAGAMENTO
    // Converte os nomes crus do banco para nomes bonitos na interface
    // ==========================================
    const rawPaymentMethod = (order.paymentMethod || "").toLowerCase();
    let displayMethod: "Cartão de Crédito" | "Pix" | "Boleto" = "Cartão de Crédito"; // Padrão
    
    if (rawPaymentMethod.includes("pix")) {
      displayMethod = "Pix";
    } else if (rawPaymentMethod.includes("boleto") || rawPaymentMethod.includes("billet")) {
      displayMethod = "Boleto";
    }
    // Se for credit_card, credit ou qualquer outra coisa, já cai no Cartão de Crédito padrão acima.

    return {
      id: order.id,
      invoiceId: order.orderNumber ? String(order.orderNumber) : "N/A",
      customer: { name: order.customerName || "Cliente não informado", email: order.customerEmail || "", avatar: "" },
      date: dateFormatted,
      time: timeFormatted,
      
      paymentStatus: (rawPaymentStatus === "failed" ? "cancelled" : rawPaymentStatus) as "paid" | "pending" | "cancelled" | "refunded",
      
      // Enviando o nome bonito formatado!
      paymentMethod: displayMethod,
      
      amount: totalAmount,
      cmv: totalCmv,
      tax: totalTaxes + gatewayFee,
      marketing: marketingCost,
      netProfit: netProfit,
      
      status: rawOrderStatus as "pending" | "processing" | "confirmed" | "preparing" | "shipped" | "delivered" | "cancelled" | "returned",
      
      items: order.items?.map((item) => ({ name: item.name || "Produto sem nome", price: Number(item.unitPrice) || 0, image: item.product?.images?.[0] || "", quantity: Number(item.quantity) || 1 })) || [],
      storeUrl,
      trackingNumber: order.trackingNumber || undefined,
    } as Order;
  });

  return <OrdersClient initialOrders={realOrders} />;
}