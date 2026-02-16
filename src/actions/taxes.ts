"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

export async function getTaxes() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) return [];

  try {
    const userId = session.user.id;

    // 1. Verifica se o Imposto Padrão (Meta) já existe
    const metaTax = await prisma.tax.findFirst({
      where: { userId, isSystem: true }
    });

    // 2. Se não existir, cria automaticamente com a regra CORRETA
    if (!metaTax) {
      await prisma.tax.create({
        data: {
          userId,
          name: "Imposto do Anúncio (Meta)",
          rate: 0, // O usuário define a alíquota (ex: 12% ou 13%)
          calculationRule: "gasto_anuncio", // 👈 NOVA REGRA: Baseado no Ad Spend
          isSystem: true,
        }
      });
    }

    const taxes = await prisma.tax.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return taxes.map((t) => ({
      ...t,
      rate: Number(t.rate),
      createdAt: t.createdAt.toISOString(),
    }));
  } catch (error) {
    return [];
  }
}
// Mantenha saveTax e deleteTax como estão

export async function saveTax(data: any) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) return { success: false, error: "Não autorizado" };

  try {
    const payload = {
      userId: session.user.id,
      name: data.name,
      rate: Number(data.rate),
      calculationRule: data.calculationRule, // Salva a regra escolhida
      // Se for edição, mantém o isSystem original, se for novo, é false
      isSystem: data.isSystem || false 
    };

    if (data.id) {
      await prisma.tax.update({ where: { id: data.id }, data: payload });
    } else {
      await prisma.tax.create({ data: payload });
    }

    revalidatePath("/finance/taxes");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteTax(id: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) return { success: false };

  try {
    // Trava de segurança no backend também
    const tax = await prisma.tax.findUnique({ where: { id } });
    if (tax?.isSystem) return { success: false, error: "Imposto padrão não pode ser excluído." };

    await prisma.tax.delete({ where: { id, userId: session.user.id } });
    revalidatePath("/finance/taxes");
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}