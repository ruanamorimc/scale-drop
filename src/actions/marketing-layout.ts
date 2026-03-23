"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth"; // Ajuste conforme sua lib de auth (NextAuth/BetterAuth)
import { headers } from "next/headers";

// Define o tipo do item de layout para TypeScript
type LayoutItem = {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  maxW?: number;
  minH?: number;
  maxH?: number;
};

export async function saveDashboardLayout(layout: LayoutItem[]) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { success: false, error: "Não autorizado" };
    }

    // AQUI VOCÊ SALVA NO BANCO.
    // Exemplo 1: Se tiver um campo 'dashboardLayout' (Json) no User
    /*
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        dashboardLayout: layout as any // Prisma Json
      }
    });
    */

    // Exemplo 2: Usando uma tabela de preferências (Recomendado)
    // await prisma.userPreference.upsert({ ... })

    // POR ENQUANTO (MOCK DE SUCESSO PARA NÃO QUEBRAR SEU APP):
    // Como não tenho acesso ao seu schema exato para criar o campo,
    // vou simular um delay de banco de dados.
    // VOCÊ PRECISA DESCOMENTAR A PARTE DO PRISMA ACIMA QUANDO TIVER O CAMPO.
    await new Promise((resolve) => setTimeout(resolve, 500));

    return { success: true };
  } catch (error) {
    console.error("Erro ao salvar layout:", error);
    return { success: false, error: "Erro ao salvar no banco" };
  }
}

export async function getDashboardLayout() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) return null;

    // BUSCAR DO BANCO
    /*
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { dashboardLayout: true }
    });
    return user?.dashboardLayout as LayoutItem[] | null;
    */

    return null; // Retorna null se não tiver salvo, para usar o padrão
  } catch (error) {
    return null;
  }
}
