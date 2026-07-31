import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Funções auxiliares para traduzir os status da Nuvemshop para os Enums do Scale Drop
function mapOrderStatus(nsStatus: string) {
  switch (nsStatus) {
    case "open":
      return "PENDING";
    case "closed":
      return "DELIVERED";
    case "cancelled":
      return "CANCELLED";
    default:
      return "PENDING";
  }
}

function mapPaymentStatus(nsPaymentStatus: string) {
  switch (nsPaymentStatus) {
    case "paid":
      return "PAID";
    case "refunded":
      return "REFUNDED";
    case "voided":
    case "abandoned":
      return "FAILED";
    case "authorized":
      return "PENDING";
    default:
      return "PENDING";
  }
}

// 🔥 Garante que o pedido sempre tenha a hashtag
function formatOrderNumber(number: string | number | null) {
  if (!number) return "#0000";
  const strNumber = String(number).trim();
  return strNumber.startsWith("#") ? strNumber : `#${strNumber}`;
}

export async function POST(request: Request) {
  try {
    const storeId = request.headers.get("x-linked-store-id");
    const event = request.headers.get("x-nuvemshop-event");

    if (!storeId || !event) {
      return NextResponse.json({ error: "Headers ausentes." }, { status: 400 });
    }

    const body = await request.json();
    console.log(
      `[Scale Drop] Webhook recebido | Evento: ${event} | Loja: ${storeId}`,
    );

    // 1. Buscar a integração
    const integration = await prisma.storeIntegration.findFirst({
      where: {
        storeId: storeId,
        platform: "NUVEMSHOP",
        isActive: true,
      },
      select: { id: true, userId: true },
    });

    if (!integration) {
      return NextResponse.json({ received: true }, { status: 200 });
    }

    // 2. Filtrar eventos de pedido
    if (event === "order/created" || event === "order/updated") {
      const externalOrderId = String(body.id);
      const rawOrderNumber = body.number || body.id;
      const orderNumber = formatOrderNumber(rawOrderNumber);

      // ==========================================
      // 3. EXTRATOR DE UTMs (100% Tipado, sem "any")
      // ==========================================
      // A Nuvemshop costuma agrupar rastreios em client_details, mas olhamos metadados também.
      const webhookMetadata =
        body.metadata || body.tracking || body.client_details || {};

      const getParam = (key: string): string | null => {
        if (webhookMetadata[key]) return String(webhookMetadata[key]);
        if (body[key]) return String(body[key]);
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
        Object.keys(webhookMetadata).length > 0 ? webhookMetadata : null;

      // ==========================================
      // 4. LÓGICA DE DEDUPLICAÇÃO E SALVAMENTO
      // ==========================================
      const existingOrder = await prisma.order.findFirst({
        where: {
          userId: integration.userId,
          orderNumber: orderNumber,
        },
        include: {
          storeIntegration: true,
        },
      });

      const nsStatus = mapOrderStatus(body.status);
      const nsPaymentStatus = mapPaymentStatus(body.payment_status);

      if (existingOrder) {
        const isGatewayOrder =
          existingOrder.storeIntegration.platform !== "NUVEMSHOP";

        if (isGatewayOrder) {
          // Mantive a sua regra de ouro: Se é do Gateway, a NS só toca na logística
          await prisma.order.update({
            where: { id: existingOrder.id },
            data: {
              status: nsStatus,
              updatedAt: new Date(),
              // Adicionamos UTMs apenas se vieram vazias do Gateway (fallback)
              ...(utm_campaign &&
                !existingOrder.utmCampaign && { utmCampaign: utm_campaign }),
              ...(utm_source &&
                !existingOrder.utmSource && { utmSource: utm_source }),
            },
          });
          console.log(
            `[Scale Drop] Pedido ${orderNumber} deduplicado. Logística atualizada pela Nuvemshop.`,
          );
        } else {
          // Se já era da Nuvemshop mesmo, atualiza valores, status E as UTMs
          await prisma.order.update({
            where: { id: existingOrder.id },
            data: {
              status: nsStatus,
              paymentStatus: nsPaymentStatus,
              total: body.total || existingOrder.total,
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
          console.log(
            `[Scale Drop] Pedido ${orderNumber} atualizado pela Nuvemshop.`,
          );
        }
      } else {
        // Se não existe, cria do zero com todas as colunas nativas (Venda Nativa)
        await prisma.order.create({
          data: {
            userId: integration.userId,
            storeIntegrationId: integration.id,
            externalOrderId: externalOrderId,
            orderNumber: orderNumber,
            status: nsStatus,
            paymentStatus: nsPaymentStatus,

            customerName: body.customer?.name || "Cliente Nuvemshop",
            customerEmail: body.customer?.email || null,
            customerPhone: body.customer?.phone || null,
            customerDocument: body.customer?.identification || null,

            shippingAddress:
              body.shipping_address?.address || "Endereço não informado",
            shippingCity: body.shipping_address?.city || null,
            shippingState: body.shipping_address?.province || null,
            shippingZipCode: body.shipping_address?.zipcode || null,

            subtotal: body.subtotal || body.total || 0,
            shippingCost: body.shipping_cost || 0,
            discount: body.discount || 0,
            total: body.total || 0,
            createdAt: new Date(body.created_at),

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
        console.log(
          `[Scale Drop] Novo pedido ${orderNumber} criado pela Nuvemshop.`,
        );
      }

      // 🔥 Revalida o cache para as telas de relatórios atualizarem em tempo real!
      revalidatePath("/marketing/utms");
      revalidatePath("/dashboard");
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("[Scale Drop] Erro no Webhook:", error);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
