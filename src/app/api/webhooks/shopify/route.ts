import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

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
    let orderStatus = "PENDING";

    if (body.cancelled_at) {
      orderStatus = "CANCELLED";
    } else if (body.fulfillment_status === "fulfilled") {
      orderStatus = "SHIPPED"; // O Fornecedor despachou!
    } else if (body.financial_status === "paid") {
      orderStatus = "PREPARING"; // Foi pago, aguardando o fornecedor enviar
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
    // O "upsert" é inteligente: se o pedido já existe (orders/updated), ele só atualiza.
    // Se não existe (orders/create), ele cria um novo.
    const order = await prisma.order.upsert({
      where: {
        storeIntegrationId_externalOrderId: {
          storeIntegrationId: integration.id,
          externalOrderId: externalOrderId,
        },
      },
      update: {
        status: orderStatus as any, // "as any" caso o TS reclame do seu Enum
        trackingNumber: trackingNumber,
        customerEmail: customerEmail,
        customerPhone: customerPhone,
      },
      create: {
        userId: integration.userId,
        storeIntegrationId: integration.id,
        externalOrderId: externalOrderId,
        orderNumber:
          body.order_number?.toString() || body.name || `#${externalOrderId}`,
        status: orderStatus as any,
        customerName: customerName,
        customerEmail: customerEmail,
        customerPhone: customerPhone,
        customerDocument: "00000000000", // CPF provisório (Shopify pura não envia CPF fácil)
        shippingAddress: body.shipping_address?.address1 || "Não informado",
        shippingCity: body.shipping_address?.city || "",
        shippingState: body.shipping_address?.province || "",
        shippingZipCode: body.shipping_address?.zip || "",
        shippingCountry: body.shipping_address?.country_code || "BR",
        subtotal: parseFloat(body.subtotal_price || 0),
        shippingCost: parseFloat(
          body.total_shipping_price_set?.shop_money?.amount || 0,
        ),
        discount: parseFloat(body.total_discounts || 0),
        total: parseFloat(body.total_price || 0),
        trackingNumber: trackingNumber,
      },
    });

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
