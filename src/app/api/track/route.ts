import { NextResponse } from "next/server";
import prisma from "@/lib/prisma"; // Ajuste o caminho se necessário

// 🔥 1. CONFIGURAÇÃO DE CORS (Permite que qualquer loja mande dados pra cá)
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// Responde às checagens de segurança dos navegadores
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// 🔥 2. RECEBENDO O EVENTO DA LOJA
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { pixelId, eventName, eventUrl, userData, customData } = body;

    // Validação básica
    if (!pixelId || !eventName) {
      return NextResponse.json({ error: "Faltam dados obrigatórios" }, { status: 400, headers: corsHeaders });
    }

    // ==========================================
    // 3. LER O BANCO DE DADOS E AS REGRAS
    // ==========================================
    // Procura no nosso banco de dados quem é o dono desse Pixel
    const metaPixel = await prisma.metaPixel.findFirst({
      where: { 
        pixelIds: { has: pixelId }, 
        status: "Ativo" 
      },
      include: { user: true } // Traz o Token do usuário junto
    });

    if (!metaPixel || !metaPixel.user.metaAccessToken) {
      return NextResponse.json({ error: "Pixel não encontrado, inativo ou sem Token." }, { status: 404, headers: corsHeaders });
    }

    const rules = metaPixel.rules as any;
    const accessToken = metaPixel.user.metaAccessToken;

    // 🔥 O SEGREDO DO SAAS: APLICANDO AS REGRAS QUE O USUÁRIO SALVOU
    if (eventName === "Lead" && rules?.lead?.enabled === "Desabilitado") {
      return NextResponse.json({ message: "Evento Lead ignorado pela regra do usuário" }, { headers: corsHeaders });
    }
    if (eventName === "AddToCart" && rules?.addToCart?.enabled === "Desabilitado") {
      return NextResponse.json({ message: "Evento AddToCart ignorado pela regra" }, { headers: corsHeaders });
    }
    // (Mais regras de Purchase e InitiateCheckout serão aplicadas aqui futuramente)

    // ==========================================
    // 4. MONTAR O EVENTO NO PADRÃO DO FACEBOOK (CAPI)
    // ==========================================
    const timeNow = Math.floor(Date.now() / 1000);
    
    const capiEvent = {
      data: [
        {
          event_name: eventName,
          event_time: timeNow,
          action_source: "website",
          event_source_url: eventUrl,
          user_data: {
            client_ip_address: userData?.ip,
            client_user_agent: userData?.userAgent,
            fbp: userData?.fbp, // Cookie de clique do FB
            fbc: userData?.fbc, // Cookie de clique do FB
          },
          custom_data: customData || {}
        }
      ]
    };

    // ==========================================
    // 5. DISPARAR DIRETO PARA O SERVIDOR DA META
    // ==========================================
    const fbUrl = `https://graph.facebook.com/v19.0/${pixelId}/events?access_token=${accessToken}`;
    const fbRes = await fetch(fbUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(capiEvent)
    });

    const fbData = await fbRes.json();

    if (fbData.error) {
      console.error("Erro retornado pela Meta:", fbData.error);
      return NextResponse.json({ error: "A Meta recusou o evento", details: fbData.error }, { status: 400, headers: corsHeaders });
    }

    // Sucesso absoluto!
    return NextResponse.json({ success: true, fbResponse: fbData }, { headers: corsHeaders });

  } catch (error) {
    console.error("Erro grave na rota de Track:", error);
    return NextResponse.json({ error: "Erro interno no servidor CAPI" }, { status: 500, headers: corsHeaders });
  }
}