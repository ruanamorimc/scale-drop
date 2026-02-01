import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth"; // Seu setup do BetterAuth
import { updateIntegrationTokens } from "@/services/store-integration"; // Sua função de salvar

export async function GET(request: Request) {
  // 1. Verificar se o usuário está logado
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Pegar o "code" que o Mercado Livre mandou na URL
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "No code provided" }, { status: 400 });
  }

  try {
    // 3. Trocar o "code" pelo Token de Acesso (POST no ML)
    const params = new URLSearchParams();
    params.append("grant_type", "authorization_code");
    params.append("client_id", process.env.ML_CLIENT_ID!);
    params.append("client_secret", process.env.ML_CLIENT_SECRET!);
    params.append("code", code);
    params.append("redirect_uri", process.env.ML_REDIRECT_URI!);

    const response = await fetch("https://api.mercadolibre.com/oauth/token", {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/x-www-form-urlencoded",
      },
      body: params,
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Erro ML Token:", data);
      throw new Error("Falha ao obter token do ML");
    }

    // 4. Salvar no Banco (Usando sua função já pronta!)
    await updateIntegrationTokens(session.user.id, data);
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    // 5. Sucesso! Redireciona de volta para a tela de configurações
    return NextResponse.redirect(
      `${baseUrl}/settings/integrations?success=true`,
    );
  } catch (error) {
    console.error("Erro no Callback ML:", error);
    return NextResponse.redirect(
      new URL("/settings/integrations?error=true", request.url),
    );
  }
}
