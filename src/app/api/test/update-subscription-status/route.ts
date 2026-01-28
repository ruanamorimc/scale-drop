/**
 * API Route para atualizar status de subscription manualmente (APENAS PARA TESTES/DEV)
 */

import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/api-helpers";
import { processSubscriptionWebhook } from "@/lib/subscription";
import type { SubscriptionProvider, SubscriptionStatus } from "@/generated/prisma/client";

export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "Esta rota não está disponível em produção" },
      { status: 403 }
    );
  }

  return withAuth(req, async (userId, request) => {
    try {
      const body = await request.json();
      
      const {
        provider = "KIRVANO",
        subscriptionId,
        status,
        endDate,
        canceledAt,
      } = body;

      if (!subscriptionId || !status) {
        return NextResponse.json(
          { error: "subscriptionId e status são obrigatórios" },
          { status: 400 }
        );
      }

      const subscription = await processSubscriptionWebhook(
        provider as SubscriptionProvider,
        {
          event: "subscription.updated",
          subscriptionId,
          userId,
          status: status as SubscriptionStatus,
          endDate: endDate ? new Date(endDate) : undefined,
          canceledAt: canceledAt ? new Date(canceledAt) : undefined,
          metadata: {
            updatedManually: true,
            testMode: true,
          },
        }
      );

      return NextResponse.json({
        success: true,
        subscription: {
          id: subscription.id,
          status: subscription.status,
          startDate: subscription.startDate,
          endDate: subscription.endDate,
        },
        message: "Status atualizado com sucesso",
      });
    } catch (error: any) {
      return NextResponse.json(
        { error: error.message || "Erro ao atualizar subscription" },
        { status: 500 }
      );
    }
  });
}
