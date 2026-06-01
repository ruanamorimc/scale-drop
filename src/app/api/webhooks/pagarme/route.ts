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

    // 2. BUSCA O DONO DA INTEGRAÇÃO (Exigência do seu Schema: userId)
    const integration = await prisma.storeIntegration.findUnique({
      where: { id: integrationId },
      select: { userId: true }, // Precisamos apenas do ID do usuário
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

    // 4. Mapeamento de Status respeitando estritamente os seus Enums
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
      orderStatus = "CONFIRMED"; // Pedido confirmado!
      paymentStatus = "PAID"; // Pagamento pago!
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

    // Apenas processa se for um evento que nos importa
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

      // 🔥 PADRONIZAÇÃO DO NÚMERO DO PEDIDO
      const rawOrderNumber = data.code || data.id;
      const orderNumberFormatted = formatOrderNumber(rawOrderNumber);

      // 5. O UPSERT Perfeito (Baseado 100% no seu schema)
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
        },
        create: {
          userId: integration.userId,
          storeIntegrationId: integrationId,
          externalOrderId: data.id,
          orderNumber: orderNumberFormatted, // 🔥 Agora salva com a hashtag garantida!

          // Valores (Seu schema exige subtotal e total)
          total: amountInReais,
          subtotal: amountInReais,

          // Status Enums
          status: orderStatus,
          paymentStatus: paymentStatus,
          paymentMethod: paymentMethod,

          // Dados do cliente
          customerName: data?.customer?.name || "Cliente Pagar.me",
          customerEmail: data?.customer?.email || "",
          customerDocument: data?.customer?.document || "",

          // Endereço (Seu schema exige, então passamos um fallback se a API não mandar)
          shippingAddress: "Endereço não informado via Webhook",
        },
      });

      // Atualiza o cache da Dashboard instantaneamente
      revalidatePath("/dashboard");
    } else {
      console.log(`⚪ Evento secundário ignorado: ${type}`);
    }

    // Retorna rápido para a Pagar.me
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
