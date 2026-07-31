"use server";

import prisma from "@/lib/prisma";

export async function getRealRevenue(email: string) {
  if (!email) return 0;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (!user) return 0;

    // Busca a soma de todos os pedidos confirmados do usuário
    const aggregate = await prisma.order.aggregate({
      where: {
        userId: user.id,
        status: { in: ["CONFIRMED", "SHIPPED", "DELIVERED"] },
      },
      _sum: {
        total: true,
      },
    });

    return Number(aggregate._sum.total) || 0;
  } catch (error) {
    console.error("Erro ao buscar faturamento do header:", error);
    return 0;
  }
}
