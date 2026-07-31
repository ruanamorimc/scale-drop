import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// 🔥 FUNÇÕES AUXILIARES DE PADRONIZAÇÃO
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

function mapCartpandaStatus(status: string): {
  order: OrderStatus;
  payment: PaymentStatus;
} {
  if (!status) return { order: "PENDING", payment: "PENDING" };
  const s = status.toLowerCase();

  if (s === "paid" || s === "approved")
    return { order: "CONFIRMED", payment: "PAID" };
  if (s === "refunded") return { order: "RETURNED", payment: "REFUNDED" };
  if (
    s === "canceled" ||
    s === "cancelled" ||
    s === "voided" ||
    s === "declined"
  )
    return { order: "CANCELLED", payment: "FAILED" };

  return { order: "PENDING", payment: "PENDING" };
}

export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const integrationId = searchParams.get("id");
    const type = searchParams.get("type");

    if (!integrationId)
      return NextResponse.json({ error: "Missing ID" }, { status: 400 });

    const integration = await prisma.storeIntegration.findUnique({
      where: { id: integrationId },
    });

    if (!integration)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    const body = await req.json();

    // ==========================================
    // 1. FILTRO DE AFILIADOS
    // ==========================================
    const isAffiliateSale = body.affiliate_id || body.affiliate_name;
    if (type === "no_affiliate" && isAffiliateSale) {
      console.log(
        "⏩ Venda de afiliado ignorada conforme configuração do link.",
      );
      return NextResponse.json(
        { message: "Affiliate sale ignored" },
        { status: 200 },
      );
    }

    // ==========================================
    // 2. MAPEAMENTO DE STATUS E DADOS BÁSICOS
    // ==========================================
    const rawOrderNumber = body.name || body.id;
    const orderNumber = formatOrderNumber(rawOrderNumber);
    const orderValue = parseFloat(body.total_price) || 0;
    const statusAlias = body.financial_status || body.status || "";

    const statuses = mapCartpandaStatus(statusAlias);

    // ==========================================
    // 3. EXTRATOR DE UTMs (100% Tipado)
    // ==========================================
    const webhookMetadata = body.metadata || body.tracking || {};

    // 🔥 Criamos a Interface cirúrgica para o array de atributos
    interface NoteAttribute {
      name: string;
      value: string;
    }

    // Agora o TypeScript sabe exatamente o que tem dentro do array
    const noteAttributes: NoteAttribute[] = Array.isArray(body.note_attributes)
      ? body.note_attributes
      : [];

    const getParam = (key: string) => {
      // 1º Tenta pegar direto do objeto de metadados
      if (webhookMetadata[key]) return String(webhookMetadata[key]);

      // 2º Tenta pegar da raiz do payload
      if (body[key]) return String(body[key]);

      // 3º Tenta pegar do array de note_attributes (SEM ANY!)
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

    // Prepara o objeto de metadados para salvar em caso de auditoria
    const finalMetadataToSave =
      Object.keys(webhookMetadata).length > 0
        ? webhookMetadata
        : noteAttributes.length > 0
          ? { note_attributes: noteAttributes }
          : {};

    // ==========================================
    // 4. UPSERT BLINDADO COM TODOS OS CAMPOS
    // ==========================================
    try {
      await prisma.order.upsert({
        where: {
          storeIntegrationId_externalOrderId: {
            storeIntegrationId: integration.id,
            externalOrderId: String(body.id),
          },
        },
        update: {
          status: statuses.order,
          paymentStatus: statuses.payment,
          total: orderValue,
          updatedAt: new Date(),

          // 🔥 Atualiza UTMs APENAS se o webhook enviá-las novamente nesse evento
          ...(utm_campaign && { utmCampaign: utm_campaign }),
          ...(utm_source && { utmSource: utm_source }),
          ...(utm_medium && { utmMedium: utm_medium }),
          ...(utm_content && { utmContent: utm_content }),
          ...(utm_term && { utmTerm: utm_term }),
          ...(src && { src: src }),
          ...(keyword && { keyword: keyword }),

          ...(Object.keys(finalMetadataToSave).length > 0 && {
            metadata: finalMetadataToSave,
          }),
        },
        create: {
          userId: integration.userId,
          storeIntegrationId: integration.id,
          externalOrderId: String(body.id),
          orderNumber: orderNumber,

          status: statuses.order,
          paymentStatus: statuses.payment,

          customerName: body.customer?.first_name
            ? `${body.customer.first_name} ${body.customer.last_name || ""}`.trim()
            : "Cliente Cartpanda",
          customerEmail: body.customer?.email || null,
          customerPhone: body.customer?.phone || null,
          customerDocument: body.customer?.cpf || null,

          shippingAddress: body.shipping_address?.address1 || "Não informado",
          shippingCity: body.shipping_address?.city || null,
          shippingState:
            body.shipping_address?.province_code ||
            body.shipping_address?.province ||
            null,
          shippingZipCode: body.shipping_address?.zip || null,

          subtotal: parseFloat(body.subtotal_price) || orderValue,
          shippingCost: parseFloat(body.total_shipping) || 0,
          discount: parseFloat(body.total_discounts) || 0,
          total: orderValue,

          createdAt: new Date(body.created_at || Date.now()),

          // 🔥 MAPEAMENTO DIRETO NAS COLUNAS NATIVAS
          utmCampaign: utm_campaign,
          utmSource: utm_source,
          utmMedium: utm_medium,
          utmContent: utm_content,
          utmTerm: utm_term,
          src: src,
          keyword: keyword,

          metadata:
            Object.keys(finalMetadataToSave).length > 0
              ? finalMetadataToSave
              : null,
        },
      });
      console.log(
        `[Scale Drop] Pedido Cartpanda ${orderNumber} salvo no banco com sucesso.`,
      );
    } catch (dbError) {
      console.error(
        "[Scale Drop] Erro ao salvar pedido Cartpanda no banco:",
        dbError,
      );
    }

    console.log(
      `✅ Recebido Cartpanda (${integration.storeName}): R$ ${body.total_price}`,
    );

    // Revalidação do cache para atualizar o painel instantaneamente
    revalidatePath("/marketing/utms");
    revalidatePath("/dashboard");

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Webhook Error:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

// Para o link S2S (Afiliados), a Cartpanda costuma usar GET
export async function GET(req: Request) {
  return NextResponse.json({ message: "S2S Received" }, { status: 200 });
}
