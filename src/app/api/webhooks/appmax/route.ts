import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// 🔥 FUNÇÃO AUXILIAR E TIPAGEM
function formatOrderNumber(number: string | number | null) {
  if (!number) return "#0000";
  const strNumber = String(number).trim();
  // Se já for #APP-123 ou #123, mantém. Se for 123, vira #123.
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
    const body = await req.json();
    const { searchParams } = new URL(req.url);

    // Pegamos o ID da integração pela URL
    const integrationId = searchParams.get("id");

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

    const externalOrderId = body.pedido_id?.toString() || body.id?.toString();
    const statusRaw = body.status?.toLowerCase();

    // ==========================================
    // 1. MAPEAMENTO DE STATUS DUPLO
    // ==========================================
    let orderStatus: OrderStatus = "PENDING";
    let paymentState: PaymentStatus = "PENDING";

    if (["pago", "aprovado", "sucesso"].includes(statusRaw)) {
      orderStatus = "CONFIRMED";
      paymentState = "PAID";
    } else if (["recusado", "cancelado", "vencido"].includes(statusRaw)) {
      orderStatus = "CANCELLED";
      paymentState = "FAILED";
    } else if (["devolvido", "estornado"].includes(statusRaw)) {
      orderStatus = "RETURNED";
      paymentState = "REFUNDED";
    }

    // ==========================================
    // 2. IDENTIFICAÇÃO DO MÉTODO E FORMATAÇÃO DO PEDIDO
    // ==========================================
    let method = "credit_card";
    if (body.forma_pagamento?.includes("pix")) method = "pix";
    if (body.forma_pagamento?.includes("boleto")) method = "boleto";

    const rawOrderNumber = body.pedido_id || externalOrderId;
    const orderNumberFormatted = formatOrderNumber(rawOrderNumber);

    // ==========================================
    // 3. EXTRATOR DE UTMs (O "Pulo do Gato" da Appmax)
    // ==========================================
    // Na Appmax, as UTMs podem vir no metadata, no tracking ou na raiz do body.
    // Essa função busca nas 3 camadas para não perder nenhuma venda!
    const webhookMetadata = body.metadata || body.tracking || {};
    const getParam = (key: string) => webhookMetadata[key] || body[key] || null;

    const utm_campaign = getParam("utm_campaign");
    const utm_source = getParam("utm_source");
    const utm_medium = getParam("utm_medium");
    const utm_content = getParam("utm_content");
    const utm_term = getParam("utm_term");
    const src = getParam("src");
    const keyword = getParam("keyword");

    // ==========================================
    // 4. UPSERT BLINDADO COM TODOS OS CAMPOS
    // ==========================================
    await prisma.order.upsert({
      where: {
        storeIntegrationId_externalOrderId: {
          storeIntegrationId: integration.id,
          externalOrderId: externalOrderId,
        },
      },
      update: {
        status: orderStatus,
        paymentStatus: paymentState,
        paymentMethod: method,

        // 🔥 Atualiza UTMs APENAS se o webhook enviá-las novamente nesse evento
        ...(utm_campaign && { utmCampaign: utm_campaign }),
        ...(utm_source && { utmSource: utm_source }),
        ...(utm_medium && { utmMedium: utm_medium }),
        ...(utm_content && { utmContent: utm_content }),
        ...(utm_term && { utmTerm: utm_term }),
        ...(src && { src: src }),
        ...(keyword && { keyword: keyword }),

        // Atualiza o JSON de fallback apenas se ele não estiver vazio
        ...(Object.keys(webhookMetadata).length > 0 && {
          metadata: webhookMetadata,
        }),
      },
      create: {
        userId: integration.userId,
        storeIntegrationId: integration.id,
        externalOrderId: externalOrderId,
        orderNumber: orderNumberFormatted,

        status: orderStatus,
        paymentStatus: paymentState,
        paymentMethod: method,

        customerName: body.cliente_nome || "Cliente Appmax",
        customerEmail: body.cliente_email || "",
        customerPhone: body.cliente_telefone || "",
        customerDocument: body.cliente_cpf || "00000000000",
        shippingAddress: "Não informado",
        shippingCity: "",
        shippingState: "",
        shippingZipCode: "",
        shippingCountry: "BR",

        subtotal: parseFloat(body.total_pedido || 0),
        shippingCost: 0,
        discount: 0,
        total: parseFloat(body.total_pedido || 0),

        // 🔥 MAPEAMENTO DIRETO NAS COLUNAS NATIVAS
        utmCampaign: utm_campaign,
        utmSource: utm_source,
        utmMedium: utm_medium,
        utmContent: utm_content,
        utmTerm: utm_term,
        src: src,
        keyword: keyword,

        // Fallback de logs e auditoria
        metadata:
          Object.keys(webhookMetadata).length > 0 ? webhookMetadata : null,
      },
    });

    // Atualiza as telas do dashboard e relatórios para refletirem a nova venda
    revalidatePath("/marketing/utms");
    revalidatePath("/dashboard");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ [APPMAX WEBHOOK] Erro:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
