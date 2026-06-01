import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import crypto from "crypto";

// 🔥 FUNÇÕES AUXILIARES DE PADRONIZAÇÃO
function formatOrderNumber(number: string | number) {
  if (!number) return "#0000";
  const strNumber = String(number).trim();
  return strNumber.startsWith('#') ? strNumber : `#${strNumber}`;
}

function mapYampiPaymentStatus(status: string) {
  switch (status) {
    case 'paid': return 'PAID';
    case 'canceled':
    case 'refused': return 'FAILED';
    case 'refunded': return 'REFUNDED';
    default: return 'PENDING';
  }
}

// ==========================================
// FUNÇÃO EXIGIDA PELA META (Criptografia SHA-256 para Email/Telefone)
// ==========================================
const hashData = (str?: string) => {
  if (!str) return undefined;
  const cleanStr = str.trim().toLowerCase();
  return crypto.createHash("sha256").update(cleanStr).digest("hex");
};

export async function POST(req: Request) {
  try {
    // 1. Pega o ID da integração que está no link (Ex: ?id=cmnp7b...)
    const { searchParams } = new URL(req.url);
    const integrationId = searchParams.get("id");

    if (!integrationId) {
      return NextResponse.json({ error: "ID da integração não fornecido." }, { status: 400 });
    }

    // 2. Busca a Chave Secreta (Token) no Banco de Dados
    const integration = await prisma.storeIntegration.findUnique({
      where: { id: integrationId }
    });

    if (!integration || !integration.accessToken) {
      return NextResponse.json({ error: "Integração não encontrada ou sem chave secreta." }, { status: 404 });
    }

    // 3. O COFRE BLINDADO: Verificação de Assinatura da Yampi
    // Precisamos ler o "corpo" da requisição como texto puro para a matemática funcionar
    const rawBody = await req.text();
    const signatureRecebida = req.headers.get("x-yampi-hmac-sha256");

    if (!signatureRecebida) {
      return NextResponse.json({ error: "Acesso Negado: Faltando assinatura de segurança." }, { status: 401 });
    }

    // Calcula a assinatura real usando a sua chave secreta
    const signatureCalculada = crypto
      .createHmac("sha256", integration.accessToken)
      .update(rawBody)
      .digest("base64");

    if (signatureRecebida !== signatureCalculada) {
      console.error("🚨 [ALERTA DE SEGURANÇA] Tentativa de fraude no Webhook interceptada!");
      return NextResponse.json({ error: "Acesso Negado: Assinatura inválida." }, { status: 401 });
    }

    // 4. Se passou pela segurança, lemos os dados da venda!
    const body = JSON.parse(rawBody);
    const eventType = body.event; 
    const orderData = body.resource || body.data;

    if (!orderData) {
      return NextResponse.json({ message: "Nenhum dado de pedido encontrado." }, { status: 200 });
    }

    const statusAlias = orderData.status?.alias || "";
    const orderValue = parseFloat(orderData.value_total || 0);
    const customer = orderData.customer || {};

    const rawOrderNumber = orderData.number || orderData.id;
    const orderNumber = formatOrderNumber(rawOrderNumber);
    
    try {
      await prisma.order.upsert({
        where: {
          storeIntegrationId_externalOrderId: {
            storeIntegrationId: integration.id,
            externalOrderId: String(orderData.id)
          }
        },
        update: {
          paymentStatus: mapYampiPaymentStatus(statusAlias),
          total: orderValue,
          updatedAt: new Date(),
        },
        create: {
          userId: integration.userId,
          storeIntegrationId: integration.id,
          externalOrderId: String(orderData.id),
          orderNumber: orderNumber, // Salvando com a # obrigatória
          
          status: 'PENDING', // Logística inicial (quem resolve isso depois é a Nuvemshop/Shopify)
          paymentStatus: mapYampiPaymentStatus(statusAlias),
          
          customerName: customer.name || 'Cliente Yampi',
          customerEmail: customer.email || null,
          customerPhone: customer.phone?.full_number || null,
          customerDocument: customer.cpf || customer.cnpj || null,
          
          // Yampi geralmente envia o endereço dentro de shipping_address ou address
          shippingAddress: orderData.shipping_address?.street || 'Não informado',
          shippingCity: orderData.shipping_address?.city || null,
          shippingState: orderData.shipping_address?.state || null,
          shippingZipCode: orderData.shipping_address?.zipcode || null,
          
          subtotal: parseFloat(orderData.value_products) || orderValue,
          shippingCost: parseFloat(orderData.value_shipping) || 0,
          discount: parseFloat(orderData.value_discount) || 0,
          total: orderValue,
          
          createdAt: new Date(orderData.created_at || Date.now()),
        }
      });
      console.log(`[Scale Drop] Pedido Yampi ${orderNumber} salvo no banco.`);
    } catch (dbError) {
      console.error("[Scale Drop] Erro ao salvar pedido Yampi no banco:", dbError);
      // Não damos return erro aqui para não travar o envio do Pixel CAPI abaixo
    }

    // 5. Busca o Pixel Ativo do Dono dessa Integração
    const metaPixel = await prisma.metaPixel.findFirst({
      where: { userId: integration.userId, status: "Ativo" },
      include: { user: true }
    });

    if (!metaPixel || !metaPixel.user.metaAccessToken) {
      return NextResponse.json({ message: "Usuário sem Pixel ativo ou sem Token." }, { status: 200 });
    }

    const rules = metaPixel.rules as any;
    const accessToken = metaPixel.user.metaAccessToken;

    // 6. O FILTRO INTELIGENTE DE REGRAS
    const purchaseConfig = rules?.purchase?.config || "Vendas pendentes e aprovadas";
    const valueConfig = rules?.purchase?.value || "Valor da venda";

    const isPaid = statusAlias === "paid" || eventType === "order.paid";
    const isPending = statusAlias === "pending" || statusAlias === "waiting_payment";

    if (purchaseConfig === "Apenas vendas aprovadas" && !isPaid) {
      console.log(`[Webhook Yampi] Venda ignorada pela regra do usuário: Apenas Aprovadas.`);
      return NextResponse.json({ message: "Venda ignorada pela regra." }, { status: 200 });
    }

    if (!isPaid && !isPending) {
      return NextResponse.json({ message: "Status não rastreável (Cancelado/Recusado)." }, { status: 200 });
    }

    const finalValue = valueConfig === "Apenas comissão" ? orderValue * 0.10 : orderValue;

    // 7. MONTANDO E ENVIANDO PARA O FACEBOOK (CAPI)
    const timeNow = Math.floor(Date.now() / 1000);
    const rawPhone = customer.phone?.full_number ? `55${customer.phone.full_number.replace(/\D/g, '')}` : "";

    const capiEvent = {
      data: [
        {
          event_name: "Purchase",
          event_time: timeNow,
          action_source: "website",
          event_source_url: "https://yampi.com.br/checkout", 
          user_data: {
            em: hashData(customer.email),
            ph: hashData(rawPhone)
          },
          custom_data: {
            currency: "BRL",
            value: finalValue.toFixed(2),
            order_id: orderData.id?.toString() || `YAMPI-${Date.now()}`
          }
        }
      ]
    };

    // Envia para a contingência (todos os pixels cadastrados naquele card)
    for (const pixelId of metaPixel.pixelIds) {
      const fbUrl = `https://graph.facebook.com/v19.0/${pixelId}/events?access_token=${accessToken}`;
      
      const fbRes = await fetch(fbUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(capiEvent)
      });

      const fbData = await fbRes.json();
      
      if (fbData.error) {
        console.error(`❌ [CAPI Webhook] Erro na Meta (Pixel ${pixelId}):`, fbData.error);
      } else {
        console.log(`✅ [CAPI Webhook] Venda Yampi (R$ ${finalValue}) -> Pixel ${pixelId} com Sucesso!`);
      }
    }

    // 8. Responde 200 para a Yampi saber que recebemos
    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error) {
    console.error("Erro fatal no Webhook da Yampi:", error);
    return NextResponse.json({ error: "Erro interno do servidor." }, { status: 500 });
  }
}