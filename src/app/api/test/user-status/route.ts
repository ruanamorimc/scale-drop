/**
 * API Route para verificar status completo do usuário (APENAS PARA TESTES/DEV)
 */

import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "Esta rota não está disponível em produção" },
      { status: 403 }
    );
  }

  return withAuth(req, async (userId) => {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscription: true,
        wallet: true,
        _count: {
          select: {
            orders: true,
            products: true,
            suppliers: true,
            storeIntegrations: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        accessStatus: user.accessStatus,
        subscription: user.subscription
          ? {
              id: user.subscription.id,
              provider: user.subscription.provider,
              status: user.subscription.status,
              startDate: user.subscription.startDate,
              endDate: user.subscription.endDate,
              canceledAt: user.subscription.canceledAt,
            }
          : null,
        wallet: user.wallet
          ? {
              id: user.wallet.id,
              balance: user.wallet.balance.toString(),
              isBlocked: user.wallet.isBlocked,
              blockedReason: user.wallet.blockedReason,
            }
          : null,
        counts: user._count,
      },
    });
  });
}
