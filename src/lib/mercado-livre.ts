"use server"; // 👈 Importante! Garante que roda no servidor e não vaza chaves

import { updateIntegrationTokens } from "@/services/store-integration";
import prisma from "@/lib/prisma";
import { StorePlatform } from "@/generated/prisma/client";

export async function refreshMercadoLivreToken(userId: string) {
  try {
    // 1. BUSCAR O TOKEN ATUAL NO BANCO
    // Usamos findFirst porque o findUnique pede o storeId, e aqui talvez a gente não saiba qual é
    const integration = await prisma.storeIntegration.findFirst({
      where: {
        userId: userId,
        platform: StorePlatform.MERCADO_LIVRE, // 👇 Usando o Enum correto
      },
    });

    // Se não tiver no banco, tenta o .env (só pro seu teste local)
    const currentRefreshToken =
      integration?.refreshToken || process.env.ML_REFRESH_TOKEN;
    if (!currentRefreshToken)
      throw new Error("Nenhum Refresh Token encontrado.");

    // 2. Prepara os dados (exatamente como no seu print do Postman)
    const myHeaders = new Headers();
    myHeaders.append("accept", "application/json");
    myHeaders.append("content-type", "application/x-www-form-urlencoded");

    const urlencoded = new URLSearchParams();
    urlencoded.append("grant_type", "refresh_token");
    urlencoded.append("client_id", process.env.ML_CLIENT_ID!);
    urlencoded.append("client_secret", process.env.ML_CLIENT_SECRET!);
    urlencoded.append("refresh_token", process.env.ML_REFRESH_TOKEN!);

    // 3. Faz a chamada (O fetch nativo)
    const response = await fetch("https://api.mercadolibre.com/oauth/token", {
      method: "POST",
      headers: myHeaders,
      body: urlencoded,
      redirect: "follow",
      cache: "no-store", // Garante que não pegue cache velho
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Erro ML:", errorData);
      throw new Error(`Falha na autenticação ML: ${response.statusText}`);
    }

    // 4. Recebe o novo Token
    const data = await response.json();

    // Opcional: Aqui você salvaria o NOVO refresh_token no seu banco de dados
    await updateIntegrationTokens(userId, data);

    return data; // Retorna { access_token, token_type, expires_in, scope, refresh_token }
  } catch (error) {
    console.error("Erro fatal ML:", error);
    return null;
  }
}
