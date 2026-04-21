import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const integrationId = searchParams.get("id");
    const shopifyTopic = req.headers.get("x-shopify-topic"); // Ex: orders/create, orders/paid

    if (!integrationId)
      return NextResponse.json({ error: "Missing ID" }, { status: 400 });

    const integration = await prisma.storeIntegration.findUnique({
      where: { id: integrationId },
    });

    if (!integration)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    const body = await req.json();

    // Roteamento inteligente baseado no tópico
    if (shopifyTopic === "orders/create") {
      console.log(
        `🛒 SHOPIFY: Novo Pedido! ID: ${body.id} | Valor: ${body.total_price}`,
      );
      // Lógica de salvar o pedido no banco para a página de rastreio entrará aqui
    } else if (shopifyTopic === "orders/paid") {
      console.log(`💰 SHOPIFY: Pedido Pago! ID: ${body.id}`);
      // Disparo de CAPI pro Facebook entrará aqui
    } else if (shopifyTopic === "orders/updated") {
      console.log(`🔄 SHOPIFY: Pedido Atualizado! ID: ${body.id}`);
      // Atualização de status de envio/rastreio entrará aqui
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Shopify Webhook Error:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
