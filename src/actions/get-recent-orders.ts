"use server";

import prisma from "@/lib/prisma";
import { Order } from "@/app/(private)/orders/columns";

export async function getRecentOrders(): Promise<Order[]> {
  try {
    const orders = await prisma.order.findMany({
      take: 5,
      orderBy: {
        createdAt: "desc",
      },
    });

    // Mapeia os dados do banco para o formato da Tabela
    const formattedOrders: Order[] = orders.map((order) => {
      return {
        id: order.id,
        // Usa orderNumber do banco, se não tiver gera um baseado no ID
        invoiceId: order.orderNumber
          ? `#${order.orderNumber}`
          : `#INV-${order.id.slice(0, 4).toUpperCase()}`,

        customer: {
          // PEGA OS CAMPOS FLAT DO SEU SCHEMA
          name: order.customerName || "Cliente Desconhecido",
          email: order.customerEmail || "sem@email.com",
          avatar: "", // Seu banco não tem avatar, deixamos vazio
        },

        // Formatação de Data e Hora
        date: new Intl.DateTimeFormat("pt-BR", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }).format(new Date(order.createdAt)),

        time: new Intl.DateTimeFormat("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        }).format(new Date(order.createdAt)),

        // Converte o Enum do Prisma (PAID) para minusculo (paid) compatível com seu badge
        paymentStatus: (order.paymentStatus?.toLowerCase() as any) || "pending",
        paymentMethod: (order.paymentMethod as any) || "Não informado",

        // Converte Decimal do Prisma para Number
        amount: Number(order.total) || 0,

        // COMO ESSES CAMPOS NÃO EXISTEM NO SEU SCHEMA, DEFINIMOS COMO 0
        // Para ter esses dados, você precisaria criar colunas no schema.prisma
        cmv: 0,
        tax: 0,
        marketing: 0,
        netProfit: Number(order.total) || 0, // Provisório: Lucro = Total (já que não temos custos)

        // Converte status do Prisma (DELIVERED) para o esperado (delivered)
        status: order.status?.toLowerCase() || "pending",
        items: [],
      };
    });

    return formattedOrders;
  } catch (error) {
    console.error("Erro ao buscar pedidos:", error);
    return [];
  }
}
