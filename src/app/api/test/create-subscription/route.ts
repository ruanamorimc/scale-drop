/**
 * API Route para criar subscription manualmente (APENAS PARA TESTES/DEV)
 * 
 * ⚠️ REMOVER EM PRODUÇÃO ou proteger com autenticação de admin
 */

import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/api-helpers";
import { upsertSubscription } from "@/lib/subscription";
import type { SubscriptionProvider, SubscriptionStatus } from "@/generated/prisma/client";

export async function POST(req: NextRequest) {
  // Em produção, adicione verificação de admin aqui
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
        externalId,
        status = "ACTIVE",
        startDate,
        endDate,
        externalPlanId,
      } = body;

      // Validações
      if (!externalId) {
        return NextResponse.json(
          { error: "externalId é obrigatório" },
          { status: 400 }
        );
      }

      const subscription = await upsertSubscription({
        userId,
        provider: provider as SubscriptionProvider,
        externalId,
        externalPlanId,
        status: status as SubscriptionStatus,
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: endDate ? new Date(endDate) : undefined,
        metadata: {
          createdManually: true,
          testMode: true,
        },
      });

      return NextResponse.json({
        success: true,
        subscription: {
          id: subscription.id,
          status: subscription.status,
          provider: subscription.provider,
          startDate: subscription.startDate,
          endDate: subscription.endDate,
        },
        message: "Subscription criada/atualizada com sucesso",
      });
    } catch (error: any) {
      return NextResponse.json(
        { error: error.message || "Erro ao criar subscription" },
        { status: 500 }
      );
    }
  });
}
