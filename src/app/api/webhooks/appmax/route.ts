import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { searchParams } = new URL(req.url);

    // Pegamos o ID da integração pela URL (igual fizemos na Shopify)
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
    // 1. MAPEAMENTO DE STATUS DUPLO (Encomenda e Pagamento)
    // ==========================================
    let orderStatus = "PENDING";
    let paymentState = "PENDING";

    if (["pago", "aprovado", "sucesso"].includes(statusRaw)) {
      orderStatus = "CONFIRMED"; // Encomenda confirmada
      paymentState = "PAID"; // Dinheiro no bolso
    } else if (["recusado", "cancelado", "vencido"].includes(statusRaw)) {
      orderStatus = "CANCELLED";
      paymentState = "FAILED";
    } else if (["devolvido", "estornado"].includes(statusRaw)) {
      orderStatus = "RETURNED";
      paymentState = "REFUNDED";
    }

    // ==========================================
    // 2. IDENTIFICAÇÃO DO MÉTODO
    // ==========================================
    let method = "credit_card";
    if (body.forma_pagamento?.includes("pix")) method = "pix";
    if (body.forma_pagamento?.includes("boleto")) method = "boleto";

    // ==========================================
    // 3. UPSERT BLINDADO COM TODOS OS CAMPOS
    // ==========================================
    await prisma.order.upsert({
      where: {
        storeIntegrationId_externalOrderId: {
          storeIntegrationId: integration.id,
          externalOrderId: externalOrderId,
        },
      },
      update: {
        // @ts-ignore
        status: orderStatus,
        // @ts-ignore
        paymentStatus: paymentState, // 🔥 Adicionado o status de pagamento correto
        paymentMethod: method,
      },
      create: {
        userId: integration.userId,
        storeIntegrationId: integration.id,
        externalOrderId: externalOrderId,
        orderNumber: body.pedido_id?.toString() || "#APP-" + externalOrderId,
        // @ts-ignore
        status: orderStatus,
        // @ts-ignore
        paymentStatus: paymentState, // 🔥 Adicionado o status de pagamento correto
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
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ [APPMAX WEBHOOK] Erro:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
