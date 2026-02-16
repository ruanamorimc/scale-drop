"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

export async function saveFixedExpense(data: any) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) return { success: false, error: "Auth required" };

  try {
    const payload = {
      userId: session.user.id,
      description: data.description,
      category: data.category,
      amount: Number(data.amount),
      date: new Date(data.date),
    };

    if (data.id) {
      await prisma.fixedExpense.update({ where: { id: data.id }, data: payload });
    } else {
      await prisma.fixedExpense.create({ data: payload });
    }

    revalidatePath("/finance");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteFixedExpense(id: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) return { success: false };
  
  try {
    await prisma.fixedExpense.delete({ where: { id, userId: session.user.id } });
    revalidatePath("/finance");
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

// Vamos buscar as despesas direto na Action principal (finance-overview) para performance,
// mas deixo essa aqui caso precise listar isoladamente depois.
export async function getFixedExpenses() {
    // ...
}