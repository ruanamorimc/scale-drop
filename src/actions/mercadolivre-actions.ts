"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth"; // Seu BetterAuth

export async function connectMercadoLivreAction() {
  // 1. Pegar o usuário atual para usar o ID dele como "state"
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    // Se não tiver logado, não deixa conectar
    return;
  }

  const appId = process.env.ML_CLIENT_ID;
  const redirectUri = process.env.ML_REDIRECT_URI;

  // 👇 AQUI ESTÁ A NOVIDADE: O STATE
  // Usamos o ID do usuário para garantir que o retorno é para ele mesmo.
  // Em apps muito seguros, usamos um hash aleatório, mas o ID já resolve 99% dos casos.
  const state = session.user.id;

  // URL oficial conforme o suporte te passou
  const authUrl = `https://auth.mercadolivre.com.br/authorization?response_type=code&client_id=${appId}&redirect_uri=${redirectUri}&state=${state}`;

  redirect(authUrl);
}
