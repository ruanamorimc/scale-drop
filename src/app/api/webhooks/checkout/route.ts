import { NextResponse } from "next/server";
import { processSubscriptionWebhook } from "@/lib/subscription";
import { validateWebhookSignature } from "@/lib/security";
import type { SubscriptionProvider } from "@/generated/prisma/client";

/**
 * Webhook handler para processar eventos de checkout externo
 * Suporta: Kirvano, PerfectPay, Hubla, Ticto
 */
export async function POST(req: Request) {
  try {
    // Obtém provider do header ou query param
    const providerHeader = req.headers.get("x-provider") || req.headers.get("x-checkout-provider");
    const provider = (providerHeader?.toUpperCase() as SubscriptionProvider) || "KIRVANO";

    // Valida signature do webhook (se disponível)
    const signature = req.headers.get("x-signature") || req.headers.get("x-webhook-signature");
    const rawBody = await req.text();
    
    if (signature) {
      const isValid = validateWebhookSignature(rawBody, signature, provider);
      if (!isValid) {
        return NextResponse.json(
          { error: "Invalid signature" },
          { status: 401 }
        );
      }
    }

    const payload = JSON.parse(rawBody);

    // Mapeia eventos comuns dos providers
    const event = payload.event || payload.type || payload.status;
    
    // Processa diferentes tipos de eventos
    switch (event?.toLowerCase()) {
      case "subscription.created":
      case "subscription.activated":
      case "payment.approved":
      case "paid":
        await handleSubscriptionActivated(provider, payload);
        break;

      case "subscription.canceled":
      case "subscription.cancelled":
      case "payment.canceled":
        await handleSubscriptionCanceled(provider, payload);
        break;

      case "subscription.expired":
      case "payment.expired":
        await handleSubscriptionExpired(provider, payload);
        break;

      case "subscription.suspended":
        await handleSubscriptionSuspended(provider, payload);
        break;

      case "subscription.updated":
      case "payment.updated":
        await handleSubscriptionUpdated(provider, payload);
        break;

      default:
        // Ignora eventos desconhecidos
        console.log(`Evento não processado: ${event}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao processar webhook:", error);
    return NextResponse.json(
      { error: "Erro ao processar webhook" },
      { status: 500 }
    );
  }
}

/**
 * Handler para assinatura ativada
 */
async function handleSubscriptionActivated(
  provider: SubscriptionProvider,
  payload: any
) {
  const userId = payload.userId || payload.customer_id || payload.user_id;
  const subscriptionId = payload.subscription_id || payload.id || payload.subscriptionId;
  const planId = payload.plan_id || payload.planId || payload.plan;

  if (!userId || !subscriptionId) {
    throw new Error("userId e subscriptionId são obrigatórios");
  }

  await processSubscriptionWebhook(provider, {
    event: "subscription.activated",
    subscriptionId,
    userId,
    status: "ACTIVE",
    startDate: payload.start_date ? new Date(payload.start_date) : new Date(),
    endDate: payload.end_date ? new Date(payload.end_date) : undefined,
    metadata: {
      planId,
      providerData: payload,
    },
  });
}

/**
 * Handler para assinatura cancelada
 */
async function handleSubscriptionCanceled(
  provider: SubscriptionProvider,
  payload: any
) {
  const userId = payload.userId || payload.customer_id || payload.user_id;
  const subscriptionId = payload.subscription_id || payload.id || payload.subscriptionId;

  if (!userId && !subscriptionId) {
    throw new Error("userId ou subscriptionId são obrigatórios");
  }

  await processSubscriptionWebhook(provider, {
    event: "subscription.canceled",
    subscriptionId,
    userId,
    status: "CANCELED",
    canceledAt: new Date(),
    metadata: {
      providerData: payload,
    },
  });
}

/**
 * Handler para assinatura expirada
 */
async function handleSubscriptionExpired(
  provider: SubscriptionProvider,
  payload: any
) {
  const userId = payload.userId || payload.customer_id || payload.user_id;
  const subscriptionId = payload.subscription_id || payload.id || payload.subscriptionId;

  if (!userId && !subscriptionId) {
    throw new Error("userId ou subscriptionId são obrigatórios");
  }

  await processSubscriptionWebhook(provider, {
    event: "subscription.expired",
    subscriptionId,
    userId,
    status: "EXPIRED",
    metadata: {
      providerData: payload,
    },
  });
}

/**
 * Handler para assinatura suspensa
 */
async function handleSubscriptionSuspended(
  provider: SubscriptionProvider,
  payload: any
) {
  const userId = payload.userId || payload.customer_id || payload.user_id;
  const subscriptionId = payload.subscription_id || payload.id || payload.subscriptionId;

  if (!userId && !subscriptionId) {
    throw new Error("userId ou subscriptionId são obrigatórios");
  }

  await processSubscriptionWebhook(provider, {
    event: "subscription.suspended",
    subscriptionId,
    userId,
    status: "SUSPENDED",
    metadata: {
      providerData: payload,
    },
  });
}

/**
 * Handler para atualização de assinatura
 */
async function handleSubscriptionUpdated(
  provider: SubscriptionProvider,
  payload: any
) {
  const userId = payload.userId || payload.customer_id || payload.user_id;
  const subscriptionId = payload.subscription_id || payload.id || payload.subscriptionId;

  if (!userId && !subscriptionId) {
    throw new Error("userId ou subscriptionId são obrigatórios");
  }

  await processSubscriptionWebhook(provider, {
    event: "subscription.updated",
    subscriptionId,
    userId,
    status: payload.status ? mapStatus(payload.status) : undefined,
    startDate: payload.start_date ? new Date(payload.start_date) : undefined,
    endDate: payload.end_date ? new Date(payload.end_date) : undefined,
    metadata: {
      providerData: payload,
    },
  });
}

/**
 * Mapeia status do provider para nosso enum
 */
function mapStatus(status: string): "PENDING" | "ACTIVE" | "EXPIRED" | "CANCELED" | "SUSPENDED" {
  const statusMap: Record<string, "PENDING" | "ACTIVE" | "EXPIRED" | "CANCELED" | "SUSPENDED"> = {
    pending: "PENDING",
    active: "ACTIVE",
    expired: "EXPIRED",
    canceled: "CANCELED",
    cancelled: "CANCELED",
    suspended: "SUSPENDED",
  };

  return statusMap[status.toLowerCase()] || "PENDING";
}
