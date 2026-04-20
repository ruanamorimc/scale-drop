import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const integrationId = searchParams.get("id");
    const type = searchParams.get("type"); // 'no_affiliate' ou vazio

    if (!integrationId)
      return NextResponse.json({ error: "Missing ID" }, { status: 400 });

    const integration = await prisma.storeIntegration.findUnique({
      where: { id: integrationId },
    });

    if (!integration)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    const body = await req.json();

    // Lógica para ignorar afiliados se a URL for do tipo 'no_affiliate'
    // Na Cartpanda, se houver 'affiliate_id' ou similar, a gente checa
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

    // Aqui segue a sua lógica de disparo CAPI para o Meta...
    console.log(
      `✅ Recebido Cartpanda (${integration.storeName}): R$ ${body.total_price}`,
    );

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Webhook Error:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

// Para o link S2S (Afiliados), a Cartpanda costuma usar GET
export async function GET(req: Request) {
  // Mesma lógica do POST acima, mas pegando dados via searchParams
  return NextResponse.json({ message: "S2S Received" }, { status: 200 });
}
