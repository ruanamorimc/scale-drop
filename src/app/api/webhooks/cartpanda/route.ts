import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// 🔥 FUNÇÕES AUXILIARES DE PADRONIZAÇÃO
function formatOrderNumber(number: string | number) {
  if (!number) return "#0000";
  const strNumber = String(number).trim();
  return strNumber.startsWith('#') ? strNumber : `#${strNumber}`;
}

function mapCartpandaStatus(status: string) {
  if (!status) return 'PENDING';
  const s = status.toLowerCase();
  if (s === 'paid' || s === 'approved') return 'PAID';
  if (s === 'refunded') return 'REFUNDED';
  if (s === 'canceled' || s === 'cancelled' || s === 'voided' || s === 'declined') return 'FAILED';
  return 'PENDING';
}

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

    // 🔥 SALVA O PEDIDO NO BANCO DE DADOS (DEDUPLICAÇÃO PADRONIZADA)
    const rawOrderNumber = body.name || body.id;
    const orderNumber = formatOrderNumber(rawOrderNumber);
    const orderValue = parseFloat(body.total_price) || 0;
    const statusAlias = body.financial_status || body.status || '';

    try {
      await prisma.order.upsert({
        where: {
          storeIntegrationId_externalOrderId: {
            storeIntegrationId: integration.id,
            externalOrderId: String(body.id)
          }
        },
        update: {
          paymentStatus: mapCartpandaStatus(statusAlias),
          total: orderValue,
          updatedAt: new Date(),
        },
        create: {
          userId: integration.userId,
          storeIntegrationId: integration.id,
          externalOrderId: String(body.id),
          orderNumber: orderNumber, // Hashtag garantida
          
          status: 'PENDING', // Plataforma logística atualiza depois
          paymentStatus: mapCartpandaStatus(statusAlias),
          
          customerName: body.customer?.first_name 
            ? `${body.customer.first_name} ${body.customer.last_name || ''}`.trim() 
            : 'Cliente Cartpanda',
          customerEmail: body.customer?.email || null,
          customerPhone: body.customer?.phone || null,
          customerDocument: body.customer?.cpf || null,
          
          shippingAddress: body.shipping_address?.address1 || 'Não informado',
          shippingCity: body.shipping_address?.city || null,
          shippingState: body.shipping_address?.province_code || body.shipping_address?.province || null,
          shippingZipCode: body.shipping_address?.zip || null,
          
          subtotal: parseFloat(body.subtotal_price) || orderValue,
          shippingCost: parseFloat(body.total_shipping) || 0,
          discount: parseFloat(body.total_discounts) || 0,
          total: orderValue,
          
          createdAt: new Date(body.created_at || Date.now()),
        }
      });
      console.log(`[Scale Drop] Pedido Cartpanda ${orderNumber} salvo no banco com sucesso.`);
    } catch (dbError) {
      console.error("[Scale Drop] Erro ao salvar pedido Cartpanda no banco:", dbError);
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
