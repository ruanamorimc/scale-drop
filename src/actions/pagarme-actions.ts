"use server";

import { getServerSession } from "@/lib/get-session";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function disconnectPagarmeIntegration() {
  try {
    const session = await getServerSession();
    const user = session?.user;

    if (!user) return { success: false, error: "Não autorizado" };  

    await prisma.storeIntegration.deleteMany({
      where: {
        userId: user.id,
        platform: "PAGARME",
      },
    });

    revalidatePath("/dashboard/integrations");
    return { success: true };
  } catch (error) {
    console.error("Erro ao desconectar Pagar.me:", error);
    return { success: false, error: "Falha ao desconectar." };
  }
}

export async function connectPagarme(data: { secretKey: string; publicKey: string }) {
  try {
    const session = await getServerSession();
    const user = session?.user;

    if (!user) {
      return { success: false, error: "Usuário não autenticado." };
    }

    if (!data.secretKey || !data.publicKey) {
      return { success: false, error: "Ambas as chaves são obrigatórias." };
    }

    // O upsert mágico: atualiza se já existir, cria se for novo
    await prisma.storeIntegration.upsert({
      where: {
        userId_platform: {
          userId: user.id,
          platform: "PAGARME",
        },
      },
      update: {
        accessToken: data.secretKey, // sk_...
        publicKey: data.publicKey,   // pk_...
        isConnected: true,
        isActive: true,
      },
      create: {
        userId: user.id,
        platform: "PAGARME",
        storeName: "Checkout Pagar.me",
        accessToken: data.secretKey,
        publicKey: data.publicKey,
        isConnected: true,
        isActive: true,
      },
    });

    // Atualiza a página de integrações para refletir o status "Conectado"
    revalidatePath("/dashboard/integrations"); 
    
    return { success: true };
  } catch (error) {
    console.error("Erro ao conectar Pagar.me:", error);
    return { success: false, error: "Falha interna ao salvar credenciais." };
  }
}