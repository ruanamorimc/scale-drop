"use server";

import { redirect } from "next/navigation";

export async function connectMercadoLivreAction() {
  const appId = process.env.ML_CLIENT_ID;
  const redirectUri = process.env.ML_REDIRECT_URI;
  
  // URL oficial de autorização do Mercado Livre
  const authUrl = `https://auth.mercadolivre.com.br/authorization?response_type=code&client_id=${appId}&redirect_uri=${redirectUri}`;

  // Redireciona o usuário para fora do seu site, indo para o ML
  redirect(authUrl);
}