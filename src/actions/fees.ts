"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

export async function saveFee(data: any) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) return { success: false, error: "Não autorizado" };

  try {
    const payload = {
      userId: session.user.id,
      name: data.name,
      type: data.feeType === "percentage" ? "PERCENTAGE" : "FIXED",
      value: Number(data.value),
      // Salva a regra se for porcentagem, senão salva null
      calculationRule: data.feeType === "percentage" ? data.calculationRule : null,
      paymentMethod: data.methods, 
    };

    if (data.id) {
      await prisma.fee.update({ where: { id: data.id }, data: payload });
    } else {
      await prisma.fee.create({ data: payload });
    }

    revalidatePath("/finance/fees");
    return { success: true };
  } catch (error: any) {
    console.error("Erro ao salvar:", error);
    return { success: false, error: error.message };
  }
}

export async function getFees() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) return [];

  try {
    const fees = await prisma.fee.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    // Serialização para o Next.js não reclamar do Decimal
    return fees.map((f) => ({
      ...f,
      value: Number(f.value),
      createdAt: f.createdAt.toISOString(),
    }));
  } catch (error) {
    return [];
  }
}

export async function deleteFee(id: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) return { success: false };

  try {
    await prisma.fee.delete({ where: { id, userId: session.user.id } });
    revalidatePath("/finance/fees");
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}