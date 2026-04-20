"use server";

// Ajuste o caminho do seu prisma client se necessário
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// TIPAGEM PARA O PIXEL QUE VEM DO FRONTEND
type PixelData = {
  id?: string;
  name: string;
  pixelIds: string[];
  type: string;
  status: string;
  rules: Record<string, unknown>; // O JSON com as regras de Lead, Purchase, etc.
};

// 1. BUSCAR TODOS OS PIXELS DO USUÁRIO
export async function getMetaPixels(userId: string) {
  try {
    const pixels = await prisma.metaPixel.findMany({
      where: { userId: userId },
      orderBy: { createdAt: "desc" },
    });
    return { success: true, data: pixels };
  } catch (error) {
    console.error("Erro ao buscar pixels:", error);
    return { success: false, error: "Falha ao buscar os pixels do Meta." };
  }
}

// 2. CRIAR OU EDITAR UM PIXEL
export async function saveMetaPixel(userId: string, data: PixelData) {
  try {
    // Se o ID foi passado e não for um ID falso do frontend (começando com 0.), é edição.
    // Como estávamos gerando IDs aleatórios (Math.random) no front, vamos validar.
    const isEditing = data.id && !data.id.includes(".");

    if (isEditing) {
      // ATUALIZAR PIXEL EXISTENTE
      const updatedPixel = await prisma.metaPixel.update({
        where: { id: data.id, userId: userId },
        data: {
          name: data.name,
          pixelIds: data.pixelIds,
          type: data.type,
          status: data.status,
          rules: data.rules as any, // Salva o JSON completo
        },
      });
      revalidatePath("/settings/integrations"); // Atualiza a tela automaticamente
      return { success: true, data: updatedPixel };
    } else {
      // CRIAR NOVO PIXEL
      const newPixel = await prisma.metaPixel.create({
        data: {
          userId: userId,
          name: data.name,
          pixelIds: data.pixelIds,
          type: data.type,
          status: data.status,
          rules: data.rules as any, // Salva o JSON completo
        },
      });
      revalidatePath("/settings/integrations");
      return { success: true, data: newPixel };
    }
  } catch (error) {
    console.error("Erro ao salvar pixel:", error);
    return {
      success: false,
      error: "Falha ao salvar as configurações do pixel.",
    };
  }
}

// 3. DELETAR UM PIXEL
export async function deleteMetaPixel(userId: string, pixelId: string) {
  try {
    await prisma.metaPixel.delete({
      where: { id: pixelId, userId: userId },
    });
    revalidatePath("/settings/integrations");
    return { success: true };
  } catch (error) {
    console.error("Erro ao deletar pixel:", error);
    return { success: false, error: "Falha ao deletar o pixel." };
  }
}

// 4. ATIVAR/DESATIVAR PIXEL
export async function toggleMetaPixelStatus(
  userId: string,
  pixelId: string,
  newStatus: string,
) {
  try {
    const updatedPixel = await prisma.metaPixel.update({
      where: { id: pixelId, userId: userId },
      data: { status: newStatus },
    });
    revalidatePath("/settings/integrations");
    return { success: true, data: updatedPixel };
  } catch (error) {
    console.error("Erro ao alterar status do pixel:", error);
    return { success: false, error: "Falha ao alterar o status do pixel." };
  }
}

// ==========================================
// AÇÕES DAS CONTAS DE ANÚNCIO (BMs)
// ==========================================

export async function getMetaAccounts(userId: string) {
  try {
    // 1. Busca o Token E O PLANO do usuário no banco
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { metaAccessToken: true, plan: true }, // 🔥 Agora puxamos o plano!
    });

    let profileName = "Sua Conta Meta";
    let profileInitials = "ME";

    // 2. Bate na API do Meta para pegar o NOME REAL do perfil
    if (user?.metaAccessToken) {
      try {
        const profileRes = await fetch(
          `https://graph.facebook.com/v19.0/me?fields=name&access_token=${user.metaAccessToken}`,
        );
        const profileData = await profileRes.json();

        if (profileData.name) {
          profileName = profileData.name;
          profileInitials = profileData.name.substring(0, 2).toUpperCase();
        }
      } catch (e) {
        console.error("Falha ao buscar nome no Meta", e);
      }
    }

    // 3. Busca as contas de anúncio
    const accounts = await prisma.metaAccount.findMany({
      where: { userId: userId },
      orderBy: { name: "asc" },
    });

    // 4. Devolve tudo para o Frontend (Contas, Nome do FB e o Plano atual)
    return {
      success: true,
      data: accounts,
      profileName,
      profileInitials,
      userPlan: user?.plan || "FREE",
    };
  } catch (error) {
    console.error("Erro ao buscar contas:", error);
    return { success: false, error: "Falha ao buscar as contas do Meta." };
  }
}

export async function toggleMetaAccountStatus(
  userId: string,
  id: string,
  isActive: boolean,
) {
  try {
    const updatedAccount = await prisma.metaAccount.update({
      where: { id: id, userId: userId },
      data: { isActive },
    });
    revalidatePath("/settings/integrations");
    return { success: true, data: updatedAccount };
  } catch (error) {
    console.error("Erro ao alterar status da conta:", error);
    return { success: false, error: "Falha ao alterar o status da conta." };
  }
}
