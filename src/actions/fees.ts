"use server";

import prisma from "@/lib/prisma";
// Importamos o Prisma geral para acessar as tipagens internas dele
import { Fee, Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

export interface SaveFeeInput {
  id?: string;
  name: string;
  feeType: "percentage" | "fixed";
  value: string | number;
  calculationRule?: string | null;
  methods: string | string[];
}

export async function saveFee(data: SaveFeeInput) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) return { success: false, error: "Não autorizado" };

  try {
    // 1. Tipamos o payload EXATAMENTE como o banco de dados espera para criar
    const payload: Prisma.FeeUncheckedCreateInput = {
      userId: session.user.id,
      name: data.name,
      type: data.feeType === "percentage" ? "PERCENTAGE" : "FIXED",
      value: Number(data.value),
      calculationRule:
        data.feeType === "percentage" ? (data.calculationRule ?? null) : null,
      paymentMethod: Array.isArray(data.methods)
        ? data.methods
        : [data.methods],
    };

    // 2. O IF fica! E usamos 'as Prisma.FeeUncheckedUpdateInput' para acalmar o TS no update
    if (data.id) {
      await prisma.fee.update({
        where: { id: data.id },
        data: payload as Prisma.FeeUncheckedUpdateInput,
      });
    } else {
      await prisma.fee.create({
        data: payload,
      });
    }

    revalidatePath("/finance/fees");
    return { success: true };
  } catch (error: unknown) {
    console.error("Erro ao salvar:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Erro desconhecido ao salvar taxa",
    };
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

    return fees.map((f: Fee) => ({
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
