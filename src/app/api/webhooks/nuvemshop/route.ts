import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

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

      // 3. Salvar ou Atualizar alinhado com o model Order
      const orderNumber = String(body.number);

      // Procura se esse pedido já existe no banco (mesmo que tenha vindo de outra integração, como Yampi/Pagar.me)
      const existingOrder = await prisma.order.findFirst({
        where: {
          userId: integration.userId,
          orderNumber: orderNumber,
        },
        include: {
          storeIntegration: true, // Trazemos os dados da integração para saber quem criou
        },
      });

      const nsStatus = mapOrderStatus(body.status);
      const nsPaymentStatus = mapPaymentStatus(body.payment_status);

      if (existingOrder) {
        // O pedido já existe! Vamos verificar quem é o "Dono" dele.
        const isGatewayOrder =
          existingOrder.storeIntegration.platform !== "NUVEMSHOP";

        if (isGatewayOrder) {
          // Se foi criado por um Gateway/Checkout, a Nuvemshop APENAS atualiza logística.
          // Não tocamos em valores, taxas ou paymentStatus.
          await prisma.order.update({
            where: { id: existingOrder.id },
            data: {
              status: nsStatus, // Atualiza apenas se foi enviado, entregue, etc.
              updatedAt: new Date(),
            },
          });
          console.log(
            `[Scale Drop] Pedido ${orderNumber} deduplicado. Logística atualizada pela Nuvemshop.`,
          );
        } else {
          // Se já era da Nuvemshop mesmo, atualiza tudo normalmente
          await prisma.order.update({
            where: { id: existingOrder.id },
            data: {
              status: nsStatus,
              paymentStatus: nsPaymentStatus,
              total: body.total || existingOrder.total,
              updatedAt: new Date(),
            },
          });
          console.log(
            `[Scale Drop] Pedido ${orderNumber} atualizado pela Nuvemshop.`,
          );
        }
      } else {
        // Se o pedido não existe em lugar nenhum, criamos do zero (Venda nativa)
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
          },
        });
        console.log(
          `[Scale Drop] Novo pedido ${orderNumber} criado pela Nuvemshop.`,
        );
      }

      console.log(
        `[Scale Drop] Pedido ${externalOrderId} processado com sucesso.`,
      );
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("[Scale Drop] Erro no Webhook:", error);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
