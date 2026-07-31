import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// 🔥 FUNÇÃO AUXILIAR DE PADRONIZAÇÃO
function formatOrderNumber(number: string | number | null) {
  if (!number) return "#0000";
  const strNumber = String(number).trim();
  return strNumber.startsWith("#") ? strNumber : `#${strNumber}`;
}

export async function POST(req: Request) {
  try {
    // 1. Pegamos o ID da integração na URL
    const { searchParams } = new URL(req.url);
    const integrationId = searchParams.get("id");

    if (!integrationId) {
      console.error("[WEBHOOK PAGAR.ME] ❌ Rejeitado: Faltando ?id= na URL");
      return NextResponse.json(
        { error: "ID da integração ausente" },
        { status: 400 },
      );
    }

    // 2. BUSCA O DONO DA INTEGRAÇÃO
    const integration = await prisma.storeIntegration.findUnique({
      where: { id: integrationId },
      select: { userId: true },
    });

    if (!integration) {
      console.error(
        "[WEBHOOK PAGAR.ME] ❌ Rejeitado: Integração não encontrada no banco",
      );
      return NextResponse.json(
        { error: "Integração inválida" },
        { status: 404 },
      );
    }

    // 3. Capturamos o JSON enviado pela Pagar.me
    const body = await req.json();
    const { type, data } = body;

    console.log(`\n[WEBHOOK PAGAR.ME] 🔔 Evento recebido: ${type}`);
    console.log(`[WEBHOOK PAGAR.ME] 🛒 Pedido Pagar.me ID: ${data?.id}`);

    const amountInReais = data?.amount ? data.amount / 100 : 0;
    const paymentMethod = data?.charges?.[0]?.payment_method || "unknown";

    // 4. Mapeamento de Status
    let orderStatus:
      | "PENDING"
      | "PROCESSING"
      | "CONFIRMED"
      | "PREPARING"
      | "SHIPPED"
      | "DELIVERED"
      | "CANCELLED"
      | "RETURNED" = "PENDING";
    let paymentStatus: "PENDING" | "PAID" | "PARTIAL" | "REFUNDED" | "FAILED" =
      "PENDING";

    if (type === "order.paid") {
      orderStatus = "CONFIRMED";
      paymentStatus = "PAID";
    } else if (type === "order.payment_failed") {
      orderStatus = "CANCELLED";
      paymentStatus = "FAILED";
    } else if (type === "order.canceled") {
      orderStatus = "CANCELLED";
      paymentStatus = "FAILED";
    } else if (type === "charge.refunded") {
      orderStatus = "RETURNED";
      paymentStatus = "REFUNDED";
    }

    if (
      [
        "order.created",
        "order.paid",
        "order.payment_failed",
        "order.canceled",
        "charge.refunded",
      ].includes(type)
    ) {
      console.log(
        `[DB] 💾 Salvando pedido -> Pagamento: ${paymentStatus} | Pedido: ${orderStatus}`,
      );

      const rawOrderNumber = data.code || data.id;
      const orderNumberFormatted = formatOrderNumber(rawOrderNumber);

      // 🔥 EXTRATOR DE UTMs DE ALTA PERFORMANCE
      // Lemos o metadata da Pagar.me e extraímos as chaves exatas do seu script
      const webhookMetadata = data.metadata || {};

      const utm_campaign = webhookMetadata.utm_campaign || null;
      const utm_source = webhookMetadata.utm_source || null;
      const utm_medium = webhookMetadata.utm_medium || null;
      const utm_content = webhookMetadata.utm_content || null;
      const utm_term = webhookMetadata.utm_term || null;
      const src = webhookMetadata.src || null;
      const keyword = webhookMetadata.keyword || null;

      // 5. O UPSERT Perfeito
      await prisma.order.upsert({
        where: {
          storeIntegrationId_externalOrderId: {
            storeIntegrationId: integrationId,
            externalOrderId: data.id,
          },
        },
        update: {
          status: orderStatus,
          paymentStatus: paymentStatus,
          // 🔥 Atualiza UTMs APENAS se o webhook enviá-las novamente
          ...(utm_campaign && { utmCampaign: utm_campaign }),
          ...(utm_source && { utmSource: utm_source }),
          ...(utm_medium && { utmMedium: utm_medium }),
          ...(utm_content && { utmContent: utm_content }),
          ...(utm_term && { utmTerm: utm_term }),
          ...(src && { src: src }),
          ...(keyword && { keyword: keyword }),
          // Mantém o metadata bruto se houver novos dados
          ...(Object.keys(webhookMetadata).length > 0 && {
            metadata: webhookMetadata,
          }),
        },
        create: {
          userId: integration.userId,
          storeIntegrationId: integrationId,
          externalOrderId: data.id,
          orderNumber: orderNumberFormatted,

          total: amountInReais,
          subtotal: amountInReais,

          status: orderStatus,
          paymentStatus: paymentStatus,
          paymentMethod: paymentMethod,

          customerName: data?.customer?.name || "Cliente Pagar.me",
          customerEmail: data?.customer?.email || "",
          customerDocument: data?.customer?.document || "",
          shippingAddress: "Endereço não informado via Webhook",

          // 🔥 MAPEAMENTO DIRETO NAS COLUNAS NATIVAS
          utmCampaign: utm_campaign,
          utmSource: utm_source,
          utmMedium: utm_medium,
          utmContent: utm_content,
          utmTerm: utm_term,
          src: src,
          keyword: keyword,

          metadata:
            Object.keys(webhookMetadata).length > 0 ? webhookMetadata : null,
        },
      });

      revalidatePath("/dashboard");
    } else {
      console.log(`⚪ Evento secundário ignorado: ${type}`);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error(
      "[WEBHOOK PAGAR.ME] ❌ Erro crítico no banco de dados:",
      error,
    );
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
