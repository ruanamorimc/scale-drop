"use server";

import prisma from "@/lib/prisma";

export async function getOrdersForTracking(userId: string) {
  try {
    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        storeIntegration: {
          select: { platform: true, storeName: true },
        },
        trackingEvents: {
          orderBy: { date: "desc" }, // Traz o evento mais novo primeiro
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Convertendo dados complexos do Prisma (Datas) para serem lidos pelo Cliente
    return { success: true, data: JSON.parse(JSON.stringify(orders)) };
  } catch (error) {
    console.error("Erro ao buscar pedidos para rastreio:", error);
    return { success: false, error: "Falha ao carregar pedidos." };
  }
}
