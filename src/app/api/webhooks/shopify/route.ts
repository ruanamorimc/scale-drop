import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// 🔥 FUNÇÃO AUXILIAR DE PADRONIZAÇÃO E TIPAGEM
function formatOrderNumber(number: string | number | null) {
  if (!number) return "#0000";
  const strNumber = String(number).trim();
  return strNumber.startsWith("#") ? strNumber : `#${strNumber}`;
}

type OrderStatus =
  | "PENDING"
  | "PROCESSING"
  | "CONFIRMED"
  | "PREPARING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "RETURNED";
type PaymentStatus = "PENDING" | "PAID" | "PARTIAL" | "REFUNDED" | "FAILED";

export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const integrationId = searchParams.get("id");
    const shopifyTopic = req.headers.get("x-shopify-topic"); // Ex: orders/create, orders/updated

    if (!integrationId)
      return NextResponse.json(
        { error: "ID da integração ausente" },
        { status: 400 },
      );

    const integration = await prisma.storeIntegration.findUnique({
      where: { id: integrationId },
    });

    if (!integration)
      return NextResponse.json(
        { error: "Integração não encontrada" },
        { status: 404 },
      );

    const body = await req.json();
    const externalOrderId = body.id.toString();

    // ==========================================
    // 1. MAPEAMENTO DE STATUS (Shopify -> Scale Drop)
    // ==========================================
    let orderStatus: OrderStatus = "PENDING";
    let paymentStatus: PaymentStatus = "PENDING";

    if (body.cancelled_at) {
      orderStatus = "CANCELLED";
      paymentStatus = "FAILED";
    } else if (body.fulfillment_status === "fulfilled") {
      orderStatus = "SHIPPED";
    } else if (body.financial_status === "paid") {
      orderStatus = "PREPARING";
      paymentStatus = "PAID";
    }

    // ==========================================
    // 2. EXTRAÇÃO DE DADOS (Cliente e Rastreio)
    // ==========================================
    const customerName = body.customer
      ? `${body.customer.first_name || ""} ${body.customer.last_name || ""}`.trim()
      : "Cliente não identificado";
    const customerEmail = body.email || body.contact_email || "";
    const customerPhone =
      body.phone || body.customer?.phone || body.shipping_address?.phone || "";

    // Pega o código de rastreio caso o fornecedor já tenha colocado
    let trackingNumber = null;
    let trackingCompany = null;
    if (body.fulfillments && body.fulfillments.length > 0) {
      trackingNumber = body.fulfillments[0].tracking_number;
      trackingCompany = body.fulfillments[0].tracking_company;
    }

    // ==========================================
    // 3. SALVANDO NO BANCO DE DADOS (UPSERT)
    // ==========================================
    // 🔥 3. LÓGICA DE DEDUPLICAÇÃO INTELIGENTE
    const rawOrderNumber = body.order_number || body.name || externalOrderId;
    const orderNumber = formatOrderNumber(rawOrderNumber);

    // Procura se o pedido já existe (talvez criado por Yampi/Appmax)
    const existingOrder = await prisma.order.findFirst({
      where: {
        userId: integration.userId,
        orderNumber: orderNumber,
      },
      include: { storeIntegration: true },
    });

    let order;

    if (existingOrder) {
      // Pedido já existe. Quem é o dono?
      const isGatewayOrder =
        existingOrder.storeIntegration.platform !== "SHOPIFY";

      if (isGatewayOrder) {
        // Se um Gateway criou, a Shopify APENAS atualiza a logística/rastreio
        order = await prisma.order.update({
          where: { id: existingOrder.id },
          data: {
            status: orderStatus, // Sem any!
            trackingNumber: trackingNumber || existingOrder.trackingNumber,
            updatedAt: new Date(),
          },
        });
        console.log(
          `[Scale Drop] Pedido Shopify ${orderNumber} deduplicado. Logística atualizada.`,
        );
      } else {
        // Se já era da Shopify mesmo, atualiza tudo
        order = await prisma.order.update({
          where: { id: existingOrder.id },
          data: {
            status: orderStatus, // Sem any!
            paymentStatus: paymentStatus, // Sem any!
            trackingNumber: trackingNumber || existingOrder.trackingNumber,
            total: parseFloat(body.total_price) || existingOrder.total,
            updatedAt: new Date(),
          },
        });
        console.log(`[Scale Drop] Pedido Shopify ${orderNumber} atualizado.`);
      }
    } else {
      // Não existe no banco, cria do zero (Venda nativa via Shopify Payments)
      order = await prisma.order.create({
        data: {
          userId: integration.userId,
          storeIntegrationId: integration.id,
          externalOrderId: externalOrderId,
          orderNumber: orderNumber,

          status: orderStatus, // Sem any!
          paymentStatus: paymentStatus, // Sem any!

          customerName: customerName,
          customerEmail: customerEmail,
          customerPhone: customerPhone,
          customerDocument: "00000000000", // Fallback

          shippingAddress: body.shipping_address?.address1 || "Não informado",
          shippingCity: body.shipping_address?.city || null,
          shippingState: body.shipping_address?.province || "",
          shippingZipCode: body.shipping_address?.zip || null,
          shippingCountry: body.shipping_address?.country_code || "BR",

          subtotal: parseFloat(body.subtotal_price) || 0,
          shippingCost: parseFloat(
            body.total_shipping_price_set?.shop_money?.amount || 0,
          ),
          discount: parseFloat(body.total_discounts) || 0,
          total: parseFloat(body.total_price) || 0,

          trackingNumber: trackingNumber,
          createdAt: new Date(body.created_at || Date.now()),
        },
      });
      console.log(`[Scale Drop] Novo pedido Shopify ${orderNumber} criado.`);
    }

    // ==========================================
    // 4. CRIANDO EVENTO NA TIMELINE
    // ==========================================
    // Se o pedido foi enviado e tem rastreio, criamos um evento na timeline
    if (orderStatus === "SHIPPED" && trackingNumber) {
      // Verifica se já registramos esse envio para não duplicar na timeline
      const existingEvent = await prisma.trackingEvent.findFirst({
        where: { orderId: order.id, status: "SHIPPED" },
      });

      if (!existingEvent) {
        await prisma.trackingEvent.create({
          data: {
            orderId: order.id,
            status: "A Caminho", // Status visual que vai aparecer na nossa interface
            description: `Objeto despachado. Código liberado pela transportadora ${trackingCompany || ""}.`,
            date: new Date(),
          },
        });
      }
    }

    console.log(
      `✅ [SHOPIFY WEBHOOK] Pedido ${order.orderNumber} processado! Status: ${orderStatus} | Tópico: ${shopifyTopic}`,
    );

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("❌ [SHOPIFY WEBHOOK] Erro Crítico:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
