/**
 * API Route exemplo: Obter saldo do wallet
 * Demonstra uso de withAuth e validação de acesso
 */

import { NextRequest } from "next/server";
import { withAuth } from "@/lib/api-helpers";
import { getWalletBalance } from "@/lib/wallet";

export async function GET(req: NextRequest) {
  return withAuth(req, async (userId) => {
    const balance = await getWalletBalance(userId);
    return {
      balance: balance.toString(),
      formatted: new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(Number(balance)),
    };
  });
}
