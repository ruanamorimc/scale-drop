import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

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

// type rigorosa para os atributos da Shopify
type NoteAttribute = {
  name: string;
  value: string;
};

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
    // 3. EXTRATOR DE UTMs (Padrão Shopify note_attributes)
    // ==========================================
    const noteAttributes: NoteAttribute[] = Array.isArray(body.note_attributes)
      ? body.note_attributes
      : [];

    const getParam = (key: string): string | null => {
      // 1º Tenta pegar da raiz do payload (alguns scripts jogam aqui)
      if (body[key]) return String(body[key]);

      // 2º Tenta pegar do array de note_attributes (comum na Shopify)
      const attr = noteAttributes.find(
        (n: NoteAttribute) => n.name === key || n.name === `_${key}`,
      );
      if (attr) return String(attr.value);

      return null;
    };

    const utm_campaign = getParam("utm_campaign");
    const utm_source = getParam("utm_source");
    const utm_medium = getParam("utm_medium");
    const utm_content = getParam("utm_content");
    const utm_term = getParam("utm_term");
    const src = getParam("src");
    const keyword = getParam("keyword");

    const finalMetadataToSave =
      noteAttributes.length > 0
        ? { note_attributes: noteAttributes as Record<string, string>[] }
        : undefined;

    // ==========================================
    // 4. LÓGICA DE DEDUPLICAÇÃO E UPSERT INTELIGENTE
    // ==========================================
    const rawOrderNumber = body.order_number || body.name || externalOrderId;
    const orderNumber = formatOrderNumber(rawOrderNumber);

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
            status: orderStatus,
            trackingNumber: trackingNumber || existingOrder.trackingNumber,
            updatedAt: new Date(),
            // 🔥 Adicionamos UTMs apenas se vieram vazias do Gateway (fallback de segurança)
            ...(utm_campaign &&
              !existingOrder.utmCampaign && { utmCampaign: utm_campaign }),
            ...(utm_source &&
              !existingOrder.utmSource && { utmSource: utm_source }),
          },
        });
        console.log(
          `[Scale Drop] Pedido Shopify ${orderNumber} deduplicado. Logística atualizada.`,
        );
      } else {
        // Se já era da Shopify mesmo, atualiza tudo (Status, Valores e UTMs)
        order = await prisma.order.update({
          where: { id: existingOrder.id },
          data: {
            status: orderStatus,
            paymentStatus: paymentStatus,
            trackingNumber: trackingNumber || existingOrder.trackingNumber,
            total: parseFloat(body.total_price) || existingOrder.total,
            updatedAt: new Date(),
            // Atualiza UTMs apenas se enviadas
            ...(utm_campaign && { utmCampaign: utm_campaign }),
            ...(utm_source && { utmSource: utm_source }),
            ...(utm_medium && { utmMedium: utm_medium }),
            ...(utm_content && { utmContent: utm_content }),
            ...(utm_term && { utmTerm: utm_term }),
            ...(src && { src: src }),
            ...(keyword && { keyword: keyword }),
            ...(finalMetadataToSave && { metadata: finalMetadataToSave }),
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

          status: orderStatus,
          paymentStatus: paymentStatus,

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

          // 🔥 MAPEAMENTO DIRETO NAS COLUNAS NATIVAS
          utmCampaign: utm_campaign,
          utmSource: utm_source,
          utmMedium: utm_medium,
          utmContent: utm_content,
          utmTerm: utm_term,
          src: src,
          keyword: keyword,
          metadata: finalMetadataToSave,
        },
      });
      console.log(`[Scale Drop] Novo pedido Shopify ${orderNumber} criado.`);
    }

    // ==========================================
    // 5. CRIANDO EVENTO NA TIMELINE
    // ==========================================
    if (orderStatus === "SHIPPED" && trackingNumber) {
      const existingEvent = await prisma.trackingEvent.findFirst({
        where: { orderId: order.id, status: "SHIPPED" },
      });

      if (!existingEvent) {
        await prisma.trackingEvent.create({
          data: {
            orderId: order.id,
            status: "A Caminho",
            description: `Objeto despachado. Código liberado pela transportadora ${trackingCompany || ""}.`,
            date: new Date(),
          },
        });
      }
    }

    // 🔥 Revalida o cache para atualizar as telas de UTMs e Dashboard imediatamente!
    revalidatePath("/marketing/utms");
    revalidatePath("/dashboard");

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
