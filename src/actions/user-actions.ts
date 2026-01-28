"use server"; // 👈 Indica que isso roda no servidor

import { updateUserSchema, type UpdateUserValues } from "@/schemas/user-schema";
import prisma from "@/lib/prisma"; // Seu cliente do prisma
import { getServerSession } from "@/lib/get-session"; // Sua função de sessão
import { revalidatePath } from "next/cache";

export async function updateUserAction(data: UpdateUserValues) {
  // 1. Verificar se o usuário está logado
  const session = await getServerSession();

  if (!session?.user?.email) {
    return { success: false, error: "Usuário não autenticado." };
  }

  // 2. Validar os dados recebidos (Segurança extra)
  const validation = updateUserSchema.safeParse(data);

  if (!validation.success) {
    return { success: false, error: "Dados inválidos." };
  }

  try {
    // 3. Atualizar no Banco de Dados
    await prisma.user.update({
      where: {
        email: session.user.email, // Garante que só atualiza o próprio usuário
      },
      data: {
        name: validation.data.username, // Atualiza o nome de usuário.
        //email: validation.data.email, // Atualiza o email de usuário.
        phoneNumber: validation.data.phone, // Atualiza o múmero de usuário.
        // Role geralmente não atualizamos aqui (risco de segurança),
        // role se atualiza via fluxo de pagamento/admin.
      },
    });

    // 4. Atualizar a tela do usuário sem recarregar (Mágica!)
    revalidatePath("/dashboard/profile");
    revalidatePath("/dashboard"); // Atualiza sidebar também se tiver nome lá

    return { success: true };
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);
    return { success: false, error: "Erro ao atualizar perfil." };
  }
}
