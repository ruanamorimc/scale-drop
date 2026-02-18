"use server";

import prisma from "@/lib/prisma"; // Importe seu cliente do banco (Prisma, Drizzle, etc)
import { Order } from "@/app/(private)/orders/columns"; // Importe a tipagem

export async function getRecentOrders(): Promise<Order[]> {
  try {
    // 1. Busca no Banco (Exemplo com Prisma)
    const orders = await db.order.findMany({
      take: 5, // Pega apenas os 5 últimos
      orderBy: {
        createdAt: "desc",
      },
      include: {
        customer: true, // Inclui dados do cliente se for uma relação
      },
    });

    // 2. Mapeia/Transforma os dados do banco para o formato da Tabela
    // O banco retorna Date objects e números puros, a tabela quer strings formatadas
    const formattedOrders: Order[] = orders.map((order: any) => {
      return {
        id: order.id,
        invoiceId: order.invoiceId || `#INV-${order.id.slice(0, 4)}`, // Fallback se não tiver invoice

        customer: {
          name: order.customer?.name || "Cliente Desconhecido",
          email: order.customer?.email || "sem@email.com",
        },

        // Formata Data: "Oct 31, 2024"
        date: new Intl.DateTimeFormat("pt-BR", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }).format(order.createdAt),

        // Formata Hora: "14:30"
        time: new Intl.DateTimeFormat("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        }).format(order.createdAt),

        paymentStatus: order.paymentStatus, // "paid", "pending", etc.
        paymentMethod: order.paymentMethod || "Cartão de Crédito",

        amount: Number(order.totalAmount), // Garante que é número
        status: order.status, // "delivered", "shipped", etc.
      };
    });

    return formattedOrders;
  } catch (error) {
    console.error("Erro ao buscar pedidos recentes:", error);
    return []; // Retorna array vazio em caso de erro para não quebrar a tela
  }
}
